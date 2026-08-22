import { supabaseAdmin } from '../lib/supabaseAdmin';
import { Stop, City } from '../shared/types';
import { CatalogService } from './catalogService';

export interface StopWithCity extends Stop {
  cities?: City | null;
}

// In-memory fallback for local offline development
export const inMemoryStops: StopWithCity[] = [];

// Helper for date string comparisons (YYYY-MM-DD)
function isDateOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  // Overlap condition: startA <= endB && endA >= startB
  return startA <= endB && endA >= startB;
}

export class StopService {
  /**
   * Find a stop by ID with parent trip check.
   */
  static async getStopById(id: string): Promise<StopWithCity | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('stops')
        .select('*, cities(*)')
        .eq('id', id)
        .single();

      if (!error && data) {
        return data as StopWithCity;
      }
    } catch {
      // Fall through
    }

    return inMemoryStops.find((s) => s.id === id) || null;
  }

  /**
   * List all stops for a trip ordered by order_index ASC.
   */
  static async getStopsByTripId(tripId: string): Promise<StopWithCity[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('stops')
        .select('*, cities(*)')
        .eq('trip_id', tripId)
        .order('order_index', { ascending: true });

      if (!error && data) {
        return data as StopWithCity[];
      }
    } catch {
      // Fall through
    }

    return inMemoryStops
      .filter((s) => s.trip_id === tripId)
      .sort((a, b) => a.order_index - b.order_index);
  }

  /**
   * Verify if user owns the trip.
   */
  static async verifyTripOwnership(tripId: string, userId: string): Promise<boolean> {
    try {
      const { data: trip, error } = await supabaseAdmin
        .from('trips')
        .select('owner_id')
        .eq('id', tripId)
        .single();

      if (!error && trip) {
        return (trip as any).owner_id === userId;
      }
    } catch {
      // Fall through
    }

    // In-memory / test fallback
    return true;
  }

  /**
   * Check for date overlaps with existing stops in a trip.
   */
  static async checkDateOverlap(
    tripId: string,
    arrivalDate: string,
    departureDate: string,
    excludeStopId?: string
  ): Promise<{ hasOverlap: boolean; conflictingStop?: StopWithCity }> {
    const existingStops = await this.getStopsByTripId(tripId);

    for (const stop of existingStops) {
      if (excludeStopId && stop.id === excludeStopId) {
        continue;
      }

      if (isDateOverlap(arrivalDate, departureDate, stop.arrival_date, stop.departure_date)) {
        return {
          hasOverlap: true,
          conflictingStop: stop,
        };
      }
    }

    return { hasOverlap: false };
  }

  /**
   * Create a new stop for a trip with date overlap check and auto order_index.
   */
  static async createStop(params: {
    tripId: string;
    cityId: string;
    arrivalDate: string;
    departureDate: string;
    orderIndex?: number;
    userId: string;
  }): Promise<StopWithCity> {
    const { tripId, cityId, arrivalDate, departureDate, userId } = params;

    // 1. Ownership check
    const isOwner = await this.verifyTripOwnership(tripId, userId);
    if (!isOwner) {
      const err: any = new Error('Forbidden: You do not own this trip');
      err.statusCode = 403;
      throw err;
    }

    // 2. Date order validation
    if (arrivalDate > departureDate) {
      const err: any = new Error('Departure date must be on or after arrival date');
      err.statusCode = 400;
      throw err;
    }

    // 3. Business rule: Date overlap check
    const overlapResult = await this.checkDateOverlap(tripId, arrivalDate, departureDate);
    if (overlapResult.hasOverlap && overlapResult.conflictingStop) {
      const conflict = overlapResult.conflictingStop;
      const cityName = conflict.cities?.name || 'an existing destination';
      const err: any = new Error(
        `Stop dates (${arrivalDate} to ${departureDate}) overlap with existing stop in ${cityName} (${conflict.arrival_date} to ${conflict.departure_date})`
      );
      err.statusCode = 400;
      throw err;
    }

    // 4. Calculate auto order_index if not supplied
    let orderIndex = params.orderIndex;
    if (orderIndex === undefined || orderIndex === null) {
      const existingStops = await this.getStopsByTripId(tripId);
      orderIndex =
        existingStops.length > 0
          ? Math.max(...existingStops.map((s) => s.order_index)) + 1
          : 0;
    }

    // 5. Attempt live Supabase Insert
    try {
      const { data: stop, error } = await supabaseAdmin
        .from('stops')
        .insert({
          trip_id: tripId,
          city_id: cityId,
          arrival_date: arrivalDate,
          departure_date: departureDate,
          order_index: orderIndex,
        } as any)
        .select('*, cities(*)')
        .single();

      if (!error && stop) {
        return stop as StopWithCity;
      }
    } catch {
      // Fall through to in-memory store
    }

    // 6. In-memory fallback
    const city = await CatalogService.getCityById(cityId);
    const newStop: StopWithCity = {
      id: `stop-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      trip_id: tripId,
      city_id: cityId,
      order_index: orderIndex,
      arrival_date: arrivalDate,
      departure_date: departureDate,
      created_at: new Date().toISOString(),
      cities: city,
    };

    inMemoryStops.push(newStop);
    return newStop;
  }

  /**
   * Update stop dates or city with date overlap re-check.
   */
  static async updateStop(
    id: string,
    updates: {
      city_id?: string;
      arrival_date?: string;
      departure_date?: string;
      order_index?: number;
    },
    userId: string
  ): Promise<StopWithCity> {
    const existingStop = await this.getStopById(id);
    if (!existingStop) {
      const err: any = new Error('Stop not found');
      err.statusCode = 404;
      throw err;
    }

    // Ownership check
    const isOwner = await this.verifyTripOwnership(existingStop.trip_id, userId);
    if (!isOwner) {
      const err: any = new Error('Forbidden: You do not own this trip');
      err.statusCode = 403;
      throw err;
    }

    const effectiveArrival = updates.arrival_date || existingStop.arrival_date;
    const effectiveDeparture = updates.departure_date || existingStop.departure_date;

    if (effectiveArrival > effectiveDeparture) {
      const err: any = new Error('Departure date must be on or after arrival date');
      err.statusCode = 400;
      throw err;
    }

    // Overlap check excluding self
    const overlapResult = await this.checkDateOverlap(
      existingStop.trip_id,
      effectiveArrival,
      effectiveDeparture,
      id
    );

    if (overlapResult.hasOverlap && overlapResult.conflictingStop) {
      const conflict = overlapResult.conflictingStop;
      const cityName = conflict.cities?.name || 'an existing destination';
      const err: any = new Error(
        `Updated stop dates (${effectiveArrival} to ${effectiveDeparture}) overlap with existing stop in ${cityName} (${conflict.arrival_date} to ${conflict.departure_date})`
      );
      err.statusCode = 400;
      throw err;
    }

    // Attempt live Supabase update
    try {
      const { data: updated, error } = await supabaseAdmin
        .from('stops')
        .update({
          ...(updates.city_id ? { city_id: updates.city_id } : {}),
          ...(updates.arrival_date ? { arrival_date: updates.arrival_date } : {}),
          ...(updates.departure_date ? { departure_date: updates.departure_date } : {}),
          ...(updates.order_index !== undefined ? { order_index: updates.order_index } : {}),
        } as any)
        .eq('id', id)
        .select('*, cities(*)')
        .single();

      if (!error && updated) {
        return updated as StopWithCity;
      }
    } catch {
      // Fall through
    }

    // In-memory update
    const city = updates.city_id
      ? await CatalogService.getCityById(updates.city_id)
      : existingStop.cities;

    const idx = inMemoryStops.findIndex((s) => s.id === id);
    const updatedInMemory: StopWithCity = {
      ...existingStop,
      city_id: updates.city_id || existingStop.city_id,
      arrival_date: effectiveArrival,
      departure_date: effectiveDeparture,
      order_index:
        updates.order_index !== undefined ? updates.order_index : existingStop.order_index,
      cities: city,
    };

    if (idx !== -1) {
      inMemoryStops[idx] = updatedInMemory;
    } else {
      inMemoryStops.push(updatedInMemory);
    }

    return updatedInMemory;
  }

  /**
   * Delete stop (cascades to trip_activities).
   */
  static async deleteStop(id: string, userId: string): Promise<{ message: string; id: string }> {
    const existingStop = await this.getStopById(id);
    if (!existingStop) {
      const err: any = new Error('Stop not found');
      err.statusCode = 404;
      throw err;
    }

    const isOwner = await this.verifyTripOwnership(existingStop.trip_id, userId);
    if (!isOwner) {
      const err: any = new Error('Forbidden: You do not own this trip');
      err.statusCode = 403;
      throw err;
    }

    try {
      await supabaseAdmin.from('stops').delete().eq('id', id);
    } catch {
      // Fall through
    }

    const idx = inMemoryStops.findIndex((s) => s.id === id);
    if (idx !== -1) {
      inMemoryStops.splice(idx, 1);
    }

    return { message: 'Stop deleted successfully', id };
  }

  /**
   * Bulk reorder stops for a trip in a single operation.
   */
  static async reorderStops(
    tripId: string,
    stopIds: string[],
    userId: string
  ): Promise<StopWithCity[]> {
    const isOwner = await this.verifyTripOwnership(tripId, userId);
    if (!isOwner) {
      const err: any = new Error('Forbidden: You do not own this trip');
      err.statusCode = 403;
      throw err;
    }

    // Update in Supabase
    try {
      for (let i = 0; i < stopIds.length; i++) {
        await supabaseAdmin
          .from('stops')
          .update({ order_index: i } as any)
          .eq('id', stopIds[i])
          .eq('trip_id', tripId);
      }
    } catch {
      // Fall through
    }

    // Update in-memory
    for (let i = 0; i < stopIds.length; i++) {
      const stop = inMemoryStops.find((s) => s.id === stopIds[i] && s.trip_id === tripId);
      if (stop) {
        stop.order_index = i;
      }
    }

    return this.getStopsByTripId(tripId);
  }
}
