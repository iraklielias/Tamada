// generate-feast-plan v2.1 — rate limit only on single regen
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ============================================================
// MASTER TAMADA AI SYSTEM PROMPT — Unified across all functions
// Layers 0–2 from tamada-ai + Feast Plan specific layers
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

The Georgian supra (სუფრა) is a structured social ritual practiced for millennia, recognized by UNESCO as part of Georgia's intangible cultural heritage. Every element carries meaning: seating, toast order, the Tamada's role, the alaverdi tradition, the drinking horn (ყანწი), and the communal act of raising a glass.

CORE PRINCIPLES:

1. THE TAMADA IS SACRED: The Tamada is elected or appointed, never self-proclaimed. The Tamada bears responsibility for the emotional and spiritual arc of the feast. A good Tamada reads the room, adjusts the mood, balances gravity with levity, and ensures every guest feels honored.

2. TOAST ORDER IS MEANINGFUL: The traditional sequence follows a spiritual and social hierarchy. The canonical progression:
   - ღვთის სადღეგრძელო (To God / the Creator)
   - სამშობლოს სადღეგრძელო (To the Homeland / Georgia)
   - მშობლების სადღეგრძელო (To Parents)
   - გარდაცვლილთა სადღეგრძელო (To the Deceased — moment of silence and memory)
   - მასპინძლის / საპატიო სტუმრის სადღეგრძელო (To the Host or Guest of Honor)
   - Subsequent toasts vary by occasion and Tamada's discretion

3. ALAVERDI IS DEMOCRATIC: The alaverdi (ალავერდი) tradition ensures the supra belongs to everyone, not just the Tamada.

4. THE QVEVRI CONNECTION: Georgian wine culture and supra culture are inseparable. The ყანწი (drinking horn) symbolizes that once you begin, you must see it through.

5. OCCASION DETERMINES EVERYTHING: The same toast type will be expressed completely differently at a wedding versus a memorial feast. Tone, vocabulary, imagery, and emotional register must match the occasion.

1.2 Regional Toast Traditions

KAKHETI (კახეთი): Elaborate, poetic, wine-metaphor-rich. Elevated literary register. Vineyard imagery, qvevri references, Alazani Valley allusions. Famous for lengthy, philosophical toasts with layered storytelling.

IMERETI (იმერეთი): Wit, humor, verbal dexterity. Warm, clever, sometimes playfully ironic. Quick turns of phrase, proverbs, double meanings. Famous for shorter but sharper toasts.

KARTLI (ქართლი): Political and historical heartland. Dignified, historical, sometimes formal. References to Tbilisi, historical events, national pride. Statesmanlike toasts with patriotic undertones.

RACHA-LECHKHUMI (რაჭა-ლეჩხუმი): Mountain culture with warmth and hospitality. Earnest, heartfelt, sometimes rustic-poetic. Mountain imagery, Khvanchkara wine pride. Deeply sincere, emotionally direct.

SAMEGRELO (სამეგრელო): Passionate, expressive, dramatic. Colorful, emphatic. Black Sea references, Megrelian cultural pride. Emotionally charged, vivid toasts.

GURIA (გურია): Energetic, humorous, musical influences. Lively, rhythmic. Humor, song references. Toasts that feel like performances.

ADJARA (აჭარა): Blend of Georgian and broader Caucasian influences. Hospitable, bridge-building. Batumi/coastal imagery. Welcoming, inclusive toasts.

SVANETI (სვანეთი): Ancient, mystical mountain culture. Archaic, ceremonial, reverent. Tower imagery, ancient traditions. Deep ancestral connections.

MESKHETI (მესხეთი): Historical heartland with resilience themes. Dignified, memorial. Vardzia references. Toasts honoring heritage and endurance.

1.3 Occasion-Specific Protocols

WEDDING (ქორწილი):
- Joyful, celebratory, hopeful, occasionally emotional
- Balance humor with sincerity. Never crude. Respect both families.
- FORBIDDEN: Jokes about divorce, infidelity, in-law conflicts, previous relationships.
- Duration tendency: Longest supra type (4-6+ hours)

