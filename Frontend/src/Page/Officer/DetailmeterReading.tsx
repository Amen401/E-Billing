import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { officerApi } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/BreadCrumb";

const MeterReadingDetail = () => {
  const { id: customerId } = useParams();
  const navigate = useNavigate();

  const { data: readings, isLoading } = useQuery({
    queryKey: ["meter-readings-by-customer", customerId],
    queryFn: async () => {
      const res = await officerApi.getMeterReadings();
      return res; 
    },
    enabled: !!customerId,
  });

  return (
    <div className="p-6 space-y-6">
      <Breadcrumb
        items={[
          { label: "Meter Readings", href: "/officer/meter-readings" },
          { label: "Details" },
        ]}
      />

      <h1 className="text-2xl font-bold">Meter Reading Details</h1>

      {!isLoading && (!readings || readings.length === 0) && (
        <div className="flex justify-center items-center h-40">
          <p className="text-lg font-medium">No meter readings found.</p>
        </div>
      )}


      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-64 h-64 bg-gray-200 rounded-md animate-pulse" />
          ))}
        </div>
      )}


      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {readings?.map((reading) => (
          <div
            key={reading._id}
            className="border rounded-md p-4 space-y-3 shadow"
          >
            <img
              src={reading?.photo?.secure_url}
              alt="Meter Reading"
              className="w-full h-48 object-cover border rounded-md"
            />

            <p>
              <strong>Reading:</strong> {reading.killowatRead} kWh
            </p>

            <p>
              <strong>Date:</strong> {reading.dateOfSubmission}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              <Badge
                variant={
                  reading.anomalyStatus === "Normal"
                    ? "default"
                    : reading.anomalyStatus === "Anomaly"
                    ? "destructive"
                    : "secondary"
                }
              >
                {reading.anomalyStatus}
              </Badge>
            </p>

            <p>
              <strong>Payment:</strong>{" "}
              <Badge
                variant={
                  reading.paymentStatus === "Paid"
                    ? "default"
                    : "destructive"
                }
              >
                {reading.paymentStatus}
              </Badge>
            </p>

            <div className="flex gap-2 mt-3">
              <Button
                onClick={async () => {
                  await officerApi.chnageMeterReadingStatus({ id: reading._id });;
                }}
                variant="outline"
              >
                Toggle Status
              </Button>

              <Button
                onClick={async () => {
                  await officerApi.updatePaymentStatus({ id: reading._id });

                }}
              >
                Toggle Payment
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MeterReadingDetail;
