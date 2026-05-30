import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getDefaultOrganization } from "@/modules/core/services/organization";

type Payload = {
  contactId?: string;
  leadId?: string;
  messageId?: string;
};

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Payload;
    const leadId = text(payload.leadId);
    const contactId = text(payload.contactId);
    const messageId = text(payload.messageId);

    if (!leadId) {
      return NextResponse.json({ message: "Lead nao informado.", ok: false }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const organization = await getDefaultOrganization();
    const now = new Date();
    const nextFollowUp = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString();

    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .select("id, company_id, status")
      .eq("organization_id", organization.id)
      .eq("id", leadId)
      .single();

    if (leadError) {
      throw new Error(leadError.message);
    }

    const currentStatus = text(lead.status);
    const shouldMoveToContacted = ["new", "qualified", "contacted"].includes(currentStatus);

    await Promise.all([
      supabase
        .from("leads")
        .update({
          last_contacted_at: now.toISOString(),
          next_follow_up_at: nextFollowUp,
          status: shouldMoveToContacted ? "contacted" : currentStatus
        })
        .eq("organization_id", organization.id)
        .eq("id", leadId),
      messageId
        ? supabase
            .from("generated_messages")
            .update({ status: "copied" })
            .eq("organization_id", organization.id)
            .eq("id", messageId)
        : Promise.resolve({ error: null }),
      supabase.from("message_events").insert({
        organization_id: organization.id,
        lead_id: leadId,
        contact_id: contactId || null,
        generated_message_id: messageId || null,
        channel: "whatsapp",
        direction: "outbound",
        status: "copied",
        metadata: {
          action: "opened_whatsapp",
          note: "Usuario abriu o WhatsApp com a mensagem preparada pela IA SDR."
        }
      }),
      supabase.from("activities").insert({
        organization_id: organization.id,
        lead_id: leadId,
        company_id: text(lead.company_id) || null,
        contact_id: contactId || null,
        type: "whatsapp_opened",
        title: "WhatsApp aberto para abordagem",
        description:
          "Mensagem da IA SDR aberta no WhatsApp. O envio final continua sob confirmacao humana.",
        metadata: {
          generated_message_id: messageId || null,
          next_follow_up_at: nextFollowUp
        }
      })
    ]);

    return NextResponse.json({
      message: "Abordagem registrada.",
      ok: true
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Erro ao registrar abordagem.",
        ok: false
      },
      { status: 500 }
    );
  }
}
