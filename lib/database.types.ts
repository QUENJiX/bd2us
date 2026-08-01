export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          curriculum: string | null;
          current_year: string | null;
          target_intake: string | null;
          aid_band: string | null;
          testing_status: string | null;
          interests: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & { id: string };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      user_task_progress: {
        Row: { user_id: string; task_id: string; completed: boolean; completed_at: string | null; updated_at: string };
        Insert: Database["public"]["Tables"]["user_task_progress"]["Row"];
        Update: Partial<Database["public"]["Tables"]["user_task_progress"]["Row"]>;
        Relationships: [];
      };
      saved_colleges: {
        Row: { user_id: string; college_id: string; bucket: string; notes: string | null; created_at: string; updated_at: string };
        Insert: Database["public"]["Tables"]["saved_colleges"]["Row"];
        Update: Partial<Database["public"]["Tables"]["saved_colleges"]["Row"]>;
        Relationships: [];
      };
      user_deadlines: {
        Row: { id: string; user_id: string; title: string; due_at: string; source_url: string | null; completed: boolean; created_at: string };
        Insert: Partial<Database["public"]["Tables"]["user_deadlines"]["Row"]> & { user_id: string; title: string; due_at: string };
        Update: Partial<Database["public"]["Tables"]["user_deadlines"]["Row"]>;
        Relationships: [];
      };
      colleges: {
        Row: { id: string; slug: string; name: string; short_name: string; aliases: string[]; location: string; city: string | null; state: string | null; region: string | null; institution_type: string; ranking_category: string; institution_control: string | null; campus_setting: string | null; enrollment_band: string | null; aid_policy: string; meets_full_need: boolean | null; merit_aid: boolean | null; cost_of_attendance: number | null; acceptance_rate: number | null; international_aid_percent: number | null; average_international_aid: number | null; special_note: string | null; source_scope: string | null; original_description: string | null; dataset_reviewed_at: string | null; research_highlight_override: string | null; official_review_status: string; official_reviewed_at: string | null; summary: string; status: string; last_verified_at: string | null; next_review_at: string | null; updated_at: string };
        Insert: Partial<Database["public"]["Tables"]["colleges"]["Row"]> & { slug: string; name: string; short_name: string; location: string; institution_type: string; aid_policy: string; summary: string };
        Update: Partial<Database["public"]["Tables"]["colleges"]["Row"]>;
        Relationships: [];
      };
      college_facts: {
        Row: { id: string; college_id: string; fact_key: string; fact_value: Json; status: string; fact_status: string; source_id: string | null; data_year: string | null; cycle: string | null; raw_value: Json | null; calculation_method: string | null; last_verified_at: string };
        Insert: Partial<Database["public"]["Tables"]["college_facts"]["Row"]> & { college_id: string; fact_key: string; fact_value: Json; last_verified_at: string };
        Update: Partial<Database["public"]["Tables"]["college_facts"]["Row"]>;
        Relationships: [];
      };
      college_sources: {
        Row: { id: string; college_id: string; label: string; url: string; last_verified_at: string; source_scope: string; data_year: string | null; cycle: string | null };
        Insert: Partial<Database["public"]["Tables"]["college_sources"]["Row"]> & { college_id: string; label: string; url: string; last_verified_at: string };
        Update: Partial<Database["public"]["Tables"]["college_sources"]["Row"]>;
        Relationships: [];
      };
      content_entries: {
        Row: { id: string; slug: string; content_type: string; locale: string; title: string; summary: string; body: Json; aliases: string[]; status: string; last_verified_at: string | null; next_review_at: string | null; published_at: string | null; updated_at: string };
        Insert: Partial<Database["public"]["Tables"]["content_entries"]["Row"]> & { slug: string; content_type: string; title: string; summary: string };
        Update: Partial<Database["public"]["Tables"]["content_entries"]["Row"]>;
        Relationships: [];
      };
      content_sources: {
        Row: { id: string; content_entry_id: string; label: string; url: string; last_verified_at: string; editor_notes: string | null };
        Insert: Partial<Database["public"]["Tables"]["content_sources"]["Row"]> & { content_entry_id: string; label: string; url: string; last_verified_at: string };
        Update: Partial<Database["public"]["Tables"]["content_sources"]["Row"]>;
        Relationships: [];
      };
      content_versions: {
        Row: { id: string; content_entry_id: string; editor_id: string | null; snapshot: Json; created_at: string };
        Insert: Partial<Database["public"]["Tables"]["content_versions"]["Row"]> & { content_entry_id: string; snapshot: Json };
        Update: Partial<Database["public"]["Tables"]["content_versions"]["Row"]>;
        Relationships: [];
      };
      audit_log: {
        Row: { id: string; actor_id: string | null; action: string; entity_type: string; entity_id: string; payload: Json; created_at: string };
        Insert: Partial<Database["public"]["Tables"]["audit_log"]["Row"]> & { action: string; entity_type: string; entity_id: string };
        Update: Partial<Database["public"]["Tables"]["audit_log"]["Row"]>;
        Relationships: [];
      };
      feedback_messages: {
        Row: { id: string; name: string; email: string; subject: string; message: string; status: string; created_at: string };
        Insert: Omit<Database["public"]["Tables"]["feedback_messages"]["Row"], "id" | "status" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["feedback_messages"]["Row"]>;
        Relationships: [];
      };
      search_queries: {
        Row: { id: string; query: string; result_count: number; created_at: string };
        Insert: Omit<Database["public"]["Tables"]["search_queries"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["search_queries"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      search_public_content: {
        Args: { search_query: string; search_types?: string[]; result_limit?: number; result_offset?: number };
        Returns: Array<{ content_type: string; title: string; summary: string; href: string; rank: number }>;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
