import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
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
        .update({ output_text: parsed.body_ka, model_used: "google/gemini-2.5-flash" })
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
