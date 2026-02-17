const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export interface WhitelistWallet {
  address: string;
  addedAt?: string;
}

export interface AddToWhitelistResponse {
  success: boolean;
  addedCount: number;
  alreadyExisted: number;
  totalFound: number;
  presetId?: string;
  presetName?: string;
  message?: string;
}

// Add wallets to whitelist based on Master Live filters
// Backend will query wallets using the provided filters
export async function addWalletsToWhitelist(filters: any): Promise<AddToWhitelistResponse> {
  const response = await fetch(`${API_BASE_URL}/wallets/whitelist`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ filters }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized');
    }
    if (response.status === 405 || response.status === 404) {
      throw new Error('Backend API not yet implemented. Please set up the whitelist router on the Creator Tracker backend.');
    }
    try {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add wallets to whitelist');
    } catch (e) {
      throw new Error('Failed to add wallets to whitelist');
    }
  }

  return await response.json();
}

// Get all whitelisted wallets
export async function getWhitelistedWallets(): Promise<WhitelistWallet[]> {
  const response = await fetch(`${API_BASE_URL}/whitelist`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized');
    }
    if (response.status === 405 || response.status === 404) {
      console.warn('Whitelist endpoint not yet implemented on backend. Returning empty array.');
      return [];
    }
    try {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch whitelisted wallets');
    } catch (e) {
      throw new Error('Failed to fetch whitelisted wallets');
    }
  }

  const data = await response.json();
  return data.wallets || [];
}

// Remove wallet from whitelist
export async function removeFromWhitelist(address: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/whitelist/${encodeURIComponent(address)}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized');
    }
    if (response.status === 405 || response.status === 404) {
      throw new Error('Backend API not yet implemented. Please set up the whitelist router on the Creator Tracker backend.');
    }
    try {
      const error = await response.json();
      throw new Error(error.error || 'Failed to remove wallet from whitelist');
    } catch (e) {
      throw new Error('Failed to remove wallet from whitelist');
    }
  }
}

// Check if wallet is whitelisted
export async function isWhitelisted(address: string): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/whitelist/${encodeURIComponent(address)}/check`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      return false;
    }
    if (response.status === 401) {
      throw new Error('Unauthorized');
    }
    return false;
  }

  const data = await response.json();
  return data.whitelisted || false;
}
