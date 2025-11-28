import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { officerApi } from "@/lib/api";
import type { Customer } from "../Types/type";
import {
  ArrowLeft,
  MapPin,
  Building2,
  Zap,
  Wallet,
  FileText,
  CheckCircle2,
  XCircle,
  Calendar,
} from "lucide-react";

const CustomerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: customers, isLoading, isError } = useQuery({
    queryKey: ["customer-detail", id],
    queryFn: () => officerApi.getCustomers(),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle p-6">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-muted rounded-lg" />
            <div className="h-96 bg-muted rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !customers) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-6">
        <Card className="max-w-md w-full shadow-soft">
          <CardContent className="pt-6 text-center">
            <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <p className="text-lg font-medium">Customer not found</p>
            <Button onClick={() => navigate(-1)} className="mt-4">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const customer: Customer | undefined = customers.find(
    (cust: Customer) => cust._id === id
  );

  if (!customer) {
    return (
      <div className="min-h-screen text-black bg-gradient-subtle flex items-center justify-center p-6">
        <Card className="max-w-md w-full shadow-soft">
          <CardContent className="pt-6 text-center">
            <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <p className="text-lg font-medium">Customer not found</p>
            <Button onClick={() => navigate(-1)} className="mt-4 text-black">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="bg-gradient-primary text-primary-foreground shadow-elegant">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 cursor-pointer text-black hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2 text-black" />
            Back
          </Button>
          <div className="flex items-start justify-between">
            <div className="animate-fade-in">
              <h1 className="text-3xl font-bold text-black mb-2">{customer.name}</h1>
              <p className=" text-black flex items-center gap-2">
                <FileText className="w-4 text-black h-4" />
                Account #{customer.accountNumber}
              </p>
            </div>
            <Badge
              variant={customer.isActive ? "default" : "secondary"}
              className={`${
                customer.isActive
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-muted"
              } text-white px-4 py-2 text-sm animate-scale-in`}
            >
              {customer.isActive ? (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              ) : (
                <XCircle className="w-4 h-4 mr-2" />
              )}
              {customer.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <Card className="shadow-soft hover:shadow-elegant transition-shadow duration-300 animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <MapPin className="w-5 h-5" />
              Location Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <InfoItem
                icon={<Building2 className="w-5 h-5 text-primary" />}
                label="Region"
                value={customer.region}
              />
              <InfoItem
                icon={<Building2 className="w-5 h-5 text-primary" />}
                label="Zone"
                value={customer.zone}
              />
              <InfoItem
                icon={<Building2 className="w-5 h-5 text-primary" />}
                label="Service Center"
                value={customer.serviceCenter}
              />
              <InfoItem
                icon={<MapPin className="w-5 h-5 text-primary" />}
                label="Town"
                value={customer.town}
              />
              <InfoItem
                icon={<MapPin className="w-5 h-5 text-primary" />}
                label="Woreda"
                value={customer.woreda}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft hover:shadow-elegant transition-shadow duration-300 animate-fade-in [animation-delay:100ms]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Zap className="w-5 h-5" />
              Power Specifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <InfoItem
                icon={<Zap className="w-5 h-5 text-primary" />}
                label="Power Approved"
                value={`${customer.powerApproved} KW`}
              />
              <InfoItem
                icon={<Zap className="w-5 h-5 text-primary" />}
                label="Kilowatt"
                value={customer.killowat}
              />
              <InfoItem
                icon={<Zap className="w-5 h-5 text-primary" />}
                label="Voltage"
                value={`${customer.volt} V`}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft hover:shadow-elegant transition-shadow duration-300 animate-fade-in [animation-delay:200ms]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Wallet className="w-5 h-5" />
              Billing Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <InfoItem
                icon={<Wallet className="w-5 h-5 text-primary" />}
                label="Deposit"
                value={`${customer.depositBirr} Birr`}
              />
              <InfoItem
                icon={<FileText className="w-5 h-5 text-primary" />}
                label="Account Number"
                value={customer.accountNumber}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft hover:shadow-elegant transition-shadow duration-300 animate-fade-in [animation-delay:300ms]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Calendar className="w-5 h-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <InfoItem
                icon={<Calendar className="w-5 h-5 text-primary" />}
                label="Created At"
                value={new Date(customer.createdAt).toLocaleString()}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const InfoItem = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) => {
  return (
    <div className="group">
      <div className="flex items-start gap-3 p-4 rounded-lg hover:bg-muted/50 transition-colors duration-200">
        <div className="mt-0.5 group-hover:scale-110 transition-transform duration-200">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground font-medium mb-1">
            {label}
          </p>
          <p className="text-base font-semibold text-foreground break-words">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailPage;
