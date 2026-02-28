import { Loader2 } from "lucide-react";
import type { NutritionResult } from "@/pages/Index";

interface Props {
  result: NutritionResult | null;
  loading: boolean;
  servings: number;
  ingredients?: string;
}

const Row = ({
  label,
  value,
  unit = "g",
  bold = false,
}: {
  label: string;
  value: number;
  unit?: string;
  bold?: boolean;
}) => (
  <div
    className={`flex items-center justify-between py-2 ${bold ? "font-semibold text-foreground" : "text-muted-foreground"}`}
  >
    <span>{label}</span>
    <span className="font-mono tabular-nums">
      {value}
      {unit}
    </span>
  </div>
);

const Divider = ({ thick = false }: { thick?: boolean }) => (
  <div className={thick ? "border-t-[3px] border-foreground" : "border-t border-border"} />
);

export const NutritionLabel = ({ result, loading, servings, ingredients }: Props) => {
  if (!result && !loading) {
    return (
      <div className="flex h-56 items-center justify-center rounded-xl border border-dashed border-border bg-card">
        <p className="text-sm text-muted-foreground">
          Your nutrition label will appear here
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-56 items-center justify-center rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Analyzing ingredients…
        </div>
      </div>
    );
  }

  const data = result!;
  const ps = data.per_serving;

  // Use AI-detected ingredients if available, otherwise fall back to user text
  const displayIngredients =
    data.detected_ingredients?.length > 0
      ? data.detected_ingredients
      : ingredients
          ?.trim()
          .split(/\n/)
          .map((s) => s.trim())
          .filter(Boolean) || [];

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      {/* Recipe name & ingredients header */}
      {(data.recipe_name || displayIngredients.length > 0) && (
        <div className="border-b border-border px-8 py-6">
          {data.recipe_name && (
            <h3 className="text-lg font-bold tracking-tight text-foreground">
              {data.recipe_name}
            </h3>
          )}
          {displayIngredients.length > 0 && (
            <div className={data.recipe_name ? "mt-3" : ""}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Ingredients
              </p>
              <ul className="space-y-1">
                {displayIngredients.map((item, i) => (
                  <li key={i} className="text-sm text-foreground">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Nutrition Facts */}
      <div className="p-8">
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="font-mono text-xl font-bold tracking-tight text-foreground">
            Nutrition Facts
          </h2>
          <span className="text-xs font-medium text-muted-foreground">per serving</span>
        </div>
        <Divider thick />

        <div className="py-4">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-semibold text-muted-foreground">Calories</span>
            <span className="font-mono text-5xl font-bold tabular-nums tracking-tighter text-foreground">
              {ps.calories}
            </span>
          </div>
        </div>
        <Divider thick />

        <div className="py-1 text-sm">
          <Row label="Total Fat" value={ps.fat_g} bold />
          <Divider />
          <Row label="Total Carbohydrate" value={ps.carbs_g} bold />
          <Divider />
          <Row label="Protein" value={ps.protein_g} bold />
        </div>
        <Divider thick />

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Total recipe calories</span>
            <span className="font-mono tabular-nums font-medium text-foreground">{data.total_calories}</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Confidence Score</span>
              <span className="font-mono tabular-nums font-semibold text-primary">{data.confidence_score}/100</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${Math.min(data.confidence_score, 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground">Based on ingredient clarity</p>
          </div>
        </div>

        <Divider />

        <p className="mt-4 text-center text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Estimates only · Not medical advice
        </p>
        <p className="mt-1 text-center text-[10px] text-muted-foreground">
          {servings} serving{servings !== 1 ? "s" : ""} per recipe
        </p>
      </div>
    </div>
  );
};
