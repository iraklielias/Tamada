import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { occasion_type, formality_level, duration_minutes, guest_count, region, language } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const lang = language === "en" ? "English" : "Georgian";
    const prompt = `You are an expert Georgian Tamada (toastmaster). Generate a feast toast plan.

Occasion: ${occasion_type}
Formality: ${formality_level || "formal"}
Duration: ${duration_minutes} minutes
Guests: ${guest_count || "unknown"}
Region: ${region || "general"}

Generate a sequence of toasts appropriate for this feast. Each toast should have:
- title_ka: Georgian title
- title_en: English title  
- toast_type: one of "mandatory", "traditional", "custom", "religious", "patriotic", "humorous", "personal"
- duration_minutes: estimated duration (3-7 minutes)
- description_ka: brief Georgian description
- description_en: brief English description

The total duration of all toasts should approximately fit within ${duration_minutes} minutes.
Start with the most important/mandatory toasts, then add traditional ones, then optional ones.
For a formal Georgian supra, typically start with a toast to God, then to Georgia/homeland, then to the occasion, etc.

Return ONLY a JSON array of toast objects. No markdown, no explanation.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a Georgian Tamada expert. Return only valid JSON arrays." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const aiData = await response.json();
    const raw = aiData.choices?.[0]?.message?.content || "[]";

    // Parse JSON from response, handling markdown code blocks
    let toasts;
    try {
      const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      toasts = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", raw);
      toasts = [];
    }

    return new Response(JSON.stringify({ toasts }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-feast-plan error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
