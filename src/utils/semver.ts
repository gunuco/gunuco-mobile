/**
 * Numeric semver compare so 1.10.0 is greater than 1.9.0.
 * Pre-release suffixes are ignored for gate checks.
 */
function parsePart(value: string | undefined): number {
  const numeric = (value ?? '0').split('-')[0]?.split('+')[0] ?? '0';
  const parsed = Number.parseInt(numeric, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export function parseSemver(version: string): [number, number, number] {
  const cleaned = version.trim().replace(/^v/i, '');
  const [major, minor, patch] = cleaned.split('.');
  return [parsePart(major), parsePart(minor), parsePart(patch)];
}

export function compareSemver(left: string, right: string): number {
  const a = parseSemver(left);
  const b = parseSemver(right);
  for (let index = 0; index < 3; index += 1) {
    const av = a[index] ?? 0;
    const bv = b[index] ?? 0;
    if (av !== bv) {
      return av > bv ? 1 : -1;
    }
  }
  return 0;
}

export function isVersionLower(current: string, minimum: string): boolean {
  return compareSemver(current, minimum) < 0;
}
