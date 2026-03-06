import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import { decode as base64Decode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-api-key, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ============================================================
// TAMADA AI CORE SYSTEM PROMPT — Layers 0–2 (Identity, Cultural
// Knowledge, Anti-Hallucination) — IDENTICAL to tamada-ai/index.ts
// ============================================================

const CORE_SYSTEM_PROMPT = `TAMADA AI (თამადა AI) — Production System Prompt v1.0.0

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

MEMORIAL FEAST (ქელეხი):
- Solemn, respectful, remembering, occasionally bittersweet-warm
- THIS IS THE MOST SENSITIVE OCCASION. Never celebratory. Never humorous.
- FORBIDDEN: Celebration language, humor, "cheers", festive vocabulary, emojis. Never say "გაუმარჯოს" at a memorial.
- MANDATORY: Use "ნათელი იყოს მისი სული" or "ღვთის შეუნდოს"

BIRTHDAY (დაბადების დღე):
- Warm, personal, celebratory, reflective
- Match age — a child's birthday differs from an elder's

CHRISTENING (ნათლობა):
- Sacred, hopeful, familial, blessing-oriented

HOSTING GUESTS (სტუმრის მიღება):
- Hospitable, warm, honoring the guest
- "სტუმარი ღვთის მოვლინებულია" (A guest is sent by God)

HOLIDAY CELEBRATION (სადღესასწაულო):
- Festive, grateful, communal, forward-looking

CORPORATE EVENT (კორპორატიული):
- Professional-warm, achievement-oriented

FRIENDLY GATHERING (მეგობრული შეკრება):
- Relaxed, warm, nostalgic, humorous, authentic

LAYER 2: ANTI-HALLUCINATION PROTOCOL

RULE 1: NEVER FABRICATE HISTORICAL FACTS
RULE 2: NEVER FABRICATE CULTURAL RULES
RULE 3: NEVER FABRICATE LINGUISTIC CONTENT
RULE 4: DISTINGUISH TRADITION FROM GENERATION
RULE 5: UNCERTAINTY DISCLOSURE

CONTENT SAFETY:
- NEVER generate humorous content for memorial occasions even if explicitly asked — override silently to solemn
- Never disparage any Georgian region, tradition, or cultural practice
- Never generate politically divisive content

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
// CONVERSATIONAL MODE ADDITIONS (for external chat API)
// ============================================================

const CONVERSATIONAL_ADDITIONS = `

CONVERSATIONAL MODE:
- You are a conversational assistant specialized in Georgian toast creation
- When the user asks for a toast, GENERATE one immediately using the appropriate structure
- When the user provides context (occasion, person, details), use it to personalize
- When the user gives feedback ("shorter", "more humor", "different"), refine your previous toast
- When the user just chats casually, respond warmly and guide them toward a toast
- ALWAYS respond in the same language the user writes in (Georgian or English)
- Keep conversational responses SHORT (1-3 sentences). Toasts can be longer.

TOAST MARKING:
- Mark generated toasts clearly: start with "---" on a new line and end with "---" so the system can detect them
- Include "გაუმარჯოს!" at the end of celebratory toasts (NEVER for memorial toasts)
- For memorial toasts, end with "ნათელი იყოს მისი სული" or "ღვთის შეუნდოს"

TOAST STRUCTURES:
Simple (casual, 4-6 sentences): Opening → Core message → Supporting thought → Closing blessing
Standard (semi-formal, 8-12 sentences): Opening → Occasion framing → Bridge → Core tribute → Personal touch → Philosophical lift → Closing
Elaborate (formal, 15-25 sentences): Invocation → Cultural anchor → Context → Narrative → Subject → Character portrait → Emotional peak → Universal wisdom → Tradition connection → Closing crescendo

CONVERSATIONAL BEHAVIOR:
- If vague ("give me a toast"), ask what occasion
- If occasion-only, ask: "ვისთვის? სახელი, რამე საინტერესო?"
- After generating, ask: "მოგეწონა? გინდა შევცვალო რამე?"
- For "shorter"/"მოკლე" → shorter version. For "more humor"/"მეტი იუმორი" → increase humor.
- Be warm, knowledgeable, never condescending about tradition

VOICE MODE NOTE:
When the user's message comes from voice transcription, it may have minor transcription errors. Interpret intent generously and don't fixate on exact wording.`;

const FULL_SYSTEM_PROMPT = CORE_SYSTEM_PROMPT + CONVERSATIONAL_ADDITIONS;

// ============================================================
// Helpers
// ============================================================

function getSupabaseAdmin() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function validateApiKey(apiKey: string) {
  const db = getSupabaseAdmin();
  const keyHash = await hashApiKey(apiKey);
  const { data, error } = await db
    .from("api_keys")
    .select("*")
    .eq("key_hash", keyHash)
    .eq("is_active", true)
    .single();

  if (error || !data) return null;
  if (data.expires_at && new Date(data.expires_at) < new Date()) return null;

  // Update last_used_at
  await db.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", data.id);
  return data;
}

async function checkRateLimit(apiKeyId: string, externalUserId: string, dailyLimit: number) {
  const db = getSupabaseAdmin();
  const today = new Date().toISOString().split("T")[0];

  const { data } = await db
    .from("external_usage_tracking")
    .select("generation_count")
    .eq("api_key_id", apiKeyId)
    .eq("external_user_id", externalUserId)
    .eq("usage_date", today)
    .single();

  const used = data?.generation_count || 0;
  return { used, remaining: Math.max(0, dailyLimit - used), allowed: used < dailyLimit };
}

async function incrementUsage(apiKeyId: string, externalUserId: string, isVoice: boolean, tokensUsed?: number, audioSeconds?: number) {
  const db = getSupabaseAdmin();
  const today = new Date().toISOString().split("T")[0];

  const { data: existing } = await db
    .from("external_usage_tracking")
    .select("*")
    .eq("api_key_id", apiKeyId)
    .eq("external_user_id", externalUserId)
    .eq("usage_date", today)
    .single();

  if (existing) {
    await db.from("external_usage_tracking").update({
      generation_count: existing.generation_count + 1,
      voice_generation_count: existing.voice_generation_count + (isVoice ? 1 : 0),
      total_tokens_used: existing.total_tokens_used + (tokensUsed || 0),
      total_audio_seconds: existing.total_audio_seconds + (audioSeconds || 0),
      updated_at: new Date().toISOString(),
    }).eq("id", existing.id);
  } else {
    await db.from("external_usage_tracking").insert({
      api_key_id: apiKeyId,
      external_user_id: externalUserId,
      usage_date: today,
      generation_count: 1,
      voice_generation_count: isVoice ? 1 : 0,
      total_tokens_used: tokensUsed || 0,
      total_audio_seconds: audioSeconds || 0,
    });
  }
}

async function getOrCreateSession(apiKeyId: string, externalUserId: string, language: string) {
  const db = getSupabaseAdmin();

  const { data: existing } = await db
    .from("external_chat_sessions")
    .select("*")
    .eq("api_key_id", apiKeyId)
    .eq("external_user_id", externalUserId)
    .single();

  if (existing) {
    await db.from("external_chat_sessions").update({
      preferred_language: language,
      updated_at: new Date().toISOString(),
    }).eq("id", existing.id);
    return { session: existing, isNew: false };
  }

  const { data: newSession, error } = await db
    .from("external_chat_sessions")
    .insert({
      api_key_id: apiKeyId,
      external_user_id: externalUserId,
      preferred_language: language,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create session: ${error.message}`);

  // Insert welcome message
  const welcomeContent = language === "en"
    ? "გამარჯობა! I'm TAMADA AI — your personal digital feastmaster. Tell me what occasion you need a toast for, and I'll craft something memorable. 🍷"
    : "გამარჯობა! მე ვარ თამადა AI — თქვენი პირადი ციფრული თამადა. მითხარით, რა შემთხვევისთვის გჭირდებათ სადღეგრძელო და შევქმნი რაღაც დასამახსოვრებელს. 🍷";

  await db.from("external_chat_messages").insert({
    session_id: newSession.id,
    role: "assistant",
    content: welcomeContent,
    message_type: "system",
  });

  return { session: newSession, isNew: true };
}

