import { Card } from "@/components/ui/card";

interface PrivacyMetricProps {
  value: string;
  label: string;
  subtext?: string;
  trend?: "up" | "down";
}

export default function PrivacyMetric({ value, label, subtext, trend }: PrivacyMetricProps) {
  return (
    <Card className="p-6">
      <div className="space-y-2">
        <div className="text-3xl font-bold font-mono">{value}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
        {subtext && (
          <div className={`text-xs font-mono ${trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-muted-foreground"}`}>
            {subtext}
          </div>
        )}
      </div>
    </Card>
  );
}
