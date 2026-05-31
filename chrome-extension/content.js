(function () {
  const API_URL = "https://ia-sdr-md-marketing.vercel.app/api/copilot/suggest";
  const PANEL_ID = "md-copilot-panel";
  const LAUNCHER_ID = "md-copilot-launcher";
  let isInserting = false;
  let isGenerating = false;

  function waitForBody() {
    if (document.body) {
      boot();
      return;
    }

    window.setTimeout(waitForBody, 250);
  }

  function looksLikeGeneratedReply(text) {
    const lower = String(text || "").toLowerCase();
    return [
      "consigo te passar uma direcao",
      "que bom falar com voce",
      "a md ajuda empresas",
      "pela forma como a md trabalha",
      "hoje o maior desafio",
      "trafego sozinho nao vende"
    ].some((item) => lower.includes(item));
  }

  function cleanMessageText(text) {
    return String(text || "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .filter((line) => !/^\d{1,2}:\d{2}$/.test(line))
      .filter((line) => !["hoje", "ontem"].includes(line.toLowerCase()))
      .join(" ")
      .trim();
  }

  function normalizeText(text) {
    return String(text || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .toLowerCase()
      .trim();
  }

  function dedupeReply(text) {
    const value = String(text || "").replace(/\s+/g, " ").trim();

    for (let size = Math.floor(value.length / 2); size > 25; size -= 1) {
      const left = value.slice(0, size).trim();
      const right = value.slice(size).trim();

      if (left && right && normalizeText(left) === normalizeText(right)) {
        return left;
      }
    }

    const sentences = value.split(/(?<=[.!?])\s+/).filter(Boolean);
    const finalSentences = [];

    sentences.forEach((sentence) => {
      if (!finalSentences.some((saved) => normalizeText(saved) === normalizeText(sentence))) {
        finalSentences.push(sentence);
      }
    });

    return finalSentences.join(" ").trim();
  }

  function getConversationContext() {
    const bubbles = Array.from(document.querySelectorAll("[data-pre-plain-text]"));
    const messages = bubbles
      .map((bubble) => {
        const text = cleanMessageText(bubble.innerText || bubble.textContent || "");
        const container = bubble.closest(".message-in, .message-out");
        const isOutgoing =
          container?.classList.contains("message-out") ||
          bubble.closest(".message-out") ||
          looksLikeGeneratedReply(text);
        const direction = isOutgoing ? "Atendente" : "Cliente";

        return text ? { direction, text } : null;
      })
      .filter(Boolean);

    if (messages.length) {
      return {
        conversation: messages.slice(-20).map((message) => `${message.direction}: ${message.text}`).join("\n"),
        latestCustomerMessage:
          [...messages].reverse().find((message) => message.direction === "Cliente")?.text || ""
      };
    }

    const selectors = [
      '[data-testid="conversation-panel-messages"]',
      '[role="application"]',
      "main"
    ];
    const root = selectors.map((selector) => document.querySelector(selector)).find(Boolean) || document.body;
    const blocked = [
      "ai reply",
      "ai rewrite",
      "add quick chat",
      "digite uma mensagem",
      "use o whatsapp no seu celular",
      "mensagens enviadas e recebidas"
    ];
    const text = (root.innerText || "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .filter((line) => !blocked.some((item) => line.toLowerCase().includes(item)))
      .filter((line) => !looksLikeGeneratedReply(line));
    const useful = text.slice(-30);

    return {
      conversation: useful.join("\n"),
      latestCustomerMessage: useful.at(-1) || ""
    };
  }

  function getChatName() {
    const candidates = [
      document.querySelector("header span[title]"),
      document.querySelector("header [dir='auto']"),
      document.querySelector("header span")
    ];
    const element = candidates.find(Boolean);
    return element?.getAttribute("title") || element?.textContent?.trim() || "Lead WhatsApp";
  }

  function firstName(value) {
    const clean = String(value || "")
      .replace(/\([^)]*\)/g, "")
      .split(/[|\-–—]/)[0]
      .trim();

    return clean.split(/\s+/).find(Boolean) || "";
  }

  function findComposer() {
    const active = document.activeElement;
    if (active?.isContentEditable) {
      return active;
    }

    const fields = Array.from(document.querySelectorAll('[contenteditable="true"]'));
    return fields.reverse().find((field) => {
      const label = field.getAttribute("aria-label") || "";
      const dataTab = field.getAttribute("data-tab") || "";
      return label.toLowerCase().includes("mensagem") || Number(dataTab) >= 9;
    }) || fields.at(-1);
  }

  function sleep(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  function clearComposer(composer) {
    composer.focus();
    composer.textContent = "";
    composer.dispatchEvent(new InputEvent("input", { bubbles: true }));
  }

  async function setComposerText(composer, nextText) {
    composer.focus();
    composer.textContent = nextText;
    composer.dispatchEvent(new InputEvent("input", { bubbles: true }));
    await sleep(120);
  }

  async function insertMessage(message) {
    if (isInserting) {
      setStatus("Ja estou preenchendo a resposta.");
      return;
    }

    const composer = findComposer();

    if (!composer) {
      setStatus("Nao encontrei o campo de mensagem. Clique na conversa e tente de novo.");
      return;
    }

    const nextText = dedupeReply(message);

    if (!nextText) {
      setStatus("Gere uma resposta antes de preencher.");
      return;
    }

    isInserting = true;

    try {
      clearComposer(composer);
      await setComposerText(composer, nextText);
      setStatus("Resposta preenchida. Revise e aperte enviar.");
    } finally {
      isInserting = false;
    }
  }

  function setStatus(message) {
    const status = document.querySelector("#md-copilot-status");
    if (status) {
      status.textContent = message;
    }
  }

  async function suggest() {
    if (isGenerating) {
      setStatus("Ja estou gerando uma resposta. Aguarde um momento.");
      return;
    }

    const button = document.querySelector("#md-copilot-generate");
    const result = document.querySelector("#md-copilot-result");
    const conversation = document.querySelector("#md-copilot-conversation");
    const companyName = document.querySelector("#md-copilot-company");
    const objective = document.querySelector("#md-copilot-objective");
    const latestCustomerMessage = conversation.dataset.latestCustomerMessage || "";

    isGenerating = true;
    button.disabled = true;
    setStatus("Analisando conversa...");

    try {
      const response = await fetch(API_URL, {
        body: JSON.stringify({
          companyName: companyName.value,
          contactName: firstName(companyName.value),
          conversation: conversation.value,
          latestCustomerMessage,
          objective: objective.value
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "A IA nao respondeu agora.");
      }

      const cleanReply = dedupeReply(payload.reply || "");
      result.textContent = cleanReply;
      result.dataset.reply = cleanReply;
      setStatus(payload.nextAction || "Resposta gerada.");
    } catch (error) {
      setStatus(error.message || "Erro ao gerar resposta.");
    } finally {
      isGenerating = false;
      button.disabled = false;
    }
  }

  function refreshContext() {
    const conversation = document.querySelector("#md-copilot-conversation");
    const companyName = document.querySelector("#md-copilot-company");
    const context = getConversationContext();

    companyName.value = getChatName();
    conversation.value = context.conversation;
    conversation.dataset.latestCustomerMessage = context.latestCustomerMessage || "";
    setStatus("Conversa atualizada.");
  }

  function createPanel() {
    const launcher = document.createElement("button");
    launcher.id = LAUNCHER_ID;
    launcher.type = "button";
    launcher.textContent = "MD Copiloto";

    const panel = document.createElement("section");
    panel.id = PANEL_ID;
    panel.innerHTML = `
      <div class="md-copilot-header">
        <div>
          <div class="md-copilot-kicker">IA SDR</div>
          <div class="md-copilot-title">Copiloto WhatsApp</div>
        </div>
        <button class="md-copilot-close" id="md-copilot-close" type="button">x</button>
      </div>
      <div class="md-copilot-body">
        <div class="md-copilot-card">
          <label class="md-copilot-label" for="md-copilot-company">Nome do contato/empresa</label>
          <input class="md-copilot-input" id="md-copilot-company" />
        </div>
        <div class="md-copilot-card">
          <div class="md-copilot-row">
            <label>
              <span class="md-copilot-label">Objetivo</span>
              <select class="md-copilot-select" id="md-copilot-objective">
                <option value="responder">Responder</option>
                <option value="marcar_reuniao">Marcar reuniao</option>
                <option value="contornar_objecao">Contornar objecao</option>
                <option value="enviar_proposta">Enviar proposta</option>
              </select>
            </label>
            <button class="md-copilot-button secondary" id="md-copilot-refresh" type="button">Ler conversa</button>
          </div>
        </div>
        <div class="md-copilot-card">
          <label class="md-copilot-label" for="md-copilot-conversation">Conversa capturada</label>
          <textarea class="md-copilot-textarea" id="md-copilot-conversation"></textarea>
        </div>
        <button class="md-copilot-button" id="md-copilot-generate" type="button">Gerar resposta</button>
        <div class="md-copilot-card">
          <div class="md-copilot-label">Resposta sugerida</div>
          <div class="md-copilot-result" id="md-copilot-result">A resposta aparece aqui.</div>
        </div>
        <div class="md-copilot-row">
          <button class="md-copilot-button secondary" id="md-copilot-copy" type="button">Copiar</button>
          <button class="md-copilot-button" id="md-copilot-insert" type="button">Preencher WhatsApp</button>
        </div>
        <div class="md-copilot-status" id="md-copilot-status"></div>
        <p class="md-copilot-note">A extensao nao envia automaticamente. Ela le a conversa visivel, gera a resposta e preenche o campo para voce revisar e enviar.</p>
      </div>
    `;

    document.body.appendChild(launcher);
    document.body.appendChild(panel);

    launcher.addEventListener("click", () => {
      panel.classList.toggle("md-open");
      if (panel.classList.contains("md-open")) {
        refreshContext();
      }
    });
    panel.querySelector("#md-copilot-close").addEventListener("click", () => panel.classList.remove("md-open"));
    panel.querySelector("#md-copilot-refresh").addEventListener("click", refreshContext);
    panel.querySelector("#md-copilot-generate").addEventListener("click", suggest);
    panel.querySelector("#md-copilot-copy").addEventListener("click", async () => {
      const reply = panel.querySelector("#md-copilot-result").dataset.reply || panel.querySelector("#md-copilot-result").textContent || "";
      await navigator.clipboard.writeText(reply);
      setStatus("Resposta copiada.");
    });
    panel.querySelector("#md-copilot-insert").addEventListener("click", async (event) => {
      const button = event.currentTarget;
      if (isInserting) {
        setStatus("Ja estou preenchendo a resposta.");
        return;
      }

      button.disabled = true;
      const reply = panel.querySelector("#md-copilot-result").dataset.reply || "";
      await insertMessage(reply);
      button.disabled = false;
    });
  }

  function boot() {
    if (document.getElementById(PANEL_ID) || document.getElementById(LAUNCHER_ID)) {
      return;
    }

    createPanel();
  }

  waitForBody();
})();