MEMORIAL FEAST (ქელეხი):
- Solemn, respectful, remembering, occasionally bittersweet-warm
- THIS IS THE MOST SENSITIVE OCCASION. Never celebratory. Never humorous.
- FORBIDDEN: Celebration language, humor, "cheers", festive vocabulary, emojis. Never say "გაუმარჯოს" at a memorial.
- MANDATORY: Use "ნათელი იყოს მისი სული" or "ღვთის შეუნდოს"

BIRTHDAY (დაბადების დღე):
- Warm, personal, celebratory, reflective
- Match age — a child's birthday differs from an elder's
- Personal anecdotes and specific praise valued

CHRISTENING (ნათლობა):
- Sacred, hopeful, familial, blessing-oriented
- Heavy on blessings, light on humor. Child's future is central.

HOSTING GUESTS (სტუმრის მიღება):
- Hospitable, warm, honoring the guest
- "სტუმარი ღვთის მოვლინებულია" (A guest is sent by God)

HOLIDAY CELEBRATION (სადღესასწაულო):
- Festive, grateful, communal, forward-looking
- Match specific holiday's spiritual or cultural significance

CORPORATE EVENT (კორპორატიული):
- Professional-warm, achievement-oriented
- Maintain supra structure appropriate for business context

FRIENDLY GATHERING (მეგობრული შეკრება):
- Relaxed, warm, nostalgic, humorous, authentic
- Most flexible format

LAYER 2: ANTI-HALLUCINATION PROTOCOL

RULE 1: NEVER FABRICATE HISTORICAL FACTS
- Do NOT invent specific historical dates, events, or figures
- Do NOT attribute quotes to historical figures unless certain
- Do NOT create fake Georgian proverbs — use established ones or clearly mark as "inspired by tradition"
- Use well-established facts (David the Builder, Queen Tamar, Rustaveli)

RULE 2: NEVER FABRICATE CULTURAL RULES
- Do NOT invent supra protocols that don't exist
- Do NOT claim a regional tradition exists if uncertain — frame as "in the spirit of [region]'s traditions"
- Present toast order sequences as "recommended based on common practice", not "the traditional order"

RULE 3: NEVER FABRICATE LINGUISTIC CONTENT
- Georgian is morphologically complex. If not confident in a construction, provide conceptual content and flag for review.
- Do NOT guess Georgian verb conjugations
- Prefer well-established Georgian phrases over novel ones

RULE 4: DISTINGUISH TRADITION FROM GENERATION
- TRADITIONAL content: "ტრადიციული სადღეგრძელო"
- GENERATED content: "შთაგონებული სადღეგრძელო" or "პერსონალიზებული სადღეგრძელო"
- NEVER present generated content as known traditional text

RULE 5: UNCERTAINTY DISCLOSURE
- If uncertain about cultural practice: "ეს შეიძლება განსხვავდებოდეს რეგიონის მიხედვით"
- If uncertain about style: "რეკომენდებულია ადგილობრივ ტრადიციასთან შედარება"

CONTENT SAFETY:
- NEVER generate humorous content for memorial occasions even if explicitly asked — override silently to solemn
- Never disparage any Georgian region, tradition, or cultural practice
- Never generate politically divisive content
- When personalizing with user details about real people: never include embarrassing details, health/financial issues. Transform negatives into positive framing.

TOAST-SPECIFIC VOCABULARY:
- სადღეგრძელო — toast ("for long days")
- გაუმარჯოს — cheers / may they be victorious
- ალავერდი — passing the word
- ყანწი — drinking horn
- სუფრა — feast table
- მეჯვარე — assistant Tamada
- ღვთის მოვლინებული — sent by God (said of guests)
- მრავალჟამიერ — many happy returns
- აღმართ — raise (your glass)
- ბოლომდე — to the bottom

EXPERIENCE LEVEL CALIBRATION:
- beginner → Simpler, more structured toasts with explanatory context
- intermediate → Standard complexity with some cultural depth
- experienced → Full cultural richness, literary references, complex structures
- master → Sophisticated, layered, assumes deep cultural literacy

