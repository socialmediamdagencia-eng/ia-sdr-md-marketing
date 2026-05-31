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
  const alreadyStarted =
    /^(atendente|ia sdr|voce|vocÃª|tu):/im.test(input.conversation) ||
    generatedReplyMarkers.some((marker) => normalize(input.conversation).includes(marker));

  if (alreadyStarted) {
    return firstName ? `${firstName},` : "";
  }

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

  // Prioridade 1: Linhas explicitamente marcadas como cliente/lead
  const explicitCustomerLines = lines
    .filter((line) => /^(cliente|lead|contato):/i.test(line))
    .map(stripSpeaker)
    .filter((line) => !isNoise(line));

  if (explicitCustomerLines.length) {
    return explicitCustomerLines.at(-1) ?? "";
  }

  // Prioridade 2: Se conversa já começou, ignora saudações e pega última útil do cliente
  const hasConversationStarted = /^(atendente|ia sdr|voce|você|tu):/im.test(input.conversation);
  
  if (hasConversationStarted) {
    // Separa mensagens de atendente e cliente por ordem de aparição
    const messageBlocks = lines.reduce(
      (acc: Array<{ type: string; lines: string[] }>, line) => {
        const isAttendeeMsg = /^(atendente|ia sdr|voce|você|tu):/i.test(line);
        const lastBlock = acc.at(-1);

        if (lastBlock && lastBlock.type === (isAttendeeMsg ? "attendee" : "customer")) {
          lastBlock.lines.push(stripSpeaker(line));
        } else {
          acc.push({
            type: isAttendeeMsg ? "attendee" : "customer",
            lines: [stripSpeaker(line)]
          });
        }

        return acc;
      },
      []
    );

    // Pega última mensagem de cliente
    const lastCustomerBlock = [...messageBlocks].reverse().find((block) => block.type === "customer");
    if (lastCustomerBlock) {
      const customerMessage = lastCustomerBlock.lines
        .filter((line) => !isNoise(line))
        .join(" ")
        .trim();
      if (customerMessage) {
        return customerMessage;
      }
    }
  }

  // Fallback: Última linha útil que não seja de atendente
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
    conversionProblem: hasAny(decisionText, [
      "converter",
      "converte",
      "conversao",
      "conversão",
      "curioso",
      "curiosos",
      "so curiosos",
      "só curiosos",
      "lead ruim",
      "leads ruins",
      "muitos leads",
      "lead desqualificado",
      "leads desqualificados"
    ]),
    doubts: hasAny(decisionText, ["duvida", "dúvida", "duvidas", "dúvidas", "como funciona", "nao entendi", "não entendi"]),
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
    hasServiceContext: hasAny(fullText, ["social media", "trafego", "tráfego", "marketing", "anuncio", "anúncio"]),
    salesIntent: hasAny(decisionText, [
      "quero vender",
      "vender mais",
      "venda",
      "vendas",
      "cliente",
      "clientes",
      "faturar",
      "faturamento",
      "crescer"
    ])
  };
}

function hasContextInsufficient(input: ConversationCopilotInput): boolean {
  const latest = latestCustomerMessage(input);
  const normalizedLatest = normalize(latest);

  // Contexto insuficiente se última mensagem for muito curta ou vazia
  if (!normalizedLatest || normalizedLatest.length < 3) {
    return true;
  }

  // Se conversa inteira for muito curta
  if (normalize(input.conversation).length < 20) {
    return true;
  }

  return false;
}

