import { generateChatCompletion, isAiConfigured } from "@/lib/ai/openrouter";

export type ConversationCopilotInput = {
  companyName: string;
  contactName?: string;
  conversation: string;
  latestCustomerMessage?: string;
  objective: string;
  pains: string[];
  recommendedOffer: string;
};

export type ConversationCopilotOutput = {
  leadStatus: "contacted" | "replied" | "meeting_scheduled" | "proposal_sent" | "won" | "lost";
  nextAction: string;
  reply: string;
  summary: string;
};

const generatedReplyMarkers = [
  "consigo te passar uma direcao",
  "que bom falar com voce",
  "a md ajuda empresas",
  "pela forma como a md trabalha",
  "para eu te mostrar algo bem objetivo",
  "hoje o maior desafio"
];

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function stripSpeaker(line: string) {
  return line.replace(/^(cliente|lead|contato|atendente|ia sdr|voce|você|tu):\s*/i, "").trim();
}

function isNoise(line: string) {
  const cleaned = normalize(stripSpeaker(line));

  if (!cleaned || cleaned.length < 2) {
    return true;
  }

  if (/^\d{1,2}:\d{2}$/.test(cleaned) || /^(hoje|ontem|segunda-feira|terca-feira|quarta-feira|quinta-feira|sexta-feira|sabado|domingo)$/.test(cleaned)) {
    return true;
  }

  return generatedReplyMarkers.some((marker) => cleaned.includes(marker));
}

function getOpening(input: ConversationCopilotInput) {
  const contactName = (input.contactName || input.companyName).split(/[|\-–—]/)[0].trim();
  const firstName =
    contactName && !normalize(contactName).includes("lead") ? contactName.split(/\s+/)[0] : "";
  const hour = Number(
    new Date().toLocaleString("pt-BR", {
      hour: "numeric",
      hour12: false,
      timeZone: "America/Sao_Paulo"
    })
  );
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  return firstName ? `${greeting}, ${firstName}!` : `${greeting}!`;
}

function latestCustomerMessage(input: ConversationCopilotInput) {
  if (input.latestCustomerMessage && !isNoise(input.latestCustomerMessage)) {
    return stripSpeaker(input.latestCustomerMessage);
  }

  const lines = input.conversation
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const explicitCustomerLines = lines
    .filter((line) => /^(cliente|lead|contato):/i.test(line))
    .map(stripSpeaker)
    .filter((line) => !isNoise(line));

  if (explicitCustomerLines.length) {
    return explicitCustomerLines.at(-1) ?? "";
  }

  const usefulLines = lines
    .filter((line) => !/^(atendente|ia sdr|voce|você|tu):/i.test(line))
    .map(stripSpeaker)
    .filter((line) => !isNoise(line));

  return usefulLines.at(-1) ?? "";
}

function hasAny(text: string, words: string[]) {
  return words.some((word) => text.includes(normalize(word)));
}

function getIntentFlags(input: ConversationCopilotInput) {
  const latest = latestCustomerMessage(input);
  const decisionText = normalize(latest || input.conversation);
  const fullText = normalize(input.conversation);
  const asksWhatElse = hasAny(decisionText, [
    "o que mais",
    "e o que mais",
    "oque mais",
    "alem disso",
    "além disso",
    "tem mais o que"
  ]);

  return {
    asksServices:
      asksWhatElse ||
      hasAny(decisionText, [
        "quais servicos",
        "quais serviços",
        "o que voces fazem",
        "o que vocês fazem",
        "tem social media",
        "social media"
      ]),
    asksOnlyTraffic:
      hasAny(decisionText, ["apenas trafego", "so trafego", "só trafego", "só tráfego", "apenas tráfego"]) ||
      (hasAny(decisionText, ["voces tem", "vocês tem", "fazem", "trabalham"]) &&
        hasAny(decisionText, ["trafego", "tráfego"])),
    asksPrice: hasAny(decisionText, ["valor", "preco", "preço", "quanto custa", "investimento"]),
    asksProposal: hasAny(decisionText, ["proposta", "manda", "envia"]),
    casualCoffee: hasAny(decisionText, ["cafe", "café"]),
    meetingSignal: hasAny(decisionText, ["reuniao", "reunião", "agenda", "horario", "horário"]),
    trafficObjection:
      (hasAny(decisionText, ["trafego", "tráfego"]) &&
        hasAny(decisionText, ["vende", "vender", "confio", "confiar", "conven"])) ||
      hasAny(decisionText, [
        "trafego nao vende",
        "tráfego nao vende",
        "nao acho que trafego vende",
        "nao confio em gestor de trafego",
        "gestor de trafego",
        "me convença",
        "me convensa",
        "me convence"
      ]),
    wantsMarketing: hasAny(decisionText, [
      "quero marketing",
      "marketing",
      "divulga",
      "anuncio",
      "anúncio",
      "trafego",
      "tráfego"
    ]),
    hasServiceContext: hasAny(fullText, ["social media", "trafego", "tráfego", "marketing", "anuncio", "anúncio"])
  };
}

