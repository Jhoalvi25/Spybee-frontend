export function formatDate(iso: string): string {
  if (!iso) return '—';

  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';

  return new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(d);
}
