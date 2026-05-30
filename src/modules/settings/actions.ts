"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getDefaultOrganization } from "@/modules/core/services/organization";

function formText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function listFromText(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function saveCommercialSettingsAction(formData: FormData) {
  const organization = await getDefaultOrganization();
  const supabase = createSupabaseAdminClient();

  const tradeName = formText(formData, "trade_name") || "MD Marketing";
  const brandName = formText(formData, "brand_name") || tradeName;
  const businessDescription = formText(formData, "business_description");
  const targetAudience = formText(formData, "target_audience");
  const mainOffers = listFromText(formText(formData, "main_offers"));
  const qualificationCriteria = listFromText(formText(formData, "qualification_criteria"));
  const toneOfVoice = formText(formData, "tone_of_voice") || "consultivo";

  const [{ error: orgError }, { error: aiError }] = await Promise.all([
    supabase
      .from("organizations")
      .update({
        city: formText(formData, "city"),
        segment: formText(formData, "segment"),
        trade_name: tradeName,
        website: formText(formData, "website")
      })
      .eq("id", organization.id),
    supabase.from("ai_settings").upsert(
      {
        organization_id: organization.id,
        brand_name: brandName,
        business_description: businessDescription,
        main_offers: mainOffers,
        qualification_criteria: qualificationCriteria,
        target_audience: targetAudience,
        tone_of_voice: toneOfVoice
      },
      { onConflict: "organization_id" }
    )
  ]);

  if (orgError) {
    throw new Error(orgError.message);
  }

  if (aiError) {
    throw new Error(aiError.message);
  }

  await supabase.from("activities").insert({
    organization_id: organization.id,
    type: "settings_updated",
    title: "Configuracoes comerciais atualizadas",
    description: "Base comercial, tom de voz, ofertas e criterios da IA SDR foram atualizados."
  });

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/configuracoes");
  revalidatePath("/mensagens");
}
