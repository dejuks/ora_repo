export function money(value) {
  return new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB', maximumFractionDigits: 2 }).format(Number(value || 0));
}

export function shortDate(value) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString();
}

export function titleForMaterial(materials, copies, row) {
  if (row?.title) return row.title;
  const materialId = row?.material_id || copies.find((c) => c.copy_id === row?.copy_id)?.material_id;
  return materials.find((m) => m.material_id === materialId)?.title || '-';
}
