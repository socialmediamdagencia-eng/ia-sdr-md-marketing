export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | { [key: string]: JsonValue | undefined } | JsonValue[];

export type CampaignStatus = "draft" | "pending" | "processing" | "completed" | "partial" | "failed";
export type LeadStatus =
  | "new"
  | "qualified"
  | "contacted"
  | "replied"
  | "meeting_scheduled"
  | "proposal_sent"
  | "won"
  | "lost"
  | "archived";
export type LeadTemperature = "cold" | "warm" | "hot";
export type TaskStatus = "pending" | "in_progress" | "completed" | "canceled";
export type Priority = "low" | "medium" | "high" | "urgent";
export type MessageStatus = "draft" | "copied" | "sent" | "failed" | "replied";
export type MessageDirection = "inbound" | "outbound";
export type IntegrationStatus = "disconnected" | "connected" | "expired" | "error";
export type MeetingStatus = "scheduled" | "completed" | "canceled" | "no_show";