function shouldUseLocalSalesBrain(input: ConversationCopilotInput) {
  const flags = getIntentFlags(input);

  return (
    flags.meetingSignal ||
    flags.trafficObjection ||
    flags.asksServices ||
    flags.asksOnlyTraffic ||
    flags.casualCoffee ||
    flags.asksPrice ||
    flags.asksProposal ||
    flags.wantsMarketing
  );
}

function cleanReply(reply: string) {
  const paragraphs = reply
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  return Array.from(new Set(paragraphs)).join("\n").trim();
}

function fallbackReply(input: ConversationCopilotInput): ConversationCopilotOutput {
  const flags = getIntentFlags(input);
  const opening = getOpening(input);

  if (flags.meetingSignal) {
    return {
      leadStatus: "meeting_scheduled",
      nextAction: "Sugerir dois horarios e marcar reuniao no painel.",
      reply: cleanReply(
        `${opening} Perfeito. Para ser objetivo, posso te mostrar em uma conversa rapida onde a MD consegue ajudar e quais caminhos fariam sentido para o seu momento. Hoje no fim da tarde ou amanha pela manha funciona melhor para voce?`
      ),
      summary: "Lead demonstrou abertura para agenda. Prioridade: marcar reuniao."
    };
  }

  if (flags.asksServices || (flags.hasServiceContext && flags.asksOnlyTraffic)) {
    return {
      leadStatus: "replied",
      nextAction: "Explicar servicos da MD e entender prioridade do cliente.",
      reply: cleanReply(
        `${opening} Temos sim. Alem de trafego, a MD pode atuar com social media estrategico, posicionamento da marca, criativos, campanhas, captacao de leads, organizacao comercial e acompanhamento dos resultados. O ideal nao e escolher servico solto, e entender o que precisa vender mais primeiro. Hoje voce sente mais falta de aparecer melhor, gerar leads ou converter quem ja chama?`
      ),
      summary: "Lead perguntou o que mais a MD faz. Resposta deve abrir o escopo e qualificar prioridade."
    };
  }

  if (flags.asksOnlyTraffic) {
    return {
      leadStatus: "replied",
      nextAction: "Explicar escopo da MD e descobrir necessidade principal.",
      reply: cleanReply(
        `${opening} Nao apenas trafego. Trafego e uma ferramenta, mas a MD olha o processo inteiro: posicionamento, oferta, criativos, campanhas, captacao de leads e acompanhamento comercial. Dependendo do caso, o problema nem e anunciar mais, e arrumar a estrategia antes. Hoje voce sente que precisa vender mais pelo digital ou organizar melhor os leads que ja chegam?`
      ),
      summary: "Lead perguntou se a MD faz apenas trafego. Resposta deve ampliar o escopo e qualificar."
    };
  }

  if (flags.trafficObjection) {
    return {
      leadStatus: "replied",
      nextAction: "Contornar objecao sobre trafego e propor diagnostico.",
      reply: cleanReply(
        `${opening} Eu concordo com voce em um ponto: trafego sozinho nao vende. O que vende e uma oferta clara, uma comunicacao boa, atendimento rapido e um funil bem acompanhado. O trafego so acelera isso. Na MD, antes de falar em anuncio, a gente entende onde a venda esta travando. Se fizer sentido, posso olhar seu caso e te dizer se o caminho e trafego, posicionamento ou processo comercial.`
      ),
      summary: "Lead demonstrou resistencia a trafego. Contorno: concordar parcialmente e reposicionar a MD como estrategia comercial."
    };
  }

  if (flags.casualCoffee) {
    return {
      leadStatus: "replied",
      nextAction: "Responder casualmente e voltar ao objetivo comercial.",
      reply: cleanReply(
        `${opening} Cafe sempre ajuda. Voltando ao marketing: para eu te orientar sem te empurrar algo generico, hoje voce quer atrair mais clientes, melhorar a imagem da marca ou organizar melhor o processo de vendas?`
      ),
      summary: "Lead trouxe conversa casual. Resposta deve acompanhar o tom e retomar qualificacao."
    };
  }

  if (flags.asksPrice || flags.asksProposal) {
    return {
      leadStatus: "replied",
      nextAction: "Qualificar antes de enviar proposta.",
      reply: cleanReply(
        `${opening} Consigo te passar uma direcao sim. Mas para nao te mandar um valor solto, preciso entender o principal objetivo: gerar mais leads, melhorar posicionamento ou estruturar melhor o comercial? Com isso eu te digo o caminho mais adequado.`
      ),
      summary: "Lead pediu valor/proposta. Melhor resposta: qualificar necessidade antes de precificar."
    };
  }

  if (flags.wantsMarketing) {
    return {
      leadStatus: "replied",
      nextAction: "Entender objetivo comercial e tentar marcar diagnostico rapido.",
      reply: cleanReply(
        `${opening} Que bom falar com voce. A MD trabalha marketing conectado a vendas, nao so postagem. Para eu entender seu momento: voce quer mais clientes chegando, melhorar a percepcao da marca ou organizar melhor o comercial?`
      ),
      summary: "Lead demonstrou interesse direto em marketing. Proximo passo: qualificar objetivo comercial."
    };
  }

  return {
    leadStatus: "replied",
    nextAction: "Responder a ultima mensagem e conduzir para diagnostico.",
    reply: cleanReply(
      `${opening} Entendi. Para eu te responder de forma util, me conta uma coisa: hoje o maior desafio e atrair clientes novos, converter melhor quem ja chama ou deixar a marca mais forte no digital?`
    ),
    summary: "Lead respondeu. Proximo passo: entender dor principal."
  };
}