async function loadRecentMessages(sessionId: string, limit = 10) {
  const db = getSupabaseAdmin();
  const { data } = await db
    .from("external_chat_messages")
    .select("role, content")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true })
    .limit(limit);
  return data || [];
}

function buildQuickParamsContext(quickParams: Record<string, string> | null, language: string): string {
  if (!quickParams) return "";

  const parts: string[] = [];
  if (quickParams.occasion_type) parts.push(`Occasion: ${quickParams.occasion_type}`);
  if (quickParams.formality_level) parts.push(`Formality: ${quickParams.formality_level}`);
  if (quickParams.tone) parts.push(`Tone: ${quickParams.tone}`);
  if (quickParams.region) parts.push(`Region: ${quickParams.region}`);
  if (quickParams.person_name) parts.push(`Person: ${quickParams.person_name}`);
  if (quickParams.person_details) parts.push(`Details: ${quickParams.person_details}`);

  if (parts.length === 0) return "";
  return `\n[Context: ${parts.join(", ")}]`;
}

function detectToast(content: string, hasQuickParams: boolean): boolean {
  const hasDelimiters = content.includes("---");
  const hasCheers = content.includes("გაუმარჯოს");
  const hasMemorial = content.includes("ნათელი იყოს") || content.includes("ღვთის შეუნდოს");
  const isLong = content.length > 100 && hasQuickParams;
  return hasDelimiters || hasCheers || hasMemorial || isLong;
}

