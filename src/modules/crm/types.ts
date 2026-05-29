export type CompanySummary = {
  id: string;
  name: string;
  segment: string;
  city: string;
  state: string;
  phone: string;
  instagramUrl: string;
  websiteUrl: string;
  dataConfidence: number;
  createdAt: string;
};

export type LeadSummary = {
  id: string;
  companyId: string;
  companyName: string;
  status: string;
  temperature: string;
  origin: string;
  nextFollowUpAt: string;
  createdAt: string;
};
