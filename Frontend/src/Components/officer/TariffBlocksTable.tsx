import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { TariffBlock } from "@/Page/Types/type";

interface TariffBlocksTableProps {
  blocks: TariffBlock[];
  onBlockChange: (id: number, value: number | "") => void;
}

const TariffBlocksTable = ({ blocks, onBlockChange }: TariffBlocksTableProps) => {
  const [savingBlockIds, setSavingBlockIds] = useState<number[]>([]);
  const [savedBlockIds, setSavedBlockIds] = useState<number[]>([]);

  const handleInputChange = (id: number, inputValue: string) => {
    if (inputValue === "") {
      onBlockChange(id, "");
    } else {
      const numValue = parseFloat(inputValue);
      if (!isNaN(numValue) && numValue >= 0) {
        onBlockChange(id, numValue);
      }
    }
  };

  const getInputValue = (rate: number | ""): string => {
    if (rate === "" || rate === null || rate === undefined) return "";
    if (typeof rate === "number" && !isNaN(rate)) return rate.toString();
    return "";
  };

  // Save rate to backend
  const handleSave = async (id: number, rate: number | "") => {
    if (rate === "" || savedBlockIds.includes(id)) return;

    setSavingBlockIds((prev) => [...prev, id]);

    try {
      const res = await fetch(`/api/tariff-blocks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rate }),
      });

      if (!res.ok) throw new Error("Failed to save");

      toast.success("Rate saved!");
      setSavedBlockIds((prev) => [...prev, id]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save rate");
    } finally {
      setSavingBlockIds((prev) => prev.filter((blockId) => blockId !== id));
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border/50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
              Block
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
              Consumption Range
            </th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">
              Rate (per kWh)
            </th>
          </tr>
        </thead>
        <tbody>
          {blocks.map((block) => (
            <tr
              key={block.id}
              className="border-b border-border/30 hover:bg-muted/30 transition-colors"
            >
              <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="font-mono text-xs">
                    {block.id}
                  </Badge>
                  <span className="font-medium text-foreground">{block.name}</span>
                </div>
              </td>
              <td className="py-4 px-4">
                <span className="text-muted-foreground">{block.range}</span>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center justify-end gap-2">
                  <span className="text-muted-foreground text-sm">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={getInputValue(block.rate)}
                    onChange={(e) => handleInputChange(block.id, e.target.value)}
                    onBlur={() => handleSave(block.id, block.rate)}
                    placeholder="0.00"
                    disabled={savedBlockIds.includes(block.id)}
                    className={`w-24 text-right tabular-nums ${
                      savedBlockIds.includes(block.id) ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                  />
                  {savingBlockIds.includes(block.id) && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TariffBlocksTable;
