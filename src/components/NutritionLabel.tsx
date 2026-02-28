import { Loader2 } from "lucide-react";
import type { NutritionResult } from "@/pages/Index";

interface Props {
  result: NutritionResult | null;
  loading: boolean;
  servings: number;
}

const Row = ({
  label,
  value,
  unit = "g",
  bold = false,
  indent = false,
}: {
  label: string;
  value: number;
  unit?: string;
  bold?: boolean;
  indent?: boolean;
}) => (
  <div
    className={`flex items-center justify-between py-2 ${bold ? "font-semibold text-foreground" : "text-muted-foreground"} ${indent ? "pl-6" : ""}`}
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

export const NutritionLabel = ({ result, loading, servings }: Props) => {
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

  return (
    <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
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

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Total recipe calories</span>
          <span className="font-mono tabular-nums font-medium text-foreground">{data.total_calories}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>AI confidence</span>
          <span className="font-mono tabular-nums font-medium text-primary">{data.confidence_score}%</span>
        </div>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        * {servings} serving{servings !== 1 ? "s" : ""} per recipe. Values are
        AI-estimated and may vary.
      </p>
    </div>
  );
};
