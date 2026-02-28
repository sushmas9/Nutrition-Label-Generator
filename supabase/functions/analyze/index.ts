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
    const { ingredients, servings, image } = await req.json();

    const hasText = ingredients && typeof ingredients === "string" && ingredients.trim();
    const hasImage = image && typeof image === "string";

    if (!hasText && !hasImage) {
      return new Response(
        JSON.stringify({ error: "Ingredients text or recipe image is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const numServings = Number(servings) || 1;

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    // Build user message content (text + optional image)
    const userContent: any[] = [];

    if (hasImage) {
      userContent.push({
        type: "image_url",
        image_url: { url: image, detail: "high" },
      });
      userContent.push({
        type: "text",
        text: hasText
          ? `The user also provided these ingredients as text:\n${ingredients.trim()}\n\nUse both the image and the text. If they conflict, prefer the image.\nServings: ${numServings}`
          : `Analyze this recipe image. Identify all visible ingredients and their approximate quantities.\nServings: ${numServings}`,
      });
    } else {
      userContent.push({
        type: "text",
        text: `Recipe:\n${ingredients.trim()}\nServings: ${numServings}`,
      });
    }

    const jsonSchema = `Return ONLY valid JSON:
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
  "confidence_score": number (integer 0–100, NOT a decimal),
  "assumptions": ["string", ...]
}`;

    userContent.push({ type: "text", text: jsonSchema });

    console.log("Analyzing with image:", hasImage, "text:", hasText);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0,
        max_tokens: 1000,
        messages: [
          {
            role: "system",
            content: `You are a precise nutrition calculation engine.

Use standard USDA nutritional values for common foods.

Instructions:
- If an image is provided, carefully identify all ingredients and estimate quantities from the image.
- Calculate nutrition based strictly on quantities provided or estimated.
- If unit is clear (g, cup, tbsp, oz), compute proportionally.
- If unit is vague (bowl, spoon, piece), assume a standard US serving size, lower confidence_score, and add the assumption to the "assumptions" array.
- Do NOT inflate estimates.
- Do NOT guess exotic values.
- Keep numbers realistic and conservative.
- Include an "assumptions" array listing any assumptions made (e.g. "Assumed 1 bowl = 240g", "Estimated 200g chicken from image").`,
          },
          {
            role: "user",
            content: userContent,
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

    // Normalize confidence_score: if AI returned 0-1 scale, convert to 0-100
    if (result.confidence_score > 0 && result.confidence_score <= 1) {
      result.confidence_score = Math.round(result.confidence_score * 100);
    }

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
    const ingredientText = ingredients || "";
    const ingredientCount = ingredientText.trim().split(/\n|,/).filter((s: string) => s.trim()).length;
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
