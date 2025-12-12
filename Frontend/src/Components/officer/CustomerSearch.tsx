import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";

interface CustomerSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  isLoading?: boolean;
}

const CustomerSearch: React.FC<CustomerSearchProps> = ({
  searchTerm,
  onSearchChange,
  onSearch,
  isLoading = false,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  return (
    <div className="relative flex gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by customer name, account number, or meter number..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-10 h-11"
        />
      </div>

      <Button
        onClick={onSearch}
        disabled={isLoading}
        className="h-11 px-6"
      >
        {isLoading ? (
          <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <Search className="h-4 w-4 mr-2" />
            Search
          </>
        )}
      </Button>
    </div>
  );
};

export default CustomerSearch;
