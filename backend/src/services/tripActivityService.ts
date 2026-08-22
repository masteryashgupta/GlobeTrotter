import { supabaseAdmin } from '../lib/supabaseAdmin';
import { TripActivity, Activity } from '../../../shared/types';
import { StopService } from './stopService';
import { CatalogService } from './catalogService';

export interface TripActivityWithDetails extends TripActivity {
  activities?: Activity | null;
}

// In-memory store for offline development
export const inMemoryTripActivities: TripActivityWithDetails[] = [];

export class TripActivityService {
  /**
   * List activities assigned to a stop, ordered by order_index and scheduled_time.
   */
  static async getActivitiesByStopId(stopId: string): Promise<TripActivityWithDetails[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('trip_activities')
        .select('*, activities(*)')
        .eq('stop_id', stopId)
        .order('order_index', { ascending: true })
        .order('scheduled_time', { ascending: true, nullsFirst: false });

      if (!error && data) {
        return data as TripActivityWithDetails[];
      }
    } catch {
      // Fall through
    }

    return inMemoryTripActivities
      .filter((ta) => ta.stop_id === stopId)
      .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
  }

  /**
   * Get single trip activity by ID.
   */
  static async getTripActivityById(id: string): Promise<TripActivityWithDetails | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('trip_activities')
        .select('*, activities(*)')
        .eq('id', id)
        .single();

      if (!error && data) {
        return data as TripActivityWithDetails;
      }
    } catch {
      // Fall through
    }

    return inMemoryTripActivities.find((ta) => ta.id === id) || null;
  }

  /**
   * Assign activity to a stop with date-range business validation.
   */
  static async assignActivityToStop(params: {
    stopId: string;
    activityId?: string;
    scheduledDate?: string;
    scheduledTime?: string;
    customCost?: number;
    notes?: string;
    orderIndex?: number;
    userId: string;
  }): Promise<TripActivityWithDetails> {
    const {
      stopId,
      activityId,
      scheduledDate,
      scheduledTime,
      customCost,
      notes,
      userId,
    } = params;

    // 1. Fetch parent stop to check date boundaries & ownership
    const stop = await StopService.getStopById(stopId);
    if (!stop) {
      const err: any = new Error('Parent stop not found');
      err.statusCode = 404;
      throw err;
    }

    // 2. Ownership check via stop's trip
    const isOwner = await StopService.verifyTripOwnership(stop.trip_id, userId);
    if (!isOwner) {
      const err: any = new Error('Forbidden: You do not own this trip');
      err.statusCode = 403;
      throw err;
    }

    // 3. Business Validation: scheduled_date must fall within stop's [arrival_date, departure_date]
    if (scheduledDate) {
      if (scheduledDate < stop.arrival_date || scheduledDate > stop.departure_date) {
        const err: any = new Error(
          `Scheduled date (${scheduledDate}) must fall within stop stay dates (${stop.arrival_date} to ${stop.departure_date})`
        );
        err.statusCode = 400;
        throw err;
      }
    }

    // 4. Auto order_index
    let orderIndex = params.orderIndex;
    if (orderIndex === undefined || orderIndex === null) {
      const existing = await this.getActivitiesByStopId(stopId);
      orderIndex =
        existing.length > 0
          ? Math.max(...existing.map((a) => a.order_index ?? 0)) + 1
          : 0;
    }

    // 5. Attempt live Supabase Insert
    try {
      const { data, error } = await supabaseAdmin
        .from('trip_activities')
        .insert({
          stop_id: stopId,
          activity_id: activityId || null,
          scheduled_date: scheduledDate || null,
          scheduled_time: scheduledTime || null,
          custom_cost: customCost !== undefined ? customCost : null,
          notes: notes || null,
          order_index: orderIndex,
        } as any)
        .select('*, activities(*)')
        .single();

      if (!error && data) {
        return data as TripActivityWithDetails;
      }
    } catch {
      // Fall through
    }

    // 6. In-memory fallback
    const activity = activityId ? await CatalogService.getActivityById(activityId) : null;
    const newTripActivity: TripActivityWithDetails = {
      id: `trip-act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      stop_id: stopId,
      activity_id: activityId || null,
      scheduled_date: scheduledDate || null,
      scheduled_time: scheduledTime || null,
      custom_cost: customCost !== undefined ? customCost : (activity?.cost ? Number(activity.cost) : null),
      notes: notes || null,
      order_index: orderIndex,
      created_at: new Date().toISOString(),
      activities: activity,
    };

    inMemoryTripActivities.push(newTripActivity);
    return newTripActivity;
  }

  /**
   * Update scheduled date/time, custom cost, or notes with date validation.
   */
  static async updateTripActivity(
    id: string,
    updates: {
      scheduled_date?: string | null;
      scheduled_time?: string | null;
      custom_cost?: number | null;
      notes?: string | null;
      order_index?: number;
    },
    userId: string
  ): Promise<TripActivityWithDetails> {
    const existing = await this.getTripActivityById(id);
    if (!existing) {
      const err: any = new Error('Trip activity not found');
      err.statusCode = 404;
      throw err;
    }

    const stop = await StopService.getStopById(existing.stop_id);
    if (!stop) {
      const err: any = new Error('Parent stop not found');
      err.statusCode = 404;
      throw err;
    }

    // Ownership check
    const isOwner = await StopService.verifyTripOwnership(stop.trip_id, userId);
    if (!isOwner) {
      const err: any = new Error('Forbidden: You do not own this trip');
      err.statusCode = 403;
      throw err;
    }

    // Date range validation if scheduled_date is modified
    const effectiveDate =
      updates.scheduled_date !== undefined ? updates.scheduled_date : existing.scheduled_date;

    if (effectiveDate) {
      if (effectiveDate < stop.arrival_date || effectiveDate > stop.departure_date) {
        const err: any = new Error(
          `Scheduled date (${effectiveDate}) must fall within stop stay dates (${stop.arrival_date} to ${stop.departure_date})`
        );
        err.statusCode = 400;
        throw err;
      }
    }

    // Attempt live Supabase update
    try {
      const { data, error } = await supabaseAdmin
        .from('trip_activities')
        .update({
          ...(updates.scheduled_date !== undefined ? { scheduled_date: updates.scheduled_date } : {}),
          ...(updates.scheduled_time !== undefined ? { scheduled_time: updates.scheduled_time } : {}),
          ...(updates.custom_cost !== undefined ? { custom_cost: updates.custom_cost } : {}),
          ...(updates.notes !== undefined ? { notes: updates.notes } : {}),
          ...(updates.order_index !== undefined ? { order_index: updates.order_index } : {}),
        } as any)
        .eq('id', id)
        .select('*, activities(*)')
        .single();

      if (!error && data) {
        return data as TripActivityWithDetails;
      }
    } catch {
      // Fall through
    }

    // In-memory update
    const idx = inMemoryTripActivities.findIndex((ta) => ta.id === id);
    const updatedInMemory: TripActivityWithDetails = {
      ...existing,
      scheduled_date:
        updates.scheduled_date !== undefined ? updates.scheduled_date : existing.scheduled_date,
      scheduled_time:
        updates.scheduled_time !== undefined ? updates.scheduled_time : existing.scheduled_time,
      custom_cost:
        updates.custom_cost !== undefined ? updates.custom_cost : existing.custom_cost,
      notes: updates.notes !== undefined ? updates.notes : existing.notes,
      order_index:
        updates.order_index !== undefined ? updates.order_index : existing.order_index,
    };

    if (idx !== -1) {
      inMemoryTripActivities[idx] = updatedInMemory;
    } else {
      inMemoryTripActivities.push(updatedInMemory);
    }

    return updatedInMemory;
  }

  /**
   * Delete trip activity from stop.
   */
  static async deleteTripActivity(
    id: string,
    userId: string
  ): Promise<{ message: string; id: string }> {
    const existing = await this.getTripActivityById(id);
    if (!existing) {
      const err: any = new Error('Trip activity not found');
      err.statusCode = 404;
      throw err;
    }

    const stop = await StopService.getStopById(existing.stop_id);
    if (stop) {
      const isOwner = await StopService.verifyTripOwnership(stop.trip_id, userId);
      if (!isOwner) {
        const err: any = new Error('Forbidden: You do not own this trip');
        err.statusCode = 403;
        throw err;
      }
    }

    try {
      await supabaseAdmin.from('trip_activities').delete().eq('id', id);
    } catch {
      // Fall through
    }

    const idx = inMemoryTripActivities.findIndex((ta) => ta.id === id);
    if (idx !== -1) {
      inMemoryTripActivities.splice(idx, 1);
    }

    return { message: 'Trip activity deleted successfully', id };
  }

  /**
   * Bulk reorder trip activities for a stop.
   */
  static async reorderTripActivities(
    stopId: string,
    activityIds: string[],
    userId: string
  ): Promise<TripActivityWithDetails[]> {
    const stop = await StopService.getStopById(stopId);
    if (!stop) {
      const err: any = new Error('Parent stop not found');
      err.statusCode = 404;
      throw err;
    }

    const isOwner = await StopService.verifyTripOwnership(stop.trip_id, userId);
    if (!isOwner) {
      const err: any = new Error('Forbidden: You do not own this trip');
      err.statusCode = 403;
      throw err;
    }

    // Update in Supabase
    try {
      for (let i = 0; i < activityIds.length; i++) {
        await supabaseAdmin
          .from('trip_activities')
          .update({ order_index: i } as any)
          .eq('id', activityIds[i])
          .eq('stop_id', stopId);
      }
    } catch {
      // Fall through
    }

    // Update in-memory
    for (let i = 0; i < activityIds.length; i++) {
      const act = inMemoryTripActivities.find(
        (ta) => ta.id === activityIds[i] && ta.stop_id === stopId
      );
      if (act) {
        act.order_index = i;
      }
    }

    return this.getActivitiesByStopId(stopId);
  }
}
