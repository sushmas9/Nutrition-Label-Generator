import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NutritionLabel } from "@/components/NutritionLabel";
import { Loader2 } from "lucide-react";

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

  const isLoading = result === "loading";

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
            Turn any recipe into an instant macro breakdown. Paste your
            ingredients below.
          </p>
        </div>

        <div className="mb-12 rounded-xl border border-border bg-card p-8 shadow-sm">
          <div className="space-y-6">
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
                onChange={(e) => setIngredients(e.target.value)}
              />
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
                disabled={!ingredients.trim() || isLoading}
                className="flex-1 h-10"
                size="default"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating…
                  </>
                ) : (
                  "Generate Label"
                )}
              </Button>
            </div>
          </div>
        </div>

        <NutritionLabel result={result} servings={servings} />
      </main>
    </div>
  );
};

export default Index;
