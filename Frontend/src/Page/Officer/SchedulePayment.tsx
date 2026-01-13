import { useEffect, useState } from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/Components/ui/card";
import { CalendarCheck, CalendarIcon } from "lucide-react";
import { Button } from "@/Components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/Components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/ui/table";
import { officerApi } from "@/lib/api";
import EthiopianCalendarDropdown from "@/Components/officer/EthiopianCalender";
import type { EthiopianDate } from "@/Components/officer/EthiopianCalender";
import { toast } from "sonner";

const SchedulePayment = () => {
  const [yearAndMonth, setYearAndMonth] = useState("");
  const [yearMonthOpen, setYearMonthOpen] = useState(false);
  const [startDate, setStartDate] = useState<EthiopianDate | null>(null);
  const [endDate, setEndDate] = useState<EthiopianDate | null>(null);
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);
  const [schedule, setSchedule] = useState<any[]>([]);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const res = await officerApi.getSchedule();
      setSchedule(Array.isArray(res) ? res : []);
    } catch {
      setSchedule([]);
    }
  };

  const isStartAfterEnd = (s: EthiopianDate, e: EthiopianDate) => {
    if (s.year !== e.year) return s.year > e.year;
    if (s.month !== e.month) return s.month > e.month;
    return s.day > e.day;
  };


const handleCreateSchedule = async () => {
  if (!yearAndMonth || !startDate || !endDate) return;

  if (isStartAfterEnd(startDate, endDate)) {
    toast.error("Start date must be before end date");
    return;
  }

  const payload = {
    yearAndMonth,
    normalPaymentStartDate: `${startDate.day}/${startDate.month}/${startDate.year}`,
    normalPaymentEndDate: `${endDate.day}/${endDate.month}/${endDate.year}`,
  };

  try {
    const res = await officerApi.createSchedule(payload);
    console.log("API Response:", res); // check what comes from backend

    // ✅ Show toast if backend returned a message
    if (res?.message) {
      toast.error(res.message);
      return; // stop further execution
    }

    // ✅ Success: schedule created
    if (res?._id) {
      setSchedule(prev => [res, ...prev]);
      setYearAndMonth("");
      setStartDate(null);
      setEndDate(null);
      toast.success("Schedule created successfully!");
    }
  } catch (err: any) {
  console.error("Create Schedule Error:", err);

  const errorMessage =
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    (typeof err?.response?.data === "string" ? err.response.data : null) ||
    err?.message ||
    "An unexpected error occurred";

  toast.error(errorMessage);
}

};


  const handleClose = async (id: string) => {
    const res = await officerApi.closeSchedule(id);
    setSchedule(prev =>
      prev.map(item =>
        item._id === id ? res || { ...item, isOpen: false } : item
      )
    );
  };

  return (
    <div className="space-y-6 p-3 sm:p-6">

      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-primary" />
            <CardTitle>Schedule Payment</CardTitle>
          </div>
          <CardDescription>
            Set up a payment schedule
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Form */}
      <Card className="p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Year & Month */}
          <Popover open={yearMonthOpen} onOpenChange={setYearMonthOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {yearAndMonth || "Year & Month"}
                <CalendarIcon className="h-4 w-4 opacity-60" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0">
              <EthiopianCalendarDropdown
                onSelect={d => {
                  setYearAndMonth(`${d.month}/${d.year}`);
                  setYearMonthOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>

          {/* Start */}
          <Popover open={startOpen} onOpenChange={setStartOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {startDate
                  ? `${startDate.day}/${startDate.month}/${startDate.year}`
                  : "Start Date"}
                <CalendarIcon className="h-4 w-4 opacity-60" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0">
              <EthiopianCalendarDropdown
                onSelect={d => {
                  setStartDate(d);
                  setStartOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>

          {/* End */}
          <Popover open={endOpen} onOpenChange={setEndOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {endDate
                  ? `${endDate.day}/${endDate.month}/${endDate.year}`
                  : "End Date"}
                <CalendarIcon className="h-4 w-4 opacity-60" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0">
              <EthiopianCalendarDropdown
                onSelect={d => {
                  setEndDate(d);
                  setEndOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>

          <Button
            className="w-full"
            disabled={!yearAndMonth || !startDate || !endDate}
            onClick={handleCreateSchedule}
          >
            Create Schedule
          </Button>
        </div>
      </Card>

      {/* 📱 MOBILE VIEW */}
      <div className="space-y-3 sm:hidden">
        {schedule.map(item => (
          <Card key={item._id} className="p-4 space-y-2">
            <div className="text-sm">
              <strong>Start:</strong> {item.normalPaymentStartDate}
            </div>
            <div className="text-sm">
              <strong>End:</strong> {item.normalPaymentEndDate}
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-xs px-2 py-1 rounded ${
                item.isOpen
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600"
              }`}>
                {item.isOpen ? "Open" : "Closed"}
              </span>

              {item.isOpen && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleClose(item._id)}
                >
                  Close
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* 🖥 DESKTOP TABLE */}
      <Card className="hidden sm:block p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Start</TableHead>
              <TableHead>End</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schedule.map(item => (
              <TableRow key={item._id}>
                <TableCell>{item.normalPaymentStartDate}</TableCell>
                <TableCell>{item.normalPaymentEndDate}</TableCell>
                <TableCell>
                  {item.isOpen ? "Open" : "Closed"}
                </TableCell>
                <TableCell className="text-right">
                  {item.isOpen && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleClose(item._id)}
                    >
                      Close
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

    </div>
  );
};

export default SchedulePayment;
