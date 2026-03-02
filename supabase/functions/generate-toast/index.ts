import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { occasion_type, formality_level, topic, language } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const formalityMap: Record<string, string> = {
      formal: "ფორმალური, პატივსაცემი",
      semi_formal: "ნახევრად ფორმალური",
      casual: "არაფორმალური, მეგობრული",
    };

    const occasionMap: Record<string, string> = {
      wedding: "ქორწილი",
      birthday: "დაბადების დღე",
      supra: "სუფრა",
      memorial: "პანაშვიდი",
      holiday: "დღესასწაული",
      business: "საქმიანი შეხვედრა",
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
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a Georgian tamada (toastmaster) expert. You create beautiful, authentic Georgian toasts. Always respond with valid JSON only." },
          { role: "user", content: prompt },
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`AI API error: ${response.status} ${errText}`);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || "";

    // Parse JSON from response (handle markdown code blocks)
    let parsed;
    try {
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                         content.match(/```\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      parsed = JSON.parse(jsonStr.trim());
    } catch {
      parsed = {
        title_ka: "სადღეგრძელო",
        body_ka: content,
        title_en: "Toast",
        body_en: content,
      };
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
