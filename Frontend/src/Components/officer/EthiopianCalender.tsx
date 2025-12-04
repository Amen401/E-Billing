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
    <div className="p-4 border rounded bg-white shadow-md">
      <div className="flex gap-2 mb-4">
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="border p-1 rounded"
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
          className="border p-1 rounded"
        >
          {Array.from({ length: 20 }, (_, i) => 2010 + i).map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => (
          <button
            key={day}
            className="p-2 hover:bg-gray-200 rounded"
            onClick={() => onSelect({ year, month, day })}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EthiopianCalendarDropdown;
