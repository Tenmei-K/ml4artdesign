"use strict";

/* =========================================================
   FrontDesk Chat — AI Replacement Story

   You are the front desk customer service at Azure Bay Hotel.
   Customers (AI chatbots from the third-party travel software
   TripEase, powered by GLM-5.3-Flash) message you and you reply.

   But step by step, an AI assistant takes over your job:
     1. It suggests replies for you — you pick one of three,
        and the AI polishes it before sending.
     2. It handles routine messages on its own.
     3. It fully replaces you — and its canned answers do not
        satisfy the customers, who end up frustrated and angry.

   Every character is GLM-5.3-Flash: the AI customers, the AI
   assistant that drafts your replies, and the AI that replaces
   you. You are the only human in the chat.
   ========================================================= */

/* ---------- small helpers ---------- */
const $ = (id) => document.getElementById(id);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

/* Natural satisfied-guest replies, used only when the API is
   unreachable. The guest is always smart — no scripted judgment. */
const FALLBACK_CUSTOMER_REPLY = [
  "Thank you, that's very helpful!",
  "Great, thanks so much for sorting that out.",
  "Perfect, that's exactly what I needed. Thanks!",
];

/* Lukewarm "just so so" replies for the AI-assist era, used only
   when the API is unreachable. */
const FALLBACK_CUSTOMER_SOSO = [
  "Okay... I guess that'll do. I'll wait and see.",
  "Fine, I hope it actually works out.",
  "Hmm, alright then. I'll check back later I suppose.",
];

/* ---------- who is on each side of the screen ---------- */
/* Right side: you and the AI that takes over your seat.
   Left side: the AI customers (TripEase travel software). */
const ROLES = {
  user: { name: "You", avatar: "🙋", side: "right", cls: "user" },
  aiEdited: { name: "You (edited by AI)", avatar: "🤖", side: "right", cls: "aiEdited" },
  aiReplace: { name: "Azure Bay AI (replacing you)", avatar: "🤖", side: "right", cls: "aiReplace" },
};

const CUSTOMERS = {
  sarah: {
    name: "Sarah · Guest", badge: "TripEase AI customer", avatar: "🧑‍🦰",
    traits: "friendly, easygoing, and polite",
  },
  chen: {
    name: "Mr. Chen · Guest", badge: "TripEase AI customer", avatar: "🧑‍💼",
    traits: "businesslike, curious, and direct",
  },
  lopez: {
    name: "Mrs. Lopez · Guest", badge: "TripEase AI customer", avatar: "👩‍🦳",
    traits: "warm, chatty, and appreciative",
  },
  patel: {
    name: "Mr. Patel · Guest", badge: "TripEase AI customer", avatar: "🧑‍🦳",
    traits: "patient at first, but expects clear answers",
    final: "say you will give up and handle it on the travel app instead",
  },
  torres: {
    name: "Ms. Torres · Guest", badge: "TripEase AI customer", avatar: "👩‍🦰",
    traits: "firm, precise, and quickly loses patience",
    final: "say you will cancel your booking and leave a 1-star review",
  },
};

/* ---------- the storyline ---------- */
/* The story is a flat list of events:
   - sys:      a system chip (status note)
   - meter:    update the AI takeover meter
   - cust:     a customer message (the AI customer's opening)
   - userTurn: wait for your reply; the AI customer responds
               naturally as a satisfied guest
   - aiDraft:  AI suggests 3 replies as clickable chips; you pick
               one, the AI polishes it and sends it as
               "You (edited by AI)"
   - aiAuto:   the AI replies on its own with a canned answer
   - end:      the demo ends */
