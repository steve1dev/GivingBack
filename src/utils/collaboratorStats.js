export const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function buildYearlySeries(rows, year) {
  const totals = new Map()
  for (const row of rows || []) {
    if (row.year !== year) continue
    totals.set(row.month, (totals.get(row.month) || 0) + Number(row.quantity_kg || 0))
  }

  return MONTH_LABELS.map((label, i) => ({
    key: `${year}-${String(i + 1).padStart(2, '0')}`,
    month: i + 1,
    label,
    kg: totals.get(i + 1) || 0,
  }))
}

export function buildMaterialSlices(rows) {
  const totals = new Map()
  for (const row of rows || []) {
    const kg = Number(row.quantity_kg || 0)
    totals.set(row.material_category, (totals.get(row.material_category) || 0) + kg)
  }

  return [...totals.entries()]
    .map(([category, kg]) => ({ category, kg }))
    .sort((a, b) => b.kg - a.kg)
}

export function filterRowsByPeriod(rows, year, month) {
  return (rows || []).filter((row) => row.year === year && (month === 0 || row.month === month))
}