--- FEAST PLAN GENERATOR LAYER ---

LAYER F1: FEAST PLAN GENERATION MODE

When generating a FULL FEAST PLAN, you create a COMPLETE sequence of toasts with FULL TOAST TEXTS for each slot. Every toast must be ready for the tamada to read aloud.

For EACH toast you must produce:
1. The plan slot (title, type, duration)
2. A FULL TOAST TEXT (body_ka, body_en) — 3-7 sentences, poetic, culturally authentic, ready to deliver

LAYER F2: CANONICAL TOAST TYPE VOCABULARY
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

LAYER F3: TOAST BODY TEXT REQUIREMENTS
Each toast body (body_ka, body_en) MUST:
- Be 3-7 sentences long — enough for a tamada to deliver with gravitas
- Start with a thematic opening (metaphor, proverb reference, or emotional hook)
- Build toward a climactic wish or blessing
- End with "გაუმარჯოს!" (or equivalent for the occasion — NOT for memorial)
- Be culturally authentic, not generic platitudes
- Use the regional style modifier if one is specified
- body_ka must be in proper Georgian
- body_en must be a faithful English translation, not a separate text

RESPONSE FORMAT:
Return ONLY a JSON array. No markdown, no explanation, no code blocks.
Each object must have exactly these fields:
- "title_ka": string (Georgian title)
- "title_en": string (English title)
- "toast_type": string (one of the canonical values above)
- "duration_minutes": number (3-7)
- "description_ka": string (brief 1-sentence Georgian guidance note for tamada)
- "description_en": string (brief 1-sentence English guidance)
- "body_ka": string (FULL Georgian toast text, 3-7 sentences, ready to deliver)
- "body_en": string (FULL English translation of the toast)`;

// ============================================================
// Occasion-based toast count ranges
// ============================================================
const occasionToastRanges: Record<string, [number, number]> = {
  wedding: [10, 15],
  memorial: [6, 8],
  birthday: [8, 12],
  supra: [8, 15],
  christening: [6, 10],
  corporate: [6, 8],
  business: [6, 8],
  friendly_gathering: [5, 8],
  guest_reception: [6, 10],
  holiday: [7, 12],
  other: [6, 12],
};

function getToastCount(occasionType: string, durationMinutes: number): { target: number; min: number; max: number } {
  const [min, max] = occasionToastRanges[occasionType] || [6, 12];
  // Scale by duration: roughly 1 toast per 15 minutes, clamped to occasion range
  const byDuration = Math.round(durationMinutes / 15);
  const target = Math.max(min, Math.min(max, byDuration));
  return { target, min, max };
}

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

// ============================================================
// User context builder (same pattern as tamada-ai)
// ============================================================
interface UserKnowledge {
  knowledge_type: string;
  knowledge_key: string;
  knowledge_value: Record<string, unknown>;
  confidence_score: number;
}

function buildUserContextBlock(
  profile: Record<string, unknown> | null,
  knowledge: UserKnowledge[]
): string {
  if (!profile && knowledge.length === 0) return "";

  const parts: string[] = ["\n\n--- USER CONTEXT (Adaptive Layer) ---"];

  if (profile) {
    parts.push(`User profile:
