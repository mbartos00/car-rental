"use client";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { CarType } from "@/types";
import { Cell, Label, Pie, PieChart } from "recharts";

type Props = {
  data: { carType: CarType; count: number }[];
};

const COLORS: Record<CarType, string> = {
  SEDAN: "var(--chart-1)",
  SUV: "var(--chart-2)",
  COUPE: "var(--chart-3)",
  CONVERTIBLE: "var(--chart-4)",
  HATCHBACK: "var(--chart-5)",
};

const CarTypeDonut = ({ data }: Props) => {
  const total = data.reduce((sum, entry) => sum + entry.count, 0);

  const config: ChartConfig = Object.fromEntries(
    data.map((entry) => [
      entry.carType,
      { label: entry.carType, color: COLORS[entry.carType] },
    ])
  );

  if (total === 0) {
    return (
      <p className="text-secondary-300 text-sm py-10 text-center">
        No reservations yet
      </p>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <ChartContainer config={config} className="aspect-square h-52">
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
          <Pie
            data={data}
            dataKey="count"
            nameKey="carType"
            innerRadius={60}
            strokeWidth={4}
          >
            {data.map((entry) => (
              <Cell key={entry.carType} fill={COLORS[entry.carType]} />
            ))}
            <Label
              content={({ viewBox }) => {
                if (!viewBox || !("cx" in viewBox)) return null;
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="fill-secondary-500 text-2xl font-bold"
                    >
                      {total}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy ?? 0) + 22}
                      className="fill-secondary-300 text-xs"
                    >
                      Rentals
                    </tspan>
                  </text>
                );
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>

      <ul className="flex-1 w-full space-y-2">
        {data.map((entry) => (
          <li
            key={entry.carType}
            className="flex items-center justify-between text-sm"
          >
            <span className="flex items-center gap-2 text-secondary-400">
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: COLORS[entry.carType] }}
              />
              {entry.carType}
            </span>
            <span className="font-semibold text-secondary-500">
              {entry.count}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CarTypeDonut;
