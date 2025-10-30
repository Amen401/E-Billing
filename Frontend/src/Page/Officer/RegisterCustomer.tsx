import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Search, Plus, Trash2, Eye, Upload, Signature, Contact, FileText, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Customer {
  _id?: string;
  name: string;
  region: string;
  serviceCenter: string;
  addressRegion: string;
  zone: string;
  woreda: string;
  town: string;
  purpose: string;
  powerApproved: number;
  killowat: number;
  applicableTarif: number;
  volt: number;
  depositBirr: number;
  accountNumber?: string;
  meterNumber?: string;
  contactInfo?: {
    phone: string;
    email: string;
    emergencyContact: string;
    alternativePhone: string;
  };
  signature?: string;
  agreedToTerms: boolean;
  createdAt?: string;
}

type RegistrationStep = 'basic' | 'contact' | 'signature' | 'agreement' | 'complete';

const RegisterCustomer = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('basic');
  const [signatureData, setSignatureData] = useState<string>("");
  
  const [formData, setFormData] = useState({
    // Basic Information
    name: "",
    region: "",
    serviceCenter: "",
    addressRegion: "",
    zone: "",
    woreda: "",
    town: "",
    purpose: "",
    powerApproved: "",
    killowat: "",
    applicableTarif: "",
    volt: "",
    depositBirr: "",
    
    // Contact Information
    phone: "",
    email: "",
    emergencyContact: "",
    alternativePhone: "",
    
    // Agreement
    agreedToTerms: false,
  });

  // Load customers from localStorage
  useEffect(() => {
    const savedCustomers = localStorage.getItem("customers");
    if (savedCustomers) {
      setCustomers(JSON.parse(savedCustomers));
    }
  }, []);

  // Save customers to localStorage
  useEffect(() => {
    localStorage.setItem("customers", JSON.stringify(customers));
  }, [customers]);

  const generateAccountNumber = () => {
    return `ACC-${Math.floor(10000 + Math.random() * 90000)}`;
  };

  const generateMeterNumber = () => {
    return `MET-${Math.floor(40000 + Math.random() * 10000)}`;
  };

  const handleBasicInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const requiredFields = [
      'name', 'region', 'serviceCenter', 'addressRegion', 
      'zone', 'woreda', 'town', 'purpose'
    ];
    
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    setCurrentStep('contact');
  };

  const handleContactInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.phone) {
      toast.error("Phone number is required");
      return;
    }

    setCurrentStep('signature');
  };

  const handleSignatureCapture = () => {
    // In a real app, you would use a signature capture library
    // For demo purposes, we'll simulate a signature
    const simulatedSignature = `data:image/svg+xml;base64,${btoa(`
      <svg width="300" height="100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="white"/>
        <path d="M20,50 Q100,20 180,50 T300,50" stroke="black" fill="none" stroke-width="2"/>
        <text x="150" y="80" text-anchor="middle" font-family="Arial" font-size="12" fill="#666">Customer Signature</text>
      </svg>
    `)}`;
    
    setSignatureData(simulatedSignature);
    toast.success("Signature captured successfully!");
    
    setTimeout(() => {
      setCurrentStep('agreement');
    }, 1000);
  };

  const handleAgreementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.agreedToTerms) {
      toast.error("You must agree to the terms and conditions");
      return;
    }

    // Final submission
    const newCustomer: Customer = {
      name: formData.name,
      region: formData.region,
      serviceCenter: formData.serviceCenter,
      addressRegion: formData.addressRegion,
      zone: formData.zone,
      woreda: formData.woreda,
      town: formData.town,
      purpose: formData.purpose,
      powerApproved: Number(formData.powerApproved) || 0,
      killowat: Number(formData.killowat) || 0,
      applicableTarif: Number(formData.applicableTarif) || 0,
      volt: Number(formData.volt) || 0,
      depositBirr: Number(formData.depositBirr) || 0,
      accountNumber: generateAccountNumber(),
      meterNumber: generateMeterNumber(),
      contactInfo: {
        phone: formData.phone,
        email: formData.email,
        emergencyContact: formData.emergencyContact,
        alternativePhone: formData.alternativePhone,
      },
      signature: signatureData,
      agreedToTerms: formData.agreedToTerms,
      createdAt: new Date().toISOString(),
    };

    setCustomers(prev => [newCustomer, ...prev]);
    setCurrentStep('complete');
    toast.success("Customer registered successfully!");
  };

  const handleClear = () => {
    setFormData({
      name: "",
      region: "",
      serviceCenter: "",
      addressRegion: "",
      zone: "",
      woreda: "",
      town: "",
      purpose: "",
      powerApproved: "",
      killowat: "",
      applicableTarif: "",
      volt: "",
      depositBirr: "",
      phone: "",
      email: "",
      emergencyContact: "",
      alternativePhone: "",
      agreedToTerms: false,
    });
    setSignatureData("");
    setCurrentStep('basic');
  };

  const startNewRegistration = () => {
    handleClear();
    setShowForm(true);
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(customer => customer._id !== id));
    toast.success("Customer deleted successfully!");
  };

  const viewCustomerDetails = (customer: Customer) => {
    toast.info(
      <div className="space-y-3 max-w-md">
        <h4 className="font-semibold text-lg">Customer Details</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><strong>Name:</strong> {customer.name}</div>
          <div><strong>Account:</strong> {customer.accountNumber}</div>
          <div><strong>Meter:</strong> {customer.meterNumber}</div>
          <div><strong>Phone:</strong> {customer.contactInfo?.phone}</div>
          <div><strong>Email:</strong> {customer.contactInfo?.email || 'N/A'}</div>
          <div><strong>Region:</strong> {customer.region}</div>
          <div><strong>Zone:</strong> {customer.zone}</div>
          <div><strong>Woreda:</strong> {customer.woreda}</div>
          <div><strong>Purpose:</strong> {customer.purpose}</div>
          <div><strong>Power:</strong> {customer.powerApproved} kW</div>
          <div><strong>Voltage:</strong> {customer.volt} V</div>
          <div><strong>Deposit:</strong> {customer.depositBirr} Birr</div>
        </div>
        {customer.signature && (
          <div className="mt-2">
            <strong>Signature:</strong> 
            <img src={customer.signature} alt="Signature" className="mt-1 border rounded" />
          </div>
        )}
      </div>,
      { duration: 15000 }
    );
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.accountNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.town.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stepConfig = {
    basic: { title: "Basic Information", icon: FileText },
    contact: { title: "Contact Information", icon: Contact },
    signature: { title: "Signature", icon: Signature },
    agreement: { title: "Agreement", icon: CheckCircle2 },
    complete: { title: "Registration Complete", icon: CheckCircle2 },
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {(['basic', 'contact', 'signature', 'agreement', 'complete'] as RegistrationStep[]).map((step, index) => {
        const StepIcon = stepConfig[step].icon;
        const isActive = step === currentStep;
        const isCompleted = 
          (step === 'basic' && currentStep !== 'basic') ||
          (step === 'contact' && ['signature', 'agreement', 'complete'].includes(currentStep)) ||
          (step === 'signature' && ['agreement', 'complete'].includes(currentStep)) ||
          (step === 'agreement' && currentStep === 'complete');
        
        return (
          <div key={step} className="flex items-center">
            <div className={`flex flex-col items-center ${isCompleted ? 'text-green-600' : isActive ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                isCompleted ? 'bg-green-600 border-green-600 text-white' : 
                isActive ? 'border-blue-600 bg-blue-50 text-blue-600' : 
                'border-gray-300 bg-white'
              }`}>
                {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <StepIcon className="h-5 w-5" />}
              </div>
              <span className="text-xs mt-2 font-medium">{stepConfig[step].title}</span>
            </div>
            {index < 4 && (
              <div className={`w-16 h-1 mx-2 ${isCompleted ? 'bg-green-600' : 'bg-gray-300'}`} />
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/officer/dashboard")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">Customer Management</h1>
          <p className="text-muted-foreground mt-1">
            Register new customers and manage existing customer accounts.
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {showForm ? "View Customers" : "Register Customer"}
        </Button>
      </div>

      {showForm ? (
        /* Multi-step Registration Form */
        <Card>
          <CardHeader>
            <CardTitle>Register New Customer</CardTitle>
            <CardDescription>
              {currentStep === 'basic' && "Fill in the basic customer information to get started."}
              {currentStep === 'contact' && "Provide contact information for the customer."}
              {currentStep === 'signature' && "Capture the customer's signature."}
              {currentStep === 'agreement' && "Review and agree to the terms and conditions."}
              {currentStep === 'complete' && "Customer registration completed successfully!"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderStepIndicator()}

            {currentStep === 'basic' && (
              <form onSubmit={handleBasicInfoSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information Fields */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
                    <Input
                      id="name"
                      placeholder="Enter customer's full name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="purpose">Purpose <span className="text-destructive">*</span></Label>
                    <Input
                      id="purpose"
                      placeholder="e.g., Residential, Commercial"
                      value={formData.purpose}
                      onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="region">Region <span className="text-destructive">*</span></Label>
                    <Input
                      id="region"
                      placeholder="e.g., Addis Ababa, Oromia"
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="serviceCenter">Service Center <span className="text-destructive">*</span></Label>
                    <Input
                      id="serviceCenter"
                      placeholder="Service center name"
                      value={formData.serviceCenter}
                      onChange={(e) => setFormData({ ...formData, serviceCenter: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="addressRegion">Address Region <span className="text-destructive">*</span></Label>
                    <Input
                      id="addressRegion"
                      placeholder="Address region"
                      value={formData.addressRegion}
                      onChange={(e) => setFormData({ ...formData, addressRegion: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zone">Zone <span className="text-destructive">*</span></Label>
                    <Input
                      id="zone"
                      placeholder="Zone"
                      value={formData.zone}
                      onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="woreda">Woreda <span className="text-destructive">*</span></Label>
                    <Input
                      id="woreda"
                      placeholder="Woreda"
                      value={formData.woreda}
                      onChange={(e) => setFormData({ ...formData, woreda: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="town">Town/City <span className="text-destructive">*</span></Label>
                    <Input
                      id="town"
                      placeholder="Town or city"
                      value={formData.town}
                      onChange={(e) => setFormData({ ...formData, town: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="powerApproved">Power Approved (kW) <span className="text-destructive">*</span></Label>
                    <Input
                      id="powerApproved"
                      type="number"
                      placeholder="Power in kW"
                      value={formData.powerApproved}
                      onChange={(e) => setFormData({ ...formData, powerApproved: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="killowat">Kilowatt (kW) <span className="text-destructive">*</span></Label>
                    <Input
                      id="killowat"
                      type="number"
                      placeholder="Kilowatt"
                      value={formData.killowat}
                      onChange={(e) => setFormData({ ...formData, killowat: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="applicableTarif">Applicable Tariff <span className="text-destructive">*</span></Label>
                    <Input
                      id="applicableTarif"
                      type="number"
                      placeholder="Tariff amount"
                      value={formData.applicableTarif}
                      onChange={(e) => setFormData({ ...formData, applicableTarif: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="volt">Voltage (V) <span className="text-destructive">*</span></Label>
                    <Input
                      id="volt"
                      type="number"
                      placeholder="Voltage in volts"
                      value={formData.volt}
                      onChange={(e) => setFormData({ ...formData, volt: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="depositBirr">Deposit (Birr) <span className="text-destructive">*</span></Label>
                    <Input
                      id="depositBirr"
                      type="number"
                      placeholder="Deposit amount in Birr"
                      value={formData.depositBirr}
                      onChange={(e) => setFormData({ ...formData, depositBirr: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" className="flex-1">
                    Continue to Contact Information
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClear}
                    className="flex-1"
                  >
                    Clear Form
                  </Button>
                </div>
              </form>
            )}

            {currentStep === 'contact' && (
              <form onSubmit={handleContactInfoSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number <span className="text-destructive">*</span></Label>
                    <Input
                      id="phone"
                      placeholder="+251 XXX XXX XXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="customer@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact">Emergency Contact</Label>
                    <Input
                      id="emergencyContact"
                      placeholder="Emergency contact person"
                      value={formData.emergencyContact}
                      onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="alternativePhone">Alternative Phone</Label>
                    <Input
                      id="alternativePhone"
                      placeholder="Alternative phone number"
                      value={formData.alternativePhone}
                      onChange={(e) => setFormData({ ...formData, alternativePhone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={() => setCurrentStep('basic')}>
                    Back
                  </Button>
                  <Button type="submit" className="flex-1">
                    Continue to Signature
                  </Button>
                </div>
              </form>
            )}

            {currentStep === 'signature' && (
              <div className="space-y-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Signature className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Customer Signature</h3>
                  <p className="text-muted-foreground mb-4">
                    Capture the customer's signature using a signature pad or upload a signature image.
                  </p>
                  
                  {signatureData ? (
                    <div className="space-y-4">
                      <img src={signatureData} alt="Captured Signature" className="mx-auto border rounded" />
                      <p className="text-green-600 font-medium">Signature captured successfully!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-gray-100 rounded-lg p-4 min-h-[200px] flex items-center justify-center">
                        <p className="text-gray-500">Signature area will appear here</p>
                      </div>
                      <div className="flex gap-4 justify-center">
                        <Button onClick={handleSignatureCapture} className="flex items-center gap-2">
                          <Upload className="h-4 w-4" />
                          Capture Signature
                        </Button>
                        <Button variant="outline" className="flex items-center gap-2">
                          <Upload className="h-4 w-4" />
                          Upload Signature
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setCurrentStep('contact')}>
                    Back
                  </Button>
                  <Button 
                    onClick={() => setCurrentStep('agreement')} 
                    disabled={!signatureData}
                    className="flex-1"
                  >
                    Continue to Agreement
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 'agreement' && (
              <form onSubmit={handleAgreementSubmit} className="space-y-6">
                <div className="border rounded-lg p-6 max-h-60 overflow-y-auto">
                  <h4 className="font-semibold mb-4">Terms and Conditions</h4>
                  <div className="space-y-4 text-sm text-muted-foreground">
                    <p>
                      By agreeing to these terms, the customer acknowledges and accepts the following:
                    </p>
                    <ul className="list-disc list-inside space-y-2">
                      <li>All provided information is accurate and complete</li>
                      <li>Agree to pay electricity bills on time as per the applicable tariff</li>
                      <li>Understand that late payments may incur penalties</li>
                      <li>Agree to maintain the meter and electrical installations properly</li>
                      <li>Accept responsibility for any damages caused by negligence</li>
                      <li>Consent to periodic inspections by utility personnel</li>
                      <li>Understand that service may be disconnected for non-payment</li>
                    </ul>
                    <p>
                      The utility company reserves the right to modify terms with prior notice. 
                      The customer may terminate service by providing written notice and settling all outstanding balances.
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="agreement"
                    checked={formData.agreedToTerms}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, agreedToTerms: checked as boolean })
                    }
                  />
                  <Label htmlFor="agreement" className="text-sm">
                    I have read and agree to the terms and conditions
                  </Label>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setCurrentStep('signature')}>
                    Back
                  </Button>
                  <Button type="submit" disabled={!formData.agreedToTerms} className="flex-1">
                    Complete Registration
                  </Button>
                </div>
              </form>
            )}

            {currentStep === 'complete' && (
              <div className="text-center space-y-6 py-8">
                <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto" />
                <div>
                  <h3 className="text-2xl font-bold text-green-600 mb-2">
                    Registration Successful!
                  </h3>
                  <p className="text-muted-foreground">
                    The customer has been successfully registered in the system.
                  </p>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-md mx-auto">
                  <h4 className="font-semibold mb-4">Customer Details</h4>
                  <div className="space-y-2 text-left">
                    <div className="flex justify-between">
                      <span>Account Number:</span>
                      <strong>{customers[0]?.accountNumber}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Meter Number:</span>
                      <strong>{customers[0]?.meterNumber}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Customer Name:</span>
                      <strong>{customers[0]?.name}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 justify-center">
                  <Button onClick={startNewRegistration} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Register Another Customer
                  </Button>
                  <Button variant="outline" onClick={() => setShowForm(false)}>
                    View All Customers
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Customers List Table */
        <Card>
          <CardHeader>
            <CardTitle>Registered Customers</CardTitle>
            <CardDescription>
              Manage and view all registered customers. Total: {customers.length} customers
            </CardDescription>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search customers by name, account number, region, or town..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {customers.length === 0 ? "No customers registered yet." : "No customers found matching your search."}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account Number</TableHead>
                      <TableHead>Customer Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead>Town</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Power (kW)</TableHead>
                      <TableHead>Deposit (Birr)</TableHead>
                      <TableHead>Signature</TableHead>
                      <TableHead>Date Registered</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer) => (
                      <TableRow key={customer._id}>
                        <TableCell className="font-mono font-medium">
                          {customer.accountNumber}
                        </TableCell>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{customer.contactInfo?.phone}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{customer.region}</Badge>
                        </TableCell>
                        <TableCell>{customer.town}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{customer.purpose}</Badge>
                        </TableCell>
                        <TableCell>{customer.powerApproved} kW</TableCell>
                        <TableCell>{customer.depositBirr.toLocaleString()} Birr</TableCell>
                        <TableCell>
                          {customer.signature ? (
                            <Badge variant="default" className="bg-green-600">Signed</Badge>
                          ) : (
                            <Badge variant="outline">No Signature</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => viewCustomerDetails(customer)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => customer._id && deleteCustomer(customer._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RegisterCustomer;