const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export interface MasterLiveSyncStatus {
  running: boolean
  updatedAt?: string
}

interface MasterLiveSyncStatusResponse {
  success?: boolean
  masterLiveWhitelistSync?: {
    isRunning?: boolean
    updatedAt?: string
  }
}

export async function getMasterLiveSyncStatus(): Promise<MasterLiveSyncStatus> {
  const response = await fetch(`${API_BASE_URL}/whitelist/master-live-sync/status`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  })
  if (!response.ok) {
    throw new Error(`Failed to get status (${response.status})`)
  }
  const data: MasterLiveSyncStatusResponse = await response.json()
  const sync = data?.masterLiveWhitelistSync
  return {
    running: Boolean(sync?.isRunning),
    updatedAt: sync?.updatedAt,
  }
}

export async function startMasterLiveSync(): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/whitelist/master-live-sync/start`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      return { success: false, error: data.error || `Failed to start (${response.status})` }
    }
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to start master live sync' }
  }
}

export async function stopMasterLiveSync(): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/whitelist/master-live-sync/stop`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      return { success: false, error: data.error || `Failed to stop (${response.status})` }
    }
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to stop master live sync' }
  }
}
