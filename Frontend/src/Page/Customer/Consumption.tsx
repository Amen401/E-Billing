import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import {
  Download,
  RefreshCw,
  Filter,
  Zap,
  BarChart3,
  Receipt,
} from "lucide-react";
import { customerApi } from "@/lib/api";
import { ConsumptionChart } from "@/Components/Customer/ConsumptionChart";
import { BillsTable } from "@/Components/Customer/BillsTable";
import PredictionCard from "@/Components/Customer/PredictionCard";

type ConsumptionPoint = {
  month: string;
  consumption: number;
  average?: number;
};

type BillRow = {
  month: string;
  reading: number;
  consumption: number;
  amount: number;
  status: string;
};

type MonthlyAnalysis = {
  readings?: Array<{
    month: string;
    consumption: number;
    reading: number;
  }>;
  prediction?: {
    predicted_kwh: number;
    month: string;
  } | null;
};
type ChartPoint = {
  month: string;
  consumption: number;
};
const Consumption: React.FC = () => {
  const [startDate, setStartDate] = useState<string>("2025-07-16");
  const [endDate, setEndDate] = useState<string>("2025-10-19");

  const {
    data: monthlyAnalysis,
    isLoading: loadingMonthly,
    isError: errorMonthly,
    refetch: refetchMonthly,
  } = useQuery<MonthlyAnalysis>({
    queryKey: ["monthly-analysis"],
    queryFn: async () => {
      const res = await customerApi.getMonthlyUsage();
      return res.data?.readings ?? [];
    },
    staleTime: 1000 * 60 * 2,
  });

  const {
    data: billsDataRaw = [],
    isLoading: loadingBills,
    isError: errorBills,
    refetch: refetchBills,
  } = useQuery({
    queryKey: ["bills", startDate, endDate],
    queryFn: async () => {
      const res = await customerApi.getmymeterReading();
      return res ?? [];
    },
    enabled: !!startDate && !!endDate,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["readings"],
    queryFn: async () => {
      const res = await customerApi.getMonthlyUsage();
      console.log("🔥 API RESPONSE:", res);
      return res;
    },
  });

  const readings = data?.readings ?? [];
  console.log("reading", readings);
  const prediction = data?.prediction?.prediction;

  const graphData: ChartPoint[] = useMemo(() => {
    const historicalData: ChartPoint[] = readings
      .map((r) => ({
        month: r.paymentMonth?.yearAndMonth ?? "Unknown",
        consumption: Number(r.monthlyUsage) || 0,
      }))

      .filter((r) => r.month !== "Unknown");

    if (prediction) {
      historicalData.push({
        month: prediction.next_month_date.substring(0, 7),
        consumption: Number(prediction.predicted_monthlyUsage) || 0,
      });
    }

    return historicalData.sort((a, b) => {
      return (
        new Date(a.month + "-01").getTime() -
        new Date(b.month + "-01").getTime()
      );
    });
  }, [readings, prediction]);
  console.log("graphData:", graphData, "isLoading:", loadingMonthly);

  const detailedData: BillRow[] = (billsDataRaw || []).map((b: any) => ({
    month: b.paymentMonth || "Unknown",
    reading: Number(b.killowatRead ?? b.reading ?? 0),
    consumption: Number(b.monthlyUsage ?? b.consumption ?? 0),
    amount: Number(b.fee ?? 0),
    status: b.paymentStatus ?? "Pending",
  }));

  function downloadCSV() {
    const headers = [
      "Billing Month",
      "Meter Reading",
      "Consumption (kWh)",
      "Amount (ETB)",
      "Status",
    ];

    const rows = detailedData.map((r) => [
      `"${r.month}"`,
      r.reading,
      r.consumption,
      r.amount.toFixed(2),
      r.status,
    ]);

    const csvContent = [headers.join(",")]
      .concat(rows.map((r) => r.join(",")))
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `consumption_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const applyFilters = () => refetchBills();
  const refreshAll = () => {
    refetchMonthly();
    refetchBills();
  };

  const totalConsumption = detailedData.reduce(
    (sum, row) => sum + row.consumption,
    0
  );
  const totalAmount = detailedData.reduce((sum, row) => sum + row.amount, 0);
  const avgConsumption =
    detailedData.length > 0 ? totalConsumption / detailedData.length : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold font-display text-foreground">
            Consumption History
          </h1>
          <p className="text-muted-foreground">
            Track and analyze your electricity usage over time
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-5 shadow-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Consumption
                </p>
                <p className="text-2xl font-bold">
                  {totalConsumption.toLocaleString()} kWh
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5 shadow-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-accent/10">
                <Zap className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Avg. Monthly Usage
                </p>
                <p className="text-2xl font-bold">
                  {avgConsumption.toFixed(0)} kWh
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5 shadow-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-success/10">
                <Receipt className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Billed</p>
                <p className="text-2xl font-bold">
                  {totalAmount.toFixed(2)} ETB
                </p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6 shadow-card">
          <div className="flex flex-wrap items-end gap-4 mb-8 pb-6 border-b">
            <div className="flex-1 min-w-[280px]">
              <Label className="mb-2 block">Date Range</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />

                <span>to</span>

                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <Button variant="outline" onClick={applyFilters}>
              <Filter className="w-4 h-4 mr-2" />
              Apply Filter
            </Button>

            <Button variant="outline" onClick={downloadCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>

            <Button variant="ghost" onClick={refreshAll}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-1">
              Monthly Consumption Trend
            </h3>
            <p className="text-sm text-muted-foreground">
              Your electricity usage over time
            </p>

            <ConsumptionChart
              data={graphData}
              isLoading={loadingMonthly}
              isError={errorMonthly}
            />
          </div>

          {monthlyAnalysis?.prediction && (
            <div className="mb-8">
              <PredictionCard prediction={monthlyAnalysis.prediction} />
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold mb-1">
              Detailed Billing Records
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Your historical electricity usage and payments
            </p>

            <BillsTable
              data={detailedData}
              isLoading={loadingBills}
              isError={errorBills}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Consumption;
