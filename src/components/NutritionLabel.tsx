interface NutritionData {
  calories: number;
  totalFat: number;
  saturatedFat: number;
  cholesterol: number;
  sodium: number;
  totalCarbs: number;
  dietaryFiber: number;
  totalSugars: number;
  protein: number;
}

interface Props {
  result: null | "loading" | object;
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
    className={`flex items-center justify-between py-1.5 ${bold ? "font-semibold" : "text-muted-foreground"} ${indent ? "pl-5" : ""}`}
  >
    <span>{label}</span>
    <span className="font-mono tabular-nums">
      {value}
      {unit}
    </span>
  </div>
);

const Divider = ({ thick = false }: { thick?: boolean }) => (
  <div
    className={`${thick ? "border-t-4 border-foreground" : "border-t border-border"}`}
  />
);

export const NutritionLabel = ({ result, servings }: Props) => {
  if (result === null) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border border-dashed">
        <p className="text-sm text-muted-foreground">
          Your nutrition label will appear here
        </p>
      </div>
    );
  }

  if (result === "loading") {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
          Analyzing ingredients…
        </div>
      </div>
    );
  }

  const data = result as NutritionData;

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="mb-1 flex items-baseline justify-between">
        <h2 className="font-mono text-lg font-bold tracking-tight">
          Nutrition Facts
        </h2>
        <span className="text-xs text-muted-foreground">per serving</span>
      </div>
      <Divider thick />

      <div className="py-3">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Calories
          </span>
          <span className="font-mono text-4xl font-bold tabular-nums tracking-tighter">
            {data.calories}
          </span>
        </div>
      </div>
      <Divider thick />

      <div className="py-1 text-sm">
        <Row label="Total Fat" value={data.totalFat} bold />
        <Divider />
        <Row label="Saturated Fat" value={data.saturatedFat} indent />
        <Divider />
        <Row label="Cholesterol" value={data.cholesterol} unit="mg" bold />
        <Divider />
        <Row label="Sodium" value={data.sodium} unit="mg" bold />
        <Divider />
        <Row label="Total Carbohydrate" value={data.totalCarbs} bold />
        <Divider />
        <Row label="Dietary Fiber" value={data.dietaryFiber} indent />
        <Divider />
        <Row label="Total Sugars" value={data.totalSugars} indent />
        <Divider />
        <Row label="Protein" value={data.protein} bold />
      </div>
      <Divider thick />

      <p className="mt-3 text-[11px] text-muted-foreground">
        * {servings} serving{servings !== 1 ? "s" : ""} per recipe. Values are
        AI-estimated and may vary.
      </p>
    </div>
  );
};
