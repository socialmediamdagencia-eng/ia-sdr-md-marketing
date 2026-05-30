import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getDefaultOrganization } from "@/modules/core/services/organization";

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export type CommercialSettings = {
  brandName: string;
  businessDescription: string;
  city: string;
  mainOffers: string[];
  qualificationCriteria: string[];
  segment: string;
  targetAudience: string;
  toneOfVoice: string;
  tradeName: string;
  website: string;
};

export async function getCommercialSettings(): Promise<CommercialSettings> {
  const supabase = createSupabaseAdminClient();
  const organization = await getDefaultOrganization();

  const { data: aiSettings, error } = await supabase
    .from("ai_settings")
    .select(
      "brand_name, business_description, target_audience, main_offers, tone_of_voice, qualification_criteria"
    )
    .eq("organization_id", organization.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return {
    brandName: text(aiSettings?.brand_name) || "MD Marketing",
    businessDescription:
      text(aiSettings?.business_description) ||
      "Marketing focado em posicionamento, demanda e vendas.",
    city: text(organization.city),
    mainOffers: stringArray(aiSettings?.main_offers),
    qualificationCriteria: stringArray(aiSettings?.qualification_criteria),
    segment: text(organization.segment),
    targetAudience:
      text(aiSettings?.target_audience) ||
      "Empresas locais que precisam gerar demanda, organizar CRM e vender mais.",
    toneOfVoice: text(aiSettings?.tone_of_voice) || "consultivo",
    tradeName: text(organization.trade_name) || text(organization.name),
    website: text(organization.website)
  };
}
