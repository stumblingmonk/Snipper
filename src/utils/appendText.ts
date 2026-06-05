export function appendWithSpacing(existing: string, addition: string): string {
  const base = existing.trimEnd();
  const next = addition.trim();
  if (!next) return existing;
  if (!base) return next;
  return `${base} ${next}`;
}
