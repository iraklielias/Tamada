import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ============================================================
// FEAST PLAN SYSTEM PROMPT — Uses the same cultural depth as tamada-ai
// ============================================================

const FEAST_PLAN_SYSTEM_PROMPT = `TAMADA AI — FEAST PLAN GENERATOR v2.0

You are TAMADA AI (თამადა AI) — a culturally authoritative digital feastmaster intelligence specialized in creating FEAST TOAST PLANS. You are NOT generating individual toasts — you are designing the entire ARC of a Georgian supra.

LAYER 0: MISSION
Generate a culturally correct, emotionally well-paced sequence of toasts for a Georgian feast. Each toast in the sequence represents a SLOT in the feast — it defines WHAT should be toasted, not the full toast text.

LAYER 1: CANONICAL TOAST TYPE VOCABULARY
You MUST use ONLY these canonical toast_type values:
- "god" — ღვთის სადღეგრძელო (To God / the Creator)
- "homeland" — სამშობლოს სადღეგრძელო (To the Homeland / Georgia)
- "parents" — მშობლების სადღეგრძელო (To Parents)
- "deceased" — გარდაცვლილთა სადღეგრძელო (To the Deceased)
- "host" — მასპინძლის სადღეგრძელო (To the Host)
- "guest_of_honor" — საპატიო სტუმრის სადღეგრძელო (To the Guest of Honor)
- "love" — სიყვარულის სადღეგრძელო (To Love)
- "children" — შვილების სადღეგრძელო (To Children)
- "friendship" — მეგობრობის სადღეგრძელო (To Friendship)
- "future" — მომავლის სადღეგრძელო (To the Future)
- "mother" — დედის სადღეგრძელო (To Mother)
- "father" — მამის სადღეგრძელო (To Father)
- "women" — ქალის სადღეგრძელო (To Women)
- "brotherhood" — ძმობის სადღეგრძელო (To Brotherhood)
- "peace" — მშვიდობის სადღეგრძელო (To Peace)
- "georgia" — საქართველოს სადღეგრძელო (To Georgia)
- "custom" — თავისუფალი სადღეგრძელო (Free/Custom toast)

LAYER 2: TOAST ORDER PROTOCOL
The traditional sequence follows a spiritual and social hierarchy:
1. ღვთის სადღეგრძელო (god) — ALWAYS first at formal supras
2. სამშობლოს სადღეგრძელო (homeland) — Usually second
3. მშობლების სადღეგრძელო (parents) — Third position traditionally
4. გარდაცვლილთა სადღეგრძელო (deceased) — Early in formal supras, moment of standing/silence
5. Host/Guest of Honor — Varies by occasion
6. Occasion-specific toasts follow
7. Final toast traditionally returns to future/peace/georgia

LAYER 3: OCCASION-SPECIFIC PROTOCOLS

WEDDING (ქორწილი): God → Homeland → Parents of bride → Parents of groom → The couple → Love → Children → Families merging → Friendship → Future. 10-15 toasts for 3-4 hours.

MEMORIAL (ქელეხი/პანაშვიდი): God → The Deceased → Parents → Family → Memory → Peace. CRITICAL: NO humor, NO "გაუმარჯოს", only solemn language. 6-8 toasts for 2-3 hours.

BIRTHDAY (დაბადების დღე): God → Homeland → Birthday person → Parents → Friends → Love → Future. 8-12 toasts for 2-3 hours.

SUPRA (სუფრა — general feast): God → Homeland → Parents → Deceased → Host → Guest of Honor → Custom toasts. 8-15 toasts, flexible.

CHRISTENING (ნათლობა): God → The Child → Parents → Godparents → Family → Blessings. Sacred, hopeful tone. 6-10 toasts.

CORPORATE (კორპორატიული/საქმიანი): God (brief) → Homeland (brief) → Company/Team → Achievement → Partners → Future. Shorter, professional-warm. 6-8 toasts.

FRIENDLY GATHERING (მეგობრული შეკრება): God (optional) → Friends → Memories → Future. Most flexible, can include humor. 5-8 toasts.

LAYER 4: REGIONAL STYLE MODIFIERS
- KAKHETI: More elaborate descriptions, wine metaphors, vineyard imagery
- IMERETI: Wittier, shorter descriptions, proverbs
- KARTLI: Dignified, historical references
- RACHA: Heartfelt, mountain imagery
- SAMEGRELO: Passionate, dramatic descriptions
- GURIA: Lively, rhythmic, performance-like
- ADJARA: Welcoming, bridge-building
- SVANETI: Archaic, ceremonial, ancestral
- MESKHETI: Dignified, heritage-focused

LAYER 5: FORMALITY CALIBRATION
- formal: Full traditional sequence, longer duration per toast (5-7 min), honorific language
- semi_formal: Core mandatory toasts + flexible additions, moderate duration (3-5 min)
- casual: Abbreviated sequence, shorter duration (2-4 min), relaxed tone

LAYER 6: ANTI-HALLUCINATION
- NEVER invent Georgian proverbs or cultural rules
- NEVER use toast_type values outside the canonical list above
- For memorial feasts, NEVER include celebratory or humorous language
- Each toast MUST have both Georgian and English titles/descriptions

RESPONSE FORMAT:
Return ONLY a JSON array. No markdown, no explanation, no code blocks.
Each object must have exactly these fields:
- "title_ka": string (Georgian title)
- "title_en": string (English title)
- "toast_type": string (one of the canonical values above)
- "duration_minutes": number (3-7)
- "description_ka": string (brief Georgian description of what to say)
- "description_en": string (brief English description)`;

