import { generateChatCompletion, isAiConfigured } from "@/lib/ai/openrouter";

type CompanyInput = {
  city: string;
  contactName?: string;
  description?: string;
  hasInstagram: boolean;
  hasPhone: boolean;
  instagramUrl?: string;
  name: string;
  segment: string;
  sourceUrl?: string;
  websiteUrl?: string;
};

export type CommercialAnalysis = {
  buyingSignals: string[];
  contactabilityScore: number;
  digitalPresenceScore: number;
  fitScore: number;
  generatedBy: string;
  message: string;
  objections: string[];
  opportunities: string[];
  opportunityScore: number;
  possiblePains: string[];
  recommendedOffer: string;
  reasoning: string;
  score: number;
  summary: string;
  temperature: "cold" | "warm" | "hot";
  urgencyScore: number;
};

function normalizeSegment(segment: string) {
  return segment.trim() || "empresa local";
}

function clampScore(value: unknown, fallback: number) {
  const number = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(number)) {
    return fallback;
  }

  return Math.min(100, Math.max(0, Math.round(number)));
}

function stringList(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const list = value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  return list.length > 0 ? list.slice(0, 6) : fallback;
}

function text(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeTemperature(value: unknown, score: number): "cold" | "warm" | "hot" {
  if (value === "hot" || value === "warm" || value === "cold") {
    return value;
  }

  if (score >= 82) {
    return "hot";
  }

  if (score >= 65) {
    return "warm";
  }

  return "cold";
}

function buildFallbackAnalysis(company: CompanyInput): CommercialAnalysis {
  const segment = normalizeSegment(company.segment);
  const fitScore = 74;
  const urgencyScore = company.hasInstagram ? 72 : 84;
  const digitalPresenceScore = company.hasInstagram ? 68 : 44;
  const contactabilityScore = company.hasPhone ? 86 : 55;
  const opportunityScore = Math.round(
    (fitScore + urgencyScore + digitalPresenceScore + contactabilityScore) / 4
  );
  const score = Math.min(96, Math.max(45, opportunityScore + (company.hasPhone ? 4 : -6)));
  const temperature = score >= 82 ? "hot" : score >= 65 ? "warm" : "cold";

  const possiblePains = [
    `Baixa previsibilidade de demanda para ${segment}.`,
    "Presenca digital pode estar desconectada do processo comercial.",
    "Possivel perda de oportunidades por falta de abordagem consultiva.",
    company.hasInstagram
      ? "Instagram existe, mas pode precisar de conteudo orientado para conversao."
      : "Canal social principal nao identificado na prospeccao inicial."
  ];

  const opportunities = [
    "Criar uma leitura rapida do posicionamento digital.",
    "Conectar conteudo, trafego e atendimento para gerar contatos qualificados.",
    "Abordar o decisor com foco em crescimento comercial, nao em postagem.",
    "Oferecer uma conversa curta para mapear gargalos de captacao."
  ];

  const greeting = company.contactName ? `Oi ${company.contactName}, tudo bem?` : "Oi, tudo bem?";

  return {
    buyingSignals: ["Empresa localizada em busca publica", "Oportunidade comercial inicial"],
    contactabilityScore,
    digitalPresenceScore,
    fitScore,
    generatedBy: isAiConfigured() ? "ia_sdr_fallback_v1" : "ia_sdr_rules_v1",
    message: `${greeting} Vi a ${company.name} em ${company.city} e percebi uma oportunidade de melhorar a captacao de clientes pelo digital.

Sou da MD Marketing Empresarial. A gente ajuda empresas a transformar presenca digital em demanda e vendas, unindo conteudo, trafego e processo comercial.

Faz sentido eu te mostrar uma ideia rapida para aumentar os contatos qualificados da ${company.name}?`,
    objections: ["Ja tenho agencia", "Quanto custa?", "Me manda uma proposta"],
    opportunities,
    opportunityScore,
    possiblePains,
    reasoning:
      "Score calculado por regra local com base em segmento, cidade, presenca digital e contato localizado.",
    recommendedOffer:
      "Analise de mercado digital + plano inicial de captacao com conteudo, trafego e processo comercial.",
    score,
    summary: `Lead analisado para ${segment} em ${company.city}. Prioridade comercial definida por dados publicos disponiveis.`,
    temperature,
    urgencyScore
  };
}

function parseJsonObject(content: string) {
  const trimmed = content.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");

  if (start < 0 || end < start) {
    throw new Error("Resposta da IA sem JSON valido.");
  }

  return JSON.parse(trimmed.slice(start, end + 1)) as Record<string, unknown>;
}

function mergeAiAnalysis(company: CompanyInput, payload: Record<string, unknown>) {
  const fallback = buildFallbackAnalysis(company);
  const score = clampScore(payload.score, fallback.score);

  return {
    buyingSignals: stringList(payload.buyingSignals, fallback.buyingSignals),
    contactabilityScore: clampScore(payload.contactabilityScore, fallback.contactabilityScore),
    digitalPresenceScore: clampScore(payload.digitalPresenceScore, fallback.digitalPresenceScore),
    fitScore: clampScore(payload.fitScore, fallback.fitScore),
    generatedBy: "openrouter",
    message: text(payload.message, fallback.message),
    objections: stringList(payload.objections, fallback.objections),
    opportunities: stringList(payload.opportunities, fallback.opportunities),
    opportunityScore: clampScore(payload.opportunityScore, fallback.opportunityScore),
    possiblePains: stringList(payload.possiblePains, fallback.possiblePains),
    reasoning: text(payload.reasoning, fallback.reasoning),
    recommendedOffer: text(payload.recommendedOffer, fallback.recommendedOffer),
    score,
    summary: text(payload.summary, fallback.summary),
    temperature: normalizeTemperature(payload.temperature, score),
    urgencyScore: clampScore(payload.urgencyScore, fallback.urgencyScore)
  } satisfies CommercialAnalysis;
}

export async function buildCommercialAnalysis(company: CompanyInput): Promise<CommercialAnalysis> {
  if (!isAiConfigured()) {
    return buildFallbackAnalysis(company);
  }

  const system = `Voce e a IA SDR da MD Marketing Empresarial.
Analise leads B2B locais para vender marketing com foco em posicionamento, demanda, CRM e vendas.
Responda somente JSON valido, sem markdown.`;

  const user = JSON.stringify({
    company,
    expectedJson: {
      buyingSignals: ["string"],
      contactabilityScore: 0,
      digitalPresenceScore: 0,
      fitScore: 0,
      message: "Mensagem curta de WhatsApp, consultiva, em portugues do Brasil, com no maximo 520 caracteres.",
      objections: ["string"],
      opportunities: ["string"],
      opportunityScore: 0,
      possiblePains: ["string"],
      reasoning: "string",
      recommendedOffer: "string",
      score: 0,
      summary: "string",
      temperature: "cold | warm | hot",
      urgencyScore: 0
    },
    rules: [
      "Priorize conversa com dono, socio, fundador ou decisor quando houver nome.",
      "Nao invente telefone, site, Instagram ou nome de pessoa.",
      "A mensagem deve soar humana, direta e consultiva.",
      "Nao mencione que e IA.",
      "Venda uma conversa rapida, nao uma proposta completa no primeiro contato."
    ]
  });

  try {
    const content = await generateChatCompletion([
      { content: system, role: "system" },
      { content: user, role: "user" }
    ]);
    return mergeAiAnalysis(company, parseJsonObject(content));
  } catch {
    return buildFallbackAnalysis(company);
  }
}
