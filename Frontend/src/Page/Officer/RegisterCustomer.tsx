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
import { z } from "zod";

const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  region: z.string().min(1, "Region is required"),
  serviceCenter: z.string().min(1, "Service Center is required"),
  addressRegion: z.string().min(1, "Address Region is required"),
  zone: z.string().min(1, "Zone is required"),
  woreda: z.string().min(1, "Woreda is required"),
  town: z.string().min(1, "Town is required"),
  powerApproved: z.coerce.number().min(0.1, "Enter valid KW"),
  killowat: z.coerce.number().min(0.1, "Enter valid KW"),
  applicableTarif: z.coerce.number().min(0.1, "Enter valid Tarif"),
  volt: z.coerce.number().min(1, "Volt is required"),
  depositBirr: z.coerce.number().min(1, "Deposit amount required"),
  serviceChargeBirr: z.coerce.number().min(0, "Service Charge must be >= 0"),
  tarifBirr: z.coerce.number().min(0, "Tarif Birr must be >= 0"),
  meterReaderSN: z.string().min(3, "Meter serial number required"),
  isActive: z.boolean(),
  password: z.string(),
  purpose: z.enum(["Domestic", "Business"], {
    required_error: "Purpose is required",
  }),
});


const RegisterCustomer = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    region: "",
    serviceCenter: "",
    addressRegion: "",
    zone: "",
    woreda: "",
    town: "",
    purpose: "",
    powerApproved: 0,
    killowat: 0,
    applicableTarif: 0,
    volt: 0,
    depositBirr: 0,
    serviceChargeBirr: 0,
    tarifBirr: 0,
    accountNumber: "",
    meterReaderSN: "",
    isActive: true,
    password: "12345678",
  });

  const handleChange = (e: any) => {
    const { name, value, type } = e.target;
    setFormData((p) => ({
      ...p,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const validation = customerSchema.safeParse(formData);

    if (!validation.success) {
      console.log("Zod validation error:", validation.error);
      const firstError =
        validation.error?.errors?.[0]?.message || "Validation failed";
      toast.error(firstError);
      setLoading(false);
      return;
    }

    try {
      const data = await officerApi.createCustomer(formData);
      toast.success(data.message || "Customer registered successfully");
      navigate("/officer/customers");
    } catch (err: any) {
      toast.error(err.message || "Failed to register customer");
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

        <Button asChild>
          <Link to="/officer/customers" className="flex items-center gap-2">
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
            Fill in the details to create an account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Full Name"
                name="name"
                value={formData.name}
                handle={handleChange}
              />

              <SelectField
                label="Region"
                name="region"
                value={formData.region}
                options={["SNNP"]}
                handle={handleChange}
              />

              <SelectField
                label="Service Center"
                name="serviceCenter"
                value={formData.serviceCenter}
                options={[
                  "Wolayta Sodo Main",
                  "Wolayta Sodo East",
                  "Wolayta Sodo West",
                ]}
                handle={handleChange}
              />

              <InputField
                label="Address Region"
                name="addressRegion"
                value={formData.addressRegion}
                handle={handleChange}
              />
              <InputField
                label="Zone"
                name="zone"
                value={formData.zone}
                handle={handleChange}
              />
              <InputField
                label="Woreda"
                name="woreda"
                value={formData.woreda}
                handle={handleChange}
              />
              <InputField
                label="Town"
                name="town"
                value={formData.town}
                handle={handleChange}
              />
              <SelectField
                label="Purpose"
                name="purpose"
                value={formData.purpose}
                options={["Domestic", "Business"]}
                handle={handleChange}
              />

              <NumberField
                label="Power Approved (KW)"
                name="powerApproved"
                value={formData.powerApproved}
                handle={handleChange}
              />
              <NumberField
                label="Killowat"
                name="killowat"
                value={formData.killowat}
                handle={handleChange}
              />

              <NumberField
                label="Applicable Tarif"
                name="applicableTarif"
                value={formData.applicableTarif}
                handle={handleChange}
              />

              <NumberField
                label="Volt"
                name="volt"
                value={formData.volt}
                handle={handleChange}
              />
              <NumberField
                label="Deposit (Birr)"
                name="depositBirr"
                value={formData.depositBirr}
                handle={handleChange}
              />
              <NumberField
                label="Service Charge (Birr)"
                name="serviceChargeBirr"
                value={formData.serviceChargeBirr}
                handle={handleChange}
              />

              <InputField
                label="Meter Serial Number"
                name="meterReaderSN"
                value={formData.meterReaderSN}
                handle={handleChange}
              />
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button type="submit" disabled={loading}>
                {loading ? "Registering..." : "Register Customer"}
              </Button>

              <Button
                variant="outline"
                type="button"
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

const InputField = ({ label, name, value, handle }: any) => (
  <div className="space-y-2">
    <Label htmlFor={name}>{label} *</Label>
    <Input id={name} name={name} value={value} onChange={handle} required />
  </div>
);

const NumberField = ({ label, name, value, handle }: any) => (
  <div className="space-y-2">
    <Label htmlFor={name}>{label} *</Label>
    <Input
      id={name}
      name={name}
      type="number"
      value={value}
      onChange={handle}
      required
    />
  </div>
);

const SelectField = ({ label, name, value, options, handle }: any) => (
  <div className="space-y-2">
    <Label htmlFor={name}>{label} *</Label>
    <select
      id={name}
      name={name}
      value={value}
      onChange={handle}
      className="border h-10 rounded-md px-2"
      required
    >
      <option value="">Select {label}</option>
      {options.map((o:any) => (
        <option key={o.value}  value={o}>
          {o}
        </option>
      ))}
    </select>
  </div>
);

export default RegisterCustomer;
