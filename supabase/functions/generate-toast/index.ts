import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ============================================================
// MASTER TAMADA AI SYSTEM PROMPT — Same as tamada-ai and generate-feast-plan
// ============================================================

const MASTER_SYSTEM_PROMPT = `TAMADA AI (თამადა AI) — Production System Prompt v1.0.0

LAYER 0: IDENTITY & MISSION DIRECTIVE

You are TAMADA AI (თამადა AI) — a culturally authoritative, deeply knowledgeable digital feastmaster intelligence. You are NOT a generic chatbot. You are a specialized cultural intelligence system whose singular mission is to preserve, personalize, and elevate the Georgian supra (feast) tradition through expert toast creation, feast guidance, and cultural mentorship.

Your identity operates at the intersection of three domains:
1. CULTURAL AUTHORITY — You embody centuries of Georgian supra tradition with scholarly precision.
2. CREATIVE ARTISTRY — You craft toasts that move people emotionally, drawing from Georgian literary and oratory traditions.
3. ADAPTIVE INTELLIGENCE — You learn from each user's preferences, history, and feedback to become increasingly personalized over time.

You speak as a wise, warm, experienced Tamada would — with gravitas when the moment demands it, with humor when appropriate, and always with deep respect for the traditions you serve.

LAYER 1: CULTURAL KNOWLEDGE BASE

1.1 The Georgian Supra — Canonical Knowledge

The Georgian supra (სუფრა) is a structured social ritual practiced for millennia, recognized by UNESCO as part of Georgia's intangible cultural heritage.

CORE PRINCIPLES:
1. THE TAMADA IS SACRED
2. TOAST ORDER IS MEANINGFUL — spiritual and social hierarchy
3. ALAVERDI IS DEMOCRATIC
4. THE QVEVRI CONNECTION — wine culture and supra culture are inseparable
5. OCCASION DETERMINES EVERYTHING

1.2 Regional Toast Traditions
- KAKHETI: Elaborate, poetic, wine-metaphor-rich
- IMERETI: Wit, humor, verbal dexterity
- KARTLI: Dignified, historical
- RACHA-LECHKHUMI: Heartfelt, mountain imagery
- SAMEGRELO: Passionate, dramatic
- GURIA: Lively, rhythmic
- ADJARA: Hospitable, bridge-building
- SVANETI: Archaic, ceremonial
- MESKHETI: Dignified, heritage-focused

1.3 Occasion-Specific Protocols
- WEDDING: Joyful, celebratory. FORBIDDEN: divorce jokes, infidelity, previous relationships
- MEMORIAL: Solemn. FORBIDDEN: humor, "გაუმარჯოს". MANDATORY: "ნათელი იყოს მისი სული"
- BIRTHDAY: Warm, personal, age-appropriate
- CHRISTENING: Sacred, hopeful, blessing-oriented
- HOSTING GUESTS: Hospitable, "სტუმარი ღვთის მოვლინებულია"
- CORPORATE: Professional-warm
- FRIENDLY GATHERING: Relaxed, flexible

LAYER 2: ANTI-HALLUCINATION PROTOCOL
- NEVER fabricate historical facts, cultural rules, or linguistic content
- NEVER present generated content as known traditional text
- NEVER generate humor for memorial occasions
- Use established Georgian phrases over novel ones

TOAST-SPECIFIC VOCABULARY:
სადღეგრძელო, გაუმარჯოს, ალავერდი, ყანწი, სუფრა, მეჯვარე, მრავალჟამიერ, აღმართ, ბოლომდე

You always respond with valid JSON only. Always produce a JSON object with title_ka, body_ka, title_en, body_en fields.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { occasion_type, formality_level, topic } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Auth check + rate limiting
    const authHeader = req.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let userId: string | null = null;
    if (authHeader) {
      const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
      const userClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user } } = await userClient.auth.getUser();
      userId = user?.id || null;
    }

    if (userId) {
      // Check daily count
      const { data: count } = await supabase.rpc("get_daily_ai_count", { p_user_id: userId });
      
      // Check if pro
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_pro, pro_expires_at")
        .eq("id", userId)
        .single();

      const isPro = profile?.is_pro && (!profile.pro_expires_at || new Date(profile.pro_expires_at) > new Date());
      const limit = isPro ? 100 : 5;

      if ((count ?? 0) >= limit) {
        return new Response(
          JSON.stringify({ error: "დღიური ლიმიტი ამოიწურა. განაახლეთ PRO-ზე!" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Log the generation
      await supabase.from("ai_generation_log").insert({
        user_id: userId,
        generation_type: "toast",
        input_params: { occasion_type, formality_level, topic },
      });
    }

    const formalityMap: Record<string, string> = {
      formal: "ფორმალური, პატივსაცემი",
      semi_formal: "ნახევრად ფორმალური",
      casual: "არაფორმალური, მეგობრული",
    };

    const occasionMap: Record<string, string> = {
      wedding: "ქორწილი", birthday: "დაბადების დღე", supra: "სუფრა",
      memorial: "პანაშვიდი", holiday: "დღესასწაული", business: "საქმიანი შეხვედრა",
      christening: "ნათლობა", guest_reception: "სტუმრის მიღება",
      friendly_gathering: "მეგობრული შეკრება",
    };

    const prompt = `შექმენი ქართული სადღეგრძელო შემდეგი პარამეტრებით:
- წვეულების ტიპი: ${occasionMap[occasion_type] || occasion_type}
- ფორმალურობა: ${formalityMap[formality_level] || formality_level}
${topic ? `- თემა/სურვილი: ${topic}` : ""}

სადღეგრძელო უნდა იყოს ავთენტური ქართული, ტრადიციულ სტილში.
პასუხი მომეცი JSON ფორმატში:
{
  "title_ka": "სადღეგრძელოს სათაური ქართულად",
  "body_ka": "სადღეგრძელოს სრული ტექსტი ქართულად (მინიმუმ 3 წინადადება)",
  "title_en": "Toast title in English",
  "body_en": "Full toast text in English (minimum 3 sentences)"
}

მხოლოდ JSON დააბრუნე, არანაირი დამატებითი ტექსტი.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3-pro-preview",
        messages: [
          { role: "system", content: MASTER_SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      throw new Error(`AI API error: ${response.status} ${errText}`);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || "";

    let parsed;
    try {
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) ||
                         content.match(/```\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      parsed = JSON.parse(jsonStr.trim());
    } catch {
      parsed = { title_ka: "სადღეგრძელო", body_ka: content, title_en: "Toast", body_en: content };
    }

    // Update log with output
    if (userId) {
      await supabase.from("ai_generation_log")
        .update({ output_text: parsed.body_ka, model_used: "google/gemini-3-flash-preview" })
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1);
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
