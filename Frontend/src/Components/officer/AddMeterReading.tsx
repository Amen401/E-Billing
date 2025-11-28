import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ImageCapture } from "@/Components/officer/ImageCapture";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, officerApi } from "@/lib/api";

interface MeterReadingForm {
  account_number: string;
  meter_number: string;
  reading_kwh: string;
  reading_date: string;
  image?: File | null;
}

const AddMeterReading = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<MeterReadingForm>({
    account_number: "",
    meter_number: "",
    reading_kwh: "",
    reading_date: new Date().toISOString().split("T")[0],
    image: null,
  });

  const [errors, setErrors] = useState<Partial<MeterReadingForm>>({});

  const createReadingMutation = useMutation({
    mutationFn: async (data: FormData) => {
   await officerApi.addMeterReading(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meter-readings"] });
      toast({
        title: "Success",
        description: "Meter reading has been recorded successfully.",
      });
      navigate("/officer/meter-readings");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to record meter reading.",
        variant: "destructive",
      });
    },
  });

  const validateForm = (): boolean => {
    const newErrors: Partial<MeterReadingForm> = {};

    if (!formData.account_number.trim()) {
      newErrors.account_number = "Account number is required";
    }

    if (!formData.meter_number.trim()) {
      newErrors.meter_number = "Meter number is required";
    }

    if (!formData.reading_kwh.trim()) {
      newErrors.reading_kwh = "Reading value is required";
    } else if (isNaN(Number(formData.reading_kwh)) || Number(formData.reading_kwh) < 0) {
      newErrors.reading_kwh = "Please enter a valid positive number";
    }

    if (!formData.reading_date) {
      newErrors.reading_date = "Reading date is required";
    }

    if (!formData.image) {
      toast({
        title: "Image Required",
        description: "Please capture or upload a meter image.",
        variant: "destructive",
      });
      return false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("account_number", formData.account_number);
    formDataToSend.append("meter_number", formData.meter_number);
    formDataToSend.append("reading_kwh", formData.reading_kwh);
    formDataToSend.append("reading_date", formData.reading_date);
    if (formData.image) {
      formDataToSend.append("image", formData.image);
    }

    createReadingMutation.mutate(formDataToSend);
  };

  const handleInputChange = (field: keyof MeterReadingForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 space-y-6">
      <div className="max-w-3xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/officer/meter-readings")}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Readings
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Add Meter Reading</h1>
          <p className="text-muted-foreground">Record a new water meter reading</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Meter Information</CardTitle>
              <CardDescription>Enter the meter details and current reading</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="account_number">
                    Account Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="account_number"
                    placeholder="e.g., ACC-2024-001"
                    value={formData.account_number}
                    onChange={(e) => handleInputChange("account_number", e.target.value)}
                    className={errors.account_number ? "border-destructive" : ""}
                  />
                  {errors.account_number && (
                    <p className="text-sm text-destructive">{errors.account_number}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meter_number">
                    Meter Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="meter_number"
                    placeholder="e.g., MTR-2024-001"
                    value={formData.meter_number}
                    onChange={(e) => handleInputChange("meter_number", e.target.value)}
                    className={errors.meter_number ? "border-destructive" : ""}
                  />
                  {errors.meter_number && (
                    <p className="text-sm text-destructive">{errors.meter_number}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reading_kwh">
                    Reading (kWh) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="reading_kwh"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 1250.50"
                    value={formData.reading_kwh}
                    onChange={(e) => handleInputChange("reading_kwh", e.target.value)}
                    className={errors.reading_kwh ? "border-destructive" : ""}
                  />
                  {errors.reading_kwh && (
                    <p className="text-sm text-destructive">{errors.reading_kwh}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reading_date">
                    Reading Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="reading_date"
                    type="date"
                    value={formData.reading_date}
                    onChange={(e) => handleInputChange("reading_date", e.target.value)}
                    className={errors.reading_date ? "border-destructive" : ""}
                    max={new Date().toISOString().split("T")[0]}
                  />
                  {errors.reading_date && (
                    <p className="text-sm text-destructive">{errors.reading_date}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                Meter Image <span className="text-destructive">*</span>
              </CardTitle>
              <CardDescription>
                Take a clear photo of the meter showing the reading
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageCapture
                onImageCapture={(file) =>
                  setFormData((prev) => ({ ...prev, image: file }))
                }
                currentImage={formData.image}
                onRemoveImage={() =>
                  setFormData((prev) => ({ ...prev, image: null }))
                }
              />
            </CardContent>
          </Card>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/officer/meter-readings")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createReadingMutation.isPending}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {createReadingMutation.isPending ? "Saving..." : "Save Reading"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMeterReading;
