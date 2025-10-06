export const capitalize = (s: string) =>
  (s && String(s[0]).toUpperCase() + String(s).slice(1)) || '';
