import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { officerApi } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/BreadCrumb";
import {
  ArrowLeft,
  Download,
  ZoomIn,
  Calendar,
  Zap,
  DollarSign,
  CreditCard,
  AlertCircle,
} from "lucide-react";

const MeterReadingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: readings, isLoading, isError } = useQuery({
    queryKey: ["customer-detail", id],
    queryFn: () => officerApi.getAllMeterReadings(),
  });

  const reading = readings?.find((r) => r._id === id) || null;

  const handleDownload = () => {
    if (reading?.photo?.secure_url) {
      const link = document.createElement("a");
      link.href = reading.photo.secure_url;
      link.download = `meter-reading-${reading._id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleZoom = () => {
    if (reading?.photo?.secure_url) {
      window.open(reading.photo.secure_url, "_blank");
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 animate-pulse space-y-6">
        <div className="h-6 w-1/4 bg-gray-200 rounded"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-[500px] bg-gray-200 rounded"></div>
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-6 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !reading) {
    return (
      <div className="p-6 text-center space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/officer/meter-readings")}
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Readings
        </Button>

        <div className="space-y-4">
          <AlertCircle className="mx-auto w-16 h-16 text-red-500" />
          <h1 className="text-2xl font-bold">
            {isError ? "Error Loading Reading" : "Reading Not Found"}
          </h1>
          <p className="text-gray-500">
            {isError
              ? "There was an error loading the meter reading. Please try again."
              : "The specific meter reading you're looking for doesn't exist."}
          </p>
          <Button onClick={() => navigate("/officer/meter-readings")}>
            View All Readings
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <Breadcrumb
          items={[
            { label: "Meter Readings", href: "/officer/meter-readings" },
            { label: reading._id?.substring(0, 8) + "..." },
          ]}
        />
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {readings.findIndex((r) => r._id === reading._id) + 1} of{" "}
            {readings.length}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => navigate("/officer/meter-readings")}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to List
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Section */}
        <div className="space-y-4">
          <div className="border rounded-lg overflow-hidden bg-gray-50 relative group">
            <img
              src={reading.photo?.secure_url || "/placeholder-meter.jpg"}
              alt="Meter Reading"
              className="w-full h-auto max-h-[500px] object-contain cursor-zoom-in"
              onClick={handleZoom}
              onError={(e) => (e.currentTarget.src = "/placeholder-meter.jpg")}
            />

            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100 gap-2">
              <Button
                size="sm"
                onClick={handleZoom}
                className="bg-white/90 hover:bg-white"
              >
                <ZoomIn className="w-4 h-4 mr-1" /> Zoom
              </Button>
              <Button
                size="sm"
                onClick={handleDownload}
                className="bg-white/90 hover:bg-white"
              >
                <Download className="w-4 h-4 mr-1" /> Download
              </Button>
            </div>

            <div className="p-4 border-t text-sm text-gray-600">
              Uploaded on {reading.dateOfSubmission}
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">Meter Reading Details</h1>
              <p className="text-gray-500">ID: {reading._id}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge
                variant={
                  reading.anomalyStatus === "Normal"
                    ? "default"
                    : reading.anomalyStatus === "Anomaly"
                    ? "destructive"
                    : "secondary"
                }
                className="text-sm px-3 py-1"
              >
                {reading.anomalyStatus}
              </Badge>
              <Badge
                variant={reading.paymentStatus === "Paid" ? "default" : "destructive"}
                className="text-sm px-3 py-1"
              >
                {reading.paymentStatus}
              </Badge>
            </div>
          </div>

          {/* Usage Info */}
          <div className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Meter Reading</p>
                  <p className="text-3xl font-bold">
                    {reading.killowatRead || reading.kilowattRead || 0} kWh
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Monthly Usage</p>
                <p className="text-2xl font-semibold text-green-600">
                  {reading.monthlyUsage} kWh
                </p>
              </div>
            </div>
          </div>

          {/* Date & Payment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetailCard icon={Calendar} title="Date & Time">
              <p className="text-lg">{reading.dateOfSubmission}</p>
              <p className="text-sm text-gray-500 mt-1">
                Month: {reading.monthName || "Not specified"}
              </p>
            </DetailCard>

            <DetailCard icon={DollarSign} title="Payment">
              <div className="flex justify-between">
                <span className="text-gray-600">Fee Amount:</span>
                <span className="font-semibold text-lg">
                  {reading.fee?.toFixed(2) || "0.00"} Birr
                </span>
              </div>
            </DetailCard>
          </div>

          {/* System Info */}
          <DetailCard title="System Information">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Created At</p>
                <p className="font-medium">
                  {new Date(reading.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="font-medium">
                  {new Date(reading.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </DetailCard>

          {/* Notice for undefined month */}
          {reading.monthName?.includes("undefined") && (
            <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50 flex items-start gap-3">
              <CreditCard className="w-5 h-5 text-yellow-600 mt-1" />
              <div>
                <h4 className="font-semibold text-yellow-800">Notice</h4>
                <p className="text-yellow-700 text-sm mt-1">
                  This reading has an undefined month value. Please verify the month information.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Reusable card for details
const DetailCard = ({ icon: Icon, title, children }: any) => (
  <div className="border rounded-lg p-4">
    {Icon && (
      <div className="flex items-center gap-3 mb-3">
        <Icon className="w-5 h-5 text-gray-500" />
        <h3 className="font-semibold">{title}</h3>
      </div>
    )}
    {children}
  </div>
);

export default MeterReadingDetail;
