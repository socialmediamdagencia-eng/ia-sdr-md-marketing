(function () {
  const API_URL = "https://ia-sdr-md-marketing.vercel.app/api/copilot/suggest";
  const PANEL_ID = "md-copilot-panel";
  const LAUNCHER_ID = "md-copilot-launcher";
  let lastInsertedMessage = "";

  function waitForBody() {
    if (document.body) {
      boot();
      return;
    }

    window.setTimeout(waitForBody, 250);
  }

  function getConversationText() {
    const selectors = [
      '[data-testid="conversation-panel-messages"]',
      '[role="application"]',
      "main"
    ];
    const root = selectors.map((selector) => document.querySelector(selector)).find(Boolean) || document.body;
    const text = (root.innerText || "").split("\n").map((line) => line.trim()).filter(Boolean);

    return text.slice(-80).join("\n");
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
    const fields = Array.from(document.querySelectorAll('[contenteditable="true"]'));
    return fields.reverse().find((field) => {
      const label = field.getAttribute("aria-label") || "";
      const dataTab = field.getAttribute("data-tab") || "";
      return label.toLowerCase().includes("mensagem") || Number(dataTab) >= 9;
    }) || fields.at(-1);
  }

  async function insertMessage(message) {
    const composer = findComposer();

    if (!composer) {
      setStatus("Nao encontrei o campo de mensagem. Clique na conversa e tente de novo.");
      return;
    }

    const nextText = String(message || "").trim();

    if (!nextText) {
      setStatus("Gere uma resposta antes de preencher.");
      return;
    }

    const currentText = (composer.innerText || composer.textContent || "").trim();

    if (currentText === nextText || currentText.includes(nextText) || lastInsertedMessage === nextText) {
      setStatus("Essa resposta ja esta no campo. Revise e aperte enviar.");
      return;
    }

    composer.focus();
    composer.textContent = "";
    composer.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "deleteContentBackward" }));

    const dataTransfer = new DataTransfer();
    dataTransfer.setData("text/plain", nextText);
    const pasteEvent = new ClipboardEvent("paste", {
      bubbles: true,
      cancelable: true,
      clipboardData: dataTransfer
    });
    composer.dispatchEvent(pasteEvent);

    if (!(composer.innerText || composer.textContent || "").includes(nextText)) {
      document.execCommand("insertText", false, nextText);
    }

    lastInsertedMessage = nextText;
    setStatus("Resposta preenchida. Revise e aperte enviar.");
  }

  function setStatus(message) {
    const status = document.querySelector("#md-copilot-status");
    if (status) {
      status.textContent = message;
    }
  }

  async function suggest() {
    const button = document.querySelector("#md-copilot-generate");
    const result = document.querySelector("#md-copilot-result");
    const conversation = document.querySelector("#md-copilot-conversation");
    const companyName = document.querySelector("#md-copilot-company");
    const objective = document.querySelector("#md-copilot-objective");

    button.disabled = true;
    setStatus("Analisando conversa...");

    try {
      const response = await fetch(API_URL, {
        body: JSON.stringify({
          companyName: companyName.value,
          contactName: firstName(companyName.value),
          conversation: conversation.value,
          objective: objective.value
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "A IA nao respondeu agora.");
      }

      result.textContent = payload.reply || "";
      result.dataset.reply = payload.reply || "";
      setStatus(payload.nextAction || "Resposta gerada.");
    } catch (error) {
      setStatus(error.message || "Erro ao gerar resposta.");
    } finally {
      button.disabled = false;
    }
  }

  function refreshContext() {
    const conversation = document.querySelector("#md-copilot-conversation");
    const companyName = document.querySelector("#md-copilot-company");

    companyName.value = getChatName();
    conversation.value = getConversationText();
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
      button.disabled = true;
      const reply = panel.querySelector("#md-copilot-result").dataset.reply || "";
      await insertMessage(reply);
      window.setTimeout(() => {
        button.disabled = false;
      }, 1200);
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
