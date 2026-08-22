import { supabaseAdmin } from '../lib/supabaseAdmin';
import { City, Activity } from '../../../shared/types';
import { normalizedCities, normalizedActivities, ActivityWithCity } from '../data/seedData';

export interface CitySearchParams {
  q?: string;
  country?: string;
  region?: string;
  limit?: number;
}

export interface ActivitySearchParams {
  cityId?: string;
  category?: string;
  minCost?: number;
  maxCost?: number;
  maxDuration?: number;
  q?: string;
  limit?: number;
}

// Track Supabase availability to avoid blocking TCP timeouts when offline
let isSupabaseAvailable = true;
let lastSupabaseCheckTime = 0;
const RETRY_INTERVAL_MS = 10000;

async function executeWithTimeout(promise: any, timeoutMs = 800): Promise<any> {
  return new Promise<any>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Supabase request timeout'));
    }, timeoutMs);

    Promise.resolve(promise)
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

export class CatalogService {
  private static checkShouldAttemptSupabase(): boolean {
    const now = Date.now();
    if (!isSupabaseAvailable && now - lastSupabaseCheckTime < RETRY_INTERVAL_MS) {
      return false;
    }
    return true;
  }

  private static markSupabaseFailure() {
    isSupabaseAvailable = false;
    lastSupabaseCheckTime = Date.now();
  }

  private static markSupabaseSuccess() {
    isSupabaseAvailable = true;
  }

  /**
   * Search cities with name ILIKE query, optional country & region filters, ordered by popularity desc.
   */
  static async searchCities(params: CitySearchParams): Promise<City[]> {
    const { q, country, region, limit = 20 } = params;

    if (this.checkShouldAttemptSupabase()) {
      try {
        let queryBuilder = supabaseAdmin.from('cities').select('*');

        if (q && q.trim()) {
          queryBuilder = queryBuilder.ilike('name', `%${q.trim()}%`);
        }
        if (country && country.trim()) {
          queryBuilder = queryBuilder.ilike('country', `%${country.trim()}%`);
        }
        if (region && region.trim()) {
          queryBuilder = queryBuilder.ilike('region', `%${region.trim()}%`);
        }

        queryBuilder = queryBuilder.order('popularity', { ascending: false }).limit(limit);

        const { data, error } = await executeWithTimeout(queryBuilder as any);

        if (!error && data && data.length > 0) {
          this.markSupabaseSuccess();
          return data as City[];
        }
        if (error) {
          this.markSupabaseFailure();
        }
      } catch (err) {
        this.markSupabaseFailure();
      }
    }

    // Fallback: Seeded dataset query
    let results = [...normalizedCities];

    if (q && q.trim()) {
      const lower = q.trim().toLowerCase();
      results = results.filter((c) => c.name.toLowerCase().includes(lower));
    }
    if (country && country.trim()) {
      const lower = country.trim().toLowerCase();
      results = results.filter((c) => c.country.toLowerCase().includes(lower));
    }
    if (region && region.trim()) {
      const lower = region.trim().toLowerCase();
      results = results.filter((c) => c.region?.toLowerCase().includes(lower));
    }

    results.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
    return results.slice(0, limit);
  }

  /**
   * Get top cities sorted by popularity.
   */
  static async getPopularCities(limit = 10): Promise<City[]> {
    if (this.checkShouldAttemptSupabase()) {
      try {
        const { data, error } = await executeWithTimeout(
          supabaseAdmin
            .from('cities')
            .select('*')
            .order('popularity', { ascending: false })
            .limit(limit) as any
        );

        if (!error && data && data.length > 0) {
          this.markSupabaseSuccess();
          return data as City[];
        }
        if (error) {
          this.markSupabaseFailure();
        }
      } catch (err) {
        this.markSupabaseFailure();
      }
    }

    const results = [...normalizedCities];
    results.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
    return results.slice(0, limit);
  }

  /**
   * Get single city by ID or name.
   */
  static async getCityById(id: string): Promise<City | null> {
    if (this.checkShouldAttemptSupabase()) {
      try {
        const { data, error } = await executeWithTimeout(
          supabaseAdmin.from('cities').select('*').eq('id', id).single() as any
        );

        if (!error && data) {
          this.markSupabaseSuccess();
          return data as City;
        }
        if (error && error.code !== 'PGRST116') {
          // If not simply "row not found", mark connection failure
          this.markSupabaseFailure();
        }
      } catch (err) {
        this.markSupabaseFailure();
      }
    }

    const city =
      normalizedCities.find((c) => c.id === id) ||
      normalizedCities.find((c) => c.name.toLowerCase() === id.toLowerCase());

    return city || null;
  }

