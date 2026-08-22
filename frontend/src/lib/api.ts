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

  async addStop(data: StopCreateInput): Promise<Stop> {
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
    activity_id: string;
    scheduled_date?: string;
    scheduled_time?: string;
    custom_cost?: number;
    notes?: string;
    order_index?: number;
  }): Promise<any> {
    const headers = await getAuthHeader();
    const res = await fetch(`${BASE_URL}/activities/trip-activities`, {
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
};
