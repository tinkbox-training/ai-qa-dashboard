export function formatDateTime(value?: string) {
  if (!value) return '-';
  return new Date(value).toLocaleString();
}

export function stripAnsi(value?: string) {
  if (!value) return '-';
  return value.replace(/\x1B\[[0-9;]*m/g, '');
}

