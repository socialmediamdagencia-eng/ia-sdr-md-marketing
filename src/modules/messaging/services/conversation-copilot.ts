import { generateChatCompletion, isAiConfigured } from "@/lib/ai/openrouter";

export type ConversationCopilotInput = {
  companyName: string;
  contactName?: string;
  conversation: string;
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

function getOpening(input: ConversationCopilotInput) {
  const contactName = (input.contactName || input.companyName).split(/[|\-–—]/)[0].trim();
  const firstName =
    contactName && !contactName.toLowerCase().includes("lead")
      ? contactName.split(/\s+/)[0]
      : "";
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

function fallbackReply(input: ConversationCopilotInput): ConversationCopilotOutput {
  const lower = input.conversation.toLowerCase();
  const lastClientMessage = input.conversation
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.toLowerCase().startsWith("cliente:"))
    .at(-1)
    ?.toLowerCase();
  const decisionText = lastClientMessage || lower;
  const asksPrice = lower.includes("valor") || lower.includes("preco") || lower.includes("preço");
  const askedProposal = lower.includes("proposta") || lower.includes("manda") || lower.includes("envia");
  const wantsMarketing =
    decisionText.includes("quero marketing") ||
    decisionText.includes("marketing") ||
    decisionText.includes("divulga") ||
    decisionText.includes("anuncio") ||
    decisionText.includes("anúncio") ||
    decisionText.includes("trafego") ||
    decisionText.includes("tráfego");
  const meetingSignal =
    decisionText.includes("reuniao") ||
    decisionText.includes("reunião") ||
    decisionText.includes("agenda") ||
    decisionText.includes("horario") ||
    decisionText.includes("horário");
  const opening = getOpening(input);

  if (meetingSignal) {
    return {
      leadStatus: "meeting_scheduled",
      nextAction: "Sugerir dois horarios e marcar reuniao no painel.",
      reply:
        `${opening} Perfeito. Para eu te mostrar algo bem objetivo, posso te chamar para uma conversa rapida de 20 minutos. Hoje no fim da tarde ou amanha pela manha funciona melhor para voce?`,
      summary: "Lead demonstrou abertura para agenda. Prioridade: marcar reuniao."
    };
  }

  if (wantsMarketing) {
    return {
      leadStatus: "replied",
      nextAction: "Entender objetivo comercial e tentar marcar diagnostico rapido.",
      reply:
        `${opening} Que bom falar com voce. A MD ajuda empresas a transformar marketing em oportunidade comercial, nao so em postagem. Hoje voce quer mais clientes pelo digital, melhorar o posicionamento da marca ou organizar melhor as vendas?`,
      summary: "Lead demonstrou interesse direto em marketing. Proximo passo: qualificar objetivo comercial."
    };
  }

  if (asksPrice || askedProposal) {
    return {
      leadStatus: "replied",
      nextAction: "Qualificar antes de enviar proposta.",
      reply:
        `${opening} Consigo te passar uma direcao sim. Antes, para nao te mandar algo generico: hoje o maior desafio e gerar mais contatos qualificados, organizar o comercial ou melhorar o posicionamento digital?`,
      summary: "Lead pediu valor/proposta. Melhor resposta: qualificar necessidade antes de precificar."
    };
  }

  return {
    leadStatus: "replied",
    nextAction: "Continuar qualificacao e tentar levar para reuniao.",
    reply:
      `${opening} Entendi. Pela forma como a MD trabalha, o primeiro passo e enxergar onde a empresa esta perdendo oportunidade no digital e no comercial. Posso te mostrar uma leitura rapida da sua operacao e apontar 2 ou 3 melhorias praticas?`,
    summary: "Lead respondeu. Proximo passo: conduzir para diagnostico curto."
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

  if (!isAiConfigured()) {
    return fallback;
  }

  try {
    const content = await generateChatCompletion([
      {
        content:
          "Voce e a IA SDR da MD Marketing. Analise conversas de WhatsApp e gere a proxima resposta comercial. Responda somente JSON valido.",
        role: "system"
      },
      {
        content: JSON.stringify({
          input,
          expectedJson: {
            leadStatus: "contacted | replied | meeting_scheduled | proposal_sent | won | lost",
            nextAction: "string",
            reply: "string curta para WhatsApp em portugues do Brasil",
            summary: "string"
          },
          rules: [
            "Nao invente dados.",
            "Comece com bom dia, boa tarde ou boa noite conforme o horario de Sao Paulo.",
            "Chame a pessoa pelo primeiro nome quando existir.",
            "Se o lead demonstrar interesse, tente levar para reuniao.",
            "Se pedir preco, qualifique antes de passar valor.",
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
      reply: text(payload.reply, fallback.reply),
      summary: text(payload.summary, fallback.summary)
    };
  } catch {
    return fallback;
  }
}
