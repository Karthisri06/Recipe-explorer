// Floating recipe assistant. Needs app.js (postJson, getUser) loaded first.
(function () {
  if (!getUser()) return; // only for signed-in users, like the recipe pages

  const history = []; // { role, content } sent to the backend with every message

  const style = document.createElement("style");
  style.textContent = `
    #chat-toggle{position:fixed;right:20px;bottom:20px;z-index:50;width:56px;height:56px;border-radius:9999px;border:none;cursor:pointer;background:#ca8a04;color:#fff;font-size:24px;box-shadow:0 6px 18px rgba(194,120,40,.35)}
    #chat-toggle:hover{background:#ea580c}
    #chat-panel{position:fixed;right:20px;bottom:90px;z-index:50;width:360px;max-width:calc(100vw - 40px);height:480px;max-height:calc(100vh - 120px);display:none;flex-direction:column;background:#fff;border-radius:24px;box-shadow:0 12px 36px rgba(194,120,40,.3);overflow:hidden;font-family:'Quicksand',sans-serif}
    #chat-panel.open{display:flex}
    #chat-panel header{background:#ca8a04;color:#fff;padding:14px 18px;font-weight:700;display:flex;justify-content:space-between;align-items:center}
    #chat-panel header button{background:none;border:none;color:#fff;font-size:20px;cursor:pointer;line-height:1}
    #chat-log{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px;background:#fffbeb}
    .chat-msg{max-width:85%;padding:10px 14px;border-radius:18px;font-size:14px;line-height:1.4;white-space:pre-wrap;word-wrap:break-word}
    .chat-msg.user{align-self:flex-end;background:#ca8a04;color:#fff}
    .chat-msg.bot{align-self:flex-start;background:#fff;color:#1f2937;border:1px solid #fde68a}
    .chat-msg.error{align-self:flex-start;background:#fef2f2;color:#b91c1c;border:1px solid #fecaca}
    .chat-msg a{color:#b45309;text-decoration:underline}
    #chat-form{display:flex;gap:8px;padding:12px;border-top:1px solid #fde68a;background:#fff}
    #chat-input{flex:1;border:1.5px solid #f3e0c8;border-radius:9999px;padding:8px 14px;font-size:14px;outline:none}
    #chat-input:focus{border-color:#ca8a04}
    #chat-form button{background:#ca8a04;color:#fff;border:none;border-radius:9999px;padding:0 18px;cursor:pointer;font-weight:600}
    #chat-form button:disabled{opacity:.6;cursor:not-allowed}
  `;
  document.head.appendChild(style);

  const toggle = document.createElement("button");
  toggle.id = "chat-toggle";
  toggle.type = "button";
  toggle.setAttribute("aria-label", "Open recipe assistant");
  toggle.textContent = "💬";

  const panel = document.createElement("section");
  panel.id = "chat-panel";
  panel.setAttribute("aria-label", "Recipe assistant");
  panel.innerHTML =
    '<header><span>Recipe assistant</span><button type="button" aria-label="Close chat">&times;</button></header>' +
    '<div id="chat-log" aria-live="polite"></div>' +
    '<form id="chat-form"><input id="chat-input" type="text" maxlength="1000" autocomplete="off" placeholder="Ask about a recipe..." aria-label="Your message"><button type="submit">Send</button></form>';

  document.body.append(toggle, panel);

  const log = panel.querySelector("#chat-log");
  const form = panel.querySelector("#chat-form");
  const input = panel.querySelector("#chat-input");
  const sendButton = form.querySelector("button");

  // Turns the reply into DOM nodes without innerHTML. Only [text](recipe.html?id=123)
  // links to our own recipe pages and **bold** are supported.
  function renderText(container, text) {
    const pattern = /\[([^\]]+)\]\((recipe\.html\?id=\d+)\)|\*\*([^*]+)\*\*/g;
    let last = 0;
    for (const match of text.matchAll(pattern)) {
      container.append(text.slice(last, match.index));
      if (match[2]) {
        const link = document.createElement("a");
        link.href = match[2];
        link.textContent = match[1];
        container.append(link);
      } else {
        const strong = document.createElement("strong");
        strong.textContent = match[3];
        container.append(strong);
      }
      last = match.index + match[0].length;
    }
    container.append(text.slice(last));
  }

  function addMessage(kind, text) {
    const bubble = document.createElement("div");
    bubble.className = `chat-msg ${kind}`;
    if (kind === "bot") renderText(bubble, text);
    else bubble.textContent = text;
    log.appendChild(bubble);
    log.scrollTop = log.scrollHeight;
    return bubble;
  }

  function open(show) {
    panel.classList.toggle("open", show);
    toggle.setAttribute("aria-label", show ? "Close recipe assistant" : "Open recipe assistant");
    if (show) input.focus();
  }

  toggle.addEventListener("click", () => open(!panel.classList.contains("open")));
  panel.querySelector("header button").addEventListener("click", () => open(false));

  addMessage("bot", "Hi! Ask me to find a recipe, check ingredients or steps, or see what other cooks thought.");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    input.value = "";
    addMessage("user", text);
    history.push({ role: "user", content: text });
    sendButton.disabled = input.disabled = true;
    const thinking = addMessage("bot", "Thinking...");

    try {
      const { ok, data } = await postJson("/api/chat", { messages: history });
      thinking.remove();
      if (!ok) throw new Error(data.error || "Something went wrong.");
      history.push({ role: "assistant", content: data.reply });
      addMessage("bot", data.reply);
    } catch (error) {
      thinking.remove();
      history.pop(); // let the user retry the same question
      addMessage("error", error.message);
    } finally {
      sendButton.disabled = input.disabled = false;
      input.focus();
    }
  });
})();
