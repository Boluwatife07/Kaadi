// OWNER: SB
// One AI call, one wrapper. 12s timeout, temperature 0.2, max_tokens 1000,
// strips ```json fences before parsing. Any throw, timeout, or parse
// failure returns { data: fallback, isFallback: true } — this NEVER
// re-throws to the caller (Section 10, 11.3).

const TIMEOUT_MS = 12_000;

export const INTAKE_SYSTEM_PROMPT = `You extract a domestic worker's professional history from their own
spoken or typed account. Return ONLY a JSON object, no prose, no markdown fences.
Schema:
{"name":string,"skills":string[],"location":string,"languages_spoken":string[],
"work_history":[{"employer_name":string,"role":string,"start_date":string,
"end_date":string,"is_ongoing":boolean,"employer_phone":string}],
"guarantor":{"name":string,"phone":string,"relationship":string}|null,
"missing_information":string[],"plain_summary":string}
Rules: use only what the text states. If a field is not stated, return an empty
string/array and add a short note to missing_information. Never infer age, gender,
tribe, ethnicity, religion, or nationality. Never invent a past employer or a phone
number. plain_summary is at most two sentences.`;

export interface StructureIntakeResult {
  name: string;
  skills: string[];
  location: string;
  languages_spoken: string[];
  work_history: {
    employer_name: string;
    role: string;
    start_date: string;
    end_date: string;
    is_ongoing: boolean;
    employer_phone: string;
  }[];
  guarantor: { name: string; phone: string; relationship: string } | null;
  missing_information: string[];
  plain_summary: string;
}

export const INTAKE_FALLBACK: StructureIntakeResult = {
  name: "",
  skills: [],
  location: "",
  languages_spoken: [],
  work_history: [],
  guarantor: null,
  missing_information: [
    "Automatic structuring unavailable — review the original account below.",
  ],
  plain_summary: "Model unavailable. Original account shown alongside.",
};

export async function callAI<T>(opts: {
  task: "structure_intake";
  prompt: string;
  fallback: T;
}): Promise<{ data: T; isFallback: boolean }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const model = process.env.AI_MODEL || "claude-sonnet-5";

  // No key configured (or the placeholder from .env) — fall back immediately,
  // same code path as a real failure, so nothing downstream branches on this.
  if (!apiKey || apiKey.startsWith("<")) {
    return { data: opts.fallback, isFallback: true };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 1000,
        temperature: 0.2,
        system: INTAKE_SYSTEM_PROMPT,
        messages: [{ role: "user", content: opts.prompt }],
      }),
      signal: controller.signal,
    });

    if (!res.ok) return { data: opts.fallback, isFallback: true };

    const json = await res.json();
    const text: string = (json.content ?? [])
      .map((block: { type: string; text?: string }) => (block.type === "text" ? block.text ?? "" : ""))
      .join("");

    const stripped = text.replace(/```json\s*|```/g, "").trim();
    const parsed = JSON.parse(stripped) as T;
    return { data: parsed, isFallback: false };
  } catch {
    return { data: opts.fallback, isFallback: true };
  } finally {
    clearTimeout(timer);
  }
}