function parseJsonObject(content: string) {
  const start = content.indexOf("{");
  const end = content.lastIndexOf("}");

  if (start < 0 || end < start) {
    throw new Error("Resposta sem JSON valido.");
  }

  return JSON.parse(content.slice(start, end + 1)) as Record<string, unknown>;
}

function parseStatus(value: unknown): ConversationCopilotOutput["leadStatus"] {
  if (
    value === "contacted" ||
    value === "replied" ||
    value === "meeting_scheduled" ||
    value === "proposal_sent" ||
    value === "won" ||
    value === "lost"
  ) {
    return value;
  }

  return "replied";
}

function text(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export async function analyzeConversation(
  input: ConversationCopilotInput
): Promise<ConversationCopilotOutput> {
  const fallback = fallbackReply(input);

  if (!isAiConfigured() || shouldUseLocalSalesBrain(input)) {
    return fallback;
  }

  try {
    const content = await generateChatCompletion([
      {
        content:
          "Voce e a IA SDR senior da MD Marketing. Responda a ultima mensagem real do cliente no WhatsApp, com estrategia comercial, sem repetir respostas anteriores. Responda somente JSON valido.",
        role: "system"
      },
      {
        content: JSON.stringify({
          input: {
            ...input,
            latestCustomerMessage: latestCustomerMessage(input)
          },
          contextMdMarketing: {
            positioning:
              "Marketing conectado a vendas: posicionamento, oferta, criativos, campanhas, captacao de leads, CRM, atendimento e acompanhamento comercial.",
            principle:
              "Nao vender trafego como solucao magica. Trafego e ferramenta; venda depende de oferta, comunicacao, funil e atendimento.",
            goal:
              "Conduzir para diagnostico ou reuniao quando houver abertura, mantendo conversa humana."
          },
          expectedJson: {
            leadStatus: "contacted | replied | meeting_scheduled | proposal_sent | won | lost",
            nextAction: "string",
            reply: "string curta para WhatsApp em portugues do Brasil",
            summary: "string"
          },
          rules: [
            "Responda a ultima mensagem do cliente, nao ao assunto antigo.",
            "Nao repita frases que ja apareceram na conversa.",
            "Comece com bom dia, boa tarde ou boa noite conforme Sao Paulo.",
            "Chame pelo primeiro nome quando existir.",
            "Se houver objecao, concorde parcialmente, reposicione e avance com pergunta inteligente.",
            "Se perguntarem se a MD faz apenas trafego, explique que trafego e uma ferramenta dentro de uma estrategia maior.",
            "Se a pessoa falar algo casual, acompanhe brevemente e volte ao objetivo comercial.",
            "Use tom humano, consultivo e direto.",
            "Nao mencione que e IA."
          ]
        }),
        role: "user"
      }
    ]);
    const payload = parseJsonObject(content);

    return {
      leadStatus: parseStatus(payload.leadStatus),
      nextAction: text(payload.nextAction, fallback.nextAction),
      reply: cleanReply(text(payload.reply, fallback.reply)),
      summary: text(payload.summary, fallback.summary)
    };
  } catch {
    return fallback;
  }
}