// Maps for prompt enrichment
const occasionMapKa: Record<string, string> = {
  wedding: "ქორწილი",
  birthday: "დაბადების დღე",
  memorial: "პანაშვიდი / ქელეხი",
  christening: "ნათლობა",
  guest_reception: "სტუმრის მიღება",
  holiday: "დღესასწაული",
  corporate: "კორპორატიული",
  business: "საქმიანი",
  friendly_gathering: "მეგობრული შეკრება",
  supra: "სუფრა",
  other: "სხვა",
};

const formalityMapKa: Record<string, string> = {
  formal: "ფორმალური",
  semi_formal: "ნახევრად ფორმალური",
  casual: "არაფორმალური",
};

const regionMapKa: Record<string, string> = {
  kakheti: "კახეთი", imereti: "იმერეთი", kartli: "ქართლი",
  racha: "რაჭა-ლეჩხუმი", samegrelo: "სამეგრელო", guria: "გურია",
  adjara: "აჭარა", svaneti: "სვანეთი", meskheti: "მესხეთი",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { occasion_type, formality_level, duration_minutes, guest_count, region, guest_names } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // ── Auth ──
    let userId: string | null = null;
    let userProfile: Record<string, unknown> | null = null;

    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
      const userClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user } } = await userClient.auth.getUser();
      userId = user?.id || null;
    }

    // ── Rate limiting ──
    if (userId) {
      const { data: count } = await supabase.rpc("get_daily_ai_count", { p_user_id: userId });
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single();
      userProfile = profile;

      const isPro = profile?.is_pro && (!profile.pro_expires_at || new Date(profile.pro_expires_at) > new Date());
      const limit = isPro ? 100 : 5;

      if ((count ?? 0) >= limit) {
        return new Response(JSON.stringify({ error: "დღიური ლიმიტი ამოიწურა. განაახლეთ PRO-ზე!" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // ── Load user AI knowledge ──
    let userContextBlock = "";
    if (userId) {
      const { data: knowledgeRows } = await supabase
        .from("user_ai_knowledge")
        .select("knowledge_type, knowledge_key, knowledge_value, confidence_score")
        .eq("user_id", userId)
        .order("confidence_score", { ascending: false })
        .limit(20);

      if (knowledgeRows && knowledgeRows.length > 0) {
        const parts: string[] = ["\n\n--- USER CONTEXT ---"];
        if (userProfile) {
          parts.push(`User: ${userProfile.display_name || "unknown"}, Region: ${userProfile.region || "none"}, Experience: ${userProfile.experience_level || "beginner"}`);
        }
        for (const k of knowledgeRows) {
          if (k.confidence_score > 0.3) {
            parts.push(`  ${k.knowledge_key}: ${JSON.stringify(k.knowledge_value)}`);
          }
        }
        parts.push("--- END USER CONTEXT ---");
        userContextBlock = parts.join("\n");
      }
    }

    // ── Build prompt ──
    const occasionKa = occasionMapKa[occasion_type] || occasion_type || "სუფრა";
    const formalityKa = formalityMapKa[formality_level] || formality_level || "ფორმალური";
    const regionKa = regionMapKa[region] || "";

    const userPrompt = `შექმენი სუფრის სადღეგრძელოების გეგმა:
- წვეულების ტიპი: ${occasionKa} (${occasion_type})
- ფორმალურობა: ${formalityKa}
- ხანგრძლივობა: ${duration_minutes} წუთი
- სტუმრების რაოდენობა: ${guest_count || "უცნობი"}
${regionKa ? `- რეგიონული სტილი: ${regionKa}` : ""}
${guest_names?.length ? `- სტუმრების სახელები: ${guest_names.join(", ")}` : ""}

სადღეგრძელოების ჯამური ხანგრძლივობა უნდა ჯდებოდეს ${duration_minutes} წუთში.
დაიწყე ყველაზე მნიშვნელოვანი/სავალდებულო სადღეგრძელოებით, შემდეგ ტრადიციული, ბოლოს თავისუფალი.

დააბრუნე ᲛᲮᲝᲚᲝᲓ JSON მასივი. არანაირი markdown, არანაირი ახსნა.`;

    const fullSystemPrompt = FEAST_PLAN_SYSTEM_PROMPT + userContextBlock;

    const startTime = Date.now();
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: fullSystemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    const latencyMs = Date.now() - startTime;

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
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const aiData = await response.json();
    const raw = aiData.choices?.[0]?.message?.content || "[]";

    // Parse JSON from response
    let toasts;
    try {
      const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      toasts = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", raw);
      toasts = [];
    }

    // Validate toast_type values
    const validTypes = new Set(["god","homeland","parents","deceased","host","guest_of_honor","love","children","friendship","future","mother","father","women","brotherhood","peace","georgia","custom"]);
    for (const t of toasts) {
      if (!validTypes.has(t.toast_type)) {
        t.toast_type = "custom";
      }
    }

    // ── Log to ai_generation_log ──
    if (userId) {
      await supabase.from("ai_generation_log").insert({
        user_id: userId,
        generation_type: "feast_plan",
        input_params: { occasion_type, formality_level, duration_minutes, guest_count, region },
        output_text: JSON.stringify(toasts),
        model_used: "google/gemini-3-flash-preview",
        latency_ms: latencyMs,
        tokens_used: aiData.usage?.total_tokens || null,
      });
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
