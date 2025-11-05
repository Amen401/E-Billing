import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ComplaintFiltersProps {
  onSearch: (query: string) => void;
  onStatusFilter: (status: string) => void;
  onCategoryFilter: (category: string) => void;
}

const ComplaintFilters = ({
  onSearch,
  onStatusFilter,
  onCategoryFilter,
}: ComplaintFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search complaints..."
          className="pl-10 w-full"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      <div className="flex gap-2 w-full sm:w-auto">
        <Select defaultValue="all-statuses" onValueChange={onStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-statuses">All Statuses</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all-cases" onValueChange={onCategoryFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-cases">All Cases</SelectItem>
            <SelectItem value="billing">Billing</SelectItem>
            <SelectItem value="delivery">Delivery</SelectItem>
            <SelectItem value="support">Support</SelectItem>
            <SelectItem value="product">Product</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ComplaintFilters;
