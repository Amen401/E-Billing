import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Lightbulb, TrendingUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { api } from "@/lib/api";

export const AIInsights = () => {
  const [insights, setInsights] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchInsights = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/ai/consumption-insights");
      setInsights(response.data);
    } catch (error: any) {
      console.error("Error fetching AI insights:", error);
      toast.error("Failed to load AI insights. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  if (!insights && !isLoading) {
    return (
      <Card className="p-6 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-2">
              AI Insights Available
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get personalized predictions and energy-saving tips based on your usage patterns.
            </p>
            <Button onClick={fetchInsights} size="sm">
              Generate Insights
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="p-6 bg-primary/5 border-primary/20">
        <div className="flex items-center gap-3">
          <div className="animate-spin">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">Generating AI insights...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-6 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-2">
              Next Month Prediction
            </h3>
            <p className="text-2xl font-bold text-primary mb-1">
              {insights?.nextMonthPrediction || "0"} kWh
            </p>
            <p className="text-sm text-muted-foreground">
              {insights?.trendAnalysis || "No trend analysis available"}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-success/5 border-success/20">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-success/10">
            <Lightbulb className="w-5 h-5 text-success" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-2">
              Energy Saving Tip
            </h3>
            <p className="text-sm text-muted-foreground">
              {insights?.savingTip || "Try reducing standby power usage and switch to LED bulbs."}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
