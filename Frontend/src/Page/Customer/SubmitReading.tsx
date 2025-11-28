import { useState, useCallback, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Camera, Edit3, CheckCircle, History, Zap } from "lucide-react";
import {toast} from "sonner";
import Webcam from "react-webcam";
import { motion, AnimatePresence } from "framer-motion";
import { ReviewDialog } from "@/Components/Customer/ReviewDialog";
import { PaymentDialog } from "@/Components/Customer/PaymentDialog";

const SubmitReading = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [manualEntry, setManualEntry] = useState(false);
  const [readingValue, setReadingValue] = useState("");
  const [showReview, setShowReview] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [submissionMode, setSubmissionMode] = useState<"upload" | "manual">("upload");
  const webcamRef = useRef<Webcam>(null);


  const previousReading = "12589";
  const estimatedAmount = 35.10;

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
        simulateOCR();
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
        simulateOCR();
      };
      reader.readAsDataURL(file);
    }
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      setImagePreview(imageSrc);
      setShowWebcam(false);
      simulateOCR();
      toast({
        title: "Image captured",
        description: "Processing meter reading...",
      });
    }
  }, [webcamRef, toast]);

  const simulateOCR = () => {
    // Simulate OCR processing
    setTimeout(() => {
      const mockReading = String(Math.floor(Math.random() * 1000) + 12800);
      setReadingValue(mockReading);
      toast({
        title: "Reading detected",
        description: `Meter reading: ${mockReading} kWh`,
      });
    }, 1500);
  };

  const handleProceedToReview = () => {
    if (!readingValue) {
      toast({
        title: "Reading required",
        description: "Please provide a meter reading",
        variant: "destructive",
      });
      return;
    }
    setShowReview(true);
  };

  const handleConfirmReading = () => {
    setShowReview(false);
    setShowPayment(true);
    toast({
      title: "Reading submitted",
      description: "Your meter reading has been recorded",
    });
  };

  const handlePaymentComplete = () => {
    toast({
      title: "Payment successful",
      description: "Thank you for your payment!",
    });
    
    setSelectedFile(null);
    setImagePreview(null);
    setCapturedImage(null);
    setReadingValue("");
    setManualEntry(false);
    setSubmissionMode("upload");
  };

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
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Submit Meter Reading
          </h1>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
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
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Image
                </Button>
                <Button
                  variant={submissionMode === "manual" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => {
                    setSubmissionMode("manual");
                    setManualEntry(true);
                  }}
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Manual Entry
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
                      <div className="space-y-4">
                        <div className="relative rounded-xl overflow-hidden shadow-md">
                          <img
                            src={imagePreview}
                            alt="Meter reading"
                            className="w-full h-64 object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                          <Button
                            variant="secondary"
                            size="sm"
                            className="absolute top-3 right-3"
                            onClick={() => {
                              setImagePreview(null);
                              setSelectedFile(null);
                              setCapturedImage(null);
                              setReadingValue("");
                            }}
                          >
                            Change Image
                          </Button>
                        </div>
                      </div>
                    ) : showWebcam ? (
                      <div className="space-y-4">
                        <div className="relative rounded-xl overflow-hidden">
                          <Webcam
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            className="w-full h-64 object-cover"
                            videoConstraints={{
                              facingMode: "environment",
                            }}
                          />
                        </div>
                        <div className="flex gap-3">
                          <Button onClick={capture} className="flex-1 bg-gradient-primary">
                            <Camera className="w-4 h-4 mr-2" />
                            Capture Photo
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setShowWebcam(false)}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                          dragActive
                            ? "border-primary bg-primary/5 scale-[1.02]"
                            : "border-border bg-muted/30"
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                      >
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                            <Upload className="w-8 h-8 text-primary" />
                          </div>
                          <p className="text-lg font-medium text-foreground mb-2">
                            Drop your meter image here
                          </p>
                          <p className="text-sm text-muted-foreground mb-6">
                            or click to browse • JPG, PNG • Max 5MB
                          </p>
                          <input
                            type="file"
                            id="fileInput"
                            className="hidden"
                            accept="image/jpeg,image/png"
                            onChange={handleFileChange}
                          />
                          <div className="flex gap-3">
                            <label htmlFor="fileInput">
                              <Button type="button" variant="outline" asChild>
                                <span className="cursor-pointer">Browse Files</span>
                              </Button>
                            </label>
                            <Button variant="outline" onClick={() => setShowWebcam(true)}>
                              <Camera className="w-4 h-4 mr-2" />
                              Use Camera
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
                    className="space-y-4"
                  >
                    <Card className="p-6 bg-muted/30">
                      <Label htmlFor="reading" className="text-base font-semibold mb-3 block">
                        Enter Meter Reading
                      </Label>
                      <div className="flex gap-3 items-end">
                        <div className="flex-1">
                          <Input
                            id="reading"
                            type="number"
                            placeholder="Enter reading value"
                            value={readingValue}
                            onChange={(e) => setReadingValue(e.target.value)}
                            className="text-2xl font-mono h-14 text-center"
                          />
                        </div>
                        <div className="text-2xl font-semibold text-muted-foreground">
                          kWh
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-3 text-center">
                        Previous reading: <span className="font-mono font-semibold">{previousReading} kWh</span>
                      </p>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {readingValue && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-6"
                >
                  <Card className="p-4 bg-success/5 border-success/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-success" />
                        <div>
                          <p className="font-semibold text-foreground">Reading Confirmed</p>
                          <p className="text-sm text-muted-foreground">
                            {submissionMode === "upload" ? "Detected from image" : "Manually entered"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold font-mono">{readingValue}</p>
                        <p className="text-sm text-muted-foreground">kWh</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {readingValue && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  <Button
                    onClick={handleProceedToReview}
                    className="w-full h-12 text-lg bg-gradient-primary shadow-soft"
                  >
                    Review & Continue
                  </Button>
                </motion.div>
              )}
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
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
                  <span className="font-mono font-semibold">{previousReading} kWh</span>
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
                  <span className="text-primary mt-0.5">•</span>
                  <span>Take a clear, well-lit photo of your meter</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Ensure all digits are visible</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Submit readings monthly for accurate billing</span>
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

      <PaymentDialog
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
