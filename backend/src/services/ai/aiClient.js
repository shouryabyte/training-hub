const { safeJsonFromText } = require("../../utils/safeJson");

function provider() {
  const p = String(process.env.AI_PROVIDER || "").trim().toLowerCase();
  if (p) return p;
  if (process.env.GEMINI_API_KEY) return "gemini";
  return "groq";
}

function requireGroqKey() {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY is not set");
  return key;
}

function requireGeminiKey() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set");
  return key;
}

function geminiModel() {
  return process.env.GEMINI_MODEL || "gemini-2.0-flash";
}


async function callGroqJson({ system, user, temperature = 0.4 }) {
  const key = requireGroqKey();

  const model = process.env.GROQ_MODEL || "llama-3.1-70b-versatile";
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      temperature,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error?.message || `Groq error ${res.status}`;
    throw new Error(msg);
  }
  const text = data?.choices?.[0]?.message?.content || "";
  return safeJsonFromText(text);
}

async function callGroqText({ system, user, temperature = 0.4 }) {
  const key = requireGroqKey();

  const model = process.env.GROQ_MODEL || "llama-3.1-70b-versatile";
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      temperature,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error?.message || `Groq error ${res.status}`;
    throw new Error(msg);
  }
  return data?.choices?.[0]?.message?.content || "";
}

async function callGeminiText({ system, user, temperature = 0.4 }) {
  const key = requireGeminiKey();
  const model = geminiModel();

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: user }] }],
        generationConfig: { temperature },
      }),
    }
  );

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error?.message || `Gemini error ${res.status}`;
    throw new Error(msg);
  }
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p?.text).filter(Boolean).join("\n") || "";
  return text;
}

async function callGeminiJson({ system, user, temperature = 0.4 }) {
  const text = await callGeminiText({
    system: `${system}\nReturn JSON only. No markdown, no commentary.`,
    user,
    temperature,
  });
  return safeJsonFromText(text);
}

async function generateJson({ system, user, temperature }) {
  if (provider() === "gemini") return callGeminiJson({ system, user, temperature });
  return callGroqJson({ system, user, temperature });
}

async function generateText({ system, user, temperature }) {
  if (provider() === "gemini") return callGeminiText({ system, user, temperature });
  return callGroqText({ system, user, temperature });
}

module.exports = { generateJson, generateText };
