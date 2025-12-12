import {
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

type ConsumptionPoint = {
  month: string;
  consumption: number;
  average?: number;
};

interface ConsumptionChartProps {
  data: ConsumptionPoint[];
  isLoading: boolean;
  isError: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-card">
        <p className="font-medium text-foreground mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value.toFixed(1)} kWh
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const ConsumptionChart = ({ data, isLoading, isError }: ConsumptionChartProps) => {
  if (isLoading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading chart data...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive font-medium">Failed to load chart data</p>
          <p className="text-muted-foreground text-sm mt-1">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">No usage data available</p>
          <p className="text-muted-foreground text-sm mt-1">Data will appear once meter readings are recorded</p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="consumptionGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="averageGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--chart-muted))" stopOpacity={0.2} />
            <stop offset="95%" stopColor="hsl(var(--chart-muted))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke="hsl(var(--border))" 
          vertical={false}
        />
        <XAxis
          dataKey="month"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          dy={10}
        />
        <YAxis 
          stroke="hsl(var(--muted-foreground))" 
          fontSize={12}
          tickLine={false}
          axisLine={false}
          dx={-10}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          verticalAlign="top" 
          height={36}
          iconType="circle"
          iconSize={8}
        />
        <Area
          type="monotone"
          dataKey="consumption"
          stroke="hsl(var(--primary))"
          strokeWidth={3}
          fill="url(#consumptionGradient)"
          name="Consumption (kWh)"
          dot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 2, stroke: "hsl(var(--card))" }}
          activeDot={{ r: 6, fill: "hsl(var(--primary))", strokeWidth: 2, stroke: "hsl(var(--card))" }}
        />
        {data.some(d => d.average !== undefined) && (
          <Area
            type="monotone"
            dataKey="average"
            stroke="hsl(var(--chart-muted))"
            strokeWidth={2}
            fill="url(#averageGradient)"
            strokeDasharray="5 5"
            name="Average Usage"
            dot={{ r: 3, fill: "hsl(var(--chart-muted))" }}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default ConsumptionChart;
