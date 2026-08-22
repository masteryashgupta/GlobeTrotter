import { supabase } from './supabase';
import { City, Trip, Stop, Activity } from '../../../shared/types';
import { StopCreateInput } from '../../../shared/validation';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function getAuthHeader(): Promise<Record<string, string>> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.access_token) {
    return {
      Authorization: `Bearer ${session.access_token}`,
    };
  }
  return {};
}

export interface CityFiltersResponse {
  countries: string[];
  regions: string[];
}

export const api = {
  // Cities
  async searchCities(params: {
    q?: string;
    country?: string;
    region?: string;
    limit?: number;
  }): Promise<City[]> {
    const searchParams = new URLSearchParams();
    if (params.q) searchParams.set('q', params.q);
    if (params.country) searchParams.set('country', params.country);
    if (params.region) searchParams.set('region', params.region);
    if (params.limit) searchParams.set('limit', params.limit.toString());

    const url = `${BASE_URL}/cities/search?${searchParams.toString()}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to search cities (${res.status})`);
    }
    return res.json();
  },

  async getPopularCities(limit = 10): Promise<City[]> {
    const res = await fetch(`${BASE_URL}/cities/popular?limit=${limit}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch popular cities (${res.status})`);
    }
    return res.json();
  },

  async getCityFilters(): Promise<CityFiltersResponse> {
    const res = await fetch(`${BASE_URL}/cities/filters`);
    if (!res.ok) {
      throw new Error(`Failed to fetch city filters (${res.status})`);
    }
    return res.json();
  },

  async getCityById(id: string): Promise<City> {
    const res = await fetch(`${BASE_URL}/cities/${id}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch city (${res.status})`);
    }
    return res.json();
  },

  // Trips
  async getUserTrips(): Promise<Trip[]> {
    const headers = await getAuthHeader();
    const res = await fetch(`${BASE_URL}/trips`, { headers });
    if (!res.ok) {
      // Return empty array if unauthenticated or error
      return [];
    }
    return res.json();
  },

  async getTripById(tripId: string): Promise<Trip & { stops?: (Stop & { cities?: City })[] }> {
    const headers = await getAuthHeader();
    const res = await fetch(`${BASE_URL}/trips/${tripId}`, { headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || `Failed to fetch trip (${res.status})`);
    }
    return res.json();
  },

  // Stops
  async getTripStops(tripId: string): Promise<(Stop & { cities?: City })[]> {
    const headers = await getAuthHeader();
    const res = await fetch(`${BASE_URL}/trips/${tripId}/stops`, { headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || `Failed to fetch stops (${res.status})`);
    }
    return res.json();
  },

  async addTripStop(
    tripId: string,
    data: { city_id: string; arrival_date: string; departure_date: string; order_index?: number }
  ): Promise<Stop & { cities?: City }> {
    const headers = await getAuthHeader();
    const res = await fetch(`${BASE_URL}/trips/${tripId}/stops`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || `Failed to add stop (${res.status})`);
    }
    return res.json();
  },

  async addStop(data: StopCreateInput): Promise<Stop & { cities?: City }> {
    const headers = await getAuthHeader();
    const res = await fetch(`${BASE_URL}/stops`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || `Failed to add stop to trip (${res.status})`);
    }
    return res.json();
  },

  async updateStop(
    stopId: string,
    data: { city_id?: string; arrival_date?: string; departure_date?: string; order_index?: number }
  ): Promise<Stop & { cities?: City }> {
    const headers = await getAuthHeader();
    const res = await fetch(`${BASE_URL}/stops/${stopId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || `Failed to update stop (${res.status})`);
    }
    return res.json();
  },

  async deleteStop(stopId: string): Promise<{ message: string; id: string }> {
    const headers = await getAuthHeader();
    const res = await fetch(`${BASE_URL}/stops/${stopId}`, {
      method: 'DELETE',
      headers,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || `Failed to delete stop (${res.status})`);
    }
    return res.json();
  },

  async reorderTripStops(tripId: string, stopIds: string[]): Promise<(Stop & { cities?: City })[]> {
    const headers = await getAuthHeader();
    const res = await fetch(`${BASE_URL}/trips/${tripId}/stops/reorder`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({ stop_ids: stopIds }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || `Failed to reorder stops (${res.status})`);
    }
    return res.json();
  },

  // Activities
  async searchActivities(params: {
    cityId?: string;
    category?: string;
    minCost?: number;
    maxCost?: number;
    maxDuration?: number;
    q?: string;
    limit?: number;
  }): Promise<(Activity & { cities?: City })[]> {
    const searchParams = new URLSearchParams();
    if (params.cityId) searchParams.set('cityId', params.cityId);
    if (params.category) searchParams.set('category', params.category);
    if (params.minCost !== undefined) searchParams.set('minCost', params.minCost.toString());
    if (params.maxCost !== undefined) searchParams.set('maxCost', params.maxCost.toString());
    if (params.maxDuration !== undefined) searchParams.set('maxDuration', params.maxDuration.toString());
    if (params.q) searchParams.set('q', params.q);
    if (params.limit) searchParams.set('limit', params.limit.toString());

    const res = await fetch(`${BASE_URL}/activities/search?${searchParams.toString()}`);
    if (!res.ok) {
      throw new Error(`Failed to search activities (${res.status})`);
    }
    return res.json();
  },

  async getActivityById(id: string): Promise<Activity & { cities?: City }> {
    const res = await fetch(`${BASE_URL}/activities/${id}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch activity (${res.status})`);
    }
    return res.json();
  },

  async assignActivityToStop(data: {
    stop_id: string;
    activity_id?: string;
    scheduled_date?: string;
    scheduled_time?: string;
    custom_cost?: number;
    notes?: string;
    order_index?: number;
  }): Promise<any> {
    const headers = await getAuthHeader();
    const res = await fetch(`${BASE_URL}/stops/${data.stop_id}/activities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || `Failed to assign activity (${res.status})`);
    }
    return res.json();
  },

  async getStopActivities(stopId: string): Promise<any[]> {
    const headers = await getAuthHeader();
    const res = await fetch(`${BASE_URL}/stops/${stopId}/activities`, { headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || `Failed to fetch stop activities (${res.status})`);
    }
    return res.json();
  },

  async updateTripActivity(
    id: string,
    data: {
      scheduled_date?: string | null;
      scheduled_time?: string | null;
      custom_cost?: number | null;
      notes?: string | null;
      order_index?: number;
    }
  ): Promise<any> {
    const headers = await getAuthHeader();
    const res = await fetch(`${BASE_URL}/trip-activities/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || `Failed to update activity (${res.status})`);
    }
    return res.json();
  },

  async deleteTripActivity(id: string): Promise<{ message: string; id: string }> {
    const headers = await getAuthHeader();
    const res = await fetch(`${BASE_URL}/trip-activities/${id}`, {
      method: 'DELETE',
      headers,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || `Failed to delete activity (${res.status})`);
    }
    return res.json();
  },

  async reorderStopActivities(stopId: string, activityIds: string[]): Promise<any[]> {
    const headers = await getAuthHeader();
    const res = await fetch(`${BASE_URL}/stops/${stopId}/activities/reorder`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({ activity_ids: activityIds }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || `Failed to reorder activities (${res.status})`);
    }
    return res.json();
  },
};