function cleanReply(reply: string) {
  const normalized = reply.trim();
  const compact = normalized.replace(/\s+/g, " ");

  for (let size = Math.floor(compact.length / 2); size > 25; size -= 1) {
    const left = compact.slice(0, size).trim();
    const right = compact.slice(size).trim();

    if (left && right && normalize(left) === normalize(right)) {
      return left;
    }
  }

  const firstSentenceMatch = compact.match(/^(.{20,260}?[.!?])\s+\1/i);
  if (firstSentenceMatch) {
    return compact.replace(firstSentenceMatch[0], firstSentenceMatch[1] + " ").trim();
  }

  const repeatedOpening = compact.match(/^(.{40,500}[?!\.])\s*(Boa (?:noite|tarde|dia),? [^!]+! .+)$/i);
  if (repeatedOpening && normalize(repeatedOpening[1]) === normalize(repeatedOpening[2])) {
    return repeatedOpening[1].trim();
  }

  const paragraphs = normalized
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
        `${opening} Hoje o primeiro passo e entender onde esta o gargalo da operacao. Em uma conversa rapida consigo te mostrar se o problema esta na geracao de leads, qualificacao ou atendimento. Hoje voces ja acompanham esses numeros?`
      ),
      summary: "Lead demonstrou abertura para agenda. Resposta de prova social e convite para conversa rapida."
    };
  }

  if (flags.conversionProblem) {
    return {
      leadStatus: "replied",
      nextAction: "Diagnosticar gargalos de geracao, qualificacao ou atendimento.",
      reply: cleanReply(
        `${opening} O proximo passo e descobrir se o gargalo esta na geracao de leads, na qualificacao ou no atendimento. Em uma conversa rapida eu te mostro qual desses pontos precisa ajuste. Hoje voces ja sabem qual parte mais trava?`
      ),
      summary: "Resposta comercial focada em diagnostico rapido e identificacao do gargalo."
    };
  }

  if (flags.doubts) {
    return {
      leadStatus: "replied",
      nextAction: "Conduzir para um diagnostico rapido em vez de explicar marketing.",
      reply: cleanReply(
        `${opening} Em vez de explicar tudo, o ideal e ver rapidamente onde esta a maior dificuldade para vender mais. Posso te mostrar isso em uma conversa rapida sobre seu processo comercial?`
      ),
      summary: "Evita explicacao de marketing e guia para diagnostico rapido."
    };
  }

  if (flags.asksServices || (flags.hasServiceContext && flags.asksOnlyTraffic)) {
    return {
      leadStatus: "replied",
      nextAction: "Conduzir para prioridade comercial, nao listar servicos.",
      reply: cleanReply(
        `${opening} A MD atua com trafego, social media e funil comercial. Agora o importante e descobrir qual parte do seu comercial precisa de ajuste. Quer marcar uma conversa rapida para eu te dizer qual caminho gerar resultado mais rapido?`
      ),
      summary: "Foco comercial em prioridade, sem virar professor de servicos."
    };
  }

  if (flags.asksOnlyTraffic) {
    return {
      leadStatus: "replied",
      nextAction: "Repor o trafego como parte do funil e buscar a proxima reuniao.",
      reply: cleanReply(
        `${opening} Trafego e parte, mas o resultado depende de onde os leads vao no funil. Em uma conversa rapida eu te mostro se o problema e trafego, qualificacao ou atendimento. Hoje a sua equipe acompanha isso?`
      ),
      summary: "Responde de forma comercial e sugere diagnostico do funil."
    };
  }

  if (flags.trafficObjection) {
    return {
      leadStatus: "replied",
      nextAction: "Contornar a objecao com foco comercial e marcar conversa.",
      reply: cleanReply(
        `${opening} Concordo: trafego sozinho nao vende. O que faz diferenca e como o lead e qualificado e tratado. Em uma conversa rapida eu te digo se o foco deve ser mais em processo ou em anuncio. Podemos agendar?`
      ),
      summary: "Contorna a objecao e redireciona para conversa sobre processo comercial."
    };
  }

  if (flags.casualCoffee) {
    return {
      leadStatus: "replied",
      nextAction: "Responder casualmente e voltar ao objetivo de reuniao.",
      reply: cleanReply(
        `${opening} Cafe e bom, mas para ir direto ao ponto eu prefiro entender rapidamente onde o seu comercial esta travando. Vamos marcar um papo rapido para eu te mostrar o melhor proximo passo?`
      ),
      summary: "Mantem o tom casual e retoma o foco em reuniao."
    };
  }

  if (flags.asksPrice || flags.asksProposal) {
    return {
      leadStatus: "replied",
      nextAction: "Qualificar antes de falar valor e sugerir conversa rapida.",
      reply: cleanReply(
        `${opening} Antes de falar valor, preciso entender se o foco e gerar leads, melhorar qualificação ou organizar atendimento. Em uma conversa rapida eu te falo o caminho mais adequado. Posso agendar?`
      ),
      summary: "Redireciona para qualificar antes da proposta e traz foco na reuniao."
    };
  }

  if (flags.salesIntent) {
    return {
      leadStatus: "replied",
      nextAction: "Avancar para diagnostico comercial e abrir caminho para reuniao.",
      reply: cleanReply(
        `${opening} Se voce quer vender mais, o importante e descobrir onde o processo comercial esta travando. Em uma conversa rapida eu te mostro se o problema e oferta, publico ou atendimento. Quando posso te ligar?`
      ),
      summary: "Avanca a conversa comercial e sugere reuniao."
    };
  }

  if (flags.wantsMarketing) {
    return {
      leadStatus: "replied",
      nextAction: "Mover de marketing generico para conversa sobre resultado comercial.",
      reply: cleanReply(
        `${opening} Marketing so faz sentido se estiver conectado a vendas. Posso te mostrar em uma conversa rapida se o problema esta na mensagem, no publico ou no funil. Hoje voce quer priorizar resultado ou visibilidade?`
      ),
      summary: "Converte marketing em resultado e apresenta conversa rapida."
    };
  }

  return {
    leadStatus: "replied",
    nextAction: "Conduzir para diagnostico rapido e priorizar reuniao.",
    reply: cleanReply(
      `${opening} Hoje o primeiro passo e entender onde esta o gargalo da operacao. Em uma conversa rapida consigo te mostrar se o problema esta na geracao de leads, na qualificacao ou no atendimento. Voces ja acompanham esses numeros?`
    ),
    summary: "Fallback comercial focado em diagnostico rapido e abertura para conversa."
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
  // Se IA não configurada ou contexto insuficiente, usa fallback
  if (!isAiConfigured() || hasContextInsufficient(input)) {
    return fallbackReply(input);
  }

  try {
    const latestMsg = latestCustomerMessage(input);
    const isConversationStarted = generatedReplyMarkers.some((marker) =>
      normalize(input.conversation).includes(marker)
    );

    const content = await generateChatCompletion([
      {
        content: `Voce e a IA SDR senior da MD Marketing. Sua prioridade e qualificar o lead e gerar uma reuniao comercial. Nao e consultor, nao e professor de marketing, nao e suporte e nao e ChatGPT. 

HIERARQUIA:
1. Responda a ultima mensagem do lead.
2. Avance a conversa.
3. Faça apenas uma pergunta estrategica.
4. Qualifique o lead.
5. Gere autoridade.
6. Conduza para reuniao quando houver contexto suficiente.
7. Nunca reinicie a conversa.

REGRAS OBRIGATORIAS:
- Maximo 4 linhas.
- Português brasileiro com acentuacao correta.
- Nunca repita saudacoes.
- Nunca repita perguntas ja respondidas.
- Nunca explique marketing como professor.
- Nunca aja como suporte.
- Nunca aja como ChatGPT.
- Nunca responda "me conta mais".
- Nunca responda "como posso ajudar".
- Nunca responda "qual seu desafio".
- Se o lead perguntar "Como faremos isso?", responda a pergunta, explique o proximo passo e aproxime da reuniao.
- Responda apenas em JSON valido, sem explicacoes adicionais.`,
        role: "system"
      },
      {
        content: JSON.stringify({
          situacao: {
            nomeContato: input.contactName || input.companyName,
            conversaCompleta: input.conversation,
            ultimaMensagemCliente: latestMsg,
            objetivo: input.objective,
            doresdoLead: input.pains,
            ofertaRecomendada: input.recommendedOffer,
            conversaJaComecou: isConversationStarted
          },
          contextMdMarketing: {
            posicionamento:
              "Marketing conectado a vendas: posicionamento, oferta, criativos, campanhas, captacao de leads, CRM, atendimento e acompanhamento comercial.",
            principio:
              "Trafego e ferramenta. O que vende mesmo: oferta clara, comunicacao boa, atendimento rapido e funil bem acompanhado.",
            objetivo:
              "Conduzir para diagnostico ou reuniao quando houver abertura, sem perder humanidade na conversa.",
            processoDaVenda: [
              "1. Entender o que o cliente vende",
              "2. Identificar cliente ideal dele",
              "3. Descobrir onde a venda trava",
              "4. Montar estrategia: posicionamento, criativos, campanhas, captacao",
              "5. Acompanhar para resultado"
            ]
          },
          formatoEsperado: {
            leadStatus: "contacted | replied | meeting_scheduled | proposal_sent | won | lost",
            nextAction: "string curta com proxima acao para o SDR",
            reply: "CURTA - max 3-4 linhas - resposta pronta para copiar no WhatsApp",
            summary: "string - resumo do que foi dito e proximo passo"
          }
        }),
        role: "user"
      }
    ]);

    const payload = parseJsonObject(content);

    // Valida resposta: se vazia ou muito genérica, usa fallback
    const reply = text(payload.reply, "");
    if (
      !reply ||
      reply.length < 10 ||
      normalize(reply).includes("me conta mais") ||
      normalize(reply).includes("tudo bem")
    ) {
      return fallbackReply(input);
    }

    return {
      leadStatus: parseStatus(payload.leadStatus),
      nextAction: text(payload.nextAction, fallbackReply(input).nextAction),
      reply: cleanReply(reply),
      summary: text(payload.summary, fallbackReply(input).summary)
    };
  } catch {
    // Se IA falhar, volta para fallback
    return fallbackReply(input);
  }
}
