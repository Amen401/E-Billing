import React, { useState } from "react";
import { Zap, Users, StepBackIcon, Link, ArrowLeft } from "lucide-react";
import { Card } from "@/Components/ui/card";
import type { Customer } from "@/Page/Types/type";
import CustomerSearch from "./CustomerSearch";
import CustomerTable from "./CustomerTable";
import PaymentDialog from "./PaymentDialog";
import { officerApi } from "@/lib/api";
import { Breadcrumb } from "@/Components/BreadCrumb";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

const AddMeterReading: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const navigate=useNavigate()

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    try {
      const res = await officerApi.searchCustomers(searchTerm);
      console.log(res);

      setCustomers(res);
    } catch (error) {
      console.error("Error searching customers:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleProcessPayment = (customers: Customer) => {
    setSelectedCustomer(customers);
    setIsPaymentDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsPaymentDialogOpen(false);
    setSelectedCustomer(null);
  };

  return (
    <div className="min-h-screen gradient-surface">
  <div className="container mx-auto px-4 py-6 sm:py-8 max-w-6xl">
    <Button onClick={() => navigate("/officer/meter-readings")} className="mb-4 flex items-center gap-2 text-sm sm:text-base">
      <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" /> Back
    </Button>

    <div className="text-center mb-6 sm:mb-8 animate-fade-in">
      <div className="inline-flex items-center justify-center h-12 w-12 sm:h-16 sm:w-16 rounded-2xl gradient-primary shadow-glow mb-3 sm:mb-4">
        <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-primary-foreground" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">
        Meter Reading & Payments
      </h1>
      <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
        Search for customers and process their meter readings and payments
      </p>
    </div>

    <Card className="p-4 sm:p-6 shadow-card mb-4 sm:mb-6 animate-slide-up">
      <CustomerSearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSearch={handleSearch}
        isLoading={isSearching}
      />
    </Card>

    <Card className="p-4 sm:p-6 shadow-card animate-slide-up overflow-x-auto">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3 sm:mb-4">
        <Users className="h-5 w-5 text-primary" />
        <h2 className="text-lg sm:text-xl font-semibold">
          {hasSearched ? "Search Results" : "All Customers"}
        </h2>
        {hasSearched && (
          <span className="text-sm text-muted-foreground">
            ({filteredCustomers.length} found)
          </span>
        )}
      </div>

      <CustomerTable
        customers={hasSearched ? customers : []}
        onProcessPayment={handleProcessPayment}
        isLoading={isSearching}
      />
    </Card>

    <PaymentDialog
      isOpen={isPaymentDialogOpen}
      onClose={handleCloseDialog}
      customer={selectedCustomer}
    />
  </div>
</div>

  );
};

export default AddMeterReading;
