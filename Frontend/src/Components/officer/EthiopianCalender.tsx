import { useState } from "react";

const ethiopianMonths = [
  "Meskerem",
  "Tikimt",
  "Hidar",
  "Tahsas",
  "Tir",
  "Yekatit",
  "Megabit",
  "Miyazya",
  "Ginbot",
  "Sene",
  "Hamle",
  "Nehase",
  "Pagume",
];

export interface EthiopianDate {
  year: number;
  month: number;
  day: number;
}

interface EthiopianCalendarDropdownProps {
  selectedDate: EthiopianDate | null;
  onSelect: (date: EthiopianDate) => void;
}

const EthiopianCalendarDropdown = ({
  selectedDate,
  onSelect,
}: EthiopianCalendarDropdownProps) => {
  const [year, setYear] = useState(2016);
  const [month, setMonth] = useState(1);

  const daysInMonth = month === 13 ? 5 : 30;
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto p-3 sm:p-4 bg-white border rounded-xl shadow-sm">
      {/* Month & Year Selectors */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="w-full sm:w-1/2 border rounded-lg px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {ethiopianMonths.map((m, i) => (
            <option key={i} value={i + 1}>
              {m}
            </option>
          ))}
        </select>

        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="w-full sm:w-1/2 border rounded-lg px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {Array.from({ length: 20 }, (_, i) => 2010 + i).map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {days.map((day) => {
          const isSelected =
            selectedDate?.day === day &&
            selectedDate?.month === month &&
            selectedDate?.year === year;

          return (
            <button
              key={day}
              onClick={() => onSelect({ year, month, day })}
              className={`
                aspect-square rounded-lg flex items-center justify-center
                text-sm sm:text-base
                transition
                ${
                  isSelected
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200 active:bg-gray-300"
                }
              `}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default EthiopianCalendarDropdown;
