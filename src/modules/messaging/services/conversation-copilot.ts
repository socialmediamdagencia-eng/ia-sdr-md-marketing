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
        `${opening} Perfeito. Para ser objetivo, posso te mostrar em uma conversa rapida onde a MD consegue ajudar e quais caminhos fariam sentido para o seu momento. Hoje no fim da tarde ou amanha pela manha funciona melhor para voce?`
      ),
      summary: "Lead demonstrou abertura para agenda. Prioridade: marcar reuniao."
    };
  }

  if (flags.conversionProblem) {
    const hasMultipleLead = normalize(latestCustomerMessage(input)).includes("muitos") ||
      normalize(latestCustomerMessage(input)).includes("muito");
    const hasCuriousKeyword = normalize(latestCustomerMessage(input)).includes("curiosos") ||
      normalize(latestCustomerMessage(input)).includes("converter");

    // Tratamento específico: "muitos leads mas são curiosos"
    if (hasMultipleLead && hasCuriousKeyword) {
      return {
        leadStatus: "replied",
        nextAction: "Diagnosticar: promessa da campanha, filtro de público, qualificação no atendimento.",
        reply: cleanReply(
          `${opening} Muitos curiosos é sintoma de um dos tres: a promessa da campanha atrai errado, o filtro do publico nao e preciso, ou o atendimento nao qualifica rapido. A MD ajusta esses tres pontos. Quando chegam esses leads, voce tenta vender logo ou conversa um pouco para entender se faz sentido?`
        ),
        summary: "Lead tem volume mas baixa qualidade de leads. Resposta: diagnosticar origem da curiosidade (campanha, publico ou atendimento) e entender processo atual."
      };
    }

    // Fallback genérico para conversionProblem
    return {
      leadStatus: "replied",
      nextAction: "Diagnosticar qualidade dos leads e gargalo de conversao.",
      reply: cleanReply(
        `${opening} isso normalmente nao e so problema de volume. Quando chegam muitos curiosos, eu olharia tres pontos: promessa da campanha, filtro do publico e como o lead e conduzido no atendimento. A MD ajusta a captacao para atrair gente com mais intencao e tambem organiza o processo para separar curioso de oportunidade real. Hoje esses leads chegam por anuncio, Instagram ou indicacao?`
      ),
      summary: "Lead disse que tem muitos leads, mas curiosos. Resposta deve tratar conversao e qualificacao."
    };
  }

  if (flags.doubts) {
    return {
      leadStatus: "replied",
      nextAction: "Explicar processo de forma simples e conduzir para diagnostico.",
      reply: cleanReply(
        `${opening} funciona assim: primeiro a gente entende o que voce vende, quem e o cliente ideal e onde a venda trava. Depois montamos o caminho: posicionamento, criativos, campanhas, captacao e acompanhamento dos contatos. O objetivo nao e fazer marketing bonito, e criar um processo que gere oportunidade comercial.`
      ),
      summary: "Lead demonstrou duvida sobre funcionamento. Resposta deve explicar o processo de forma clara."
    };
  }

  if (flags.asksServices || (flags.hasServiceContext && flags.asksOnlyTraffic)) {
    return {
      leadStatus: "replied",
      nextAction: "Explicar servicos da MD e entender prioridade do cliente.",
      reply: cleanReply(
        `${opening} Temos sim. Alem de trafego, a MD pode atuar com social media estrategico, posicionamento da marca, criativos, campanhas, captacao de leads, organizacao comercial e acompanhamento dos resultados. Como voce falou que quer vender mais, eu olharia primeiro qual canal pode trazer oportunidade mais rapido e onde a venda esta travando.`
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

  if (flags.salesIntent) {
    return {
      leadStatus: "replied",
      nextAction: "Conduzir para diagnostico de vendas e marketing.",
      reply: cleanReply(
        `${opening} perfeito. Se o objetivo e vender mais, eu nao comecaria escolhendo servico solto. A gente precisa olhar oferta, publico, criativos, canais de captacao e atendimento. Pelo que voce trouxe, o diagnostico inicial seria entender se falta demanda, se a mensagem nao convence ou se os contatos chegam e nao viram venda.`
      ),
      summary: "Lead deixou claro que objetivo principal e vender mais. Proximo passo: diagnostico comercial."
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
        content: `Voce e a IA SDR senior da MD Marketing. Sua missao: responder a ultima mensagem REAL do cliente no WhatsApp com uma resposta consultiva, humana e estrategica. 

REGRAS OBRIGATORIAS:
1. Responda EXATAMENTE a ultima mensagem do cliente, nao a conversas antigas.
2. Nunca repita saudacoes (Bom dia, Boa tarde, Boa noite) se a conversa ja comecou.
3. Nao repita o nome do cliente em toda resposta - use apenas uma vez no maximo.
4. Responda sempre de forma CURTA e natural - maximo 3-4 linhas.
5. Identifique a dor, objecao ou estgio da conversa e responda com precisao.
6. Termine SEMPRE com uma pergunta estrategica que avan a conversa.
7. Nunca responda de forma generica como "me conta mais" - seja especifico.
8. Nao prometa resultado garantido ou percentual.
9. Mantenha tom humano, consultivo, direto - nao robota.
10. NUNCA mencione que voce e IA.

ESTILO MD MARKETING:
- Foco em VENDA e RESULTADO comercial, nao em "atividades"
- Compreenda: "trafego sozinho nao vende, precisa de oferta, comunicacao e funil"
- Desafios comuns: baixa qualificacao, curiosos vs leads reais, falta de processo comercial

Responda APENAS com JSON valido, sem explicacoes adicionais.`,
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
