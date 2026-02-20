const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export interface FilterPreset {
  id: string;
  name: string;
  filters: any;
  columnsVisibility?: Record<string, boolean> | null;
  createdAt?: string;
  updatedAt?: string;
}

export type ColumnVisibilityMap = Record<string, boolean>;

export interface PresetsResponse {
  presets: FilterPreset[];
}

// Get all filter presets
export async function getFilterPresets(): Promise<FilterPreset[]> {
  const response = await fetch(`${API_BASE_URL}/filter-presets`, {
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
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch filter presets');
  }

  const data: PresetsResponse = await response.json();
  return data.presets || [];
}

// Get a specific preset by ID
export async function getFilterPreset(id: string): Promise<FilterPreset> {
  const response = await fetch(`${API_BASE_URL}/filter-presets/${id}`, {
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
    if (response.status === 404) {
      throw new Error('Preset not found');
    }
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch filter preset');
  }

  return await response.json();
}

// Create a new preset
export async function createFilterPreset(
  id: string,
  name: string,
  filters: any,
  columnsVisibility?: ColumnVisibilityMap | null
): Promise<FilterPreset> {
  const body: { id: string; name: string; filters: any; columnsVisibility?: ColumnVisibilityMap | null } = { id, name, filters };
  if (columnsVisibility !== undefined) {
    body.columnsVisibility = columnsVisibility;
  }
  const response = await fetch(`${API_BASE_URL}/filter-presets`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized');
    }
    if (response.status === 405 || response.status === 404) {
      throw new Error('Backend API not yet implemented. Please set up the filter presets router on the Creator Tracker backend.');
    }
    if (response.status === 409) {
      throw new Error('A preset with this ID already exists');
    }
    try {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create filter preset');
    } catch (e) {
      throw new Error('Failed to create filter preset');
    }
  }

  return await response.json();
}

// Update a preset
export async function updateFilterPreset(
  id: string,
  updates: {
    name?: string;
    filters?: any;
    columnsVisibility?: ColumnVisibilityMap | null;
  }
): Promise<FilterPreset> {
  const response = await fetch(`${API_BASE_URL}/filter-presets/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    let message = 'Failed to update filter preset';
    if (response.status === 401) {
      message = 'Unauthorized';
    } else if (response.status === 405 || response.status === 404) {
      message = 'Backend API not yet implemented. Please set up the filter presets router on the Creator Tracker backend.';
    } else {
      try {
        const error = await response.json();
        message = error.error || message;
      } catch (_) {}
    }
    alert(message);
    throw new Error(message);
  } else{
    alert('Filter preset updated successfully');
  }

  return await response.json();
}

// Delete a preset
export async function deleteFilterPreset(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/filter-presets/${id}`, {
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
      throw new Error('Backend API not yet implemented. Please set up the filter presets router on the Creator Tracker backend.');
    }
    try {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete filter preset');
    } catch (e) {
      throw new Error('Failed to delete filter preset');
    }
  }
}
