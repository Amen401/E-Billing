import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import TariffBlocksTable from "@/Components/officer/TariffBlocksTable";
import ServiceChargesTable from "@/Components/officer/ServiceChargesTable";
import { Save, Zap, Loader2 } from "lucide-react";

import { officerApi } from "@/lib/api";
import type { TariffBlock, ServiceCharge } from "../Types/type";
import { transform } from "zod";

const TariffAndService = () => {
  const [tariffId, setTariffId] = useState<string>("");

  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const [tariffBlocks, setTariffBlocks] = useState<TariffBlock[]>([]);
  const [domesticCharges, setDomesticCharges] = useState<ServiceCharge[]>([]);
  const [generalCharges, setGeneralCharges] = useState<ServiceCharge[]>([]);
  const [industryCharges, setIndustryCharges] = useState<ServiceCharge[]>([]);

  // ================= LOAD EXISTING TARIFF =================
  const loadExistingTariffs = useCallback(async () => {
    setIsInitialLoading(true);
    try {
      const res = await officerApi.getTariff();
      if (!res) return;

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
          id: "dom-under",
          type: "Up to 50 kWh",
          paidRate: res.domesticUnder50 ?? "",
        },
        {
          id: "dom-above",
          type: "Above 50 kWh",
          paidRate: res.domesticAbove50 ?? "",
        },
      ]);

      setGeneralCharges([
        { id: "gen-all", type: "All Usage", paidRate: res.allUsage ?? "" },
      ]);

      setIndustryCharges([
        { id: "ind-3", type: "Three Phase", paidRate: res.threePhase ?? "" },
      ]);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load tariffs");
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExistingTariffs();
  }, [loadExistingTariffs]);

  const updateSingleTariffField = async (block: string, value: number) => {
    if (!tariffId) {
      toast.error("Tariff ID not found");
      return;
    }

    try {
      const res = await officerApi.UpdateTarfiff({
        tId: tariffId,
        block,
        value,
      });

      if (res.status === 200) {
        toast.success(`${block} updated successfully`);
      } else {
        toast.error(`Failed to update ${block}`);
      }
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || `Failed to update ${block}`;
      toast.error(msg);
    }
  };

  // ================= HANDLERS =================
  const handleBlockChange = (id: number, value: number | "") => {
    setTariffBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, rate: value } : b))
    );
    if (value !== "") updateSingleTariffField(`block${id}`, Number(value));
  };

  const handleChargeChange = (
    category: "domestic" | "general" | "industry",
    id: string,
    value: number | ""
  ) => {
    const updateFn = (prev: ServiceCharge[]) =>
      prev.map((c) => (c.id === id ? { ...c, paidRate: value } : c));

    if (category === "domestic") setDomesticCharges(updateFn);
    if (category === "general") setGeneralCharges(updateFn);
    if (category === "industry") setIndustryCharges(updateFn);

    if (value !== "") {
      let blockKey = "";
      if (category === "domestic")
        blockKey = id === "dom-under" ? "domesticUnder50" : "domesticAbove50";
      if (category === "general") blockKey = "allUsage";
      if (category === "industry") blockKey = "threePhase";

      updateSingleTariffField(blockKey, Number(value));
    }
  };

  // ================= UI =================
  if (isInitialLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Zap className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-bold">Tariff & Service Charges</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Residential Usage Blocks</CardTitle>
          </CardHeader>
          <CardContent>
            <TariffBlocksTable
              blocks={tariffBlocks}
              tariffId={tariffId} // <-- pass it here
              onBlockChange={handleBlockChange}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Service Charges</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <ServiceChargesTable
              title="Domestic"
              charges={domesticCharges}
              onChargeChange={(id, _, val) =>
                handleChargeChange("domestic", id, val)
              }
            />
            <ServiceChargesTable
              title="General"
              charges={generalCharges}
              onChargeChange={(id, _, val) =>
                handleChargeChange("general", id, val)
              }
            />
            <ServiceChargesTable
              title="Industry"
              charges={industryCharges}
              onChargeChange={(id, _, val) =>
                handleChargeChange("industry", id, val)
              }
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TariffAndService;
