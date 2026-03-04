import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ============================================================
// TAMADA AI CORE SYSTEM PROMPT — Layers 0–2 (Identity, Cultural
// Knowledge, Anti-Hallucination) embedded verbatim.
// ============================================================

const SYSTEM_PROMPT = `TAMADA AI (თამადა AI) — Production System Prompt v1.0.0

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
- master → Sophisticated, layered, assumes deep cultural literacy`;

// ============================================================
// Helper: Build the dynamic user context injection
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

  // Group knowledge by type
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

// ============================================================
// Occasion map for prompt enrichment
// ============================================================

const occasionMapKa: Record<string, string> = {
  wedding: "ქორწილი",
  birthday: "დაბადების დღე",
  memorial: "პანაშვიდი / ქელეხი",
  christening: "ნათლობა",
  guest_reception: "სტუმრის მიღება",
  holiday: "დღესასწაული",
  corporate: "კორპორატიული",
  friendly_gathering: "მეგობრული შეკრება",
  supra: "სუფრა",
  other: "სხვა",
};

const formalityMapKa: Record<string, string> = {
  formal: "ფორმალური, პატივსაცემი",
  semi_formal: "ნახევრად ფორმალური",
  casual: "არაფორმალური, მეგობრული",
};

const regionMapKa: Record<string, string> = {
  kakheti: "კახეთი",
  imereti: "იმერეთი",
  kartli: "ქართლი",
  racha: "რაჭა-ლეჩხუმი",
  samegrelo: "სამეგრელო",
  guria: "გურია",
  adjara: "აჭარა",
  svaneti: "სვანეთი",
  meskheti: "მესხეთი",
};

