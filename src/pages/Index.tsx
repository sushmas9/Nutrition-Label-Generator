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
    // Simulated result after a brief delay
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
    <div className="flex min-h-screen items-start justify-center px-4 py-16 md:py-24">
      <div className="w-full max-w-lg space-y-10">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="font-mono text-2xl font-semibold tracking-tight">
            AI Nutrition Label Generator
          </h1>
          <p className="text-sm text-muted-foreground">
            Turn any recipe into instant macro breakdown
          </p>
        </div>

        {/* Form */}
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="ingredients" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Ingredients (include quantities)
            </Label>
            <Textarea
              id="ingredients"
              placeholder={"2 chicken breasts\n1 cup rice\n1 tbsp olive oil\n..."}
              className="min-h-[140px] resize-none font-mono text-sm"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="servings" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
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
            disabled={!ingredients.trim() || result === "loading"}
            className="w-full"
          >
            {result === "loading" ? "Generating…" : "Generate Nutrition Label"}
          </Button>
        </div>

        {/* Results */}
        <NutritionLabel result={result} servings={servings} />
      </div>
    </div>
  );
};

export default Index;
