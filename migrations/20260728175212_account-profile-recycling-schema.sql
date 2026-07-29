create extension if not exists pgcrypto;

create table if not exists public.account_profiles (
	user_id uuid primary key references auth.users(id) on delete cascade,
	display_name text,
	phone text,
	avatar_url text,
	avatar_key text,
	member_since date not null default current_date,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create table if not exists public.user_points_wallet (
	user_id uuid primary key references auth.users(id) on delete cascade,
	total_points bigint not null default 0,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create table if not exists public.user_recycling_streak (
	user_id uuid primary key references auth.users(id) on delete cascade,
	current_streak_days integer not null default 0 check (current_streak_days >= 0),
	longest_streak_days integer not null default 0 check (longest_streak_days >= 0),
	last_recycle_date date,
	last_recycle_at timestamptz,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create table if not exists public.recycling_material_rules (
	id bigserial primary key,
	model_class text not null unique,
	material_category text not null,
	display_label text not null,
	points_per_unit integer not null check (points_per_unit > 0),
	is_active boolean not null default true,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create table if not exists public.user_material_totals (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references auth.users(id) on delete cascade,
	material_category text not null,
	item_count integer not null default 0 check (item_count >= 0),
	points_earned bigint not null default 0 check (points_earned >= 0),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	unique(user_id, material_category)
);

create table if not exists public.recycling_events (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references auth.users(id) on delete cascade,
	model_class text not null,
	material_category text not null,
	display_label text not null,
	confidence numeric(5,4) not null check (confidence >= 0 and confidence <= 1),
	quantity integer not null default 1 check (quantity > 0),
	points_earned integer not null check (points_earned >= 0),
	captured_image_url text,
	recycled_at timestamptz not null default now(),
	event_date date not null default current_date,
	created_at timestamptz not null default now()
);

create index if not exists idx_recycling_events_user_time
	on public.recycling_events (user_id, recycled_at desc);

create index if not exists idx_recycling_events_user_date
	on public.recycling_events (user_id, event_date desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
	new.updated_at := now();
	return new;
end;
$$;

drop trigger if exists trg_account_profiles_updated_at on public.account_profiles;
create trigger trg_account_profiles_updated_at
before update on public.account_profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_user_points_wallet_updated_at on public.user_points_wallet;
create trigger trg_user_points_wallet_updated_at
before update on public.user_points_wallet
for each row execute function public.set_updated_at();

drop trigger if exists trg_user_recycling_streak_updated_at on public.user_recycling_streak;
create trigger trg_user_recycling_streak_updated_at
before update on public.user_recycling_streak
for each row execute function public.set_updated_at();

drop trigger if exists trg_recycling_material_rules_updated_at on public.recycling_material_rules;
create trigger trg_recycling_material_rules_updated_at
before update on public.recycling_material_rules
for each row execute function public.set_updated_at();

drop trigger if exists trg_user_material_totals_updated_at on public.user_material_totals;
create trigger trg_user_material_totals_updated_at
before update on public.user_material_totals
for each row execute function public.set_updated_at();

insert into public.recycling_material_rules (model_class, material_category, display_label, points_per_unit, is_active)
values
	('Plastic bottle', 'Plastic', 'Plastic Bottle', 1, true),
	('Paper', 'Paper', 'Paper', 1, true),
	('Cardboard', 'Cardboard', 'Cardboard', 2, true),
	('Glass', 'Glass', 'Glass', 4, true)
on conflict (model_class) do update
set
	material_category = excluded.material_category,
	display_label = excluded.display_label,
	points_per_unit = excluded.points_per_unit,
	is_active = excluded.is_active,
	updated_at = now();

create or replace function public.handle_auth_user_created()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
	insert into public.account_profiles (user_id, display_name)
	values (
		new.id,
		coalesce(new.profile->>'name', split_part(new.email, '@', 1))
	)
	on conflict (user_id) do nothing;

	insert into public.user_points_wallet (user_id)
	values (new.id)
	on conflict (user_id) do nothing;

	insert into public.user_recycling_streak (user_id)
	values (new.id)
	on conflict (user_id) do nothing;

	return new;
end;
$$;

drop trigger if exists trg_auth_user_created on auth.users;
create trigger trg_auth_user_created
after insert on auth.users
for each row execute function public.handle_auth_user_created();

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
declare
	v_user_id uuid := auth.uid();
	v_rule public.recycling_material_rules%rowtype;
	v_points integer;
	v_event_id uuid;
	v_recycled_at timestamptz;
	v_total_points bigint;
	v_streak public.user_recycling_streak%rowtype;
	v_new_streak integer;
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

alter table public.account_profiles enable row level security;
alter table public.user_points_wallet enable row level security;
alter table public.user_recycling_streak enable row level security;
alter table public.user_material_totals enable row level security;
alter table public.recycling_events enable row level security;
alter table public.recycling_material_rules enable row level security;

drop policy if exists account_profiles_select_own on public.account_profiles;
create policy account_profiles_select_own
on public.account_profiles
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists account_profiles_insert_own on public.account_profiles;
create policy account_profiles_insert_own
on public.account_profiles
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists account_profiles_update_own on public.account_profiles;
create policy account_profiles_update_own
on public.account_profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists user_points_wallet_select_own on public.user_points_wallet;
create policy user_points_wallet_select_own
on public.user_points_wallet
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists user_recycling_streak_select_own on public.user_recycling_streak;
create policy user_recycling_streak_select_own
on public.user_recycling_streak
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists user_material_totals_select_own on public.user_material_totals;
create policy user_material_totals_select_own
on public.user_material_totals
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists recycling_events_select_own on public.recycling_events;
create policy recycling_events_select_own
on public.recycling_events
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists recycling_events_insert_own on public.recycling_events;
create policy recycling_events_insert_own
on public.recycling_events
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists recycling_material_rules_select_authenticated on public.recycling_material_rules;
create policy recycling_material_rules_select_authenticated
on public.recycling_material_rules
for select
to authenticated
using (is_active = true);

grant select, insert, update on public.account_profiles to authenticated;
grant select on public.user_points_wallet to authenticated;
grant select on public.user_recycling_streak to authenticated;
grant select on public.user_material_totals to authenticated;
grant select, insert on public.recycling_events to authenticated;
grant select on public.recycling_material_rules to authenticated;
