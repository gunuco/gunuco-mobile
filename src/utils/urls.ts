/**
 * External URL helpers. Do not attach auth tokens to these destinations.
 */

export function isHttpsUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/** Backend-provided store links for force update. */
export function isSafeStoreUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === 'https:' ||
      parsed.protocol === 'market:' ||
      parsed.protocol === 'itms:' ||
      parsed.protocol === 'itms-apps:'
    );
  } catch {
    return false;
  }
}
