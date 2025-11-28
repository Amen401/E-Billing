import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Loader2 } from "lucide-react";

interface ComplaintFiltersProps {
  onSearch: (query: string) => void;
  onStatusFilter: (status: string) => void;
  onCategoryFilter: (category: string) => void;
  isSearching?: boolean;
}

const ComplaintFilters = ({
  onSearch,
  onStatusFilter,
  onCategoryFilter,
  isSearching = false,
}: ComplaintFiltersProps) => {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
        <Input
          placeholder="Search by ID, account, subject, or customer..."
          className="pl-9 pr-9"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      
      <Select onValueChange={onStatusFilter} defaultValue="all-statuses">
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all-statuses">All Statuses</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="open">Open</SelectItem>
          <SelectItem value="in-progress">In Progress</SelectItem>
          <SelectItem value="resolved">Resolved</SelectItem>
          <SelectItem value="closed">Closed</SelectItem>
        </SelectContent>
      </Select>

      <Select onValueChange={onCategoryFilter} defaultValue="all-cases">
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all-cases">All Categories</SelectItem>
          <SelectItem value="billing">Billing</SelectItem>
          <SelectItem value="technical">Technical</SelectItem>
          <SelectItem value="account">Account</SelectItem>
          <SelectItem value="service">Service</SelectItem>
          <SelectItem value="general">General</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ComplaintFilters;
