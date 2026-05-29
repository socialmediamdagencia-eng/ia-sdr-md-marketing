import type { JsonValue } from "@/types/domain";

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          trade_name: string | null;
          website: string | null;
          segment: string | null;
          city: string | null;
          state: string | null;
          country: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["organizations"]["Row"]> & { name: string };
        Update: Partial<Database["public"]["Tables"]["organizations"]["Row"]>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          name: string;
          email: string;
          role: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          organization_id: string;
          user_id: string;
          name: string;
          email: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      organization_settings: JsonTable;
      companies: JsonTable;
      contacts: JsonTable;
      leads: JsonTable;
      pipelines: JsonTable;
      pipeline_stages: JsonTable;
      prospecting_campaigns: JsonTable;
      prospecting_results: JsonTable;
      data_sources: JsonTable;
      enrichment_jobs: JsonTable;
      lead_scores: JsonTable;
      lead_insights: JsonTable;
      score_rules: JsonTable;
      message_templates: JsonTable;
      generated_messages: JsonTable;
      message_events: JsonTable;
      tasks: JsonTable;
      follow_up_sequences: JsonTable;
      follow_up_steps: JsonTable;
      lead_follow_up_sequences: JsonTable;
      integrations: JsonTable;
      meetings: JsonTable;
      meeting_participants: JsonTable;
      meeting_notes: JsonTable;
      activities: JsonTable;
      dashboard_snapshots: JsonTable;
      ai_settings: JsonTable;
      ai_prompts: JsonTable;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      campaign_status: "draft" | "pending" | "processing" | "completed" | "partial" | "failed";
      lead_status:
        | "new"
        | "qualified"
        | "contacted"
        | "replied"
        | "meeting_scheduled"
        | "proposal_sent"
        | "won"
        | "lost"
        | "archived";
      lead_temperature: "cold" | "warm" | "hot";
      task_status: "pending" | "in_progress" | "completed" | "canceled";
      priority_level: "low" | "medium" | "high" | "urgent";
      message_status: "draft" | "copied" | "sent" | "failed" | "replied";
      message_direction: "inbound" | "outbound";
      integration_status: "disconnected" | "connected" | "expired" | "error";
      meeting_status: "scheduled" | "completed" | "canceled" | "no_show";
    };
    CompositeTypes: Record<string, never>;
  };
};

type JsonTable = {
  Row: Record<string, JsonValue | undefined>;
  Insert: Record<string, JsonValue | undefined>;
  Update: Record<string, JsonValue | undefined>;
  Relationships: [];
};
