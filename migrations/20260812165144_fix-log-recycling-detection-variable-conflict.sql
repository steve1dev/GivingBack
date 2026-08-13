-- The previous fix only qualified the two references that had already
-- surfaced (recycled_at, total_points). PL/pgSQL's variable substitution
-- also reaches into ON CONFLICT (...) target lists, so material_category
-- (an ON CONFLICT key on user_material_totals and collaborator_material_totals)
-- was still ambiguous against the RETURNS TABLE OUT parameter of the same
-- name. Rather than hand-qualifying every remaining spot, prefer table
-- columns over same-named variables function-wide; the function never
-- intentionally reads the OUT parameters as variables (it always uses the
-- v_-prefixed locals and only assigns to the OUT parameters via the final
-- `return query`), so this is safe.
create or replace function public.log_recycling_detection(
	p_model_class text,
	p_confidence numeric,
	p_quantity integer default 1,
	p_captured_image_url text default null
)
returns table (
	event_id uuid,
	total_points bigint,
	points_earned integer,
	current_streak_days integer,
	material_category text,
	display_label text,
	recycled_at timestamptz
)
language plpgsql
security definer
set search_path = public, auth
as $$
#variable_conflict use_column
declare
	v_user_id uuid := auth.uid();
	v_rule public.recycling_material_rules%rowtype;
	v_points integer;
	v_event_id uuid;
	v_recycled_at timestamptz;
	v_total_points bigint;
	v_streak public.user_recycling_streak%rowtype;
	v_new_streak integer;
	v_default_collaborator_id uuid;
	v_kg numeric(12,2);
begin
	if v_user_id is null then
		raise exception 'Not authenticated';
	end if;

	if p_quantity is null or p_quantity <= 0 then
		raise exception 'Quantity must be greater than zero';
	end if;

	select *
		into v_rule
	from public.recycling_material_rules
	where model_class = p_model_class
		and is_active = true;

	if not found then
		raise exception 'Material class not configured: %', p_model_class;
	end if;

	v_points := v_rule.points_per_unit * p_quantity;

	insert into public.recycling_events (
		user_id,
		model_class,
		material_category,
		display_label,
		confidence,
		quantity,
		points_earned,
		captured_image_url,
		event_date
	)
	values (
		v_user_id,
		v_rule.model_class,
		v_rule.material_category,
		v_rule.display_label,
		p_confidence,
		p_quantity,
		v_points,
		p_captured_image_url,
		current_date
	)
	returning id, recycled_at into v_event_id, v_recycled_at;

	insert into public.user_points_wallet (user_id, total_points)
	values (v_user_id, v_points)
	on conflict (user_id) do update
		set total_points = public.user_points_wallet.total_points + excluded.total_points,
				updated_at = now();

	select total_points
		into v_total_points
	from public.user_points_wallet
	where user_id = v_user_id;

	insert into public.user_material_totals (user_id, material_category, item_count, points_earned)
	values (v_user_id, v_rule.material_category, p_quantity, v_points)
	on conflict (user_id, material_category) do update
		set item_count = public.user_material_totals.item_count + excluded.item_count,
				points_earned = public.user_material_totals.points_earned + excluded.points_earned,
				updated_at = now();

	insert into public.user_recycling_streak (user_id)
	values (v_user_id)
	on conflict (user_id) do nothing;

	select *
		into v_streak
	from public.user_recycling_streak
	where user_id = v_user_id
	for update;

	if v_streak.last_recycle_date is null then
		v_new_streak := 1;
	elsif v_streak.last_recycle_date = current_date then
		v_new_streak := v_streak.current_streak_days;
	elsif v_streak.last_recycle_date = current_date - interval '1 day' then
		v_new_streak := v_streak.current_streak_days + 1;
	else
		v_new_streak := 1;
	end if;

	update public.user_recycling_streak
	set
		current_streak_days = v_new_streak,
		longest_streak_days = greatest(longest_streak_days, v_new_streak),
		last_recycle_date = current_date,
		last_recycle_at = now(),
		updated_at = now()
	where user_id = v_user_id;

	-- Attribute this recycled material's kg weight to the current default
	-- collaborator's yearly total (public impact stats).
	select id
		into v_default_collaborator_id
	from public.collaborators
	where is_default = true
	limit 1;

	if v_default_collaborator_id is not null then
		v_kg := v_rule.kg_per_unit * p_quantity;

		insert into public.collaborator_material_totals (collaborator_id, year, material_category, quantity_kg)
		values (v_default_collaborator_id, extract(year from now())::int, v_rule.material_category, v_kg)
		on conflict (collaborator_id, year, material_category) do update
			set quantity_kg = public.collaborator_material_totals.quantity_kg + excluded.quantity_kg,
					updated_at = now();
	end if;

	return query
	select
		v_event_id,
		v_total_points,
		v_points,
		v_new_streak,
		v_rule.material_category,
		v_rule.display_label,
		v_recycled_at;
end;
$$;

grant execute on function public.log_recycling_detection(text, numeric, integer, text) to authenticated;
