import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NutritionLabel } from "@/components/NutritionLabel";

const Index = () => {
  const [ingredients, setIngredients] = useState("");
  const [servings, setServings] = useState(1);
  const [result, setResult] = useState<null | "loading" | object>(null);

  const handleGenerate = () => {
    if (!ingredients.trim()) return;
    setResult("loading");
    setTimeout(() => {
      setResult({
        calories: 420,
        totalFat: 18,
        saturatedFat: 6,
        cholesterol: 85,
        sodium: 680,
        totalCarbs: 38,
        dietaryFiber: 4,
        totalSugars: 6,
        protein: 28,
      });
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-2xl items-center px-6">
          <span className="font-mono text-sm font-semibold tracking-tight">
            NutriLabel
          </span>
          <span className="ml-2 rounded-full bg-foreground px-2 py-0.5 text-[10px] font-medium text-background">
            AI
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-12 md:py-16">
        {/* Hero */}
        <div className="mb-10 space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Nutrition Label Generator
          </h1>
          <p className="max-w-md text-base text-muted-foreground">
            Turn any recipe into an instant macro breakdown. Paste your ingredients below.
          </p>
        </div>

        {/* Form card */}
        <div className="mb-8 rounded-lg border bg-card p-6 shadow-sm">
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="ingredients" className="text-sm font-medium">
                Ingredients
              </Label>
              <p className="text-xs text-muted-foreground">Include quantities for each item</p>
              <Textarea
                id="ingredients"
                placeholder={"2 chicken breasts\n1 cup rice\n1 tbsp olive oil"}
                className="min-h-[130px] resize-none font-mono text-sm leading-relaxed"
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
              />
            </div>

            <div className="flex items-end gap-4">
              <div className="space-y-2">
                <Label htmlFor="servings" className="text-sm font-medium">
                  Servings
                </Label>
                <Input
                  id="servings"
                  type="number"
                  min={1}
                  value={servings}
                  onChange={(e) => setServings(Number(e.target.value))}
                  className="w-20 font-mono text-sm"
                />
              </div>
              <Button
                onClick={handleGenerate}
                disabled={!ingredients.trim() || result === "loading"}
                className="flex-1"
                size="default"
              >
                {result === "loading" ? "Generating…" : "Generate Label"}
              </Button>
            </div>
          </div>
        </div>

        {/* Results */}
        <NutritionLabel result={result} servings={servings} />
      </main>
    </div>
  );
};

export default Index;
