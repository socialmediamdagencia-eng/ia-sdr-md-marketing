import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type OrganizationRecord = {
  id: string;
  name: string;
};

export async function getDefaultOrganization(): Promise<OrganizationRecord> {
  const supabase = createSupabaseAdminClient();

  const { data: existing, error: existingError } = await supabase
    .from("organizations")
    .select("id, name")
    .eq("name", "MD Marketing")
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existing?.id && typeof existing.id === "string") {
    return {
      id: existing.id,
      name: typeof existing.name === "string" ? existing.name : "MD Marketing"
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
    .select("id, name")
    .single();

  if (createError) {
    throw new Error(createError.message);
  }

  return {
    id: String(created.id),
    name: typeof created.name === "string" ? created.name : "MD Marketing"
  };
}
