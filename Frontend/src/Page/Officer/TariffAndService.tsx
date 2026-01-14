import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import TariffBlocksTable from "@/Components/officer/TariffBlocksTable";
import ServiceChargesTable from "@/Components/officer/ServiceChargesTable";
import { Save, Zap, Loader2, RefreshCw } from "lucide-react";

import { officerApi } from "@/lib/api";
import type { TariffBlock, ServiceCharge } from "../Types/type";

const TariffAndService = () => {
  const [tariffId, setTariffId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // --- State Management ---
  const [tariffBlocks, setTariffBlocks] = useState<TariffBlock[]>([
    { id: 1, name: "1st block", range: "Up to 50kwh", rate: "" },
    { id: 2, name: "2nd block", range: "Up to 100kwh", rate: "" },
    { id: 3, name: "3rd block", range: "Up to 200kwh", rate: "" },
    { id: 4, name: "4th block", range: "Up to 300kwh", rate: "" },
    { id: 5, name: "5th block", range: "Up to 400kwh", rate: "" },
    { id: 6, name: "6th block", range: "Up to 500kwh", rate: "" },
    { id: 7, name: "7th block", range: "Above 500kwh", rate: "" },
  ]);

  const [domesticCharges, setDomesticCharges] = useState<ServiceCharge[]>([
    { id: "dom-postpaid-50", type: "Up to 50kwh", paidRate: "" },
    { id: "dom-postpaid-above", type: "Above 50kwh", paidRate: "" },
  ]);
  const [generalCharges, setGeneralCharges] = useState<ServiceCharge[]>([
    { id: "gen-all", type: "All Usage", paidRate: "" },
  ]);
  const [industryCharges, setIndustryCharges] = useState<ServiceCharge[]>([
    { id: "ind-3phase", type: "Three Phase", paidRate: "" },
  ]);

  // --- Data Fetching ---
  const loadExistingTariffs = useCallback(async () => {
    setIsInitialLoading(true);
    try {
      const res = await officerApi.getTariff();
      console.log(res);
      if (res) {
        setTariffId(res._id || "");

        setTariffBlocks([
          {
            id: 1,
            name: "1st block",
            range: "Up to 50kwh",
            rate: res.block1 ?? "",
          },
          {
            id: 2,
            name: "2nd block",
            range: "Up to 100kwh",
            rate: res.block2 ?? "",
          },
          {
            id: 3,
            name: "3rd block",
            range: "Up to 200kwh",
            rate: res.block3 ?? "",
          },
          {
            id: 4,
            name: "4th block",
            range: "Up to 300kwh",
            rate: res.block4 ?? "",
          },
          {
            id: 5,
            name: "5th block",
            range: "Up to 400kwh",
            rate: res.block5 ?? "",
          },
          {
            id: 6,
            name: "6th block",
            range: "Up to 500kwh",
            rate: res.block6 ?? "",
          },
          {
            id: 7,
            name: "7th block",
            range: "Above 500kwh",
            rate: res.block7 ?? "",
          },
        ]);
        setDomesticCharges([
          {
            id: "dom-postpaid-50",
            type: "Up to 50 kWh",
            paidRate: res.domesticUnder50 ?? "",
          },
          {
            id: "dom-postpaid-above",
            type: "Above 50 kWh",
            paidRate: res.domesticAbove50 ?? "",
          },
        ]);

        setGeneralCharges([
          {
            id: "gen-all",
            type: "All Usage",
            paidRate: res.allUsage ?? "",
          },
        ]);

       
      }
    } catch (err) {
      toast.error("Could not load current rates");
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExistingTariffs();
  }, [loadExistingTariffs]);

  // --- Handlers ---
  const handleBlockChange = (id: number, value: number | "") => {
    setTariffBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, rate: value } : b))
    );
  };

  const handleChargeChange = (
    category: "domestic" | "general" | "industry",
    id: string,
    value: number | ""
  ) => {
    const updateFn = (prev: ServiceCharge[]) =>
      prev.map((c) => (c.id === id ? { ...c, paidRate: value } : c));

    if (category === "domestic") setDomesticCharges(updateFn);
    else if (category === "general") setGeneralCharges(updateFn);
    else if (category === "industry") setIndustryCharges(updateFn);
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      let tId = tariffId;

      // --- Step 1: If no tariff exists, create it first ---
      if (!tariffId) {
        const createRes = await officerApi.addtrariff({
          // Optional: initial data, can be empty or filled with defaults
          block1: Number(tariffBlocks[0].rate) || 0,
          block2: Number(tariffBlocks[1].rate) || 0,
          block3: Number(tariffBlocks[2].rate) || 0,
          block4: Number(tariffBlocks[3].rate) || 0,
          block5: Number(tariffBlocks[4].rate) || 0,
          block6: Number(tariffBlocks[5].rate) || 0,
          block7: Number(tariffBlocks[6].rate) || 0,
          domesticUnder50: Number(domesticCharges[0].paidRate) || 0,
          domesticAbove50: Number(domesticCharges[1].paidRate) || 0,
          allUsage: Number(generalCharges[0].paidRate) || 0,
          threePhase: Number(industryCharges[0].paidRate) || 0,
        });
        tId = createRes.data.tId;
        setTariffId(tId); // store newly created ID
      }

      // --- Step 2: Update all rates ---
      const updatePromises: Promise<any>[] = [];

      // Tariff Blocks
      tariffBlocks.forEach((block, i) => {
        if (block.rate !== "") {
          updatePromises.push(
            officerApi.UpdateTarfiff({
              tId,
              block: `block${i + 1}`,
              value: Number(block.rate),
            })
          );
        }
      });

      // Domestic Charges
      domesticCharges.forEach((c) => {
        const key =
          c.type.includes("50") && !c.type.includes("Above")
            ? "domesticUnder50"
            : "domesticAbove50";
        if (c.paidRate !== "") {
          updatePromises.push(
            officerApi.UpdateTarfiff({
              tId,
              block: key,
              value: Number(c.paidRate),
            })
          );
        }
      });

      // General
      if (generalCharges[0].paidRate !== "") {
        updatePromises.push(
          officerApi.UpdateTarfiff({
            tId,
            block: "allUsage",
            value: Number(generalCharges[0].paidRate),
          })
        );
      }

      // Industry
      if (industryCharges[0].paidRate !== "") {
        updatePromises.push(
          officerApi.UpdateTarfiff({
            tId,
            block: "threePhase",
            value: Number(industryCharges[0].paidRate),
          })
        );
      }

      await Promise.all(updatePromises);

      toast.success("Tariffs saved successfully");
      loadExistingTariffs(); 
    } catch (err) {
      console.error(err);
      toast.error("Failed to save tariffs. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
          <div className="relative p-4 rounded-full bg-primary/10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
        <p className="text-muted-foreground animate-pulse">
          Loading current tariffs...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-primary/5 via-accent/5 to-background border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 py-8 md:py-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-primary to-primary/80 rounded-xl text-primary-foreground shadow-lg shadow-primary/20">
                <Zap className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                  Tariff & Service Charges
                </h1>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={loadExistingTariffs}
                disabled={isLoading}
                className="h-10 w-10"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
              </Button>
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="gap-2 px-6 min-w-[140px] h-10 shadow-md shadow-primary/20"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* 1. Tariff Blocks */}
        <Card className="overflow-hidden border-border/50 shadow-sm">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="text-lg font-semibold flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground font-bold">
                1
              </span>
              Residential Usage Blocks (kWh)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <TariffBlocksTable
              blocks={tariffBlocks}
              onBlockChange={handleBlockChange}
            />
          </CardContent>
        </Card>

        {/* 2. Service Charges */}
        <Card className="overflow-hidden border-border/50 shadow-sm">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="text-lg font-semibold flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground font-bold">
                2
              </span>
              Service & Fixed Charges
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-10 pt-6">
            <ServiceChargesTable
              title="Domestic / Residential"
              charges={domesticCharges}
              onChargeChange={(id, _, val) =>
                handleChargeChange("domestic", id, val)
              }
            />
            <div className="border-t border-border/30" />
            <ServiceChargesTable
              title="General / Commercial"
              charges={generalCharges}
              onChargeChange={(id, _, val) =>
                handleChargeChange("general", id, val)
              }
            />
            <div className="border-t border-border/30" />
            
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TariffAndService;
