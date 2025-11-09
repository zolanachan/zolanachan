import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface HowItWorksStepProps {
  step: number;
  icon: LucideIcon;
  title: string;
  description: string;
}

export default function HowItWorksStep({ step, icon: Icon, title, description }: HowItWorksStepProps) {
  return (
    <Card className="p-6 relative overflow-visible">
      <div className="absolute -top-3 -left-3 w-12 h-12 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">
        {step}
      </div>
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </Card>
  );
}
