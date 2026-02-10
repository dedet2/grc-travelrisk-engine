// Supabase Generated Types
// This file contains TypeScript types generated from Supabase schema
// Regenerate after any database schema changes

export interface Database {
  public: {
    Tables: {
      frameworks: {
        Row: {
          id: string;
          name: string;
          version: string;
          description: string;
          source_url: string | null;
          status: 'draft' | 'published' | 'archived';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          version: string;
          description: string;
          source_url?: string | null;
          status?: 'draft' | 'published' | 'archived';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          version?: string;
          description?: string;
          source_url?: string | null;
          status?: 'draft' | 'published' | 'archived';
          created_at?: string;
          updated_at?: string;
        };
      };
      controls: {
        Row: {
          id: string;
          framework_id: string;
          control_id_str: string;
          title: string;
          description: string;
          category: string;
          control_type: 'technical' | 'operational' | 'management';
          created_at: string;
        };
        Insert: {
          id?: string;
          framework_id: string;
          control_id_str: string;
          title: string;
          description: string;
          category: string;
          control_type: 'technical' | 'operational' | 'management';
          created_at?: string;
        };
        Update: {
          id?: string;
          framework_id?: string;
          control_id_str?: string;
          title?: string;
          description?: string;
          category?: string;
          control_type?: 'technical' | 'operational' | 'management';
          created_at?: string;
        };
      };
      assessments: {
        Row: {
          id: string;
          user_id: string;
          framework_id: string;
          name: string;
          status: 'in-progress' | 'completed' | 'archived';
          overall_score: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          framework_id: string;
          name: string;
          status?: 'in-progress' | 'completed' | 'archived';
          overall_score?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          framework_id?: string;
          name?: string;
          status?: 'in-progress' | 'completed' | 'archived';
          overall_score?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      assessment_responses: {
        Row: {
          id: string;
          assessment_id: string;
          control_id: string;
          response: 'implemented' | 'partially-implemented' | 'not-implemented';
          evidence: string | null;
          score: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          assessment_id: string;
          control_id: string;
          response: 'implemented' | 'partially-implemented' | 'not-implemented';
          evidence?: string | null;
          score?: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          assessment_id?: string;
          control_id?: string;
          response?: 'implemented' | 'partially-implemented' | 'not-implemented';
          evidence?: string | null;
          score?: number;
          notes?: string | null;
          created_at?: string;
        };
      };
      travel_advisories: {
        Row: {
          id: string;
          country_code: string;
          country_name: string;
          advisory_level: number;
          description: string;
          source: string;
          fetched_at: string;
          expires_at: string;
        };
        Insert: {
          id?: string;
          country_code: string;
          country_name: string;
          advisory_level: number;
          description: string;
          source: string;
          fetched_at?: string;
          expires_at: string;
        };
        Update: {
          id?: string;
          country_code?: string;
          country_name?: string;
          advisory_level?: number;
          description?: string;
          source?: string;
          fetched_at?: string;
          expires_at?: string;
        };
      };
      trip_risk_reports: {
        Row: {
          id: string;
          user_id: string;
          assessment_id: string | null;
          destination_country: string;
          departure_date: string;
          return_date: string;
          grc_score: number;
          travel_score: number;
          combined_score: number;
          report_data: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          assessment_id?: string | null;
          destination_country: string;
          departure_date: string;
          return_date: string;
          grc_score: number;
          travel_score: number;
          combined_score: number;
          report_data: Record<string, unknown>;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          assessment_id?: string | null;
          destination_country?: string;
          departure_date?: string;
          return_date?: string;
          grc_score?: number;
          travel_score?: number;
          combined_score?: number;
          report_data?: Record<string, unknown>;
          created_at?: string;
        };
      };
      agent_runs: {
        Row: {
          id: string;
          agent_name: string;
          workflow: string;
          task_title: string;
          status: 'pending' | 'running' | 'completed' | 'failed';
          latency_ms: number;
          tasks_completed: number;
          total_tasks: number;
          input_tokens: number;
          output_tokens: number;
          cost_usd: number;
          error_message: string | null;
          autonomy_level: 'low' | 'medium' | 'high';
          human_reviewed: boolean;
          output_in_range: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          agent_name: string;
          workflow: string;
          task_title: string;
          status?: 'pending' | 'running' | 'completed' | 'failed';
          latency_ms: number;
          tasks_completed: number;
          total_tasks: number;
          input_tokens: number;
          output_tokens: number;
          cost_usd: number;
          error_message?: string | null;
          autonomy_level: 'low' | 'medium' | 'high';
          human_reviewed?: boolean;
          output_in_range?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          agent_name?: string;
          workflow?: string;
          task_title?: string;
          status?: 'pending' | 'running' | 'completed' | 'failed';
          latency_ms?: number;
          tasks_completed?: number;
          total_tasks?: number;
          input_tokens?: number;
          output_tokens?: number;
          cost_usd?: number;
          error_message?: string | null;
          autonomy_level?: 'low' | 'medium' | 'high';
          human_reviewed?: boolean;
          output_in_range?: boolean;
          created_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string;
          action: string;
          resource_type: string;
          resource_id: string;
          details: Record<string, unknown> | null;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action: string;
          resource_type: string;
          resource_id: string;
          details?: Record<string, unknown> | null;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          action?: string;
          resource_type?: string;
          resource_id?: string;
          details?: Record<string, unknown> | null;
          ip_address?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
