import { Input } from "@/components/ui/input";
import type { ServiceCharge } from "@/Page/Types/type";


interface ServiceChargesTableProps {
  title: string;
  charges: ServiceCharge[];
  onChargeChange: (id: string, field: string, value: number | "") => void;
}

const ServiceChargesTable = ({
  title,
  charges,
  onChargeChange,
}: ServiceChargesTableProps) => {
  const handleInputChange = (id: string, inputValue: string) => {
    if (inputValue === "") {
      onChargeChange(id, "paidRate", "");
    } else {
      const numValue = parseFloat(inputValue);
      if (!isNaN(numValue) && numValue >= 0) {
        onChargeChange(id, "paidRate", numValue);
      }
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-accent" />
        {title}
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                Category
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">
                Fixed Charge ($)
              </th>
            </tr>
          </thead>
          <tbody>
            {charges.map((charge) => (
              <tr
                key={charge.id}
                className="border-b border-border/30 hover:bg-muted/30 transition-colors"
              >
                <td className="py-4 px-4">
                  <span className="font-medium text-foreground">{charge.type}</span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-muted-foreground text-sm">$</span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={charge.paidRate}
                      onChange={(e) => handleInputChange(charge.id, e.target.value)}
                      placeholder="0.00"
                      className="w-24 text-right tabular-nums"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ServiceChargesTable;
