import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Camera, Edit3, CheckCircle, History, Zap, TrendingUp, Calendar, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import Webcam from "react-webcam";
import { motion, AnimatePresence } from "framer-motion";
import { ReviewDialog } from "@/components/Customer/ReviewDialog";
import { EthiopianPaymentDialog } from "@/Components/Customer/PaymentDialog";
import { customerApi } from "@/lib/api";

interface MeterReadingResult {
  meterReadingresult: {
    photo: {
      secure_url: string;
      public_id: string;
    };
    paymentStatus: string;
    fee: number;
    _id: string;
    killowatRead: number;
    monthlyUsage: number;
    anomalyStatus: string;
    dateOfSubmission: string;
    paymentMonth: string;
    customerId: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  message: string;
}

const SubmitReading = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [manualEntry, setManualEntry] = useState(false);
  const [readingValue, setReadingValue] = useState<string>("");
  const [submissionMode, setSubmissionMode] = useState<"upload" | "manual">(
    "upload"
  );
  const [showWebcam, setShowWebcam] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<MeterReadingResult | null>(null);

  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const previousReading = "12589";
  const estimatedAmount = 35.1;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setSelectedFile(file);
    setCapturedImage(null);

    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const capture = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return toast.error("Failed to capture image");

    setCapturedImage(imageSrc);
    setSelectedFile(null);
    setImagePreview(imageSrc);
    setShowWebcam(false);
  };

  const submitToBackend = async () => {
    if (!selectedFile && !capturedImage && !readingValue) {
      toast.error("Please provide a reading or an image");
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();

      if (selectedFile) {
        formData.append("image", selectedFile);
      }
      else if (capturedImage) {
        const res = await fetch(capturedImage);
        const blob = await res.blob();

        if (blob.size === 0) {
          toast.error("Captured image is empty. Please try again.");
          setIsProcessing(false);
          return;
        }

        const file = new File([blob], "meter.jpg", { type: "image/jpeg" });
        formData.append("image", file);
      }

      if (manualEntry && readingValue) {
        formData.append("readingValue", readingValue);
      }

      const response = await customerApi.submitMeterReading(formData);
      console.log(response);
      
      setSubmissionResult(response);
      toast.success("Meter reading submitted successfully!");

    } catch (error: any) {
      console.error("Submission error:", error);
      toast.error(error?.response?.data?.message || "Failed to submit reading");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProceedToReview = () => {
    if (manualEntry && !readingValue)
      return toast.error("Please enter a reading value");
    setShowReview(true);
  };

  const handleConfirmReading = () => {
    setShowReview(false);
    submitToBackend();
  };

  const handlePaymentComplete = () => {
    toast.success("Payment completed!");
    setShowPayment(false);
  };

  const handleNewSubmission = () => {
    setSubmissionResult(null);
    setSelectedFile(null);
    setCapturedImage(null);
    setImagePreview(null);
    setReadingValue("");
    setManualEntry(false);
    setSubmissionMode("upload");
  };

  if (submissionResult) {
    const result = submissionResult.meterReadingresult;
    const isAnomalyDetected = result.anomalyStatus !== "Normal";

    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container max-w-2xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full mb-4 shadow-lg">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-xl font-bold mb-2">Reading Submitted!</h1>
            <p className="text-muted-foreground">{submissionResult.message}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 shadow-xl">
              {result.photo?.secure_url && (
                <div className="mb-6 rounded-xl overflow-hidden border-2 border-border">
                  <img
                    src={result.photo.secure_url}
                    alt="Submitted meter reading"
                    className="w-full h-[420px] object-contain bg-black/80"
                  />
                </div>
              )}

              <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-8 rounded-2xl mb-6 text-center">
                <p className="text-sm text-muted-foreground mb-2 uppercase tracking-wide">
                  Current Reading
                </p>
                <p className="text-2xl font-bold font-mono text-primary mb-1">
                  {result.killowatRead.toLocaleString('en-US',{useGrouping:false})}
                </p>
                <p className="text-lg text-muted-foreground font-medium">kWh</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <Card className="p-5 bg-muted/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly Usage</p>
                      <p className="text-2xl font-bold font-mono">
                        {result.monthlyUsage} <span className="text-sm font-normal">kWh</span>
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-5 bg-muted/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Fee Amount</p>
                      <p className="text-2xl font-bold">
                        {result.fee.toFixed(2)}birr
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

           
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    Submission Date
                  </span>
                  <span className="font-mono font-semibold">{result.dateOfSubmission}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                  <span className="text-sm font-medium">Payment Status</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    result.paymentStatus === "Paid" 
                      ? "bg-green-500/10 text-green-700" 
                      : "bg-amber-500/10 text-amber-700"
                  }`}>
                    {result.paymentStatus}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                  <span className="text-sm font-medium flex items-center gap-2">
                    {isAnomalyDetected && <AlertCircle className="w-4 h-4 text-amber-600" />}
                    Anomaly Status
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    isAnomalyDetected
                      ? "bg-amber-500/10 text-amber-700" 
                      : "bg-green-500/10 text-green-700"
                  }`}>
                    {result.anomalyStatus}
                  </span>
                </div>
              </div>

         
              <div className="flex gap-3">
                {result.paymentStatus !== "Paid" && (
                  <Button
                    onClick={() => setShowPayment(true)}
                    className="flex-1 h-12 text-lg bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                  >
                    Pay {result.fee.toFixed(2)} birr
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={handleNewSubmission}
                  className="flex-1 h-12 text-lg"
                >
                  Submit New Reading
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>

        <EthiopianPaymentDialog
          open={showPayment}
          onOpenChange={setShowPayment}
          amount={result.fee}
          readingValue={result.killowatRead.toString()}
          onPaymentComplete={handlePaymentComplete}
        />
      </div>
    );
  }

 
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container max-w-5xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl mb-4 shadow-soft">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Submit Meter Reading</h1>
          <p className="text-muted-foreground">
            Upload or manually enter your electricity meter reading
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <Card className="p-6 shadow-card">
              <div className="flex gap-3 mb-6">
                <Button
                  variant={submissionMode === "upload" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => {
                    setSubmissionMode("upload");
                    setManualEntry(false);
                  }}
                >
                  <Upload className="w-4 h-4 mr-2" /> Upload Image
                </Button>
              </div>

              <AnimatePresence mode="wait">
                {submissionMode === "upload" ? (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    {imagePreview ? (
                      <>
                        <div className="relative rounded-2xl overflow-hidden shadow-xl border bg-background">
                          <img
                            src={imagePreview}
                            alt="Meter reading"
                            className="w-full h-[420px] object-contain bg-black/80"
                          />

                          {isProcessing && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <div className="text-white text-center">
                                <div className="animate-spin w-10 h-10 border-4 border-white border-t-transparent rounded-full mx-auto mb-3" />
                                <p className="text-lg">Processing...</p>
                              </div>
                            </div>
                          )}

                          <Button
                            variant="secondary"
                            size="sm"
                            className="absolute top-4 right-4 shadow-lg"
                            onClick={() => {
                              setImagePreview(null);
                              setSelectedFile(null);
                              setCapturedImage(null);
                            }}
                          >
                            Change Image
                          </Button>
                        </div>
                      </>
                    ) : showWebcam ? (
                      <div className="space-y-4">
                        <Webcam
                          ref={webcamRef}
                          screenshotFormat="image/jpeg"
                          className="w-full h-64 object-cover rounded-xl"
                          videoConstraints={{ facingMode: "environment" }}
                        />
                        <div className="flex gap-3">
                          <Button onClick={capture} className="flex-1">
                            <Camera className="w-4 h-4 mr-2" /> Capture
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => setShowWebcam(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed rounded-xl p-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-16 h-16 bg-primary/10 flex items-center justify-center rounded-full mb-4">
                            <Upload className="w-8 h-8 text-primary" />
                          </div>
                          <p className="text-lg font-medium mb-2">
                            Drop your meter image here
                          </p>
                          <p className="text-sm text-muted-foreground mb-6">
                            or click to browse • JPG, PNG • Max 5MB
                          </p>
                          <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/jpeg,image/png"
                            onChange={handleFileChange}
                          />
                          <div className="flex gap-3">
                            <Button
                              variant="outline"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              Browse Files
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setShowWebcam(true)}
                            >
                              <Camera className="w-4 h-4 mr-2" /> Use Camera
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="manual"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Card className="p-6 bg-muted/30">
                      <Label
                        htmlFor="reading"
                        className="text-base font-semibold mb-3 block"
                      >
                        Enter Meter Reading
                      </Label>
                      <div className="flex gap-3 items-end">
                        <Input
                          id="reading"
                          type="number"
                          placeholder="Enter reading value"
                          value={readingValue}
                          onChange={(e) => setReadingValue(e.target.value)}
                          className="text-2xl font-mono h-14 text-center flex-1"
                        />
                        <div className="text-2xl font-semibold text-muted-foreground">
                          kWh
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-3 text-center">
                        Previous reading:{" "}
                        <span className="font-mono font-semibold ml-1">
                          {previousReading} kWh
                        </span>
                      </p>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {(selectedFile || capturedImage || readingValue) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 flex gap-3"
                >
                  <Button
                    onClick={handleProceedToReview}
                    className="flex-1 h-12 text-lg bg-gradient-primary"
                  >
                    Review
                  </Button>
                  <Button
                    onClick={submitToBackend}
                    className="flex-1 h-12 text-lg bg-black bg-success/70 text-white"
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Sending..." : "Send Reading"}
                  </Button>
                </motion.div>
              )}
            </Card>
          </motion.div>

        
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <Card className="p-5 shadow-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>
                <h3 className="font-semibold">Last Reading</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Reading</span>
                  <span className="font-mono font-semibold">
                    {previousReading} kWh
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Date</span>
                  <span className="font-medium">2024-03-28</span>
                </div>
              </div>
            </Card>

            <Card className="p-5 shadow-card bg-primary/5 border-primary/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <History className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold">Tips</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span> Take a clear,
                  well-lit photo of your meter
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span> Ensure all
                  digits are visible
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span> Submit readings
                  monthly for accurate billing
                </li>
              </ul>
            </Card>
          </motion.div>
        </div>
      </div>

      <ReviewDialog
        open={showReview}
        onOpenChange={setShowReview}
        readingValue={readingValue}
        previousReading={previousReading}
        imagePreview={imagePreview}
        onConfirm={handleConfirmReading}
      />

      <EthiopianPaymentDialog
        open={showPayment}
        onOpenChange={setShowPayment}
        amount={estimatedAmount}
        readingValue={readingValue}
        onPaymentComplete={handlePaymentComplete}
      />
    </div>
  );
};

export default SubmitReading;
