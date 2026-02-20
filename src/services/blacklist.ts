const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export interface BlacklistWallet {
  address: string;
  nickname: string | null;
}

export async function getBlacklistWallets(): Promise<BlacklistWallet[]> {
  const response = await fetch(`${API_BASE_URL}/whitelist/blacklist/`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    if (response.status === 401) throw new Error('Unauthorized');
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch blacklist');
  }
  const data = await response.json();
  return data.wallets || [];
}

export async function addBlacklistWallet(
  address: string,
  nickname?: string | null
): Promise<{ success: boolean; message?: string }> {
  const trimmed = address.trim();
  if (!trimmed) throw new Error('Wallet address is required');
  const response = await fetch(`${API_BASE_URL}/whitelist/blacklist/`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address: trimmed, nickname: nickname ?? null }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Failed to add wallet to blacklist');
  }
  return { success: true, message: data.message };
}

export async function removeBlacklistWallet(address: string): Promise<{ success: boolean; message?: string }> {
  const trimmed = address.trim();
  if (!trimmed) throw new Error('Wallet address is required');
  const response = await fetch(`${API_BASE_URL}/whitelist/blacklist/${encodeURIComponent(trimmed)}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Failed to remove wallet from blacklist');
  }
  return { success: true, message: data.message };
}
