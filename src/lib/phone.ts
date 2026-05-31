// Normalize a Saudi phone to its last 9 digits (e.g. 5XXXXXXXX) so numbers in
// different formats (+9665…, 9665…, 05…, 5…) compare equal. Used to link a
// Salla order's customer phone to the office that registered with it.
export function normalizePhone(raw?: string | null): string {
  if (!raw) return "";
  let d = String(raw).replace(/\D/g, "");
  if (d.startsWith("966")) d = d.slice(3);
  d = d.replace(/^0+/, "");
  return d.slice(-9);
}
