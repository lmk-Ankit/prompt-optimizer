// Vercel Serverless Function — POST /api/optimize
// Proxies user prompts to OpenRouter and returns an improved version + quality scores.
// The API key stays server-side so it's never exposed to the browser.

export const config = {
  runtime: "edge", // Use Vercel Edge Runtime for low latency
};

// ─── Prompt Scoring ────────────────────────────────────────────────────────────
// Heuristic scorer: rates a prompt out of 10 on five dimensions.
// Each dimension awards 0–2 points; totals are averaged to give a clean 0–10.

function scorePrompt(prompt) {
  const text = prompt.trim();
  const words = text.split(/\s+/).filter(Boolean);
  const issues = [];
  let score = 0;

  // 1. Length — very short prompts give the AI nothing to work with
  if (words.length >= 20) {
    score += 2;
  } else if (words.length >= 10) {
    score += 1;
    issues.push("Prompt is short — add more context or detail");
  } else {
    issues.push("Prompt is too brief — elaborate on what you actually need");
  }

  // 2. Role assignment — "Act as a …" dramatically improves output quality
  const roleKeywords = ["act as", "you are", "as a", "as an", "role:", "persona:"];
  if (roleKeywords.some((k) => text.toLowerCase().includes(k))) {
    score += 2;
  } else {
    score += 0;
    issues.push('No role defined — try starting with "Act as a …"');
  }

  // 3. Clarity — question mark or clear action verb signals intent
  const actionVerbs = ["explain", "describe", "list", "compare", "write", "create",
    "summarize", "analyze", "generate", "give me", "provide", "show"];
  const hasQuestion = text.includes("?");
  const hasAction = actionVerbs.some((v) => text.toLowerCase().includes(v));
  if (hasQuestion || hasAction) {
    score += 2;
  } else {
    score += 1;
    issues.push("Unclear intent — start with an action verb or question");
  }

  // 4. Output format — requesting a specific format dramatically improves usability
  const formatHints = ["bullet", "list", "step", "table", "json", "markdown",
    "numbered", "format", "structure", "outline", "paragraph"];
  if (formatHints.some((f) => text.toLowerCase().includes(f))) {
    score += 2;
  } else {
    score += 0;
    issues.push('No output format specified — try "in bullet points" or "as a table"');
  }

  // 5. Specificity — domain words, numbers, or proper nouns signal depth
  const hasNumbers = /\d/.test(text);
  const hasProperNouns = /[A-Z]/.test(text.slice(1)); // skip first char
  const isLongEnough = words.length >= 15;
  if (hasNumbers || (hasProperNouns && isLongEnough)) {
    score += 2;
  } else if (isLongEnough) {
    score += 1;
    issues.push("Could be more specific — add domain terms, numbers, or constraints");
  } else {
    issues.push("Too generic — include specific subject matter or constraints");
  }

  return { score, issues };
}

// ─── System Prompt ─────────────────────────────────────────────────────────────
// This IS the "model logic" — it tells the AI exactly how to transform the prompt.
// Written as a precise specification so the AI behaves like a prompt engineer.

const SYSTEM_PROMPT = `You are an expert AI prompt engineer. Your job is to transform weak, vague user prompts into highly effective prompts that consistently produce excellent AI responses.

A high-quality prompt always includes:
1. A ROLE — who the AI should be (e.g., "Act as a senior software engineer")
2. CLEAR INTENT — an unambiguous action verb + objective
3. CONTEXT — relevant background, constraints, or audience
4. OUTPUT FORMAT — how the response should be structured (bullet points, table, code, numbered steps, etc.)
5. SPECIFICITY — precise domain terms, quantities, or criteria

When given a weak prompt, you MUST:
- Rewrite it to include all five elements above
- Keep the user's core intent fully intact
- Make it 3–5× longer and more detailed than the original
- Write in second-person imperative (give direct instructions to the AI)

Return ONLY the improved prompt text. No explanations, no preamble, no quotes around the output.`;

// ─── Mode-specific suffixes ─────────────────────────────────────────────────────
// Different optimization modes append extra instructions to the system prompt.

const MODE_SUFFIX = {
  quick: "\nKeep the improved prompt concise but complete — under 80 words.",
  deep: "\nMake the improved prompt comprehensive and exhaustive — cover edge cases, examples, and nuances. Aim for 100–200 words.",
  research:
    "\nRewrite the prompt in an academic/research style, suitable for generating literature-review quality content. Include methodological constraints and citation requests where applicable.",
};

// ─── Main Handler ──────────────────────────────────────────────────────────────

export default async function handler(req) {
  // Handle CORS preflight (OPTIONS)
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Only POST requests allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { prompt, mode = "quick" } = body;

  if (!prompt || typeof prompt !== "string" || prompt.trim().length < 3) {
    return new Response(
      JSON.stringify({ error: "prompt must be a non-empty string of at least 3 characters" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "Server misconfiguration: API key not set" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // Compute before score using the heuristic scorer
  const { score: scoreBefore, issues } = scorePrompt(prompt);

  // Build the combined system prompt (base + mode suffix)
  const systemMsg = SYSTEM_PROMPT + (MODE_SUFFIX[mode] ?? MODE_SUFFIX.quick);

  // Call OpenRouter
  const MODELS = [
    "mistralai/mistral-small-creative",
  ];

  let improved = null;
  let lastError = null;
  let usedModel = null;

  for (const model of MODELS) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          // OpenRouter requires this header to identify the app
          "HTTP-Referer": "https://prompt-optimizer.vercel.app",
          "X-Title": "Prompt Optimizer",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemMsg },
            { role: "user", content: prompt.trim() },
          ],
          max_tokens: 500,
          temperature: 0.7, // slight creativity for natural-sounding rewrites
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        lastError = `Model ${model} returned ${response.status}: ${errText}`;
        continue; // try next model
      }

      const data = await response.json();
      improved = data.choices?.[0]?.message?.content?.trim();
      usedModel = model;
      if (improved) break; // success — stop trying
    } catch (err) {
      lastError = err.message;
    }
  }

  if (!improved) {
    return new Response(
      JSON.stringify({ error: "All models failed", detail: lastError }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }

  // Compute after score on the AI-generated improved prompt
  const { score: scoreAfter } = scorePrompt(improved);

  return new Response(
    JSON.stringify({
      original: prompt.trim(),
      improved,
      score_before: scoreBefore,
      score_after: scoreAfter,
      issues, // list of specific weaknesses found in the original
      model_used: usedModel, // which model actually succeeded
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}
