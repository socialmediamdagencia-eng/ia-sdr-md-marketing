import { NextResponse } from "next/server";
import { analyzeConversation } from "@/modules/messaging/services/conversation-copilot";

type SuggestBody = {
  companyName?: string;
  contactName?: string;
  conversation?: string;
  latestCustomerMessage?: string;
  objective?: string;
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Origin": "*"
  };
}

function text(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: corsHeaders(),
    status: 204
  });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as SuggestBody;
  const conversation = text(body.conversation);

  if (!conversation) {
    return NextResponse.json(
      { error: "Conversa nao enviada." },
      {
        headers: corsHeaders(),
        status: 400
      }
    );
  }

  const result = await analyzeConversation({
    companyName: text(body.companyName, "Lead WhatsApp"),
    contactName: text(body.contactName, text(body.companyName, "Lead WhatsApp")),
    conversation,
    latestCustomerMessage: text(body.latestCustomerMessage),
    objective: text(body.objective, "responder"),
    pains: [
      "Baixa previsibilidade comercial",
      "Poucos leads qualificados",
      "Dificuldade em transformar presenca digital em vendas"
    ],
    recommendedOffer:
      "Diagnostico comercial e digital da MD Marketing para identificar gargalos e oportunidades."
  });

  return NextResponse.json(result, { headers: corsHeaders() });
}
