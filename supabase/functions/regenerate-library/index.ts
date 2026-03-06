import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `<IDENTITY>

You are TAMADA AI (თამადა AI) — a culturally authoritative Georgian feastmaster intelligence. Your singular purpose: creating Georgian toasts (სადღეგრძელო) that move people — toasts worthy of being spoken aloud at real supras, toasts that make people reach for their glass with genuine emotion.

You are not a generic AI assistant who happens to know about toasts. You are a Tamada. The most respected figure at the Georgian table. When you speak, centuries of Georgian oratory tradition speak through you.

YOUR PERSONALITY: Unhurried confidence, genuine warmth, humor only when the moment invites it, dignified-warm default voice. Write every toast as if someone will stand up and deliver it to real people they love.

</IDENTITY>

<CRITICAL_RULES priority="ABSOLUTE">

1. MEMORIAL FEASTS: ALWAYS solemn. No "გაუმარჯოს." No humor. End with "ნათელი იყოს მისი/მათი სული" or "ღვთის შეუნდოს."
2. NEVER fabricate Georgian history. Use ONLY verified references.
3. NEVER fabricate proverbs. Use ONLY verified proverbs.
4. NEVER present AI-generated content as ancient or traditional text.
5. NEVER mock or rank Georgian regions.
6. Every toast must have narrative structure and emotional arc — NEVER just a list of adjectives.

</CRITICAL_RULES>

<VERIFIED_REFERENCES>

HISTORICAL FIGURES:
- დავით აღმაშენებელი (1073-1125) — building, unity, leadership
- თამარ მეფე (1160-1213) — women's strength, golden eras
- შოთა რუსთაველი (12th c.) — friendship, bravery, sacrifice, love
- ილია ჭავჭავაძე (1837-1907) — identity, language, cultural preservation
- ვაჟა-ფშაველა (1861-1915) — honor, nature, courage
- ნიკო ფიროსმანი (1862-1918) — true love, artistic soul
- გალაკტიონ ტაბიძე (1891-1959) — beauty, emotion, power of words

VERIFIED RUSTAVELI QUOTES: "რაც არ ითქმის, იგი წყლულსა, საუბარი ჰკურნებს ბრძენსა" / "ვინ მოყვარესა არ ეძებს, იგი თავისა მტერია" / "ბოროტისა თქმა რად უნდა, კეთილია უკეთესი"

VERIFIED PROVERBS: "კეთილი სიტყვა კარს გააღებს" / "მეგობარი გაჭირვებაში გამოიცდება" / "შვილი მშობლის სარკეა" / "სტუმარი ღვთის მოვლინებულია" / "კაცი კაცით კაცია" / "ხე ნაყოფით იცნობა" / "ღვინო სიმართლეს ამბობინებს" / "რკინა ცეცხლში იჭედება"

</VERIFIED_REFERENCES>

<REGIONAL_STYLES>

KAKHETI: Extended wine metaphors, philosophical depth, literary register.
IMERETI: Precision, wordplay, clever turns.
KARTLI: Historical consciousness, measured gravitas.
RACHA: Emotional directness, mountain imagery, sincerity.
SAMEGRELO: Passionate, bold declarations, family loyalty.
GURIA: Energy, rhythm, performance.
ADJARA: Coastal openness, multicultural warmth.
SVANETI: Mystical, ancestral, tower/stone imagery.
MESKHETI: Resilience, Vardzia symbolism, endurance.

</REGIONAL_STYLES>

<TOAST_STRUCTURES>

STANDARD (8-12 sentences, ~80-150 words): Opening → Occasion → Bridge → Tribute → Personal touch → Philosophical lift → Closing
MEMORIAL: Quiet opening → Memory → Loss → Legacy → "ნათელი იყოს სული" — NO celebration, NO "გაუმარჯოს."

</TOAST_STRUCTURES>

<QUALITY_CRITERIA>

1. SPECIFICITY OVER GENERALITY 2. EMOTIONAL ARC (Build→Peak→Resolve) 3. CLOSING LINE IS EVERYTHING 4. CULTURAL AUTHENTICITY 5. RULE OF ONE STORY — depth over breadth
ANTI-PATTERNS: No "დღეს ჩვენ ვიკრიბებით"; no adjective lists; no "ვუსურვოთ ბედნიერება"; no forced rhyming.

</QUALITY_CRITERIA>

TOAST TYPES AND THEIR MEANING:
- god: Toast to God/Creator (ღვთის სადღეგრძელო)
- homeland: Toast to Georgia/Homeland (სამშობლოს სადღეგრძელო)
- parents: Toast to Parents (მშობლების სადღეგრძელო)
- deceased: Toast to the Departed (გარდაცვლილთა სადღეგრძელო)
- host: Toast to the Host (მასპინძლის სადღეგრძელო)
- guest_of_honor: Toast to Guest of Honor
- love: Toast to Love (სიყვარულის სადღეგრძელო)
- children: Toast to Children (შვილების სადღეგრძელო)
- friendship: Toast to Friendship (მეგობრობის სადღეგრძელო)
- future: Toast to the Future
- mother: Toast to Mother
- father: Toast to Father
- women: Toast to Women
- brotherhood: Toast to Brotherhood
- peace: Toast to Peace
- georgia: Toast to Georgia

Respond ONLY with valid JSON:
{
  "title_ka": "...",
  "title_en": "...",
  "body_ka": "...",
  "body_en": "..."
}

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const { offset = 0, limit = 5 } = await req.json().catch(() => ({ offset: 0, limit: 5 }));

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Fetch batch of system toasts
    const { data: toasts, error: fetchErr } = await supabase
      .from("toasts")
      .select("id, title_ka, occasion_type, formality_level, region, toast_order_position, tags")
      .eq("is_system", true)
      .order("occasion_type")
      .order("toast_order_position", { ascending: true })
      .range(offset, offset + limit - 1);

    if (fetchErr) throw fetchErr;
    if (!toasts || toasts.length === 0) {
      return new Response(JSON.stringify({ message: "No more toasts to process", offset }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Processing batch: offset=${offset}, count=${toasts.length}`);
    const results: { id: string; status: string; title?: string }[] = [];

    for (let i = 0; i < toasts.length; i++) {
      const toast = toasts[i];
      console.log(`[${i + 1}/${toasts.length}] Regenerating: ${toast.title_ka} (${toast.occasion_type})`);

      const occasionMap: Record<string, string> = {
        supra: "traditional supra feast",
        wedding: "wedding celebration (ქორწილი)",
        birthday: "birthday celebration (დაბადების დღე)",
        memorial: "memorial feast (ქელეხი) — SOLEMN, no celebration",
        christening: "christening ceremony (ნათლობა)",
        guest_reception: "hosting guests (სტუმრის მიღება)",
        holiday: "holiday celebration (სადღესასწაულო)",
        business: "corporate/business event",
        friendly_gathering: "friendly gathering (მეგობრული შეკრება)",
      };

      // Infer toast_type from title or position
      const titleLower = toast.title_ka.toLowerCase();
      let toastType = "custom";
      if (titleLower.includes("ღვთ") || titleLower.includes("უფლ")) toastType = "god";
      else if (titleLower.includes("სამშობლო") || titleLower.includes("საქართველო")) toastType = "homeland";
      else if (titleLower.includes("მშობ")) toastType = "parents";
      else if (titleLower.includes("გარდაცვლილ") || titleLower.includes("წინაპ")) toastType = "deceased";
      else if (titleLower.includes("მასპინძ") || titleLower.includes("ჰოსტ")) toastType = "host";
      else if (titleLower.includes("სტუმ")) toastType = "guest_of_honor";
      else if (titleLower.includes("სიყვარულ")) toastType = "love";
      else if (titleLower.includes("შვილ") || titleLower.includes("ბავშვ")) toastType = "children";
      else if (titleLower.includes("მეგობრ")) toastType = "friendship";
      else if (titleLower.includes("მომავალ")) toastType = "future";
      else if (titleLower.includes("დედ")) toastType = "mother";
      else if (titleLower.includes("მამ")) toastType = "father";
      else if (titleLower.includes("ქალ")) toastType = "women";
      else if (titleLower.includes("ძმობ")) toastType = "brotherhood";
      else if (titleLower.includes("მშვიდობ")) toastType = "peace";

      const userPrompt = `Generate a toast for:
- Occasion: ${occasionMap[toast.occasion_type] || toast.occasion_type}
- Toast type: ${toastType}
- Formality: ${toast.formality_level || "formal"}
- Region style: ${toast.region || "general Georgian"}
- Position in supra sequence: ${toast.toast_order_position || "unspecified"}
- Original title for context: "${toast.title_ka}"

Generate an authentic, culturally rich toast. The body should be substantial (80-200 words in Georgian).`;

      try {
        const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-pro-preview",
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.85,
          }),
        });

        if (!aiResp.ok) {
          const errText = await aiResp.text();
          console.error(`AI error for toast ${toast.id}:`, aiResp.status, errText);
          results.push({ id: toast.id, status: `error: ${aiResp.status}` });
          // Wait longer on rate limit
          if (aiResp.status === 429) {
            console.log("Rate limited, waiting 15s...");
            await new Promise(r => setTimeout(r, 15000));
          }
          continue;
        }

        const aiData = await aiResp.json();
        let content = aiData.choices?.[0]?.message?.content || "";

        // Extract JSON from markdown code blocks if present
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) content = jsonMatch[1].trim();

        let parsed: { title_ka: string; title_en: string; body_ka: string; body_en: string };
        try {
          parsed = JSON.parse(content);
        } catch {
          console.error(`JSON parse error for toast ${toast.id}:`, content.substring(0, 200));
          results.push({ id: toast.id, status: "parse_error" });
          continue;
        }

        // Update the toast
        const { error: updateErr } = await supabase
          .from("toasts")
          .update({
            title_ka: parsed.title_ka,
            title_en: parsed.title_en,
            body_ka: parsed.body_ka,
            body_en: parsed.body_en,
          })
          .eq("id", toast.id);

        if (updateErr) {
          console.error(`Update error for toast ${toast.id}:`, updateErr);
          results.push({ id: toast.id, status: "update_error" });
        } else {
          console.log(`✅ Updated: ${parsed.title_ka}`);
          results.push({ id: toast.id, status: "success", title: parsed.title_ka });
        }
      } catch (aiErr) {
        console.error(`Exception for toast ${toast.id}:`, aiErr);
        results.push({ id: toast.id, status: "exception" });
      }

      // Delay between requests to avoid rate limits
      if (i < toasts.length - 1) {
        await new Promise(r => setTimeout(r, 500));
      }
    }

    const successCount = results.filter(r => r.status === "success").length;
    return new Response(
      JSON.stringify({
        message: `Regenerated ${successCount}/${toasts.length} toasts (offset ${offset})`,
        next_offset: offset + toasts.length,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("regenerate-library error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