  /**
   * Search activities with filters by cityId, category, cost range, max duration.
   */
  static async searchActivities(params: ActivitySearchParams): Promise<ActivityWithCity[]> {
    const { cityId, category, minCost, maxCost, maxDuration, q, limit = 20 } = params;

    if (this.checkShouldAttemptSupabase()) {
      try {
        let queryBuilder = supabaseAdmin.from('activities').select('*, cities(*)');

        if (cityId && cityId.trim()) {
          queryBuilder = queryBuilder.eq('city_id', cityId.trim());
        }
        if (category && category.trim()) {
          const categories = category.split(',').map((c) => c.trim().toLowerCase()).filter(Boolean);
          if (categories.length === 1) {
            queryBuilder = queryBuilder.eq('category', categories[0]);
          } else if (categories.length > 1) {
            queryBuilder = queryBuilder.in('category', categories);
          }
        }
        if (minCost !== undefined && !isNaN(minCost)) {
          queryBuilder = queryBuilder.gte('cost', minCost);
        }
        if (maxCost !== undefined && !isNaN(maxCost)) {
          queryBuilder = queryBuilder.lte('cost', maxCost);
        }
        if (maxDuration !== undefined && !isNaN(maxDuration)) {
          queryBuilder = queryBuilder.lte('duration_minutes', maxDuration);
        }
        if (q && q.trim()) {
          queryBuilder = queryBuilder.ilike('name', `%${q.trim()}%`);
        }

        queryBuilder = queryBuilder.order('cost', { ascending: true }).limit(limit);

        const { data, error } = await executeWithTimeout(queryBuilder as any);

        if (!error && data && data.length > 0) {
          this.markSupabaseSuccess();
          return data as ActivityWithCity[];
        }
        if (error) {
          this.markSupabaseFailure();
        }
      } catch (err) {
        this.markSupabaseFailure();
      }
    }

    // Fallback: Seeded dataset query
    let results = [...normalizedActivities];

    if (cityId && cityId.trim()) {
      const targetCityId = cityId.trim();
      // Match by UUID or city name
      const matchedCity =
        normalizedCities.find((c) => c.id === targetCityId) ||
        normalizedCities.find((c) => c.name.toLowerCase() === targetCityId.toLowerCase());

      const actualCityId = matchedCity ? matchedCity.id : targetCityId;
      results = results.filter((a) => a.city_id === actualCityId);
    }

    if (category && category.trim()) {
      const categories = category.split(',').map((c) => c.trim().toLowerCase()).filter(Boolean);
      results = results.filter((a) => a.category && categories.includes(a.category.toLowerCase()));
    }

    if (minCost !== undefined && !isNaN(minCost)) {
      results = results.filter((a) => (a.cost ?? 0) >= minCost);
    }

    if (maxCost !== undefined && !isNaN(maxCost)) {
      results = results.filter((a) => (a.cost ?? 0) <= maxCost);
    }

    if (maxDuration !== undefined && !isNaN(maxDuration)) {
      results = results.filter((a) => (a.duration_minutes ?? 0) <= maxDuration);
    }

    if (q && q.trim()) {
      const lower = q.trim().toLowerCase();
      results = results.filter(
        (a) =>
          a.name.toLowerCase().includes(lower) ||
          (a.description && a.description.toLowerCase().includes(lower))
      );
    }

    results.sort((a, b) => (a.cost ?? 0) - (b.cost ?? 0));
    return results.slice(0, limit);
  }

  /**
   * Get distinct countries and regions for search filter dropdowns.
   */
  static async getCityFilters(): Promise<{ countries: string[]; regions: string[] }> {
    const cities = await this.searchCities({ limit: 200 });
    const countries = Array.from(new Set(cities.map((c) => c.country).filter(Boolean))).sort();
    const regions = Array.from(
      new Set(cities.map((c) => c.region).filter((r): r is string => Boolean(r)))
    ).sort();
    return { countries, regions };
  }

  /**
   * Get single activity by ID.
   */
  static async getActivityById(id: string): Promise<ActivityWithCity | null> {
    if (this.checkShouldAttemptSupabase()) {
      try {
        const { data, error } = await executeWithTimeout(
          supabaseAdmin.from('activities').select('*, cities(*)').eq('id', id).single() as any
        );

        if (!error && data) {
          this.markSupabaseSuccess();
          return data as ActivityWithCity;
        }
        if (error && error.code !== 'PGRST116') {
          this.markSupabaseFailure();
        }
      } catch (err) {
        this.markSupabaseFailure();
      }
    }

    const activity = normalizedActivities.find((a) => a.id === id);
    return activity || null;
  }
}
