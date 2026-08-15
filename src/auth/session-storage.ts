const STORAGE_KEY = 'finance:refresh:v1';

export function readRefreshToken(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function writeRefreshToken(token: string): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, token);
  } catch {
    // Private mode may throw; in-memory auth still works for this tab.
  }
}

export function clearRefreshToken(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Already cleared in memory.
  }
}
