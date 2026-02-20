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
export async function addWalletsToWhitelistTire1(filters: any): Promise<AddToWhitelistResponse> {
  const response = await fetch(`${API_BASE_URL}/whitelist/tire1`, {
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

// Add a single wallet address to whitelist
export async function addWalletToWhitelistTire1(address: string): Promise<{ success: boolean; message?: string }> {
  const trimmed = address.trim();
  if (!trimmed) throw new Error('Wallet address is required');
  const response = await fetch(`${API_BASE_URL}/whitelist/tire1`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ addresses: trimmed }),
  });
  if (!response.ok) {
    if (response.status === 401) throw new Error('Unauthorized');
    try {
      const err = await response.json();
      throw new Error(err.error || err.message || 'Failed to add wallet');
    } catch (e: any) {
      if (e.message && !e.message.includes('Failed to add')) throw e;
      throw new Error('Failed to add wallet to Tier 1 whitelist');
    }
  }
  return await response.json();
}

export async function addWalletToWhitelistTire2(address: string): Promise<{ success: boolean; message?: string }> {
  const trimmed = address.trim();
  if (!trimmed) throw new Error('Wallet address is required');
  const response = await fetch(`${API_BASE_URL}/whitelist/tire2`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ addresses: trimmed }),
  });
  if (!response.ok) {
    if (response.status === 401) throw new Error('Unauthorized');
    try {
      const err = await response.json();
      throw new Error(err.error || err.message || 'Failed to add wallet');
    } catch (e: any) {
      if (e.message && !e.message.includes('Failed to add')) throw e;
      throw new Error('Failed to add wallet to Tier 2 whitelist');
    }
  }
  return await response.json();
}

