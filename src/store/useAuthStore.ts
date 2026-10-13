import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { fetchAuthToken } from '@/api/authApi';

import { secureJSONStorage } from './secureStorage';
import type { LoadStatus } from './useTransactionsStore';

interface AuthState {
  token: string | null;
  status: LoadStatus;
  error: string | null;
  /** Fetches a new mock token; `persist` saves it to secure storage. */
  fetchToken: () => Promise<void>;
  /** Removes the token from memory and secure storage. */
  clearToken: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      status: 'idle',
      error: null,
      fetchToken: async () => {
        if (get().status === 'loading') return;
        set({ status: 'loading', error: null });
        try {
          const token = await fetchAuthToken();
          set({ token, status: 'success' });
        } catch (e) {
          set({
            status: 'error',
            error: e instanceof Error ? e.message : 'Something went wrong.',
          });
        }
      },
      clearToken: () => set({ token: null, status: 'idle', error: null }),
    }),
    {
      name: 'aeon.auth',
      storage: secureJSONStorage,
      partialize: (state) => ({ token: state.token }),
      merge: (persisted, current) => {
        const token = (persisted as Partial<AuthState> | undefined)?.token ?? null;
        // Don't clobber a newer in-memory token.
        if (current.token || !token) return current;
        return { ...current, token, status: 'success' };
      },
    },
  ),
);
