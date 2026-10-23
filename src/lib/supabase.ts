import { createClient } from '@supabase/supabase-js';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          username: string;
          role: 'admin' | 'user';
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          role?: 'admin' | 'user';
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          role?: 'admin' | 'user';
          created_at?: string;
        };
        Relationships: [];
      };
      procurement_projects: {
        Row: {
          id: string;
          owner_id: string | null;
          title: string;
          office_name: string;
          procurement_type: 'works' | 'goods' | 'consulting' | 'services';
          method_id: string;
          estimated_amount: number;
          current_stage_id: string;
          progress_percent: number;
          budget_source: string;
          start_date: string;
          target_completion_date: string;
          contractor_name: string | null;
          contract_amount: number | null;
          checklist_status: Json;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          owner_id: string | null;
          title: string;
          office_name: string;
          procurement_type: 'works' | 'goods' | 'consulting' | 'services';
          method_id: string;
          estimated_amount: number;
          current_stage_id: string;
          progress_percent: number;
          budget_source: string;
          start_date: string;
          target_completion_date: string;
          contractor_name?: string | null;
          contract_amount?: number | null;
          checklist_status?: Json;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string | null;
          title?: string;
          office_name?: string;
          procurement_type?: 'works' | 'goods' | 'consulting' | 'services';
          method_id?: string;
          estimated_amount?: number;
          current_stage_id?: string;
          progress_percent?: number;
          budget_source?: string;
          start_date?: string;
          target_completion_date?: string;
          contractor_name?: string | null;
          contract_amount?: number | null;
          checklist_status?: Json;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

export const supabase = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl!, supabasePublishableKey!, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export const USER_EMAIL_DOMAIN = 'accounts.procurement-guide.example';

export const usernameToEmail = (username: string) =>
  `${username.trim().toLocaleLowerCase()}@${USER_EMAIL_DOMAIN}`;
