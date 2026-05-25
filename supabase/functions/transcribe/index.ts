import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// 1. Rate Limiting: In-memory rate limiter per worker instance
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 5; // Strict limit for audio uploads (more computationally expensive)

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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // SECURITY: IP-based Rate Limiting
    const clientIp = req.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(clientIp)) {
      return new Response(JSON.stringify({ error: "Too many requests. Please try again later." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // SECURITY: Secure API Key Handling
    const openaiKey = Deno.env.get("OPENAI_KEY");
    if (!openaiKey) {
      console.error("Missing OPENAI_KEY environment variable");
      return new Response(
        JSON.stringify({ error: "Internal Server Configuration Error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // SECURITY: Strict Input Validation & Sanitization
    let formData;
    try {
      formData = await req.formData();
    } catch (e) {
      return new Response(JSON.stringify({ error: "Invalid form data payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check for unexpected fields (Prompt/Parameter Injection Defense)
    const allowedKeys = ["audio"];
    for (const key of formData.keys()) {
      if (!allowedKeys.includes(key)) {
        return new Response(
          JSON.stringify({ error: `Unexpected field in request: ${key}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const audioFile = formData.get("audio") as File;

    if (!audioFile || typeof audioFile.size !== 'number') {
      return new Response(
        JSON.stringify({ error: "No valid audio file provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Size limit: 25MB (Whisper API limit)
    const MAX_FILE_SIZE = 25 * 1024 * 1024;
    if (audioFile.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ error: "Audio file exceeds maximum allowed size of 25MB" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check mime type and extension (Basic sanitization)
    const allowedMimeTypes = ['audio/webm', 'audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/x-m4a', 'audio/mp4'];
    if (!allowedMimeTypes.includes(audioFile.type)) {
       // Fallback checking extension
       const ext = audioFile.name.split('.').pop()?.toLowerCase();
       const allowedExtensions = ['webm', 'mp3', 'wav', 'ogg', 'm4a', 'mp4'];
       if (!ext || !allowedExtensions.includes(ext)) {
          return new Response(
            JSON.stringify({ error: "Unsupported audio format" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
       }
    }

    // Forward to OpenAI Whisper API securely
    const whisperForm = new FormData();
    whisperForm.append("file", audioFile, audioFile.name || "audio.webm");
    whisperForm.append("model", "whisper-1");
    whisperForm.append("language", "en");

    const response = await fetch(
      "https://api.openai.com/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiKey}`,
        },
        body: whisperForm,
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error(`Whisper API error: ${error}`);
      // Return a sanitized error message to prevent leaking internal OpenAI details
      return new Response(
        JSON.stringify({ error: `Downstream transcription service error` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await response.json();

    return new Response(JSON.stringify({ text: result.text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Unhandled Edge Function Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
