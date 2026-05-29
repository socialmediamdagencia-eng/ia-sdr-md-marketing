"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getDefaultOrganization } from "@/modules/core/services/organization";

function formText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function createActivity(input: {
  organizationId: string;
  companyId?: string;
  leadId?: string;
  title: string;
  description: string;
  type: string;
}) {
  const supabase = createSupabaseAdminClient();

  await supabase.from("activities").insert({
    organization_id: input.organizationId,
    company_id: input.companyId,
    lead_id: input.leadId,
    type: input.type,
    title: input.title,
    description: input.description
  });
}

export async function createCompanyAction(formData: FormData) {
  const name = formText(formData, "name");

  if (!name) {
    throw new Error("Informe o nome da empresa.");
  }

  const organization = await getDefaultOrganization();
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("companies")
    .insert({
      organization_id: organization.id,
      name,
      segment: formText(formData, "segment"),
      city: formText(formData, "city"),
      state: formText(formData, "state"),
      phone: formText(formData, "phone"),
      instagram_url: formText(formData, "instagram_url"),
      website_url: formText(formData, "website_url"),
      source: "manual",
      data_confidence: 80
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await createActivity({
    organizationId: organization.id,
    companyId: String(data.id),
    type: "company_created",
    title: "Empresa criada",
    description: `Empresa ${name} adicionada ao CRM.`
  });

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/empresas");
  revalidatePath("/leads");
}

export async function createLeadAction(formData: FormData) {
  const companyId = formText(formData, "company_id");

  if (!companyId) {
    throw new Error("Selecione uma empresa.");
  }

  const organization = await getDefaultOrganization();
  const supabase = createSupabaseAdminClient();

  const status = formText(formData, "status") || "new";
  const temperature = formText(formData, "temperature") || "cold";
  const origin = formText(formData, "origin") || "manual";

  const { data, error } = await supabase
    .from("leads")
    .upsert(
      {
        organization_id: organization.id,
        company_id: companyId,
        status,
        temperature,
        origin
      },
      { onConflict: "organization_id,company_id" }
    )
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await createActivity({
    organizationId: organization.id,
    companyId,
    leadId: String(data.id),
    type: "lead_created",
    title: "Lead criado",
    description: "Lead manual criado ou atualizado no CRM."
  });

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/empresas");
  revalidatePath("/leads");
}