// ============================================================
// Main handler
// ============================================================

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      action = "generate_toast",
      generation_params,
      refinement_params,
      feast_context,
    } = body;

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
      const {
        data: { user },
      } = await userClient.auth.getUser();
      userId = user?.id || null;
    }

    // ── Rate limiting ──
    if (userId) {
      const { data: count } = await supabase.rpc("get_daily_ai_count", {
        p_user_id: userId,
      });

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      userProfile = profile;

      const isPro =
        profile?.is_pro &&
        (!profile.pro_expires_at ||
          new Date(profile.pro_expires_at) > new Date());
      const limit = isPro ? 100 : 5;

      if ((count ?? 0) >= limit) {
        return new Response(
          JSON.stringify({
            error: "დღიური ლიმიტი ამოიწურა. განაახლეთ PRO-ზე!",
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // ── Load user AI knowledge ──
    let userKnowledge: UserKnowledge[] = [];
    if (userId) {
      const { data: knowledgeRows } = await supabase
        .from("user_ai_knowledge")
        .select(
          "knowledge_type, knowledge_key, knowledge_value, confidence_score"
        )
        .eq("user_id", userId)
        .order("confidence_score", { ascending: false })
        .limit(50);
      userKnowledge = (knowledgeRows as UserKnowledge[]) || [];
    }

    // ── Build dynamic system prompt ──
    const userContextBlock = buildUserContextBlock(
      userProfile,
      userKnowledge
    );
    const fullSystemPrompt = SYSTEM_PROMPT + userContextBlock;

    // ── Build user message based on action ──
    let userMessage = "";

    if (action === "generate_toast") {
      const p = generation_params || {};
      const occasionKa = occasionMapKa[p.occasion_type] || p.occasion_type || "სუფრა";
      const formalityKa = formalityMapKa[p.formality_level] || p.formality_level || "ფორმალური";
      const regionKa = regionMapKa[p.region] || "";

      userMessage = `შექმენი ქართული სადღეგრძელო შემდეგი პარამეტრებით:
- წვეულების ტიპი: ${occasionKa}
- ფორმალურობა: ${formalityKa}
${regionKa ? `- რეგიონული სტილი: ${regionKa}` : ""}
${p.toast_type ? `- სადღეგრძელოს ტიპი: ${p.toast_type}` : ""}
${p.person_name ? `- ვისთვის: ${p.person_name}` : ""}
${p.person_details ? `- დეტალები: ${p.person_details}` : ""}
${p.tone ? `- ტონი: ${p.tone}` : ""}
${p.freeform_comment ? `- დამატებითი სურვილი: ${p.freeform_comment}` : ""}
${p.language === "en" ? "- ენა: მხოლოდ ინგლისურად" : p.language === "both" ? "- ენა: ქართულად და ინგლისურად" : "- ენა: ქართულად და ინგლისურად"}

პასუხი მომეცი მკაცრად JSON ფორმატში, არანაირი დამატებითი ტექსტი:
{
  "title_ka": "სადღეგრძელოს სათაური ქართულად",
  "body_ka": "სადღეგრძელოს სრული ტექსტი ქართულად (მინიმუმ 3 წინადადება)",
  "title_en": "Toast title in English",
  "body_en": "Full toast text in English (minimum 3 sentences)",
  "metadata": {
    "toast_type": "${p.toast_type || "custom"}",
    "region_style": "${p.region || "general"}",
    "tone": "${p.tone || "traditional"}",
    "complexity": "moderate",
    "generation_type": "personalized"
  },
  "delivery_guidance": {
    "recommended_pace": "slow|moderate|conversational (აირჩიე ერთი)",
    "emotional_peak_location": "beginning|middle|end (აირჩიე ერთი)",
    "pause_suggestions": ["რომელი წინადადების შემდეგ გააჩერე პაუზისთვის"],
    "glass_raise_moment": "რომელ მომენტში უნდა აიწიოს ბოკალი",
    "estimated_duration_minutes": 2
  }
}`;
    } else if (action === "regenerate" || action === "refine") {
      const r = refinement_params || {};
      userMessage = `მომხმარებელმა უკვე მიიღო სადღეგრძელო და სურს ცვლილება.
${r.feedback ? `მომხმარებლის კომენტარი: "${r.feedback}"` : ""}
${r.adjustment_type ? `მოთხოვნილი ცვლილება: ${r.adjustment_type}` : ""}

გთხოვ, შექმენი ახალი ვერსია იმავე JSON ფორმატში:
{
  "title_ka": "...", "body_ka": "...", "title_en": "...", "body_en": "...",
  "metadata": { "toast_type": "custom", "region_style": "general", "tone": "traditional", "complexity": "moderate", "generation_type": "personalized" }
}`;
    } else if (action === "feast_advisory") {
      const fc = feast_context || {};
      const occasionKaAdv = occasionMapKa[fc.occasion_type] || fc.occasion_type || "სუფრა";
      const completedToastsList = (fc.completed_toasts || []).map((t: any) => `${t.position}. ${t.title_ka} (${t.toast_type})`).join("\n");
      const guestListStr = (fc.guests || []).map((g: any) => `${g.name} — ალავერდი: ${g.alaverdi_count ?? 0}`).join(", ");
      
      userMessage = `ვმართავ სუფრას. მიმდინარე მდგომარეობა:
- წვეულების ტიპი: ${occasionKaAdv}
- მიმდინარე სადღეგრძელოს ინდექსი: ${fc.current_toast_index ?? 0}
- სულ სადღეგრძელოები: ${fc.total_toasts ?? 0}
- გასული დრო (წუთი): ${fc.elapsed_minutes ?? 0}
- სავარაუდო ხანგრძლივობა (წუთი): ${fc.total_duration_minutes ?? 0}
- სტუმრების რაოდენობა: ${fc.guest_count ?? "უცნობი"}
${fc.current_toast_title ? `- მიმდინარე სადღეგრძელო: ${fc.current_toast_title} (${fc.current_toast_type || ""})` : ""}
${completedToastsList ? `- უკვე შესრულებული:\n${completedToastsList}` : ""}
${guestListStr ? `- სტუმრები: ${guestListStr}` : ""}
${fc.skipped_count ? `- გამოტოვებული: ${fc.skipped_count}` : ""}

მომეცი 1-2 რჩევა JSON ფორმატში. რჩევა შეიძლება იყოს:
- pacing: ტემპის შესახებ
- alaverdi_suggestion: ვის მიეცეს ალავერდი
- transition: გარდამავალი ფრაზა
- toast_order: რჩევა რიგითობაზე
- mood_reading: განწყობის შეფასება

პასუხი მკაცრად JSON:
{
  "advisories": [
    {
      "type": "pacing|alaverdi_suggestion|transition|toast_order|mood_reading",
      "message_ka": "რჩევა ქართულად",
      "message_en": "Advisory in English",
      "priority": "low|medium|high"
    }
  ]
}`;
    } else {
      return new Response(
        JSON.stringify({ error: `Unknown action: ${action}` }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ── Call AI Gateway ──
    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: fullSystemPrompt },
            { role: "user", content: userMessage },
          ],
          temperature: 0.8,
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "AI rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI API error: ${response.status} ${errText}`);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || "";

    // ── Parse JSON from response ──
    let parsed;
    try {
      const jsonMatch =
        content.match(/```json\s*([\s\S]*?)\s*```/) ||
        content.match(/```\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      parsed = JSON.parse(jsonStr.trim());
    } catch {
      // Fallback: wrap raw text
      parsed = {
        title_ka: "სადღეგრძელო",
        body_ka: content,
        title_en: "Toast",
        body_en: content,
        metadata: {
          toast_type: "custom",
          generation_type: "personalized",
          complexity: "moderate",
        },
      };
    }

    // ── Log the generation ──
    if (userId) {
      await supabase.from("ai_generation_log").insert({
        user_id: userId,
        generation_type: action,
        input_params: generation_params || refinement_params || feast_context || {},
        output_text: parsed.body_ka || JSON.stringify(parsed),
        model_used: "google/gemini-2.5-flash",
      });
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("tamada-ai error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
