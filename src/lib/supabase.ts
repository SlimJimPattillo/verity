import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Financials type for reports
export type Financials = {
  program: number;
  admin: number;
  fundraising: number;
};

// Database types (you can generate these with `supabase gen types typescript`)
export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          website: string | null;
          ein: string | null;
          sector: 'food' | 'education' | 'healthcare' | 'animal' | 'other' | null;
          primary_color: string;
          secondary_color: string;
          neutral_color: string;
          logo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          website?: string | null;
          ein?: string | null;
          sector?: 'food' | 'education' | 'healthcare' | 'animal' | 'other' | null;
          primary_color?: string;
          secondary_color?: string;
          neutral_color?: string;
          logo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          website?: string | null;
          ein?: string | null;
          sector?: 'food' | 'education' | 'healthcare' | 'animal' | 'other' | null;
          primary_color?: string;
          secondary_color?: string;
          neutral_color?: string;
          logo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          organization_id: string;
          full_name: string | null;
          role: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          organization_id: string;
          full_name?: string | null;
          role?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          full_name?: string | null;
          role?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      metrics: {
        Row: {
          id: string;
          organization_id: string;
          label: string;
          value: number;
          unit: '$' | '%' | 'People' | '#';
          type: 'output' | 'outcome';
          comparison: string | null;
          previous_value: number | null;
          time_period: string | null;
          data_source: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          label: string;
          value: number;
          unit: '$' | '%' | 'People' | '#';
          type: 'output' | 'outcome';
          comparison?: string | null;
          previous_value?: number | null;
          time_period?: string | null;
          data_source?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          label?: string;
          value?: number;
          unit?: '$' | '%' | 'People' | '#';
          type?: 'output' | 'outcome';
          comparison?: string | null;
          previous_value?: number | null;
          time_period?: string | null;
          data_source?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      narratives: {
        Row: {
          id: string;
          organization_id: string;
          title: string;
          content: string;
          tags: string[] | null;
          source: 'manual' | 'ai_generated' | 'imported' | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          title: string;
          content: string;
          tags?: string[] | null;
          source?: 'manual' | 'ai_generated' | 'imported' | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          title?: string;
          content?: string;
          tags?: string[] | null;
          source?: 'manual' | 'ai_generated' | 'imported' | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      reports: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          type: 'Annual Report' | 'Grant Application' | 'Impact Report';
          status: 'Draft' | 'Published' | 'Under Review';
          title: string | null;
          date_range: string | null;
          narrative: string | null;
          template_id: string | null;
          primary_color: string | null;
          secondary_color: string | null;
          neutral_color: string | null;
          financials: Financials | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          type: 'Annual Report' | 'Grant Application' | 'Impact Report';
          status?: 'Draft' | 'Published' | 'Under Review';
          title?: string | null;
          date_range?: string | null;
          narrative?: string | null;
          template_id?: string | null;
          primary_color?: string | null;
          secondary_color?: string | null;
          neutral_color?: string | null;
          financials?: Financials | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          type?: 'Annual Report' | 'Grant Application' | 'Impact Report';
          status?: 'Draft' | 'Published' | 'Under Review';
          title?: string | null;
          date_range?: string | null;
          narrative?: string | null;
          template_id?: string | null;
          primary_color?: string | null;
          secondary_color?: string | null;
          neutral_color?: string | null;
          financials?: Financials | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      report_metrics: {
        Row: {
          id: string;
          report_id: string;
          metric_id: string;
          sort_order: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          report_id: string;
          metric_id: string;
          sort_order?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          report_id?: string;
          metric_id?: string;
          sort_order?: number | null;
          created_at?: string;
        };
      };
      grant_answers: {
        Row: {
          id: string;
          organization_id: string;
          question: string;
          answer: string;
          tone: string | null;
          metrics_used: string[] | null;
          saved_to_narratives: boolean;
          narrative_id: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          question: string;
          answer: string;
          tone?: string | null;
          metrics_used?: string[] | null;
          saved_to_narratives?: boolean;
          narrative_id?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          question?: string;
          answer?: string;
          tone?: string | null;
          metrics_used?: string[] | null;
          saved_to_narratives?: boolean;
          narrative_id?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
      };
    };
  };
};
