import { useState, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NutritionLabel } from "@/components/NutritionLabel";
import { Loader2, ImagePlus, X } from "lucide-react";

interface PerServing {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface NutritionResult {
  total_calories: number;
  total_protein_g: number;
  total_carbs_g: number;
  total_fat_g: number;
  per_serving: PerServing;
  confidence_score: number;
}

const Index = () => {
  const [ingredients, setIngredients] = useState("");
  const [servings, setServings] = useState(1);
  const [result, setResult] = useState<NutritionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be under 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      setImageBase64(base64);
      if (error) setError(null);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageBase64(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleGenerate = async () => {
    setError(null);

    if (!ingredients.trim() && !imageBase64) {
      setError("Please enter ingredients or upload a recipe image.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            ingredients: ingredients || undefined,
            servings,
            image: imageBase64 || undefined,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to analyze ingredients.");
      }

      const data: NutritionResult = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-3xl items-center px-6">
          <span className="font-mono text-sm font-semibold tracking-tight text-foreground">
            NutriLabel
          </span>
          <span className="ml-2.5 rounded-md bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
            AI
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <div className="mb-14 space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Nutrition Label Generator
          </h1>
          <p className="max-w-lg text-lg text-muted-foreground">
            Turn any recipe into an instant macro breakdown. Paste ingredients
            or upload a recipe image.
          </p>
        </div>

        <div className="mb-12 rounded-xl border border-border bg-card p-8 shadow-sm">
          <div className="space-y-6">
            {/* Image upload */}
            <div className="space-y-2.5">
              <Label className="text-sm font-semibold text-foreground">
                Recipe Image
              </Label>
              <p className="text-xs text-muted-foreground">
                Upload a photo of your recipe or dish
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />

              {imagePreview ? (
                <div className="relative w-full overflow-hidden rounded-lg border border-border">
                  <img
                    src={imagePreview}
                    alt="Recipe preview"
                    className="h-48 w-full object-cover"
                  />
                  <button
                    onClick={removeImage}
                    className="absolute right-2 top-2 rounded-full bg-background/80 p-1.5 text-foreground backdrop-blur-sm transition-colors hover:bg-background"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-32 w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <ImagePlus className="h-5 w-5" />
                  Click to upload image
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-medium text-muted-foreground">AND / OR</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {/* Text ingredients */}
            <div className="space-y-2.5">
              <Label htmlFor="ingredients" className="text-sm font-semibold text-foreground">
                Ingredients
              </Label>
              <p className="text-xs text-muted-foreground">
                Include quantities for each item
              </p>
              <Textarea
                id="ingredients"
                placeholder={"2 chicken breasts\n1 cup rice\n1 tbsp olive oil"}
                className="min-h-[150px] resize-none font-mono text-sm leading-relaxed"
                value={ingredients}
                onChange={(e) => {
                  setIngredients(e.target.value);
                  if (error) setError(null);
                }}
              />
              {error && (
                <p className="text-sm font-medium text-destructive">{error}</p>
              )}
            </div>

            <div className="flex items-end gap-5">
              <div className="space-y-2.5">
                <Label htmlFor="servings" className="text-sm font-semibold text-foreground">
                  Servings
                </Label>
                <Input
                  id="servings"
                  type="number"
                  min={1}
                  value={servings}
                  onChange={(e) => setServings(Number(e.target.value))}
                  className="w-24 font-mono text-sm"
                />
              </div>
              <Button
                onClick={handleGenerate}
                disabled={loading}
                className="flex-1 h-10"
                size="default"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing…
                  </>
                ) : (
                  "Generate Label"
                )}
              </Button>
            </div>
          </div>
        </div>

        <NutritionLabel result={result} loading={loading} servings={servings} />
      </main>
    </div>
  );
};

export default Index;
