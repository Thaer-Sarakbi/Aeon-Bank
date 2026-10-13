const LATENCY_MS = 500;

/** Dev-only switch to exercise the auth error state. */
export const mockAuthConfig = {
  shouldFail: false,
};

/** Simulates `POST /auth/token` and returns a mock bearer token. */
export function fetchAuthToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (mockAuthConfig.shouldFail) {
        reject(new Error('Unable to sign in. Please try again.'));
        return;
      }
      resolve(`mock-token-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`);
    }, LATENCY_MS);
  });
}