export async function addWalletsToWhitelistTire2(filters: any): Promise<AddToWhitelistResponse> {
  const response = await fetch(`${API_BASE_URL}/whitelist/tire2`, {
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
export async function getWhitelistedWalletsTire1(): Promise<WhitelistWallet[]> {
  const response = await fetch(`${API_BASE_URL}/whitelist/tire1`, {
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

  const json = await response.json();
  const raw = json.data ?? json.wallets ?? [];
  return Array.isArray(raw)
    ? raw.map((item: { walletAddress?: string; address?: string; updatedAt?: string; addedAt?: string }) => ({
        address: item.walletAddress ?? item.address ?? '',
        addedAt: item.updatedAt ?? item.addedAt,
      }))
    : [];
}

export async function getWhitelistedWalletsTire2(): Promise<WhitelistWallet[]> {
  const response = await fetch(`${API_BASE_URL}/whitelist/tire2`, {
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

  const json = await response.json();
  const raw = json.data ?? json.wallets ?? [];
  return Array.isArray(raw)
    ? raw.map((item: { walletAddress?: string; address?: string; updatedAt?: string; addedAt?: string }) => ({
        address: item.walletAddress ?? item.address ?? '',
        addedAt: item.updatedAt ?? item.addedAt,
      }))
    : [];
}

// Search tire1 by wallet address (GET /tire1/:address)
export async function getWhitelistWalletByAddressTire1(address: string): Promise<{ found: boolean; data?: WhitelistWallet }> {
  const trimmed = address.trim();
  if (!trimmed) return { found: false };
  const response = await fetch(`${API_BASE_URL}/whitelist/tire1/${encodeURIComponent(trimmed)}`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  if (response.status === 404) {
    await response.json().catch(() => ({}));
    return { found: false };
  }
  if (!response.ok) {
    if (response.status === 401) throw new Error('Unauthorized');
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || err.message || 'Failed to search Tier 1 whitelist');
  }
  const json = await response.json();
  if (!json.found || !json.data) return { found: false };
  const d = json.data;
  return {
    found: true,
    data: {
      address: d.walletAddress ?? d.address ?? '',
      addedAt: d.updatedAt ?? d.addedAt,
    },
  };
}

// Search tire2 by wallet address (GET /tire2/:address)
export async function getWhitelistWalletByAddressTire2(address: string): Promise<{ found: boolean; data?: WhitelistWallet }> {
  const trimmed = address.trim();
  if (!trimmed) return { found: false };
  const response = await fetch(`${API_BASE_URL}/whitelist/tire2/${encodeURIComponent(trimmed)}`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  if (response.status === 404) {
    await response.json().catch(() => ({}));
    return { found: false };
  }
  if (!response.ok) {
    if (response.status === 401) throw new Error('Unauthorized');
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || err.message || 'Failed to search Tier 2 whitelist');
  }
  const json = await response.json();
  if (!json.found || !json.data) return { found: false };
  const d = json.data;
  return {
    found: true,
    data: {
      address: d.walletAddress ?? d.address ?? '',
      addedAt: d.updatedAt ?? d.addedAt,
    },
  };
}

// Remove wallet(s) from whitelist - API expects DELETE with body { addresses: string | string[] }
export async function removeFromWhitelistTire1(address: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/whitelist/tire1`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ addresses: address }),
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error('Unauthorized');
    if (response.status === 400) {
      try {
        const err = await response.json();
        throw new Error(err.error || 'Invalid request');
      } catch (e: any) {
        if (e.message && e.message !== 'Invalid request') throw e;
        throw new Error('Addresses are required');
      }
    }
    try {
      const error = await response.json();
      throw new Error(error.error || error.message || 'Failed to remove wallet from whitelist');
    } catch (e: any) {
      if (e.message) throw e;
      throw new Error('Failed to remove wallet from whitelist');
    }
  }
}

export async function removeFromWhitelistTire2(address: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/whitelist/tire2`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ addresses: address }),
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error('Unauthorized');
    if (response.status === 400) {
      try {
        const err = await response.json();
        throw new Error(err.error || 'Invalid request');
      } catch (e: any) {
        if (e.message && e.message !== 'Invalid request') throw e;
        throw new Error('Addresses are required');
      }
    }
    try {
      const error = await response.json();
      throw new Error(error.error || error.message || 'Failed to remove wallet from whitelist');
    } catch (e: any) {
      if (e.message) throw e;
      throw new Error('Failed to remove wallet from whitelist');
    }
  }
}

// Migrate Main to Redis - sync whitelist data from Main (Postgres) to Redis
export async function migrateMainToRedis(): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/whitelist/migrateMainToRedis`, {
    method: 'POST',
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
      throw new Error('Backend API not yet implemented. Please set up the whitelist migrate Main to Redis endpoint on the Creator Tracker backend.');
    }
    try {
      const error = await response.json();
      throw new Error(error.error || 'Failed to migrate Main to Redis');
    } catch (e) {
      throw new Error('Failed to migrate Main to Redis');
    }
  }

  return await response.json();
}


// Migrate Redis to Main - sync whitelist data from Redis to Main (Postgres)
export async function migrateRedisToMain(): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/whitelist/migrateRedisToMain`, {
    method: 'POST',
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
      throw new Error('Backend API not yet implemented. Please set up the whitelist migrate Main to Redis endpoint on the Creator Tracker backend.');
    }
    try {
      const error = await response.json();
      throw new Error(error.error || 'Failed to migrate Main to Redis');
    } catch (e) {
      throw new Error('Failed to migrate Main to Redis');
    }
  }

  return await response.json();
}

const CREATORS_API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export interface SaveToWhitelistSuccessResponse {
  success: true;
  message: string;
  totalMatching?: number;
  tire1Added?: number;
  tire2Added?: number;
  alreadyInTire1?: number;
  alreadyInTire2?: number;
}

export interface SaveToWhitelistErrorResponse {
  success: false;
  error: string;
}

/** Save current filtered creator results into whitelist (POST /creators/save-to-whitelist) */
export async function saveFilteredResultsToWhitelist(
  viewAll: boolean,
  tire2: boolean,
  filters: Record<string, unknown>,
  whatIfSettings: unknown
): Promise<SaveToWhitelistSuccessResponse | SaveToWhitelistErrorResponse> {
  const params = new URLSearchParams();
  if (viewAll) params.set('viewAll', 'true');
  if (tire2) params.set('tire2', 'true');
  const response = await fetch(
    `${CREATORS_API_BASE}/tokens/creators/save-to-whitelist?${params.toString()}`,
    {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filters, whatIfSettings }),
    }
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const msg = data?.error || `Failed to save to whitelist (${response.status})`;
    return { success: false, error: msg };
  }
  return {
    success: true,
    message: data?.message ?? 'Saved to whitelist.',
    totalMatching: data?.totalMatching,
    tire1Added: data?.tire1Added,
    tire2Added: data?.tire2Added,
    alreadyInTire1: data?.alreadyInTire1,
    alreadyInTire2: data?.alreadyInTire2,
  };
}