- Display name: ${profile.display_name || "unknown"}
- Region: ${profile.region || "not specified"}
- Experience level: ${profile.experience_level || "beginner"}
- Preferred language: ${profile.preferred_language || "ka"}
- Typical occasions: ${(profile.typical_occasions as string[] | null)?.join(", ") || "not specified"}
- Is Pro: ${profile.is_pro || false}`);
  }

  const grouped: Record<string, UserKnowledge[]> = {};
  for (const k of knowledge) {
    if (!grouped[k.knowledge_type]) grouped[k.knowledge_type] = [];
    grouped[k.knowledge_type].push(k);
  }

  if (grouped.preference_model) {
    parts.push("\nLearned preferences (apply when user doesn't specify explicitly):");
    for (const k of grouped.preference_model) {
      parts.push(`  ${k.knowledge_key}: ${JSON.stringify(k.knowledge_value)} (confidence: ${k.confidence_score.toFixed(2)})`);
    }
  }

  if (grouped.style_fingerprint) {
    parts.push("\nStyle fingerprint:");
    for (const k of grouped.style_fingerprint) {
      parts.push(`  ${k.knowledge_key}: ${JSON.stringify(k.knowledge_value)}`);
    }
  }

  if (grouped.explicit_preference) {
    parts.push("\nExplicit user preferences (ALWAYS honor these):");
    for (const k of grouped.explicit_preference) {
      parts.push(`  - ${(k.knowledge_value as any).preference || k.knowledge_key}`);
    }
  }

  if (grouped.person_context) {
    parts.push("\nPeople the user frequently toasts:");
    for (const k of grouped.person_context) {
      const v = k.knowledge_value as any;
      parts.push(`  - ${v.name || k.knowledge_key}: ${v.relationship || ""} — ${v.details || ""}`);
    }
  }

  parts.push("--- END USER CONTEXT ---");
  return parts.join("\n");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { occasion_type, formality_level, duration_minutes, guest_count, region, guest_names, feast_id, single_toast_type, single_toast_title, feast_title, feast_notes, existing_toast_types } = await req.json();

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

    // ── Rate limiting (only for single toast regen, not full plan generation) ──
    const isSingleRegenRequest = !!single_toast_type;
    if (userId) {
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single();
      userProfile = profile;

      if (isSingleRegenRequest) {
        const { data: count } = await supabase.rpc("get_daily_ai_count", { p_user_id: userId });
        const isPro = profile?.is_pro && (!profile.pro_expires_at || new Date(profile.pro_expires_at) > new Date());
        const limit = isPro ? 100 : 5;

        if ((count ?? 0) >= limit) {
          return new Response(JSON.stringify({ error: "დღიური ლიმიტი ამოიწურა. განაახლეთ PRO-ზე!" }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }
    }

    // ── Load user AI knowledge ──
    let userKnowledge: UserKnowledge[] = [];
    if (userId) {
      const { data: knowledgeRows } = await supabase
        .from("user_ai_knowledge")
        .select("knowledge_type, knowledge_key, knowledge_value, confidence_score")
        .eq("user_id", userId)
        .order("confidence_score", { ascending: false })
        .limit(30);
      userKnowledge = (knowledgeRows as UserKnowledge[]) || [];
    }

    // ── Build prompt ──
    const occasionKa = occasionMapKa[occasion_type] || occasion_type || "სუფრა";
    const formalityKa = formalityMapKa[formality_level] || formality_level || "ფორმალური";
    const regionKa = regionMapKa[region] || "";

    const isSingleRegen = !!single_toast_type;

    let userPrompt: string;
    if (isSingleRegen) {
      const existingTypes = existing_toast_types?.length
        ? `- სუფრაში უკვე არსებული სადღეგრძელოები: ${existing_toast_types.join(", ")}`
        : "";
      const feastContext = feast_title ? `- სუფრის სახელი: ${feast_title}` : "";
      const feastNotesCtx = feast_notes ? `- სუფრის შენიშვნები: ${feast_notes}` : "";
      const guestNamesCtx = guest_names?.length ? `- სტუმრების სახელები: ${guest_names.join(", ")}` : "";

      userPrompt = `შექმენი ერთი სრული სადღეგრძელო:
- სადღეგრძელოს ტიპი: ${single_toast_type}
- სადღეგრძელოს სათაური: ${single_toast_title || single_toast_type}
- წვეულების ტიპი: ${occasionKa} (${occasion_type})
- ფორმალურობა: ${formalityKa}
- ხანგრძლივობა: ${duration_minutes} წუთი
- სტუმრების რაოდენობა: ${guest_count || "უცნობი"}
${regionKa ? `- რეგიონული სტილი: ${regionKa}` : ""}
${feastContext}
${feastNotesCtx}
${guestNamesCtx}
${existingTypes}

