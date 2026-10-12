import type { Transaction } from '@/types/transaction';

/** Newest first. Returns a new array. */
export function sortByDateDesc(transactions: Transaction[]): Transaction[] {
  return [...transactions].sort(
    (a, b) => new Date(b.transferDate).getTime() - new Date(a.transferDate).getTime(),
  );
}
