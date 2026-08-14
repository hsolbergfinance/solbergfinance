import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

type PracticeRequest = {
  subject?: string;
  topic?: string;
  difficulty?: string;
  format?: "mcq" | "open" | "mixed";
  count?: number;
};

const SUBJECT_SCOPE: Record<string, string> = {
  "Calculus 1": `MAST10005 scope: mathematical statements; sets; direct proof, contradiction and induction; quantified statements; functions; implied domain and range; injective/surjective/bijective functions and inverses; trigonometric functions; complex numbers; derivatives and differentiation techniques; function sketching; implicit differentiation; integrals; substitution; integration by parts; rational functions; introductory differential equations; separable differential equations; vectors, scalar products, projections, parametric curves and vector calculus.`,
  "Mathematical Economics": `ECON30020 scope: rigorous proofs; real numbers, sets and Euclidean space; open/closed/compact sets; functions and level sets; convex sets/functions, concavity and quasiconcavity; continuity, limits, Intermediate Value and Weierstrass theorems; differentiation in R and R^n, gradients and Hessians; unconstrained and constrained optimisation, Lagrange and Kuhn-Tucker methods; envelope theorem and theorem of the maximum; Roy's identity, Hotelling's lemma and Shephard's lemma; matrices and linear systems; implicit and inverse function theorems; Brouwer fixed point theorem and Nash equilibrium existence; dynamic optimisation, Bellman equations and search.`,
  "Time Series": `University time-series analysis and forecasting scope: creating and plotting time-series objects; changing frequency and aggregation; windowing; trend, seasonality and transformations; stationarity; autocorrelation and partial autocorrelation; AR and ARDL models; model selection including information criteria; VAR intuition; forecasting and forecast uncertainty. Keep questions at undergraduate econometrics/time-series level.`,
  "Algorithmic Trading": `FNCE30010 scope: market microstructure; game theory foundations; Python fundamentals for trading; trading robots and rule design; algorithmic-trading experiments; market-microstructure theory; backtesting; CAPM applications; portfolio reallocation; statistical arbitrage; project design; fundamental trading robots. Prefer reasoning about implementation, biases, backtests, market mechanics and simple Python where appropriate.`,
  "IB Technical": `Investment-banking interview scope: three financial statements and accounting links; enterprise value versus equity value; valuation methods; trading comps and precedent transactions; DCF, UFCF, terminal value and WACC; M&A process from sell-side and buy-side perspectives; accretion/dilution and purchase consideration; synergies; LBO mechanics and returns; debt and capital structure; Australian schemes of arrangement versus takeover bids; concise behavioural and commercial judgement questions.`,
  "GMAT": `Current GMAT preparation scope: Quantitative Reasoning, Verbal Reasoning and Data Insights. Questions should be original and GMAT-like rather than copied from official materials. Prioritise clear logical reasoning, time-efficient solution methods and one uniquely defensible answer.`
};

async function verifySupabaseUser(token: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !publishableKey) return false;

  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: publishableKey,
      Authorization: `Bearer ${token}`
    },
    cache: "no-store"
  });

  return response.ok;
}

export async function POST(request: NextRequest) {
  const authorization = request.headers.get("authorization") || "";
  const token = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : "";

  if (!token || !(await verifySupabaseUser(token))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "AI Practice is not configured yet. Add OPENAI_API_KEY to Vercel and redeploy."
      },
      { status: 503 }
    );
  }

  const body = (await request.json()) as PracticeRequest;
  const subject = body.subject && SUBJECT_SCOPE[body.subject]
    ? body.subject
    : "Calculus 1";
  const topic = (body.topic || "Mixed review").slice(0, 120);
  const difficulty = (body.difficulty || "Current course").slice(0, 60);
  const format = body.format || "mixed";
  const count = Math.min(Math.max(Number(body.count) || 5, 1), 8);
  const scope = SUBJECT_SCOPE[subject];

  const prompt = `You are generating a short mobile practice set for a University of Melbourne commerce student.\n\nSUBJECT: ${subject}\nTOPIC: ${topic}\nDIFFICULTY: ${difficulty}\nFORMAT: ${format}\nQUESTION COUNT: ${count}\nCOURSE / INTERVIEW SCOPE: ${scope}\n\nRules:\n- Stay inside the supplied scope unless the selected topic clearly narrows it further.\n- Generate original questions. Do not reproduce copyrighted test-bank or official GMAT questions.\n- Each question must be self-contained and useful on a phone while commuting.\n- Verify every mathematical, accounting, finance and programming answer before returning it.\n- MCQ questions must have exactly four plausible options and exactly one correct option. correctIndex is 0, 1, 2 or 3.\n- Open questions must have options = [] and correctIndex = -1. Provide a concise idealAnswer and 2-5 keyPoints the student should mention.\n- For IB Technical, favour concise interview-style prompts and practical commercial reasoning.\n- For Calculus and Mathematical Economics, include genuine problem solving rather than only definitions.\n- For Algorithmic Trading, mix market intuition, backtesting logic and small code-reading questions when appropriate.\n- For GMAT, make questions GMAT-like but original.\n- Hints must help without revealing the answer.\n- Explanations should teach the quickest reliable reasoning path.`;

  const schema = {
    type: "object",
    additionalProperties: false,
    properties: {
      title: { type: "string" },
      questions: {
        type: "array",
        minItems: count,
        maxItems: count,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            id: { type: "string" },
            type: { type: "string", enum: ["mcq", "open"] },
            question: { type: "string" },
            options: {
              type: "array",
              items: { type: "string" },
              maxItems: 4
            },
            correctIndex: { type: "integer", minimum: -1, maximum: 3 },
            idealAnswer: { type: "string" },
            explanation: { type: "string" },
            hint: { type: "string" },
            keyPoints: {
              type: "array",
              items: { type: "string" },
              minItems: 1,
              maxItems: 5
            }
          },
          required: [
            "id",
            "type",
            "question",
            "options",
            "correctIndex",
            "idealAnswer",
            "explanation",
            "hint",
            "keyPoints"
          ]
        }
      }
    },
    required: ["title", "questions"]
  };

  const openaiResponse = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: process.env.OPENAI_PRACTICE_MODEL || "gpt-5-mini",
      store: false,
      input: prompt,
      reasoning: { effort: "medium" },
      text: {
        verbosity: "low",
        format: {
          type: "json_schema",
          name: "practice_set",
          strict: true,
          schema
        }
      }
    })
  });

  if (!openaiResponse.ok) {
    const detail = await openaiResponse.text();
    console.error("OpenAI practice generation failed:", detail);
    return NextResponse.json(
      { error: "Could not generate a practice set. Try again in a moment." },
      { status: 502 }
    );
  }

  const responseJson = await openaiResponse.json();
  const outputText = (responseJson.output ?? [])
    .flatMap((item: any) => item.type === "message" ? item.content ?? [] : [])
    .filter((part: any) => part.type === "output_text")
    .map((part: any) => part.text ?? "")
    .join("");

  if (!outputText) {
    return NextResponse.json(
      { error: "The model returned no practice questions." },
      { status: 502 }
    );
  }

  try {
    return NextResponse.json(JSON.parse(outputText));
  } catch {
    return NextResponse.json(
      { error: "The generated practice set could not be parsed." },
      { status: 502 }
    );
  }
}