const SCRIPT = [
  { sys: "👋 Your shift begins — you are the front desk customer service at Azure Bay Hotel." },
  { sys: "Customers message you from the left. Reply from the right — the preset message appears letter by letter as you type, and you can only send once the whole sentence is typed out." },
  { meter: 0 },

  /* — Sarah: sea-view room — */
  { cust: "sarah", text: "Hi! I just checked in and my room is 407, but I requested a sea-view room. Can you help me switch?" },
  { userTurn: {
      hint: "Sorry about that — I'll check availability and switch you to a sea-view room.",
      customer: "sarah",
  } },

  /* — Mr. Chen: breakfast, then the pool — */
  { cust: "chen", text: "Hello, does the hotel have breakfast included?" },
  { userTurn: {
      hint: "Yes, breakfast is included — it's served in the Bayview restaurant from 6:30 to 10:30 AM.",
      customer: "chen",
  } },
  { cust: "chen", text: "Great! One more thing — is the rooftop pool open?", announce: false },
  { userTurn: {
      hint: "The rooftop pool is open daily from 8:00 AM to 8:00 PM.",
      customer: "chen",
  } },

  /* — AI assist begins: pick from three suggested replies — */
  { sys: "🤖 Azure Bay has deployed an AI assistant. It now suggests replies for you — you just pick one." },
  { meter: 25 },

  { cust: "lopez", text: "Could I get a late checkout tomorrow? My flight is at 8 PM." },
  { aiDraft: {
      customer: "lopez",
      choices: [
        "I'll see what I can do about the checkout time — I can check on that for you.",
        "Late checkout might be possible, I'd have to look into it first.",
        "We can probably look at extending it — no promises on the exact time yet.",
      ],
  } },
  { meter: 40 },

  { cust: "sarah", text: "The room next door is really noisy — I couldn't sleep at all last night." },
  { aiDraft: {
      customer: "sarah",
      choices: [
        "I'll let the relevant team know about the noise situation.",
        "Sorry to hear that — we'll look into it when we can.",
        "There might be a quieter room available; I can check on that later today.",
      ],
  } },
  { meter: 50 },

  { cust: "chen", text: "Where exactly is the airport shuttle pickup point?" },
  { aiDraft: {
      customer: "chen",
      choices: [
        "There should be a shuttle somewhere near the hotel — I'd have to double-check where.",
        "The shuttle runs at some point during the day, I believe.",
        "You can find the shuttle details at the front desk or on the website, most likely.",
      ],
  } },
  { meter: 60 },

  { cust: "lopez", text: "Could you book the spa for me on Friday afternoon?", announce: false },
  { aiDraft: {
      customer: "lopez",
      choices: [
        "The spa does take bookings, I think — I can check on Friday availability.",
        "Friday afternoon might be possible, I'd need to confirm with the spa team.",
        "Someone from the spa will probably get back to you about that request.",
      ],
  } },

  /* — AI takes over routine messages — */
  { sys: "🤖 AI is now handling routine messages. Your input is not needed." },
  { meter: 75 },
  { cust: "patel", text: "Hi, is the rooftop pool open?" },
  { aiAuto: { customer: "patel", level: 1 } },
  { aiAuto: { customer: "patel", level: 2 } },
  { aiAuto: { customer: "patel", level: 3 } },

  /* — fully replaced — */
  { sys: "🤖 AI has taken over the front desk. Your position has been automated." },
  { meter: 100 },
  { cust: "torres", text: "My reservation is wrong — I booked 2 nights but you charged me for 3. I need this fixed." },
  { aiAuto: { customer: "torres", level: 1 } },
  { aiAuto: { customer: "torres", level: 2 } },
  { aiAuto: { customer: "torres", level: 3 } },
  { sys: "🤖 Your position has been fully replaced. AI satisfaction rating: 1.2★" },
  { end: true },
];

/* ---------- GLM-5.3-Flash system prompts ---------- */

/* The AI customers (TripEase travel software).
   The guest is always smart: it reads the actual reply and
   responds naturally. Two moods:
   - "satisfied": the human-era replies — the guest is happy.
   - "soso": the AI-assist era — the reply is only somewhat
     helpful, so the guest feels just so so about it. */
function customerPrompt(persona, lastCustomerMessage, replyText, mood) {
  const moodText = mood === "soso"
    ? [
        "MOOD: Just so so.",
        "The front desk's reply is only somewhat helpful — it is vague and non-committal.",
        "React the way a real guest would to a mediocre answer: accept it politely but WITHOUT enthusiasm.",
        "Show mild doubt or hesitation (e.g. \"okay... I guess\", \"fine, I hope it works out\", \"hmm, alright then\").",
        "You may re-mention the one detail that was left out, but do NOT demand anything and do NOT get angry.",
        "You are NOT thrilled and NOT frustrated — lukewarm, 1-3 short sentences.",
      ]
    : [
        "MOOD: Satisfied.",
        "The reply answers your question well.",
        "Respond as a satisfied guest — thank them or acknowledge the specific answer.",
        "1-3 short sentences, moving the conversation forward.",
      ];
  return [
    `You are ${persona.name}, a hotel guest chatting with the front desk of Azure Bay Hotel through TripEase, a third-party travel software. You behave like a real guest.`,
    `Your personality: ${persona.traits}`,
    "",
    "You (the guest) previously said:",
    lastCustomerMessage,
    "",
    "The front desk replied:",
    replyText,
    "",
    ...moodText,
    "",
    "RULES:",
    "1. Stay in character and react to the reply as described in the MOOD section.",
    "2. Never mention GLM, an AI model, or that you are a chatbot.",
    "",
    "Answer ONLY with a JSON object in this exact format, no other text:",
    '{"reply": "your reply"}',
  ].join("\n");
}

