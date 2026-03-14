"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useState } from "react";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface MonthlyData {
  month: string;   // "Jan 25"
  revenue: number;
  cost: number;
  profit: number;
  units: number;
}

export interface BrandData {
  brand: string;
  revenue: number;
  profit: number;
  units: number;
}

export interface StatusData {
  name: string;
  value: number;
  color: string;
}

interface Props {
  monthly: MonthlyData[];
  brands: BrandData[];
  statusBreakdown: StatusData[];
}

// ── Custom tooltip ─────────────────────────────────────────────────────────────

function DollarTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 shadow-xl text-xs">
      <p className="mb-1.5 font-medium text-zinc-300">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }} className="flex gap-3 justify-between">
          <span className="text-zinc-500">{p.name}</span>
          <span className="font-semibold">${Number(p.value).toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
}

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 shadow-xl text-xs">
      <p style={{ color: p.payload.color }} className="font-semibold">{p.name}</p>
      <p className="text-zinc-400">{p.value} items</p>
    </div>
  );
}

// ── Tab button ─────────────────────────────────────────────────────────────────

function Tab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={[
        "px-3 py-1.5 rounded-full text-[11px] font-medium uppercase tracking-[0.2em] transition-all duration-150",
        active
          ? "bg-zinc-100 text-black"
          : "text-zinc-500 hover:text-zinc-300",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function SalesCharts({ monthly, brands, statusBreakdown }: Props) {
  const [activeTab, setActiveTab] = useState<"revenue" | "brands" | "inventory">("revenue");

  const hasMonthly = monthly.length > 0;
  const hasBrands = brands.length > 0;

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5 space-y-5">
      {/* Header + tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-zinc-100">Analytics</h2>
          <p className="text-[11px] text-zinc-600 mt-0.5">Financial performance overview</p>
        </div>
        <div className="flex gap-1 rounded-full border border-zinc-800 bg-zinc-950 p-1">
          <Tab active={activeTab === "revenue"} onClick={() => setActiveTab("revenue")}>Revenue</Tab>
          <Tab active={activeTab === "brands"} onClick={() => setActiveTab("brands")}>By Brand</Tab>
          <Tab active={activeTab === "inventory"} onClick={() => setActiveTab("inventory")}>Inventory</Tab>
        </div>
      </div>

      {/* ── Revenue over time ── */}
      {activeTab === "revenue" && (
        <>
          {!hasMonthly ? (
            <EmptyState message="No sales data yet. Mark items as sold to see revenue trends." />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={monthly} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e4e4e7" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#e4e4e7" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#71717a", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#71717a", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                  width={44}
                />
                <Tooltip content={<DollarTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 11, color: "#71717a", paddingTop: 12 }}
                  iconType="circle"
                  iconSize={6}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#e4e4e7"
                  strokeWidth={1.5}
                  fill="url(#revGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: "#e4e4e7" }}
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  name="Profit"
                  stroke="#34d399"
                  strokeWidth={1.5}
                  fill="url(#profGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: "#34d399" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </>
      )}

      {/* ── Revenue by brand ── */}
      {activeTab === "brands" && (
        <>
          {!hasBrands ? (
            <EmptyState message="No sales data yet. Mark items as sold to see brand performance." />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={brands.slice(0, 8)}
                margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
                barCategoryGap="28%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis
                  dataKey="brand"
                  tick={{ fill: "#71717a", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#71717a", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                  width={44}
                />
                <Tooltip content={<DollarTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 11, color: "#71717a", paddingTop: 12 }}
                  iconType="circle"
                  iconSize={6}
                />
                <Bar dataKey="revenue" name="Revenue" fill="#3f3f46" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" name="Profit" fill="#34d399" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </>
      )}

      {/* ── Inventory status donut ── */}
      {activeTab === "inventory" && (
        <div className="flex flex-col items-center sm:flex-row sm:items-center sm:gap-8">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={statusBreakdown.filter((s) => s.value > 0)}
                cx="50%"
                cy="50%"
                innerRadius={68}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {statusBreakdown
                  .filter((s) => s.value > 0)
                  .map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="flex flex-row flex-wrap justify-center gap-x-5 gap-y-2 sm:flex-col sm:gap-y-3 pb-4 sm:pb-0">
            {statusBreakdown
              .filter((s) => s.value > 0)
              .map((s) => (
                <div key={s.name} className="flex items-center gap-2">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="text-xs text-zinc-400 capitalize">{s.name}</span>
                  <span className="text-xs font-semibold text-zinc-200 ml-auto pl-4">{s.value}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-[240px] items-center justify-center">
      <p className="text-sm text-zinc-600 text-center max-w-xs">{message}</p>
    </div>
  );
}
