import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ingredients, servings } = await req.json();

    if (!ingredients || typeof ingredients !== "string" || !ingredients.trim()) {
      return new Response(
        JSON.stringify({ error: "Ingredients are required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Ingredients received:", ingredients);
    const numServings = Number(servings) || 1;

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0,
        messages: [
          {
            role: "system",
            content: `You are a precise nutrition calculation engine.

Use standard USDA nutritional values for common foods.

Instructions:
- Calculate nutrition based strictly on quantities provided.
- If unit is clear (g, cup, tbsp, oz), compute proportionally.
- If unit is vague (bowl, spoon, piece), assume a standard US serving size and lower confidence_score.
- Do NOT inflate estimates.
- Do NOT guess exotic values.
- Keep numbers realistic and conservative.`,
          },
          {
            role: "user",
            content: `Return ONLY valid JSON:
{
  "total_calories": number,
  "total_protein_g": number,
  "total_carbs_g": number,
  "total_fat_g": number,
  "per_serving": {
    "calories": number,
    "protein_g": number,
    "carbs_g": number,
    "fat_g": number
  },
  "confidence_score": number
}

Recipe:
${ingredients.trim()}
Servings: ${numServings}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("OpenAI API error:", response.status, text);
      throw new Error("AI analysis failed");
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const result = JSON.parse(jsonStr);

    // Validate parsed values
    if (
      result.total_calories < 0 ||
      result.total_protein_g < 0 ||
      result.total_carbs_g < 0 ||
      result.total_fat_g < 0 ||
      result.confidence_score > 100
    ) {
      return new Response(
        JSON.stringify({ error: "Invalid nutrition values returned by AI" }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Flag suspiciously low calories for multi-ingredient recipes
    const ingredientCount = ingredients.trim().split(/\n|,/).filter((s: string) => s.trim()).length;
    if (result.total_calories < 20 && ingredientCount > 2) {
      result.confidence_score = Math.min(result.confidence_score, 20);
      console.warn("Suspiciously low calories for multi-ingredient recipe, lowering confidence");
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Analysis failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
