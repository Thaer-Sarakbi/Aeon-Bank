import { create } from 'zustand';

import { fetchTransactions } from '@/api/transactionsApi';
import type { Transaction } from '@/types/transaction';
import { sortByDateDesc } from '@/utils/sort';

export type LoadStatus = 'idle' | 'loading' | 'success' | 'error';

interface TransactionsState {
  transactions: Transaction[];
  status: LoadStatus;
  error: string | null;
  fetchTransactions: () => Promise<void>;
}

export const useTransactionsStore = create<TransactionsState>()((set, get) => ({
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
}));

export const selectTransactionById = (refId: string) => (state: TransactionsState) =>
  state.transactions.find((t) => t.refId === refId);
