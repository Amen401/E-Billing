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

  const handleProcessPayment = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsPaymentDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsPaymentDialogOpen(false);
    setSelectedCustomer(null);
  };

  return (
    <div className="min-h-screen gradient-surface">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button onClick={() => navigate("/officer/meter-readings")}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl gradient-primary shadow-glow mb-4">
            <Zap className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Meter Reading & Payments
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Search for customers and process their meter readings and payments
          </p>
        </div>
        <Card className="p-6 shadow-card mb-6 animate-slide-up">
          <CustomerSearch
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onSearch={handleSearch}
            isLoading={isSearching}
          />
        </Card>

        <Card className="p-6 shadow-card animate-slide-up">
          <div className="flex items-center gap-3 mb-4">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">
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
