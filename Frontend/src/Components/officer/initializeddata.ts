import type { TariffData } from "@/Page/Types/type";


export const initialTariffData: TariffData = {
  tariffBlocks: [
    { id: 1, name: "1st block", range: "Up to 50kwh",  rate: 0.2730 },
    { id: 2, name: "2nd block", range: "Up to 100kwh",  rate: 0.7670 },
    { id: 3, name: "3rd block", range: "Up to 200kwh",  rate: 1.6250 },
    { id: 4, name: "4th block", range: "Up to 300kwh",  rate: 2.0000 },
    { id: 5, name: "5th block", range: "Up to 400kwh",  rate: 2.2000 },
    { id: 6, name: "6th block", range: "Up to 500kwh",  rate: 2.4050 },
    { id: 7, name: "7th block", range: "Above 500kwh",  rate: 2.4810 },
  ],
  domesticCharges: [
    { id: "dom-postpaid-50", category: "Domestic", type: "paid - Up to 50kwh", paidRate: 10.00,},
    { id: "dom-postpaid-above", category: "Domestic", type: "paid - Above 50kwh", paidRate: 42.00, },
  ],
  generalCharges: [
    { id: "gen-all", category: "General Tariff", type: "All Usage", paidRate: 54.00},
  ],
  industryCharges: [
    { id: "ind-3phase", category: "Industry Tariff", type: "Three Phase", paidRate: 54.00, },
  ],
};
