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

const Row = ({ label, value, unit = "g", bold = false, indent = false }: { label: string; value: number; unit?: string; bold?: boolean; indent?: boolean }) => (
  <div className={`flex justify-between py-1 ${bold ? "font-semibold" : ""} ${indent ? "pl-4" : ""}`}>
    <span>{label}</span>
    <span className="font-mono tabular-nums">{value}{unit}</span>
  </div>
);

const Divider = ({ thick = false }: { thick?: boolean }) => (
  <div className={`${thick ? "border-t-[6px]" : "border-t"} border-foreground`} />
);

export const NutritionLabel = ({ result, servings }: Props) => {
  if (result === null) {
    return (
      <div className="rounded-md border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Your nutrition label will appear here
        </p>
      </div>
    );
  }

  if (result === "loading") {
    return (
      <div className="rounded-md border p-8 text-center">
        <p className="text-sm text-muted-foreground animate-pulse">
          Analyzing ingredients…
        </p>
      </div>
    );
  }

  const data = result as NutritionData;

  return (
    <div className="rounded-md border-2 border-foreground p-4 font-mono text-sm">
      <h2 className="text-2xl font-bold tracking-tight">Nutrition Facts</h2>
      <Divider />
      <p className="py-1 text-xs text-muted-foreground">
        {servings} serving{servings !== 1 ? "s" : ""} per recipe
      </p>
      <Divider thick />
      <div className="py-1">
        <div className="flex items-baseline justify-between">
          <span className="text-xs font-semibold">Calories</span>
          <span className="text-3xl font-bold tabular-nums">{data.calories}</span>
        </div>
      </div>
      <Divider thick />
      <div className="space-y-0 text-xs">
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
      <p className="pt-2 text-[10px] text-muted-foreground">
        * Values are AI-estimated and may vary.
      </p>
    </div>
  );
};
