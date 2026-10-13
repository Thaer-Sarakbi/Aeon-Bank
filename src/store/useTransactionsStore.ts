import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { fetchTransactions } from '@/api/transactionsApi';
import type { Transaction } from '@/types/transaction';
import { sortByDateDesc } from '@/utils/sort';

import { secureJSONStorage } from './secureStorage';

export type LoadStatus = 'idle' | 'loading' | 'success' | 'error';

interface TransactionsState {
  transactions: Transaction[];
  status: LoadStatus;
  error: string | null;
  fetchTransactions: () => Promise<void>;
}

export const useTransactionsStore = create<TransactionsState>()(
  persist(
    (set, get) => ({
      transactions: [],
      status: 'idle',
      error: null,
      fetchTransactions: async () => {
        if (get().status === 'loading') return;
        set({ status: 'loading', error: null });
        try {
          const result = await fetchTransactions();
          set({ transactions: sortByDateDesc(result), status: 'success' });
        } catch (e) {
          set({
            status: 'error',
            error: e instanceof Error ? e.message : 'Something went wrong.',
          });
        }
      },
    }),
    {
      name: 'aeon.transactions',
      storage: secureJSONStorage,
      // Only the cached list is persisted; status stays `idle` so screens still refetch on launch.
      partialize: (state) => ({ transactions: state.transactions }),
      // Don't let a late hydration overwrite a fresher fetch.
      merge: (persisted, current) =>
        current.transactions.length > 0
          ? current
          : { ...current, ...(persisted as Partial<TransactionsState> | undefined) },
    },
  ),
);

export const selectTransactionById = (refId: string) => (state: TransactionsState) =>
  state.transactions.find((t) => t.refId === refId);
