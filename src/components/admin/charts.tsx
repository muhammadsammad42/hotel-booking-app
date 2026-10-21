"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { formatPrice } from "@/lib/format";

export type MonthPoint = { key: string; label: string; value: number };

const axis = { stroke: "var(--border)", tick: { fill: "var(--muted-foreground)", fontSize: 12 }, tickLine: false } as const;

const compactMoney = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 }).format(cents / 100);

function ChartTooltip({ active, payload, format }: { active?: boolean; payload?: { payload: MonthPoint }[]; format: (value: number) => string }) {
  const point = payload?.[0]?.payload;
  if (!active || !point) return null;
  const [year, month] = point.key.split("-");
  const label = new Date(Date.UTC(Number(year), Number(month) - 1, 1)).toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-overlay">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold tabular-nums">{format(point.value)}</p>
    </div>
  );
}

/** The same numbers as a table, for screen readers and anyone who prefers it. */
function DataTable({ data, caption, format }: { data: MonthPoint[]; caption: string; format: (value: number) => string }) {
  return (
    <table className="sr-only">
      <caption>{caption}</caption>
      <thead>
        <tr>
          <th scope="col">Month</th>
          <th scope="col">Value</th>
        </tr>
      </thead>
      <tbody>
        {data.map((point) => (
          <tr key={point.key}>
            <th scope="row">{point.key}</th>
            <td>{format(point.value)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Payments received per month, as an area chart in the brand colour. */
export function RevenueChart({ data }: { data: MonthPoint[] }) {
  return (
    <figure className="m-0">
      <div className="h-64 w-full" aria-hidden>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="revenue-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.28} />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="0" strokeOpacity={0.7} />
            <XAxis dataKey="label" {...axis} axisLine={false} dy={6} interval="preserveStartEnd" />
            <YAxis {...axis} axisLine={false} width={56} tickFormatter={compactMoney} />
            <Tooltip cursor={{ stroke: "var(--input)", strokeWidth: 1 }} content={<ChartTooltip format={(value) => formatPrice(value)} />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--primary)"
              strokeWidth={2}
              fill="url(#revenue-fill)"
              activeDot={{ r: 5, fill: "var(--primary)", stroke: "var(--card)", strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <DataTable data={data} caption="Revenue received per month" format={(value) => formatPrice(value)} />
    </figure>
  );
}

/** Bookings made per month, as thin bars rounded at the top. */
export function BookingsChart({ data }: { data: MonthPoint[] }) {
  return (
    <figure className="m-0">
      <div className="h-64 w-full" aria-hidden>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barCategoryGap="28%">
            <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.7} />
            <XAxis dataKey="label" {...axis} axisLine={false} dy={6} interval="preserveStartEnd" />
            <YAxis {...axis} axisLine={false} width={40} allowDecimals={false} />
            <Tooltip cursor={{ fill: "var(--accent)" }} content={<ChartTooltip format={(value) => `${value} ${value === 1 ? "booking" : "bookings"}`} />} />
            <Bar dataKey="value" fill="var(--secondary)" radius={[4, 4, 0, 0]} maxBarSize={28} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <DataTable data={data} caption="Bookings made per month" format={String} />
    </figure>
  );
}
