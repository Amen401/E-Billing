import { useEffect, useState } from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarCheck, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/Components/ui/calendar";
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


const SchedulePayment = () => {
  const [yearAndMonth, setYearAndMonth] = useState("");
  const [yearMonthOpen, setYearMonthOpen] = useState(false);
  const [startDate, setStartDate] = useState<EthiopianDate | null>(null);
  const [endDate, setEndDate] = useState<EthiopianDate | null>(null);
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);

  const [gYearMonth, setGYearMonth] = useState<Date | undefined>(undefined);
  const [schedule, setSchedule] = useState<any[]>([]);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await officerApi.getSchedule();
        setSchedule(Array.isArray(res) ? res : []);
      } catch (error) {
        console.log(error);
      }
    };
    fetchSchedule();
  }, []);

 const handleCreateSchedule = async () => {
  if (!yearAndMonth || !startDate || !endDate) {
    alert("Please fill all fields");
    return;
  }

  try {
    const res = await officerApi.createSchedule({
      yearAndMonth,
      normalPaymentStartDate: `${startDate.day}/${startDate.month}/${startDate.year}`,
      normalPaymentEndDate: `${endDate.day}/${endDate.month}/${endDate.year}`,
    });

    setSchedule(Array.isArray(res) ? res : []);
  } catch (error) {
    console.log(error);
  }
};


  const handleClose = async (id: string) => {
    try {
      await officerApi.closeSchedule(id);

      const res = await officerApi.getSchedule();
      setSchedule(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log(err);
    }
  };
  const formatEthiopianDate = (date: EthiopianDate | null) => {
    if (!date) return "";
    return `${date.day}/${date.month}/${date.year}`;
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-primary" />
            <CardTitle>Schedule Payment</CardTitle>
          </div>
          <CardDescription>
            Set up a payment schedule for the customer
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-end md:gap-6 gap-4">
          <div className="flex flex-col gap-1 w-full md:w-auto">
            <label className="text-sm font-medium">
              Year & Month (Ethiopian)
            </label>
            <Popover open={yearMonthOpen} onOpenChange={setYearMonthOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full md:w-[250px] flex justify-between"
                >
                  {yearAndMonth || "Select Year & Month"}
                  <CalendarIcon className="h-4 w-4 opacity-60" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="p-0">
               <EthiopianCalendarDropdown
                  selectedDate={yearAndMonth ? { year: parseInt(yearAndMonth.split('/')[1]), month: parseInt(yearAndMonth.split('/')[0]), day: 1 } : null}
                  onSelect={(date: EthiopianDate) => {
                    setYearAndMonth(`${date.month}/${date.year}`);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex flex-col gap-1 w-full md:w-auto">
            <label className="text-sm font-medium">
              Start Date (Ethiopian)
            </label>
            <Popover open={startOpen} onOpenChange={setStartOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full md:w-[250px] flex justify-between"
                >
                  {startDate
                    ? formatEthiopianDate(startDate)
                    : "Select Start Date"}
                  <CalendarIcon className="h-4 w-4 opacity-60" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="p-0">
                <EthiopianCalendarDropdown
                  selectedDate={startDate}
                  onSelect={(date: EthiopianDate) => {
                    setStartDate(date);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex flex-col gap-1 w-full md:w-auto">
            <label className="text-sm font-medium">End Date (Ethiopian)</label>
            <Popover open={endOpen} onOpenChange={setEndOpen}>
              <PopoverTrigger asChild>
               <Button
                  variant="outline"
                  className="w-full md:w-[250px] flex justify-between"
                >
                  {endDate
                    ? formatEthiopianDate(endDate)
                    : "Select End Date"}
                  <CalendarIcon className="h-4 w-4 opacity-60" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="p-0">
                 <EthiopianCalendarDropdown
                  selectedDate={endDate}
                  onSelect={(date: EthiopianDate) => {
                    setEndDate(date);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          <Button
            className="w-full md:w-[200px]"
            onClick={handleCreateSchedule}
          >
            Create Schedule
          </Button>
        </div>
      </Card>

      <Card className="p-4 overflow-x-auto">
        <Table className="min-w-[600px] md:min-w-full">
          <TableHeader>
            <TableRow>
              <TableHead>Starting Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {schedule.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.normalPaymentStartDate}</TableCell>
                <TableCell>{item.normalPaymentEndDate}</TableCell>
                <TableCell>{item.isOpen ? "Open" : "Closed"}</TableCell>
                <TableCell>
                  {!item.isOpen ? (
                    <p>No Action Available</p>
                  ) : (
                    <Button
                      variant="destructive"
                      size="sm"
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
