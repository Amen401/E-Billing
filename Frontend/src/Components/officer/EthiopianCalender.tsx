import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/Components/ui/button";

export interface EthiopianDate {
  day: number;
  month: number;
  year: number;
}

const ETHIOPIAN_MONTHS = [
  "Meskerem", "Tikimt", "Hidar", "Tahsas", "Tir", "Yekatit",
  "Megabit", "Miazia", "Ginbot", "Sene", "Hamle", "Nehase", "Pagume"
];

interface Props {
  onSelect: (date: EthiopianDate) => void;
  showDays?: boolean;
}

export default function EthiopianCalendarDropdown({ onSelect, showDays = true }: Props) {
  const [year, setYear] = useState(2017);
  const [month, setMonth] = useState(1);
  const [view, setView] = useState<"month" | "day">("month");

  const daysInMonth = month === 13 ? 5 : 30;

  const handleMonthSelect = (m: number) => {
    setMonth(m);
    if (showDays) {
      setView("day");
    } else {
      onSelect({ day: 1, month: m, year });
    }
  };

  const handleDaySelect = (d: number) => {
    onSelect({ day: d, month, year });
  };

  return (
    <div className="p-3 bg-popover rounded-lg border shadow-lg min-w-[280px]">
      {/* Year Navigation */}
      <div className="flex items-center justify-between mb-3">
        <Button variant="ghost" size="icon" onClick={() => setYear(y => y - 1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="font-semibold text-foreground">{year} E.C.</span>
        <Button variant="ghost" size="icon" onClick={() => setYear(y => y + 1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {view === "month" ? (
        <div className="grid grid-cols-3 gap-2">
          {ETHIOPIAN_MONTHS.map((name, i) => (
            <Button
              key={name}
              variant={month === i + 1 ? "default" : "outline"}
              size="sm"
              className="text-xs"
              onClick={() => handleMonthSelect(i + 1)}
            >
              {name}
            </Button>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setView("month")}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              {ETHIOPIAN_MONTHS[month - 1]}
            </Button>
          </div>
          <div className="grid grid-cols-6 gap-1">
            {Array.from({ length: daysInMonth }, (_, i) => (
              <Button
                key={i}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-xs"
                onClick={() => handleDaySelect(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
