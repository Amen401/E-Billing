
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ServiceCharge } from "@/Page/Types/type";

interface ServiceChargesTableProps {
  title: string;
  charges: ServiceCharge[];
  onChargeChange: (
    id: string,
    field: "postpaidRate" | "prepaidRate",
    value: number
  ) => void;
}

const ServiceChargesTable = ({
  title,
  charges,
  onChargeChange,
}: ServiceChargesTableProps) => {
  const handleInputChange = (
    id: string,
    field: "postpaidRate" | "prepaidRate",
    value: string
  ) => {
    const numValue = parseFloat(value) || 0;
    onChargeChange(id, field, numValue);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <div className="rounded-lg border border-table-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-table-header hover:bg-table-header">
              <TableHead className="font-semibold text-foreground w-[250px]">
                Type
              </TableHead>
              <TableHead className="font-semibold text-foreground text-center">
                Postpaid (Birr)
              </TableHead>
              <TableHead className="font-semibold text-foreground text-center">
                Prepaid (Birr)
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {charges.map((charge) => (
              <TableRow
                key={charge.id}
                className="hover:bg-table-hover transition-colors"
              >
                <TableCell className="font-medium">{charge.type}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={charge.postpaidRate}
                    onChange={(e) =>
                      handleInputChange(charge.id, "postpaidRate", e.target.value)
                    }
                    className="w-full text-center"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={charge.prepaidRate}
                    onChange={(e) =>
                      handleInputChange(charge.id, "prepaidRate", e.target.value)
                    }
                    className="w-full text-center"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ServiceChargesTable;
