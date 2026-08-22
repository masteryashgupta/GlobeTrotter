export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          language_pref: string | null
          currency: string | null
          is_admin: boolean
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          language_pref?: string | null
          currency?: string | null
          is_admin?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          language_pref?: string | null
          currency?: string | null
          is_admin?: boolean
          created_at?: string
        }
      }
      cities: {
        Row: {
          id: string
          name: string
          country: string
          region: string | null
          cost_index: number | null
          popularity: number | null
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          country: string
          region?: string | null
          cost_index?: number | null
          popularity?: number | null
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          country?: string
          region?: string | null
          cost_index?: number | null
          popularity?: number | null
          image_url?: string | null
          created_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          city_id: string | null
          name: string
          category: 'sightseeing' | 'food' | 'adventure' | 'nightlife' | 'culture' | 'shopping' | 'other' | null
          description: string | null
          cost: number | null
          duration_minutes: number | null
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          city_id?: string | null
          name: string
          category?: 'sightseeing' | 'food' | 'adventure' | 'nightlife' | 'culture' | 'shopping' | 'other' | null
          description?: string | null
          cost?: number | null
          duration_minutes?: number | null
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          city_id?: string | null
          name?: string
          category?: 'sightseeing' | 'food' | 'adventure' | 'nightlife' | 'culture' | 'shopping' | 'other' | null
          description?: string | null
          cost?: number | null
          duration_minutes?: number | null
          image_url?: string | null
          created_at?: string
        }
      }
      trips: {
        Row: {
          id: string
          owner_id: string | null
          name: string | null
          description: string | null
          start_date: string
          end_date: string
          cover_photo_url: string | null
          is_public: boolean
          share_token: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id?: string | null
          name?: string | null
          description?: string | null
          start_date: string
          end_date: string
          cover_photo_url?: string | null
          is_public?: boolean
          share_token?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string | null
          name?: string | null
          description?: string | null
          start_date?: string
          end_date?: string
          cover_photo_url?: string | null
          is_public?: boolean
          share_token?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      stops: {
        Row: {
          id: string
          trip_id: string
          city_id: string | null
          custom_city_name: string | null
          order_index: number
          arrival_date: string
          departure_date: string
          created_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          city_id?: string | null
          custom_city_name?: string | null
          order_index: number
          arrival_date: string
          departure_date: string
          created_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          city_id?: string | null
          custom_city_name?: string | null
          order_index?: number
          arrival_date?: string
          departure_date?: string
          created_at?: string
        }
      }
      trip_activities: {
        Row: {
          id: string
          stop_id: string
          activity_id: string | null
          custom_activity_name: string | null
          scheduled_date: string | null
          scheduled_time: string | null
          custom_cost: number | null
          notes: string | null
          order_index: number | null
          created_at: string
        }
        Insert: {
          id?: string
          stop_id: string
          activity_id?: string | null
          custom_activity_name?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          custom_cost?: number | null
          notes?: string | null
          order_index?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          stop_id?: string
          activity_id?: string | null
          custom_activity_name?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          custom_cost?: number | null
          notes?: string | null
          order_index?: number | null
          created_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          trip_id: string
          stop_id: string | null
          category: 'transport' | 'stay' | 'activity' | 'meals' | 'misc' | null
          label: string | null
          amount: number
          created_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          stop_id?: string | null
          category?: 'transport' | 'stay' | 'activity' | 'meals' | 'misc' | null
          label?: string | null
          amount: number
          created_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          stop_id?: string | null
          category?: 'transport' | 'stay' | 'activity' | 'meals' | 'misc' | null
          label?: string | null
          amount?: number
          created_at?: string
        }
      }
      community_posts: {
        Row: {
          id: string
          user_id: string
          location: string
          trip_title: string
          content: string
          image_url: string | null
          likes_count: number
          comments_count: number
          category: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          location: string
          trip_title: string
          content: string
          image_url?: string | null
          likes_count?: number
          comments_count?: number
          category: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          location?: string
          trip_title?: string
          content?: string
          image_url?: string | null
          likes_count?: number
          comments_count?: number
          category?: string
          created_at?: string
        }
      }
      trip_copies: {
        Row: {
          id: string
          original_trip_id: string | null
          copied_trip_id: string | null
          copied_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          original_trip_id?: string | null
          copied_trip_id?: string | null
          copied_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          original_trip_id?: string | null
          copied_trip_id?: string | null
          copied_by?: string | null
          created_at?: string
        }
      }
    }
  }
}