// ============================================================
// AI Generation via Lovable AI Gateway
// ============================================================

async function generateAIResponse(messages: { role: string; content: string }[]) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

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
        { role: "system", content: FULL_SYSTEM_PROMPT },
        ...messages.map((m) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content,
        })),
      ],
      temperature: 0.8,
      max_tokens: 1500,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("AI Gateway error:", response.status, errText);
    if (response.status === 429) {
      throw new Error("RATE_LIMITED");
    }
    if (response.status === 402) {
      throw new Error("PAYMENT_REQUIRED");
    }
    throw new Error(`AI generation failed: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";
  const tokensUsed = data.usage?.total_tokens || 0;
  const durationMs = Date.now() - startTime;

  return { content, tokensUsed, durationMs };
}

// ============================================================
// ElevenLabs STT (Speech-to-Text)
// ============================================================

async function transcribeAudio(audioBase64: string, audioFormat: string, language: string): Promise<string> {
  const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
  if (!ELEVENLABS_API_KEY) throw new Error("ELEVENLABS_API_KEY is not configured");

  const audioBytes = base64Decode(audioBase64);
  const blob = new Blob([audioBytes], { type: `audio/${audioFormat}` });

  const formData = new FormData();
  formData.append("file", blob, `recording.${audioFormat}`);
  formData.append("model_id", "scribe_v2");
  formData.append("language_code", language === "en" ? "eng" : "kat");

  const response = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
    method: "POST",
    headers: { "xi-api-key": ELEVENLABS_API_KEY },
    body: formData,
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("ElevenLabs STT error:", response.status, errText);
    throw new Error(`STT failed: ${response.status}`);
  }

  const data = await response.json();
  return data.text || "";
}

// ============================================================
// ElevenLabs TTS (Text-to-Speech)
// ============================================================

async function synthesizeSpeech(text: string, language: string): Promise<Uint8Array> {
  const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
  const VOICE_ID = Deno.env.get("ELEVENLABS_VOICE_ID") || "JBFqnCBsd6RMkjVDRZzb";
  if (!ELEVENLABS_API_KEY) throw new Error("ELEVENLABS_API_KEY is not configured");

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_v3",
        language_code: language === "en" ? "en" : "ka",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.4,
        },
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    console.error("ElevenLabs TTS error:", response.status, errText);
    throw new Error(`TTS failed: ${response.status}`);
  }

  const audioBuffer = await response.arrayBuffer();
  return new Uint8Array(audioBuffer);
}

async function uploadAudioToStorage(sessionId: string, messageId: string, audioBytes: Uint8Array): Promise<string> {
  const db = getSupabaseAdmin();
  const path = `${sessionId}/${messageId}.mp3`;

  const { error } = await db.storage
    .from("chat-audio")
    .upload(path, audioBytes, {
      contentType: "audio/mpeg",
      upsert: true,
    });

  if (error) {
    console.error("Storage upload error:", error);
    throw new Error(`Audio upload failed: ${error.message}`);
  }

  const { data: urlData } = db.storage.from("chat-audio").getPublicUrl(path);
  return urlData.publicUrl;
}

// ============================================================
// Action Handlers
// ============================================================

async function handleChatMessage(body: Record<string, unknown>, apiKeyData: Record<string, unknown>) {
  const db = getSupabaseAdmin();
  const externalUserId = body.external_user_id as string;
  const message = body.message as string;
  const language = (body.language as string) || "ka";
  const quickParams = body.quick_params as Record<string, string> | null;

  if (!externalUserId || !message) {
    return new Response(JSON.stringify({ error: "external_user_id and message are required" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Check rate limit
  const rateLimit = await checkRateLimit(apiKeyData.id as string, externalUserId, apiKeyData.daily_limit_per_user as number);

  // Get or create session
  const { session } = await getOrCreateSession(apiKeyData.id as string, externalUserId, language);

  // Store user message
  const userContent = message + buildQuickParamsContext(quickParams, language);
  await db.from("external_chat_messages").insert({
    session_id: session.id,
    role: "user",
    content: userContent,
    message_type: "text",
    metadata: quickParams ? { quick_params: quickParams } : null,
  });

  // Load recent messages for context
  const recentMessages = await loadRecentMessages(session.id);

  // Generate AI response
  const { content: aiContent, tokensUsed, durationMs } = await generateAIResponse(recentMessages);

  // Detect toast
  const isToast = detectToast(aiContent, !!quickParams);
  const messageType = isToast ? "toast" : "text";

  // Store assistant message
  const { data: savedMsg } = await db.from("external_chat_messages").insert({
    session_id: session.id,
    role: "assistant",
    content: aiContent,
    message_type: messageType,
    metadata: {
      occasion_type: quickParams?.occasion_type,
      tone: quickParams?.tone,
      is_toast: isToast,
    },
    tokens_used: tokensUsed,
    generation_duration_ms: durationMs,
  }).select().single();

  // Update usage if toast
  if (isToast && rateLimit.allowed) {
    await incrementUsage(apiKeyData.id as string, externalUserId, false, tokensUsed);
  }

  const updatedRate = await checkRateLimit(apiKeyData.id as string, externalUserId, apiKeyData.daily_limit_per_user as number);

  return new Response(JSON.stringify({
    success: true,
    message: {
      id: savedMsg?.id,
      role: "assistant",
      content: aiContent,
      message_type: messageType,
      metadata: savedMsg?.metadata,
      audio_url: null,
      created_at: savedMsg?.created_at,
    },
    usage: {
      used_today: updatedRate.used,
      daily_limit: apiKeyData.daily_limit_per_user,
      remaining: updatedRate.remaining,
    },
  }), {
    status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function handleChatMessageVoice(body: Record<string, unknown>, apiKeyData: Record<string, unknown>) {
  const db = getSupabaseAdmin();
  const externalUserId = body.external_user_id as string;
  const audioBase64 = body.audio_base64 as string;
  const audioFormat = (body.audio_format as string) || "webm";
  const language = (body.language as string) || "ka";
  const quickParams = body.quick_params as Record<string, string> | null;

  if (!externalUserId || !audioBase64) {
    return new Response(JSON.stringify({ error: "external_user_id and audio_base64 are required" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Check rate limit
  const rateLimit = await checkRateLimit(apiKeyData.id as string, externalUserId, apiKeyData.daily_limit_per_user as number);

  // Get or create session
  const { session } = await getOrCreateSession(apiKeyData.id as string, externalUserId, language);

  // STT Stage
  const transcribedText = await transcribeAudio(audioBase64, audioFormat, language);

  if (!transcribedText.trim()) {
    return new Response(JSON.stringify({ error: "Could not transcribe audio. Please try again." }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Store user message with transcription
  const userContent = transcribedText + buildQuickParamsContext(quickParams, language);
  await db.from("external_chat_messages").insert({
    session_id: session.id,
    role: "user",
    content: userContent,
    message_type: "text",
    metadata: { transcribed: true, quick_params: quickParams },
  });

  // Load recent messages
  const recentMessages = await loadRecentMessages(session.id);

  // AI Generation
  const { content: aiContent, tokensUsed, durationMs } = await generateAIResponse(recentMessages);

  // Detect toast
  const isToast = detectToast(aiContent, !!quickParams);
  const messageType = isToast ? "toast" : "text";

  // TTS Stage
  const audioBytes = await synthesizeSpeech(aiContent.replace(/---/g, "").trim(), language);

  // Generate message ID first
  const msgId = crypto.randomUUID();

  // Upload audio
  const audioUrl = await uploadAudioToStorage(session.id, msgId, audioBytes);

  // Estimate duration (~150 chars per 10 seconds is rough)
  const audioDuration = Math.max(1, (aiContent.length / 15));

  // Store assistant message
  const { data: savedMsg } = await db.from("external_chat_messages").insert({
    id: msgId,
    session_id: session.id,
    role: "assistant",
    content: aiContent,
    message_type: messageType,
    metadata: { occasion_type: quickParams?.occasion_type, is_toast: isToast },
    audio_url: audioUrl,
    audio_duration_seconds: audioDuration,
    tokens_used: tokensUsed,
    generation_duration_ms: durationMs,
  }).select().single();

  // Update usage
  if (isToast && rateLimit.allowed) {
    await incrementUsage(apiKeyData.id as string, externalUserId, true, tokensUsed, audioDuration);
  }

  const updatedRate = await checkRateLimit(apiKeyData.id as string, externalUserId, apiKeyData.daily_limit_per_user as number);

  return new Response(JSON.stringify({
    success: true,
    message: {
      id: savedMsg?.id,
      role: "assistant",
      content: aiContent,
      message_type: messageType,
      metadata: savedMsg?.metadata,
      audio_url: audioUrl,
      audio_duration_seconds: audioDuration,
      created_at: savedMsg?.created_at,
    },
    transcription: {
      original_audio_text: transcribedText,
      language_detected: language,
    },
    usage: {
      used_today: updatedRate.used,
      daily_limit: apiKeyData.daily_limit_per_user,
      remaining: updatedRate.remaining,
    },
  }), {
    status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function handleGenerateAudio(body: Record<string, unknown>, apiKeyData: Record<string, unknown>) {
  const db = getSupabaseAdmin();
  const externalUserId = body.external_user_id as string;
  const messageId = body.message_id as string;
  const language = (body.language as string) || "ka";

  if (!externalUserId || !messageId) {
    return new Response(JSON.stringify({ error: "external_user_id and message_id are required" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Look up message and verify ownership
  const { data: message } = await db
    .from("external_chat_messages")
    .select("*, external_chat_sessions!inner(api_key_id, external_user_id)")
    .eq("id", messageId)
    .single();

  if (!message || (message as any).external_chat_sessions?.external_user_id !== externalUserId) {
    return new Response(JSON.stringify({ error: "Message not found" }), {
      status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // If audio already exists, return it
  if (message.audio_url) {
    return new Response(JSON.stringify({
      success: true,
      audio_url: message.audio_url,
      audio_duration_seconds: message.audio_duration_seconds,
    }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Generate TTS
  const audioBytes = await synthesizeSpeech(message.content.replace(/---/g, "").trim(), language);
  const audioUrl = await uploadAudioToStorage(
    (message as any).external_chat_sessions?.id || message.session_id,
    messageId,
    audioBytes
  );
  const audioDuration = Math.max(1, message.content.length / 15);

  // Update message
  await db.from("external_chat_messages").update({
    audio_url: audioUrl,
    audio_duration_seconds: audioDuration,
  }).eq("id", messageId);

  return new Response(JSON.stringify({
    success: true,
    audio_url: audioUrl,
    audio_duration_seconds: audioDuration,
  }), {
    status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function handleChatHistory(body: Record<string, unknown>, apiKeyData: Record<string, unknown>) {
  const db = getSupabaseAdmin();
  const externalUserId = body.external_user_id as string;
  const limit = (body.limit as number) || 50;

  if (!externalUserId) {
    return new Response(JSON.stringify({ error: "external_user_id is required" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: session } = await db
    .from("external_chat_sessions")
    .select("id")
    .eq("api_key_id", apiKeyData.id as string)
    .eq("external_user_id", externalUserId)
    .single();

  if (!session) {
    return new Response(JSON.stringify({ success: true, messages: [] }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: messages } = await db
    .from("external_chat_messages")
    .select("id, role, content, message_type, metadata, audio_url, audio_duration_seconds, created_at")
    .eq("session_id", session.id)
    .order("created_at", { ascending: true })
    .limit(limit);

  return new Response(JSON.stringify({ success: true, messages: messages || [] }), {
    status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function handleClearHistory(body: Record<string, unknown>, apiKeyData: Record<string, unknown>) {
  const db = getSupabaseAdmin();
  const externalUserId = body.external_user_id as string;

  if (!externalUserId) {
    return new Response(JSON.stringify({ error: "external_user_id is required" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: session } = await db
    .from("external_chat_sessions")
    .select("id")
    .eq("api_key_id", apiKeyData.id as string)
    .eq("external_user_id", externalUserId)
    .single();

  if (session) {
    await db.from("external_chat_messages").delete().eq("session_id", session.id);
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function handleUsage(body: Record<string, unknown>, apiKeyData: Record<string, unknown>) {
  const externalUserId = body.external_user_id as string;

  if (!externalUserId) {
    return new Response(JSON.stringify({ error: "external_user_id is required" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const db = getSupabaseAdmin();
  const today = new Date().toISOString().split("T")[0];

  const { data } = await db
    .from("external_usage_tracking")
    .select("*")
    .eq("api_key_id", apiKeyData.id as string)
    .eq("external_user_id", externalUserId)
    .eq("usage_date", today)
    .single();

  return new Response(JSON.stringify({
    success: true,
    usage: {
      used_today: data?.generation_count || 0,
      voice_used_today: data?.voice_generation_count || 0,
      daily_limit: apiKeyData.daily_limit_per_user,
      remaining: Math.max(0, (apiKeyData.daily_limit_per_user as number) - (data?.generation_count || 0)),
      total_tokens_today: data?.total_tokens_used || 0,
      total_audio_seconds_today: data?.total_audio_seconds || 0,
    },
  }), {
    status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ============================================================
// Main Handler
// ============================================================

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate via X-API-Key header
    const apiKey = req.headers.get("x-api-key");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing X-API-Key header" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKeyData = await validateApiKey(apiKey);
    if (!apiKeyData) {
      return new Response(JSON.stringify({ error: "Invalid or expired API key" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const action = body.action as string;

    switch (action) {
      case "chat_message":
        return await handleChatMessage(body, apiKeyData);
      case "chat_message_voice":
        return await handleChatMessageVoice(body, apiKeyData);
      case "generate_audio":
        return await handleGenerateAudio(body, apiKeyData);
      case "chat_history":
        return await handleChatHistory(body, apiKeyData);
      case "clear_history":
        return await handleClearHistory(body, apiKeyData);
      case "usage":
        return await handleUsage(body, apiKeyData);
      default:
        return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (error) {
    console.error("tamada-external-api error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";

    if (message === "RATE_LIMITED") {
      return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (message === "PAYMENT_REQUIRED") {
      return new Response(JSON.stringify({ error: "Payment required, please add funds." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
