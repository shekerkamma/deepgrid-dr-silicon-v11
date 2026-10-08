var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// proxy/rerank-worker.js
var MODEL = "gemini-flash-lite-latest";
var MAX_QUERY_CHARS = 400;
var MAX_CANDIDATES = 8;
var MAX_EXCERPT_CHARS = 420;
var UPSTREAM_TIMEOUT_MS = 6e3;
var ALLOWED_ORIGINS = /* @__PURE__ */ new Set([
  "https://shekerkamma.github.io",
  "http://localhost:8899",
  "http://localhost:5173"
]);
function cors(origin) {
  const allow = ALLOWED_ORIGINS.has(origin) ? origin : "null";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}
__name(cors, "cors");
var clean = /* @__PURE__ */ __name((s, n) => String(s || "").replace(/\s+/g, " ").slice(0, n), "clean");
var rerank_worker_default = {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const headers = { ...cors(origin), "Content-Type": "application/json" };
    if (request.method === "OPTIONS") return new Response(null, { headers: cors(origin) });
    if (request.method !== "POST") return new Response('{"error":"POST only"}', { status: 405, headers });
    if (!ALLOWED_ORIGINS.has(origin)) {
      return new Response('{"error":"origin not allowed"}', { status: 403, headers });
    }
    if (!env.GEMINI_API_KEY) {
      return new Response('{"error":"proxy not configured"}', { status: 503, headers });
    }
    let q = "", cands = [];
    try {
      const body = await request.json();
      q = clean(body.q, MAX_QUERY_CHARS).trim();
      cands = Array.isArray(body.candidates) ? body.candidates.slice(0, MAX_CANDIDATES) : [];
    } catch {
      return new Response('{"error":"bad json"}', { status: 400, headers });
    }
    if (!q || cands.length < 2) {
      return new Response('{"error":"need q and 2+ candidates"}', { status: 400, headers });
    }
    const list = cands.map((c, i) => `[${i + 1}] ${clean(c.title, 120)} \u2014 ${clean(c.excerpt, MAX_EXCERPT_CHARS)}`).join("\n");
    const prompt = `You are ranking retrieved passages from a DeepGrid Semi investor dossier.
Question: ${q}

${list}

Which ONE passage best answers the question? Reply with only its number.
If NONE of them answers the question -- if the question is about something this
investor dossier does not cover, such as sport, geography, cooking, weather, or
another company entirely -- reply with only 0.`;
    let text = "";
    try {
      const upstream = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            // flash-lite rejects thinkingConfig with a bare HTTP 400. On the
            // full flash models the opposite holds: WITHOUT thinkingBudget 0
            // the reasoning tokens eat the output budget and the reply comes
            // back an EMPTY STRING -- which reads as a refusal, not as a
            // configuration error. Keyed off the model name so swapping MODEL
            // cannot silently break one or the other.
            generationConfig: /lite/.test(MODEL) ? { maxOutputTokens: 64, temperature: 0 } : { maxOutputTokens: 64, temperature: 0, thinkingConfig: { thinkingBudget: 0 } }
          }),
          signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS)
        }
      );
      if (upstream.ok) {
        const j = await upstream.json();
        text = j?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      }
    } catch {
    }
    const m = text.match(/\b([0-8])\b/);
    const n = m ? Number(m[1]) : 1;
    return new Response(JSON.stringify({ pick: n >= 0 && n <= cands.length ? n : 1 }), { headers });
  }
};
export {
  rerank_worker_default as default
};
//# sourceMappingURL=rerank-worker.js.map
