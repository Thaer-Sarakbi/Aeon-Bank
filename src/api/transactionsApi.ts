import type { Transaction } from '@/types/transaction';

import { data } from './response';

const LATENCY_MS = 800;

/** Dev-only switches to exercise the error and empty states. */
export const mockApiConfig = {
  shouldFail: false,
  returnEmpty: false,
};

/** Simulates `GET /transactions` against the mocked response. */
export function fetchTransactions(): Promise<Transaction[]> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (mockApiConfig.shouldFail) {
        reject(new Error('Unable to load transfers. Please check your connection and try again.'));
        return;
      }
      resolve(mockApiConfig.returnEmpty ? [] : data.map((t) => ({ ...t })));
    }, LATENCY_MS);
  });
}