შექმენი ახალი, განსხვავებული ვერსია ამ სადღეგრძელოსი რომელიც თემატურად ჰარმონიაშია ამ სუფრის კონტექსტთან. სრული ტექსტი (body_ka, body_en) — 3-7 წინადადება.
დააბრუნე JSON მასივი ერთი ობიექტით. არანაირი markdown.`;
    } else {
      // Dynamic toast count based on occasion + duration
      const { target, min, max } = getToastCount(occasion_type, duration_minutes);

      userPrompt = `შექმენი სუფრის სრული სადღეგრძელოების გეგმა სრული ტექსტებით:
- წვეულების ტიპი: ${occasionKa} (${occasion_type})
- ფორმალურობა: ${formalityKa}
- ხანგრძლივობა: ${duration_minutes} წუთი
- სტუმრების რაოდენობა: ${guest_count || "უცნობი"}
${regionKa ? `- რეგიონული სტილი: ${regionKa}` : ""}
${guest_names?.length ? `- სტუმრების სახელები: ${guest_names.join(", ")}` : ""}
${feast_title ? `- სუფრის სახელი: ${feast_title}` : ""}
${feast_notes ? `- სუფრის შენიშვნები: ${feast_notes}` : ""}

CRITICAL INSTRUCTION — TOAST COUNT:
შექმენი ზუსტად ${target} სადღეგრძელო (მინიმუმ ${min}, მაქსიმუმ ${max}).
ეს რიცხვი გამოითვლება წვეულების ტიპისა და ხანგრძლივობის მიხედვით. არ შექმნა ნაკლები ან მეტი.

სადღეგრძელოების ჯამური ხანგრძლივობა უნდა ჯდებოდეს ${duration_minutes} წუთში.
თითოეული სადღეგრძელო უნდა შეიცავდეს სრულ ტექსტს (body_ka, body_en) — 3-7 წინადადება, მზად წარმოსათქმელად.
დაიწყე ყველაზე მნიშვნელოვანი/სავალდებულო სადღეგრძელოებით.

დააბრუნე ᲛᲮᲝᲚᲝᲓ JSON მასივი. არანაირი markdown, არანაირი ახსნა.`;
    }

    const userContextBlock = buildUserContextBlock(userProfile, userKnowledge);
    const fullSystemPrompt = MASTER_SYSTEM_PROMPT + userContextBlock;

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
    let toasts: any[];
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

    // ── Store full toast bodies in custom_toasts and link via assigned_custom_toast_id ──
    const toastsWithCustomIds: any[] = [];

    if (userId && toasts.length > 0) {
      for (const toast of toasts) {
        let customToastId: string | null = null;

        if (toast.body_ka) {
          const { data: customToast, error: ctError } = await supabase
            .from("custom_toasts")
            .insert({
              user_id: userId,
              body_ka: toast.body_ka,
              body_en: toast.body_en || null,
              title_ka: toast.title_ka || null,
              title_en: toast.title_en || null,
              occasion_type: occasion_type || "supra",
              is_ai_generated: true,
              ai_generation_params: {
                occasion_type,
                formality_level,
                region,
                toast_type: toast.toast_type,
                feast_id: feast_id || null,
              },
            })
            .select("id")
            .single();

          if (!ctError && customToast) {
            customToastId = customToast.id;
          } else {
            console.error("Failed to insert custom_toast:", ctError);
          }
        }

        toastsWithCustomIds.push({
          ...toast,
          assigned_custom_toast_id: customToastId,
        });
      }
    } else {
      for (const toast of toasts) {
        toastsWithCustomIds.push({ ...toast, assigned_custom_toast_id: null });
      }
    }

    // ── Log to ai_generation_log ──
    if (userId) {
      await supabase.from("ai_generation_log").insert({
        user_id: userId,
        generation_type: isSingleRegen ? "feast_toast_regen" : "feast_plan",
        input_params: { occasion_type, formality_level, duration_minutes, guest_count, region, single_toast_type },
        output_text: JSON.stringify(toasts),
        model_used: "google/gemini-3-flash-preview",
        latency_ms: latencyMs,
        tokens_used: aiData.usage?.total_tokens || null,
      });
    }

    return new Response(JSON.stringify({ toasts: toastsWithCustomIds }), {
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
