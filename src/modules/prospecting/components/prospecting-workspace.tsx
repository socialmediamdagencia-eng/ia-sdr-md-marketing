"use client";

import { FormEvent, useEffect, useState } from "react";
import { CampaignsTable } from "@/modules/prospecting/components/campaigns-table";
import type { ProspectingCampaignSummary } from "@/modules/prospecting/services/prospecting-queries";

type ApiState = {
  message: string;
  status: "idle" | "loading" | "success" | "error";
};

export function ProspectingWorkspace() {
  const [campaigns, setCampaigns] = useState<ProspectingCampaignSummary[]>([]);
  const [state, setState] = useState<ApiState>({ message: "", status: "idle" });

  async function loadCampaigns() {
    try {
      const response = await fetch("/api/prospecting/campaigns", { cache: "no-store" });
      const payload = (await response.json()) as {
        campaigns?: ProspectingCampaignSummary[];
        message?: string;
        ok?: boolean;
      };

      setCampaigns(payload.campaigns ?? []);
      if (payload.ok === false && payload.message) {
        setState({ message: payload.message, status: "error" });
      }
    } catch {
      setState({
        message: "Nao foi possivel carregar o historico agora.",
        status: "error"
      });
    }
  }

  useEffect(() => {
    void loadCampaigns();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const segment = String(formData.get("segment") ?? "").trim();
    const city = String(formData.get("city") ?? "").trim();
    const quantity = Number(formData.get("quantity") ?? 0);

    setState({ message: "Buscando dados publicos e criando leads...", status: "loading" });

    try {
      const response = await fetch("/api/prospecting/run", {
        body: JSON.stringify({ city, quantity, segment }),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      });
      const payload = (await response.json()) as { message?: string; ok?: boolean };

      if (!payload.ok) {
        setState({
          message: payload.message ?? "A busca nao conseguiu finalizar.",
          status: "error"
        });
        await loadCampaigns();
        return;
      }

      setState({
        message: payload.message ?? "Busca finalizada.",
        status: "success"
      });
      form.reset();
      await loadCampaigns();
    } catch {
      setState({
        message: "A busca falhou, mas a tela continua funcionando. Tente outro segmento/cidade.",
        status: "error"
      });
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="rounded-md border border-line bg-white p-5">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-teal">IA SDR</p>
            <h2 className="mt-1 text-lg font-semibold text-ink">Nova busca real</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              A busca roda isolada em API. Se falhar, a pagina continua aberta e mostra o
              motivo.
            </p>
          </div>
          <span className="w-fit rounded-md border border-line px-3 py-1 text-xs text-slate-600">
            Busca publica experimental
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-1 text-sm">
            <span className="font-medium text-ink">Segmento</span>
            <input
              className="h-10 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-teal"
              name="segment"
              placeholder="Ex: clinica odontologica"
              required
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium text-ink">Cidade</span>
            <input
              className="h-10 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-teal"
              name="city"
              placeholder="Ex: Sao Paulo"
              required
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium text-ink">Quantidade</span>
            <input
              className="h-10 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-teal"
              max="30"
              min="1"
              name="quantity"
              placeholder="Ex: 10"
              required
              type="number"
            />
          </label>
        </div>

        {state.status !== "idle" ? (
          <div
            className={`mt-4 rounded-md border p-3 text-sm ${
              state.status === "success"
                ? "border-teal/20 bg-teal/10 text-teal"
                : state.status === "loading"
                  ? "border-line bg-mist text-slate-600"
                  : "border-coral/20 bg-coral/10 text-coral"
            }`}
          >
            {state.message}
          </div>
        ) : null}

        <div className="mt-5 flex justify-end">
          <button
            className="rounded-md bg-teal px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal/90 disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={state.status === "loading"}
            type="submit"
          >
            {state.status === "loading" ? "Buscando..." : "Buscar leads reais"}
          </button>
        </div>
      </form>

      <CampaignsTable campaigns={campaigns} />
    </>
  );
}
