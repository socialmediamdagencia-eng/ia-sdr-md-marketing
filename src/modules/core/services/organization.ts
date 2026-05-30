import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type OrganizationRecord = {
  city: string;
  id: string;
  name: string;
  segment: string;
  trade_name: string;
  website: string;
};

export async function getDefaultOrganization(): Promise<OrganizationRecord> {
  const supabase = createSupabaseAdminClient();

  const { data: existing, error: existingError } = await supabase
    .from("organizations")
    .select("id, name, trade_name, website, segment, city")
    .eq("name", "MD Marketing")
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existing?.id && typeof existing.id === "string") {
    return {
      city: typeof existing.city === "string" ? existing.city : "",
      id: existing.id,
      name: typeof existing.name === "string" ? existing.name : "MD Marketing",
      segment: typeof existing.segment === "string" ? existing.segment : "",
      trade_name: typeof existing.trade_name === "string" ? existing.trade_name : "",
      website: typeof existing.website === "string" ? existing.website : ""
    };
  }

  const { data: created, error: createError } = await supabase
    .from("organizations")
    .insert({
      name: "MD Marketing",
      trade_name: "MD Marketing",
      segment: "Marketing Digital",
      country: "BR"
    })
    .select("id, name, trade_name, website, segment, city")
    .single();

  if (createError) {
    throw new Error(createError.message);
  }

  return {
    city: typeof created.city === "string" ? created.city : "",
    id: String(created.id),
    name: typeof created.name === "string" ? created.name : "MD Marketing",
    segment: typeof created.segment === "string" ? created.segment : "",
    trade_name: typeof created.trade_name === "string" ? created.trade_name : "",
    website: typeof created.website === "string" ? created.website : ""
  };
}
