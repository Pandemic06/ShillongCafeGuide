/**
 * Indian numbers from Google or the admin area often start with the domestic
 * "0" ("087987 19975", "0364 222 0386"). That prefix fails when dialled from
 * abroad, so show and dial them in international form ("+91 87987 19975").
 */
export function toInternationalPhone(phone: string): string {
  const trimmed = phone.trim();
  return /^0\d/.test(trimmed) ? `+91 ${trimmed.slice(1)}` : trimmed;
}
