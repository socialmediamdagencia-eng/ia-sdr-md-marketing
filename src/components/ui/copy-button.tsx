"use client";

import { useState } from "react";

type CopyButtonProps = {
  className?: string;
  label?: string;
  text: string;
};

export function CopyButton({ className = "", label = "Copiar", text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button className={className} onClick={handleCopy} type="button">
      {copied ? "Copiado" : label}
    </button>
  );
}
