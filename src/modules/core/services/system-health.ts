import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type HealthStatus = "ready" | "warning" | "error";

type HealthCheck = {
  label: string;
  status: HealthStatus;
  detail: string;
};

type HealthCheckTable =
  | "organizations"
  | "companies"
  | "leads"
  | "prospecting_campaigns"
  | "activities";

const checks: { label: string; table: HealthCheckTable }[] = [
  { label: "Organizacoes", table: "organizations" },
  { label: "Empresas", table: "companies" },
  { label: "Leads", table: "leads" },
  { label: "Campanhas", table: "prospecting_campaigns" },
  { label: "Atividades", table: "activities" }
];

export type SystemHealth = {
  status: HealthStatus;
  summary: string;
  checks: HealthCheck[];
};

export async function getSystemHealth(): Promise<SystemHealth> {
  let supabase;

  try {
    supabase = createSupabaseAdminClient();
  } catch (error) {
    return {
      status: "error",
      summary: "Variaveis do Supabase nao configuradas.",
      checks: [
        {
          label: "Ambiente",
          status: "error",
          detail: error instanceof Error ? error.message : "Erro desconhecido."
        }
      ]
    };
  }

  const results = await Promise.all(
    checks.map(async (check) => {
      const { count, error } = await supabase
        .from(check.table)
        .select("id", { count: "exact", head: true });

      if (error) {
        return {
          label: check.label,
          status: "error" as const,
          detail: error.message
        };
      }

      return {
        label: check.label,
        status: "ready" as const,
        detail: `${count ?? 0} registros`
      };
    })
  );

  const hasError = results.some((result) => result.status === "error");

  return {
    status: hasError ? "error" : "ready",
    summary: hasError
      ? "Conexao Supabase encontrada, mas ha tabelas com erro."
      : "Supabase conectado e tabelas essenciais respondendo.",
    checks: results
  };
}
