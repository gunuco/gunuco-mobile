import type { MoneyPaise } from './commerce';

export type StoreCreditLedgerEntry = {
  id?: string;
  label?: string;
  amountPaise?: MoneyPaise;
  createdAtLabel?: string;
};

export type StoreCredit = {
  balancePaise: MoneyPaise;
  history?: StoreCreditLedgerEntry[];
};

/**
 * [CONFIRM] apply-store-credit request contract.
 * Docs: amount or max. Phase 8 sends `{ max: true }` for "use available credit".
 */
export type ApplyStoreCreditPayload = {
  max: true;
};
