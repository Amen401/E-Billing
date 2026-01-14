import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { initialTariffData } from "@/Components/officer/initializeddata";
import TariffBlocksTable from "@/Components/officer/TariffBlocksTable";
import ServiceChargesTable from "@/Components/officer/ServiceChargesTable";
import { Save, Zap, Loader2 } from "lucide-react";
import type { TariffData, TariffBlock, ServiceCharge } from "../Types/type";
import { officerApi } from "@/lib/api";

const TariffAndService = () => {
  const [tariffData, setTariffData] = useState<TariffData>(initialTariffData);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);


  useEffect(() => {
    const initData = async () => {
      try {
        const res = await officerApi.getTariff();
   
        if (res?.data && Object.keys(res.data).length > 0) {
          setTariffData(res.data);
        } else {

          await officerApi.UpdateTarfiff(initialTariffData);
          setTariffData(initialTariffData);
          toast.info("System Initialized", {
            description: "Default tariff rates have been synchronized with the server.",
          });
        }
      } catch (error) {
        console.error("Fetch Error:", error);
        toast.error("Connection Error", {
          description: "Could not load tariff data from the server.",
        });
      } finally {
        setIsInitialLoading(false);
      }
    };
    initData();
  }, []);

  // 2. Generic Handler for all Service Charges (Reduces redundancy)
  const handleChargeChange = useCallback((
    category: "domesticCharges" | "generalCharges" | "industryCharges",
    id: string,
    field: keyof ServiceCharge,
    value: number
  ) => {
    setTariffData((prev) => ({
      ...prev,
      [category]: prev[category].map((charge) =>
        charge.id === id ? { ...charge, [field]: value } : charge
      ),
    }));
  }, []);

  // 3. Handler for Tariff Blocks
  const handleBlockChange = (
    id: number,
    field: keyof TariffBlock,
    value: number
  ) => {
    setTariffData((prev) => ({
      ...prev,
      tariffBlocks: prev.tariffBlocks.map((block) =>
        block.id === id ? { ...block, [field]: value } : block
      ),
    }));
  };

  // 4. Save Logic
  const handleSave = async () => {
    setIsLoading(true);
    try {
      await officerApi.UpdateTarfiff(tariffData);
      toast.success("Changes Saved", {
        description: "Tariff and service charges updated successfully.",
      });
    } catch (error) {
      toast.error("Save Failed", {
        description: "An error occurred while updating the rates.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg text-primary-foreground">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                Tariff & Service Charges
              </h1>
              <p className="text-muted-foreground text-sm">
                Operational control for utility billing rates.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()} 
              disabled={isLoading}
            >
              Reset View
            </Button>
            <Button onClick={handleSave} disabled={isLoading} className="gap-2 px-6">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        {/* 1. Residential Tariff Blocks */}
        <Card className="shadow-sm">
          <CardHeader className="border-b">
            <CardTitle className="text-lg font-semibold">1. Residential Usage Blocks (kWh)</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <TariffBlocksTable 
              blocks={tariffData.tariffBlocks} 
              onBlockChange={handleBlockChange} 
            />
          </CardContent>
        </Card>

        {/* 2. Service Charges Section */}
        <Card className="shadow-sm">
          <CardHeader className="border-b">
            <CardTitle className="text-lg font-semibold">2. Service & Fixed Charges</CardTitle>
          </CardHeader>
          <CardContent className="space-y-10 pt-6">
            <ServiceChargesTable
              title="Domestic / Residential"
              charges={tariffData.domesticCharges}
              onChargeChange={(id, field, val) => handleChargeChange("domesticCharges", id, field, val)}
            />
            <hr className="border-muted/30" />
            <ServiceChargesTable
              title="General / Commercial"
              charges={tariffData.generalCharges}
              onChargeChange={(id, field, val) => handleChargeChange("generalCharges", id, field, val)}
            />
            <hr className="border-muted/30" />
            <ServiceChargesTable
              title="Industrial Rates"
              charges={tariffData.industryCharges}
              onChargeChange={(id, field, val) => handleChargeChange("industryCharges", id, field, val)}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TariffAndService;