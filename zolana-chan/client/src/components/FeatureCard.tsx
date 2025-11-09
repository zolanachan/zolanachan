import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  metric?: string;
}

export default function FeatureCard({ icon: Icon, title, description, metric }: FeatureCardProps) {
  return (
    <Card className="p-6 hover-elevate active-elevate-2 transition-all">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          {metric && (
            <div className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
              {metric}
            </div>
          )}
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">{title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>
      </div>
    </Card>
  );
}
