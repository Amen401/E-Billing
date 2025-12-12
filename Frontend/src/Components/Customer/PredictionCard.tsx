import { Card } from "@/Components/ui/card";
import { Sparkles, TrendingUp, Zap } from "lucide-react";

interface PredictionCardProps {
  prediction: {
    predicted_kwh?: number;
    month?: string;
  } | null;
}

export const PredictionCard = ({ prediction }: PredictionCardProps) => {
  if (!prediction) return null;

  return (
    <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-card to-accent/5 animate-slide-up">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                AI Prediction
                <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  Beta
                </span>
              </h3>
              <p className="text-sm text-muted-foreground">
                Expected consumption for {prediction.month ?? "next month"}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-foreground">
                {prediction.predicted_kwh?.toFixed(0) ?? 0}
              </span>
              <span className="text-lg text-muted-foreground">kWh</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>Estimated usage</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Zap className="w-4 h-4 text-warning" />
            <span>Plan your energy usage efficiently based on this prediction</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PredictionCard;
