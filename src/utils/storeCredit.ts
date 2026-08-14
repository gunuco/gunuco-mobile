import type { StoreCredit, StoreCreditLedgerEntry } from '@/src/types/storeCredit';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function unwrap(response: unknown): Record<string, unknown> {
  const root = asRecord(response) ?? {};
  return asRecord(root.data) ?? asRecord(root.storeCredit) ?? root;
}

export function normalizeStoreCredit(response: unknown): StoreCredit {
  const payload = unwrap(response);
  const historyRaw = payload.history ?? payload.entries ?? payload.ledger;
  const history = Array.isArray(historyRaw)
    ? historyRaw
        .map((raw): StoreCreditLedgerEntry | null => {
          const rec = asRecord(raw);
          if (!rec) {
            return null;
          }
          return {
            id: asString(rec.id),
            label: asString(rec.label) ?? asString(rec.description),
            amountPaise: asNumber(rec.amountPaise) ?? asNumber(rec.amount),
            createdAtLabel: asString(rec.createdAtLabel) ?? asString(rec.createdAt),
          };
        })
        .filter((item): item is StoreCreditLedgerEntry => item !== null)
    : undefined;

  return {
    balancePaise: asNumber(payload.balancePaise) ?? asNumber(payload.balance) ?? 0,
    history,
  };
}