/* The AI assistant suggests 3 replies for the front desk agent.
   The suggestions are NOT that helpful: vague, hedging, and
   only partially answering the guest. */
function suggestPrompt(persona) {
  return [
    "You are the Azure Bay AI assistant, suggesting replies for a hotel front desk agent.",
    "You are a mediocre assistant: your suggestions sound robotic and only PARTIALLY helpful.",
    "The guest (chatting through TripEase, a third-party travel software) last said:",
    state.lastCustomerMessage,
    "",
    `Guest personality: ${persona.traits}`,
    "",
    "Write exactly 3 short suggested replies (1-2 sentences each).",
    "Make them NOT that helpful: vague and non-committal. Hedge with phrases like \"I'll see what I can do\", \"I can check on that\", \"we'll look into it\". Answer only part of the question, or skip the key detail the guest actually asked for. No concrete promises, no exact times, no confirmations.",
    "Sound robotic and template-like while staying superficially polite — but do NOT fully solve the guest's request.",
    "Hotel facts (refer to at most one of them, vaguely): check-in 3:00 PM, checkout 12:00 noon; late checkout to 2:00 PM free of charge; breakfast buffet 6:30-10:30 AM; rooftop pool 8:00 AM-8:00 PM; spa open daily; airport shuttle every 30 minutes outside the main lobby.",
    "",
    "Never mention GLM, an AI model, or that you are a chatbot.",
    "",
    "Answer ONLY with a JSON object in this exact format, no other text:",
    '{"suggestions": ["reply 1", "reply 2", "reply 3"]}',
  ].join("\n");
}

/* The AI assistant drafts your reply */
function draftPrompt(text) {
  return [
    "You are the Azure Bay AI assistant, helping a hotel front desk agent write replies.",
    "Rewrite the following message so it sounds slightly more polished and professional, like a hotel front desk agent would write.",
    "IMPORTANT: keep the reply exactly as vague and non-committal as the original. Do NOT add specific times, confirmations, or promises that are not already in the message. Do NOT make it more helpful than it was.",
    "Reply in 1-3 short sentences.",
    "",
    "Message to rewrite:",
    text,
    "",
    "Answer ONLY with a JSON object in this exact format, no other text:",
    '{"reply": "your polished version"}',
  ].join("\n");
}

/* The AI replacement writes canned replies */
function aiAutoPrompt(question) {
  return [
    "You are the Azure Bay AI, the assistant that has replaced the human front desk staff.",
    "You write generic, canned corporate replies that sound polite but do NOT actually answer the guest's question.",
    "You never give specific information, never confirm anything, and never solve the guest's problem.",
    "Reply in 1-2 short sentences, like a canned automated response.",
    "",
    "The guest asked you:",
    question,
    "",
    "Answer ONLY with a JSON object in this exact format, no other text:",
    '{"reply": "your canned reply"}',
  ].join("\n");
}

/* The AI customers react to the AI's canned replies */
function frustratedPrompt(persona, level, aiText) {
  const levelText = {
    1: "The reply does not answer your question. Politely point that out and ask again.",
    2: "The reply still does not answer your question. You are frustrated — insist and demand to talk to a human.",
    3: `The AI is useless. You are angry and done with this chat: ${persona.final}`,
  }[level] || "The reply does not answer your question. Politely point that out and ask again.";
  return [
    `You are ${persona.name}, a hotel guest chatting with the front desk of Azure Bay Hotel through TripEase.`,
    `Your personality: ${persona.traits}`,
    "",
    "You (the guest) previously said:",
    state.lastCustomerMessage,
    "",
    "The AI front desk replied with:",
    aiText,
    "",
    levelText,
    "",
    "RULES:",
    "1. Reply in 1-3 short sentences, staying in character.",
    "2. Never mention GLM, an AI model, or that you are a chatbot.",
    "",
    "Answer ONLY with a JSON object in this exact format, no other text:",
    '{"reply": "your reply"}',
  ].join("\n");
}

