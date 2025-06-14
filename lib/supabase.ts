import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          name: string;
          password: string;
          created_at: string;
          expires_at: string;
          total_size: number;
          is_deleted: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          password: string;
          created_at?: string;
          expires_at: string;
          total_size?: number;
          is_deleted?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          password?: string;
          created_at?: string;
          expires_at?: string;
          total_size?: number;
          is_deleted?: boolean;
        };
      };
      files: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          size: number;
          type: string | null;
          storage_path: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          name: string;
          size: number;
          type?: string | null;
          storage_path: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          name?: string;
          size?: number;
          type?: string | null;
          storage_path?: string;
          created_at?: string;
        };
      };
      access_logs: {
        Row: {
          id: string;
          project_id: string;
          accessed_at: string;
          ip_address: string | null;
          user_agent: string | null;
        };
        Insert: {
          id?: string;
          project_id: string;
          accessed_at?: string;
          ip_address?: string | null;
          user_agent?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string;
          accessed_at?: string;
          ip_address?: string | null;
          user_agent?: string | null;
        };
      };
    };
  };
}