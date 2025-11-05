import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UserPlus, Users } from "lucide-react";
import { Breadcrumb } from "@/Components/BreadCrumb";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { officerApi } from "@/lib/api";

const RegisterCustomer = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    region: "",
    service_center: "",
    address_region: "",
    zone: "",
    woreda: "",
    town: "",
    purpose: "",
    power_approved: "",
    killowat: "",
    applicable_tarif: "",
    volt: "",
    deposit_birr: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const data = await officerApi.createCustomer(formData);
    toast.success(data.message || "Customer registered successfully!");
    navigate("/officer/customers");
  } catch (error: any) {
    toast.error(error.message || "Failed to register customer");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/officer/dashboard" },
          { label: "Register Customer" },
          { label: "View Customers", href: "/officer/customers" },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Register Customer
          </h1>
          <p className="text-muted-foreground">
            Add new customers to the system
          </p>
        </div>

        <Button asChild className="flex items-center gap-2">
          <Link to="/officer/customers">
            <Users className="h-4 w-4" />
            View All Customers
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            <CardTitle>Customer Registration Form</CardTitle>
          </div>
          <CardDescription>
            Enter customer details to create a new account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter customer's full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="region">Region *</Label>
                <Input
                  id="region"
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  placeholder="e.g., Addis Ababa"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="service_center">Service Center *</Label>
                <Input
                  id="service_center"
                  name="service_center"
                  value={formData.service_center}
                  onChange={handleChange}
                  placeholder="e.g., Bole Service Center"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address_region">Address Region *</Label>
                <Input
                  id="address_region"
                  name="address_region"
                  value={formData.address_region}
                  onChange={handleChange}
                  placeholder="Customer's address region"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zone">Zone *</Label>
                <Input
                  id="zone"
                  name="zone"
                  value={formData.zone}
                  onChange={handleChange}
                  placeholder="Administrative zone"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="woreda">Woreda *</Label>
                <Input
                  id="woreda"
                  name="woreda"
                  value={formData.woreda}
                  onChange={handleChange}
                  placeholder="Administrative woreda"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="town">Town *</Label>
                <Input
                  id="town"
                  name="town"
                  value={formData.town}
                  onChange={handleChange}
                  placeholder="Town or city"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose *</Label>
                <Input
                  id="purpose"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  placeholder="e.g., Residential, Commercial"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="power_approved">Power Approved (KW) *</Label>
                <Input
                  id="power_approved"
                  name="power_approved"
                  type="number"
                  step="0.01"
                  value={formData.power_approved}
                  onChange={handleChange}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="killowat">Killowat *</Label>
                <Input
                  id="killowat"
                  name="killowat"
                  type="number"
                  step="0.01"
                  value={formData.killowat}
                  onChange={handleChange}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="applicable_tarif">Applicable Tarif *</Label>
                <Input
                  id="applicable_tarif"
                  name="applicable_tarif"
                  type="number"
                  step="0.01"
                  value={formData.applicable_tarif}
                  onChange={handleChange}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="volt">Volt *</Label>
                <Input
                  id="volt"
                  name="volt"
                  type="number"
                  step="0.01"
                  value={formData.volt}
                  onChange={handleChange}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deposit_birr">Deposit (Birr) *</Label>
                <Input
                  id="deposit_birr"
                  name="deposit_birr"
                  type="number"
                  step="0.01"
                  value={formData.deposit_birr}
                  onChange={handleChange}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button type="submit" disabled={loading}>
                {loading ? "Registering..." : "Register Customer"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/officer/customers")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterCustomer;
