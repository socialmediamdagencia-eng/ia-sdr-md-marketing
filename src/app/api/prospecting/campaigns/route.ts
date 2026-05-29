import { NextResponse } from "next/server";
import { getProspectingCampaigns } from "@/modules/prospecting/services/prospecting-queries";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const campaigns = await getProspectingCampaigns();
    return NextResponse.json({ campaigns, ok: true });
  } catch (error) {
    return NextResponse.json({
      campaigns: [],
      ok: false,
      message: error instanceof Error ? error.message : "Nao foi possivel carregar campanhas."
    });
  }
}