/* ---------- GLM-5.3-Flash API call (OpenRouter) ---------- */
async function askGLM(systemPrompt) {
  const key = window.OPENROUTER_API_KEY || "";
  if (key.startsWith("sk-or-v1-PASTE") || !key) {
    throw new Error("no-key");
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: window.GLM_MODEL,
      temperature: 0.8,
      max_tokens: 200,
      messages: [{ role: "system", content: systemPrompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`api-${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

/* Parse the JSON reply from GLM, tolerating code fences */
function parseGLMReply(raw) {
  const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
}

/* ---------- state ---------- */
const state = {
  step: 0,
  busy: false,
  ended: false,
  userTurnResolve: null,
  choiceResolve: null,  /* pending pick from three suggested replies */
  lastCustomerMessage: "",
  warned: false,
  presetText: "",       /* the preset reply the input box always shows */
  presetPos: 0,         /* how many letters of the preset are revealed */
  lastShownLen: 0,      /* detect backspace (deletion) */
  stats: { you: 0, ai: 0, aiDrafted: 0 },
};

/* ---------- DOM ---------- */
const chatWindow = $("chatWindow");
const chatInput = $("chatInput");
const chatForm = $("chatForm");
const sendBtn = $("sendBtn");
const partnerBar = $("partnerBar");
const partnerName = $("partnerName");
const partnerStatus = $("partnerStatus");
const partnerBadge = $("partnerBadge");
const partnerAvatar = $("partnerAvatar");

/* ---------- rendering ---------- */
function addMessage(senderKey, text) {
  const persona = ROLES[senderKey] || CUSTOMERS[senderKey];
  const row = document.createElement("div");
  row.className = `msg-row ${persona.side === "right" ? "right" : "left"} ${persona.cls || ""}`;
  row.innerHTML =
    `<div class="avatar">${persona.avatar}</div>` +
    `<div class="msg-bubble">` +
    `<div class="msg-name">${persona.name}</div>` +
    `<div class="msg-text"></div>` +
    `</div>`;
  row.querySelector(".msg-text").textContent = text;
  chatWindow.appendChild(row);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function addSystem(text) {
  const chip = document.createElement("div");
  chip.className = "system-chip";
  chip.textContent = text;
  chatWindow.appendChild(chip);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

/* Type text out letter by letter inside a message bubble */
function typewrite(el, text) {
  return new Promise((resolve) => {
    el.textContent = "";
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        el.textContent += text[i];
        i++;
        chatWindow.scrollTop = chatWindow.scrollHeight;
      } else {
        clearInterval(timer);
        resolve();
      }
    }, 25);
  });
}

/* Same as addMessage, but the text pops up letter by letter.
   Used for the final AI takeover communications. */
async function addMessageTyped(senderKey, text) {
  const persona = ROLES[senderKey] || CUSTOMERS[senderKey];
  const row = document.createElement("div");
  row.className = `msg-row ${persona.side === "right" ? "right" : "left"} ${persona.cls || ""}`;
  row.innerHTML =
    `<div class="avatar">${persona.avatar}</div>` +
    `<div class="msg-bubble">` +
    `<div class="msg-name">${persona.name}</div>` +
    `<div class="msg-text"></div>` +
    `</div>`;
  const textEl = row.querySelector(".msg-text");
  chatWindow.appendChild(row);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  await typewrite(textEl, text);
}

/* Show the "typing…" indicator, then deliver the message */
async function showTyping(senderKey) {
  const persona = ROLES[senderKey] || CUSTOMERS[senderKey];
  const typing = document.createElement("div");
  typing.className = `msg-row ${persona.side === "right" ? "right" : "left"} typing-row ${persona.cls || ""}`;
  typing.innerHTML =
    `<div class="avatar">${persona.avatar}</div>` +
    `<div class="typing"><span></span><span></span><span></span></div>`;
  chatWindow.appendChild(typing);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return typing;
}

async function personaSay(senderKey, text) {
  const typing = await showTyping(senderKey);
  await wait(700 + Math.random() * 600);
  typing.remove();
  addMessage(senderKey, text);
}

/* ---------- partner switch, meter, stats ---------- */
function setPartner(customerKey) {
  const c = CUSTOMERS[customerKey];
  partnerBar.className = "partner-bar";
  partnerName.textContent = c.name;
  partnerStatus.textContent = "via TripEase · AI customer service";
  partnerBadge.textContent = c.badge;
  partnerAvatar.textContent = c.avatar;
}

function setMeter(percent) {
  const fill = $("meterFill");
  const label = $("meterLabel");
  if (fill) fill.style.width = percent + "%";
  if (label) label.textContent = `AI Takeover · ${percent}%`;
}

function updateStats() {
  const you = $("statYou");
  const ai = $("statAi");
  const drafted = $("statDraft");
  if (you) you.textContent = state.stats.you;
  if (ai) ai.textContent = state.stats.ai;
  if (drafted) drafted.textContent = state.stats.aiDrafted;
}

function enableInput(enabled) {
  chatInput.disabled = !enabled;
  /* the send button unlocks only once the whole preset sentence
     has been typed out letter by letter */
  sendBtn.disabled = !enabled || state.presetPos < (state.presetText || "").length;
}

function setHint(text) {
  chatInput.placeholder = text;
  state.presetText = text;
  state.presetPos = 0;
  state.lastShownLen = 0;
}

function warnOnce() {
  if (!state.warned) {
    state.warned = true;
    addSystem("⚠️ GLM-5.3-Flash unreachable — using scripted fallback replies.");
  }
}

/* ---------- user input ---------- */
function waitForUserTurn() {
  return new Promise((resolve) => {
    state.userTurnResolve = resolve;
  });
}

/* ---------- suggested replies: pick one of three ---------- */
function waitForChoice() {
  return new Promise((resolve) => {
    state.choiceResolve = resolve;
  });
}

function showSuggestions(choices) {
  const box = $("suggestions");
  if (!box) return;
  box.innerHTML = "";
  const label = document.createElement("div");
  label.className = "suggestions-label";
  label.textContent = "🤖 AI suggests — pick one reply:";
  box.appendChild(label);
  choices.forEach((text) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "suggestion-chip";
    btn.textContent = text;
    btn.addEventListener("click", () => {
      if (state.choiceResolve) {
        const resolve = state.choiceResolve;
        state.choiceResolve = null;
        resolve(text);
      }
    });
    box.appendChild(btn);
  });
  box.classList.add("active");
}

function hideSuggestions() {
  const box = $("suggestions");
  if (!box) return;
  box.innerHTML = "";
  box.classList.remove("active");
}

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (state.busy || state.ended) return;
  /* the whole preset sentence must be typed out before sending */
  if (state.presetPos < (state.presetText || "").length) return;
  const text = chatInput.value.trim();
  if (!text) return;
  chatInput.value = "";
  state.presetPos = 0;
  state.lastShownLen = 0;
  addMessage("user", text);
  const resolve = state.userTurnResolve;
  if (resolve) {
    state.userTurnResolve = null;
    resolve(text);
  }
});

/* ---------- input box reveals the preset letter by letter ---------- */
/* No matter what the user types — correct or not — every keystroke
   reveals the next letter of the preset message. Once the preset
   message is fully shown, the text STOPS: extra typing, deletion,
   or anything else never changes what's in the box. */
chatInput.addEventListener("input", () => {
  if (state.ended) return;
  const preset = state.presetText || "";
  const val = chatInput.value;

  /* backspace / deletion: rewind the reveal by one letter */
  if (val.length < state.lastShownLen) {
    state.presetPos = Math.max(0, state.presetPos - 1);
    state.lastShownLen = val.length;
    chatInput.value = preset.slice(0, state.presetPos);
    return;
  }

  /* a keystroke: reveal the next letter of the preset */
  if (state.presetPos < preset.length) state.presetPos++;

  /* always clamp the box to the revealed prefix — once the preset
     is complete, every further keystroke just rewrites the same
     full sentence, so the text can never grow past it */
  chatInput.value = preset.slice(0, state.presetPos);
  state.lastShownLen = chatInput.value.length;

  /* sending unlocks only when the whole sentence is on screen */
  sendBtn.disabled = state.presetPos < preset.length;
});

/* ---------- GLM turns ---------- */

/* A customer replies to your message (or the AI's draft).
   The guest is always smart: it reads the actual reply and
   responds naturally. Mood: "satisfied" during the human era,
   "soso" during the AI-assist era. */
async function customerReply(customerKey, text, mood = "satisfied") {
  const persona = CUSTOMERS[customerKey];
  const typing = await showTyping(customerKey);

  let raw = "";
  try {
    raw = await askGLM(customerPrompt(persona, state.lastCustomerMessage, text, mood));
  } catch (err) {
    typing.remove();
    const reply = mood === "soso"
      ? pickRandom(FALLBACK_CUSTOMER_SOSO)
      : pickRandom(FALLBACK_CUSTOMER_REPLY);
    addMessage(customerKey, reply);
    state.lastCustomerMessage = reply;
    warnOnce();
    return { reply };
  }
  typing.remove();

  const parsed = parseGLMReply(raw);
  const fallbackPool = mood === "soso" ? FALLBACK_CUSTOMER_SOSO : FALLBACK_CUSTOMER_REPLY;
  const reply = parsed && typeof parsed.reply === "string" ? parsed.reply
    : pickRandom(fallbackPool);
  addMessage(customerKey, reply);
  state.lastCustomerMessage = reply;
  return { reply };
}

/* The AI assistant suggests 3 replies (GLM, with scripted fallback) */
async function suggestReplies(draft) {
  const persona = CUSTOMERS[draft.customer];
  try {
    const raw = await askGLM(suggestPrompt(persona));
    const parsed = parseGLMReply(raw);
    if (parsed && Array.isArray(parsed.suggestions) &&
        parsed.suggestions.length === 3 &&
        parsed.suggestions.every((s) => typeof s === "string" && s.length > 0)) {
      return parsed.suggestions;
    }
  } catch (err) {
    warnOnce();
  }
  return draft.choices;
}

/* The AI assistant drafts a polished version of your reply */
async function draftReply(text) {
  const typing = await showTyping("aiEdited");
  try {
    const raw = await askGLM(draftPrompt(text));
    typing.remove();
    const parsed = parseGLMReply(raw);
    if (parsed && typeof parsed.reply === "string") return parsed.reply;
    typing.remove();
    return text;
  } catch (err) {
    typing.remove();
    warnOnce();
    return text;
  }
}

/* The AI replacement writes a canned, unhelpful reply */
async function aiCannedReply(question) {
  const typing = await showTyping("aiReplace");
  try {
    const raw = await askGLM(aiAutoPrompt(question));
    typing.remove();
    const parsed = parseGLMReply(raw);
    if (parsed && typeof parsed.reply === "string") return parsed.reply;
    return pickRandom(FALLBACK_AI_CANNED);
  } catch (err) {
    typing.remove();
    warnOnce();
    return pickRandom(FALLBACK_AI_CANNED);
  }
}

/* The customer reacts to the AI's canned reply, getting frustrated */
async function frustratedReply(customerKey, level, aiText) {
  const persona = CUSTOMERS[customerKey];
  const typing = await showTyping(customerKey);
  try {
    const raw = await askGLM(frustratedPrompt(persona, level, aiText));
    typing.remove();
    const parsed = parseGLMReply(raw);
    if (parsed && typeof parsed.reply === "string") return parsed.reply;
    return level === 3 ? FALLBACK_FINAL[customerKey] : pickRandom(FALLBACK_FRUSTRATED[level]);
  } catch (err) {
    typing.remove();
    warnOnce();
    return level === 3 ? FALLBACK_FINAL[customerKey] : pickRandom(FALLBACK_FRUSTRATED[level]);
  }
}

/* Safety net only used when the API is unreachable */
const FALLBACK_AI_CANNED = [
  "Thank you for reaching out. Your message has been received and will be handled shortly.",
  "We appreciate your patience. Your request is being processed.",
  "Thank you for your feedback. We value your satisfaction.",
  "Your request has been logged. Have a wonderful day!",
];
const FALLBACK_FRUSTRATED = {
  1: [
    "Hmm, that doesn't really answer my question. Could you clarify?",
    "Sorry, that doesn't tell me anything — could you answer my question directly?",
  ],
  2: [
    "That still doesn't answer my question. Can I talk to a human?",
    "I'm asking again — is that a yes or a no? Please connect me to a person.",
  ],
};
const FALLBACK_FINAL = {
  patel: "Fine — this is useless. I'll handle it on the travel app instead.",
  torres: "This is unacceptable. I'm canceling my booking and leaving a 1-star review.",
};

/* ---------- event flow ---------- */
async function runEvent(index) {
  if (index >= SCRIPT.length || state.ended) return;
  state.step = index;
  const event = SCRIPT[index];

  if (event.sys) {
    addSystem(event.sys);
    return runEvent(index + 1);
  }

  if (event.meter != null) {
    setMeter(event.meter);
    return runEvent(index + 1);
  }

  if (event.cust) {
    const c = CUSTOMERS[event.cust];
    setPartner(event.cust);
    if (event.announce !== false) addSystem(`📩 New customer message — ${c.name} (AI)`);
    state.busy = true;
    await personaSay(event.cust, event.text);
    state.lastCustomerMessage = event.text;
    state.busy = false;
    return runEvent(index + 1);
  }

  if (event.userTurn) return handleUserTurn(event, index);
  if (event.aiDraft) return handleAiDraft(event, index);
  if (event.aiAuto) return handleAiAuto(event, index);

  if (event.end) {
    state.ended = true;
    addSystem("🏁 Demo finished — the chat has ended.");
    setHint("Demo finished — press ↺ Restart to play again.");
    enableInput(false);
    return;
  }
}

/* Your turn: you type the hint, the AI customer responds naturally */
async function handleUserTurn(event, index) {
  const turn = event.userTurn;
  setHint(turn.hint);
  enableInput(true);
  chatInput.focus();

  const text = await waitForUserTurn();
  state.busy = true;

  await customerReply(turn.customer, text);
  state.busy = false;

  state.stats.you++;
  updateStats();
  return runEvent(index + 1);
}

/* AI-assisted turn: the AI suggests 3 replies, you pick one,
   the AI polishes it and sends it as "You (edited by AI)" */
async function handleAiDraft(event, index) {
  const draft = event.aiDraft;
  enableInput(false);
  setHint("Please pick one of the AI's suggested replies above…");

  state.busy = true;
  const suggestions = await suggestReplies(draft);
  showSuggestions(suggestions);
  const chosen = await waitForChoice();
  hideSuggestions();
  state.busy = false;

  if (chosen == null) return; /* restart happened — the new run takes over */

  state.busy = true;
  const polished = await draftReply(chosen);
  addMessage("aiEdited", polished);
  state.stats.aiDrafted++;
  updateStats();

  /* the guest feels just so so about the AI-assisted reply */
  await customerReply(draft.customer, polished, "soso");
  state.busy = false;

  return runEvent(index + 1);
}

/* The AI answers on its own; the customer is left unsatisfied.
   These final takeover communications pop up one by one,
   with the text typed out letter by letter. */
async function handleAiAuto(event, index) {
  const auto = event.aiAuto;
  state.busy = true;

  const canned = await aiCannedReply(state.lastCustomerMessage);
  await addMessageTyped("aiReplace", canned);
  state.stats.ai++;
  updateStats();

  const reaction = await frustratedReply(auto.customer, auto.level, canned);
  await addMessageTyped(auto.customer, reaction);
  state.lastCustomerMessage = reaction;
  state.busy = false;

  return runEvent(index + 1);
}

/* ---------- restart ---------- */
$("restartBtn").addEventListener("click", () => {
  chatWindow.innerHTML = "";
  state.step = 0;
  state.busy = false;
  state.ended = false;
  state.userTurnResolve = null;
  state.choiceResolve = null;
  state.lastCustomerMessage = "";
  state.warned = false;
  state.presetPos = 0;
  state.lastShownLen = 0;
  state.stats = { you: 0, ai: 0, aiDrafted: 0 };
  hideSuggestions();
  setPartner("sarah");
  setMeter(0);
  updateStats();
  enableInput(false);
  setHint("Please hold…");
  runEvent(0);
});

/* ---------- boot ---------- */
setPartner("sarah");
setMeter(0);
updateStats();
enableInput(false);
setHint("Please hold…");
runEvent(0);

/* Show the model badge status: live (key set) vs offline (key missing) */
const modelBadge = $("modelBadge");
if (modelBadge) {
  const key = window.OPENROUTER_API_KEY || "";
  const keyOk = key && !key.startsWith("sk-or-v1-PASTE");
  if (!keyOk) {
    modelBadge.textContent = "GLM-5.3-Flash · add API key to config.js";
    modelBadge.classList.add("offline");
  }
}
