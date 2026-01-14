
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TariffBlock } from "@/Page/Types/type";

interface TariffBlocksTableProps {
  blocks: TariffBlock[];
  onBlockChange: (id: number, field: keyof TariffBlock, value: number) => void;
}

const TariffBlocksTable = ({ blocks, onBlockChange }: TariffBlocksTableProps) => {
  const handleInputChange = (
    id: number,
    field: keyof TariffBlock,
    value: string
  ) => {
    const numValue = parseFloat(value) || 0;
    onBlockChange(id, field, numValue);
  };

  return (
    <div className="rounded-lg border border-table-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-table-header hover:bg-table-header">
            <TableHead className="font-semibold text-foreground w-[180px]">
              Tariff Block
            </TableHead>
            <TableHead className="font-semibold text-foreground w-[150px]">
              kWh/month
            </TableHead>
            <TableHead className="font-semibold text-foreground text-center">
              Rate 1 (Birr/kWh)
            </TableHead>
            <TableHead className="font-semibold text-foreground text-center">
              Rate 2 (Birr/kWh)
            </TableHead>
            <TableHead className="font-semibold text-foreground text-center">
              Rate 3 (Birr/kWh)
            </TableHead>
            <TableHead className="font-semibold text-foreground text-center">
              Rate 4 (Birr/kWh)
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {blocks.map((block) => (
            <TableRow
              key={block.id}
              className="hover:bg-table-hover transition-colors"
            >
              <TableCell className="font-medium">
                {block.id}. {block.name}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {block.range}
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  step="0.0001"
                  value={block.rate1}
                  onChange={(e) =>
                    handleInputChange(block.id, "rate1", e.target.value)
                  }
                  className="w-full text-center"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  step="0.0001"
                  value={block.rate2}
                  onChange={(e) =>
                    handleInputChange(block.id, "rate2", e.target.value)
                  }
                  className="w-full text-center"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  step="0.0001"
                  value={block.rate3}
                  onChange={(e) =>
                    handleInputChange(block.id, "rate3", e.target.value)
                  }
                  className="w-full text-center"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  step="0.0001"
                  value={block.rate4}
                  onChange={(e) =>
                    handleInputChange(block.id, "rate4", e.target.value)
                  }
                  className="w-full text-center"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TariffBlocksTable;
