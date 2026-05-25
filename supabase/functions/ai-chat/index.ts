import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// 1. Rate Limiting: In-memory rate limiter per worker instance
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 15; // Sensible default for chat endpoints

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  record.count++;
  return true;
}

const SYSTEM_PROMPT = `You are Tangible AI — an expert research assistant specializing in electrical engineering, electrical machines, power systems, and control systems.

Your core expertise includes:
- DC motors & generators (shunt, series, compound wound)
- Transformers (single-phase, three-phase, core/shell type)
- Induction motors (squirrel cage, wound rotor)
- Synchronous machines
- Power electronics and drives
- Control systems and feedback theory
- Circuit analysis and electromagnetic theory

Guidelines:
- Provide clear, technically accurate explanations
- Use proper engineering notation and units
- When discussing equations, format them clearly with variable definitions
- Reference relevant IEEE/IEC standards when appropriate
- If an image is shared, analyze it thoroughly — identify components, circuits, diagrams, or handwritten equations
- Be concise but thorough. Prioritize clarity over verbosity
- If unsure about something, say so rather than guessing`;

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // SECURITY: IP-based Rate Limiting
    // Graceful 429 response if the client exceeds the quota
    const clientIp = req.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(clientIp)) {
      return new Response(JSON.stringify({ error: "Too many requests. Please try again later." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // SECURITY: Secure API Key Handling
    // Keys are loaded from environment variables (Supabase secrets)
    // Client-side never sees the keys.
    const openaiKey = Deno.env.get("OPENAI_KEY");
    if (!openaiKey) {
      console.error("Missing OPENAI_KEY environment variable");
      return new Response(
        JSON.stringify({ error: "Internal Server Configuration Error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // SECURITY: Strict Input Validation & Sanitization
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages, model = "gpt-4o", ...unexpectedFields } = body;

    // Reject unexpected fields to prevent prompt injection or parameter tampering
    if (Object.keys(unexpectedFields).length > 0) {
      return new Response(
        JSON.stringify({ error: "Unexpected fields in request payload" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Schema-based validation for messages array
    if (!messages || !Array.isArray(messages) || messages.length === 0 || messages.length > 50) {
      return new Response(
        JSON.stringify({ error: "messages array is required and must contain between 1 and 50 items" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Strict validation for each message and length sanitization
    for (const msg of messages) {
      if (typeof msg !== 'object' || msg === null) {
        return new Response(JSON.stringify({ error: "Invalid message format" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      
      const allowedRoles = ['user', 'assistant', 'system'];
      if (!allowedRoles.includes(msg.role)) {
        return new Response(JSON.stringify({ error: "Invalid role. Must be user, assistant, or system." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      if (typeof msg.content === 'string') {
        if (msg.content.length > 20000) {
          return new Response(JSON.stringify({ error: "Message content exceeds maximum allowed length" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
      } else if (Array.isArray(msg.content)) {
        // Validate multimodal content array (vision API format)
        if (msg.content.length > 10) {
          return new Response(JSON.stringify({ error: "Too many content blocks in a single message" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        for (const block of msg.content) {
          if (block.type !== 'text' && block.type !== 'image_url') {
            return new Response(JSON.stringify({ error: "Invalid content block type" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
          }
        }
      } else {
        return new Response(JSON.stringify({ error: "Invalid content format. Must be string or array." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    // Allowed model check (White-listing specific models only)
    const allowedModels = ["gpt-4o", "gpt-4o-mini"];
    if (!allowedModels.includes(model)) {
      return new Response(
        JSON.stringify({ error: "Invalid model specified" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prepend system message securely
    const fullMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages,
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: fullMessages,
        stream: true,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`OpenAI API error: ${error}`);
      // SECURITY: Return a sanitized error message to the client, preventing internal leakage
      return new Response(
        JSON.stringify({ error: `Downstream AI provider error` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Stream the response back
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Unhandled Edge Function Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
