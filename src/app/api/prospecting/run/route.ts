import { NextResponse } from "next/server";
import { runProspectingCampaign } from "@/modules/prospecting/actions";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      city?: unknown;
      quantity?: unknown;
      segment?: unknown;
    };

    const segment = typeof body.segment === "string" ? body.segment : "";
    const city = typeof body.city === "string" ? body.city : "";
    const quantity = typeof body.quantity === "number" ? body.quantity : Number(body.quantity);

    await runProspectingCampaign({ city, quantity, segment });

    return NextResponse.json({
      ok: true,
      message: "Busca finalizada. Confira empresas, leads, mensagens e dashboard."
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Erro ao executar a prospeccao."
      },
      { status: 200 }
    );
  }
}
