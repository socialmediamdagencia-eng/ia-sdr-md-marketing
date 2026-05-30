import { env } from "@/lib/env";

type OpenRouterMessage = {
  content: string;
  role: "system" | "user";
};

type OpenRouterResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
};

export function isAiConfigured() {
  return Boolean(env.openRouterApiKey);
}

export async function generateChatCompletion(messages: OpenRouterMessage[]) {
  if (!env.openRouterApiKey) {
    return "";
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    body: JSON.stringify({
      messages,
      model: env.openRouterModel,
      response_format: { type: "json_object" },
      temperature: 0.45
    }),
    headers: {
      Authorization: `Bearer ${env.openRouterApiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://ia-sdr-md-marketing.vercel.app",
      "X-Title": "IA SDR MD Marketing"
    },
    method: "POST"
  });

  const payload = (await response.json().catch(() => ({}))) as OpenRouterResponse;

  if (!response.ok) {
    throw new Error(payload.error?.message ?? "A IA nao respondeu agora.");
  }

  return payload.choices?.[0]?.message?.content ?? "";
}
