type CompanyInput = {
  city: string;
  hasInstagram: boolean;
  hasPhone: boolean;
  name: string;
  segment: string;
};

function normalizeSegment(segment: string) {
  return segment.trim() || "empresa local";
}

export function buildCommercialAnalysis(company: CompanyInput) {
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

  const recommendedOffer =
    "Analise de mercado digital + plano inicial de captacao com conteudo, trafego e processo comercial.";

  const message = `Oi ${company.name.includes(" ") ? "tudo bem" : "tudo bem"}? Vi a ${company.name} em ${company.city} e percebi uma oportunidade de melhorar a captacao de clientes pelo digital.

Sou da MD Marketing Empresarial. A gente ajuda empresas a transformar presenca digital em demanda e vendas, unindo conteudo, trafego e processo comercial.

Faz sentido eu te mostrar uma ideia rapida para aumentar os contatos qualificados da ${company.name}?`;

  return {
    contactabilityScore,
    digitalPresenceScore,
    fitScore,
    message,
    opportunities,
    opportunityScore,
    possiblePains,
    recommendedOffer,
    score,
    temperature,
    urgencyScore
  };
}
