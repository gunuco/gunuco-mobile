/**
 * Money helpers — amounts from API/payment are integer paise.
 */

export function formatPaise(paise: number, options?: { showFree?: boolean }): string {
  if (options?.showFree && paise === 0) {
    return 'Free';
  }
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(rupees);
}

export function paiseToRupees(paise: number): number {
  return paise / 100;
}
