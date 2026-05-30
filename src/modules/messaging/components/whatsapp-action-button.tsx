"use client";

import { useState } from "react";

type WhatsAppActionButtonProps = {
  contactId: string;
  leadId: string;
  messageId: string;
  url: string;
};

export function WhatsAppActionButton({
  contactId,
  leadId,
  messageId,
  url
}: WhatsAppActionButtonProps) {
  const [isSaving, setIsSaving] = useState(false);

  async function handleOpen() {
    setIsSaving(true);

    try {
      await fetch("/api/messaging/whatsapp-open", {
        body: JSON.stringify({ contactId, leadId, messageId }),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      });
    } finally {
      setIsSaving(false);
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <button
      className="inline-flex w-fit items-center justify-center rounded-md bg-teal px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal/90 disabled:cursor-wait disabled:bg-slate-400"
      disabled={isSaving}
      onClick={handleOpen}
      type="button"
    >
      {isSaving ? "Registrando..." : "Abrir WhatsApp"}
    </button>
  );
}
