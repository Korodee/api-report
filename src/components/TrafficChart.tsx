import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { modulesByVolume, totals, type ModuleRow } from "../data";
import { fmtInt, fmtPct } from "../format";
import { useChartColors, useMediaQuery } from "../hooks";
import { ChartTooltip } from "./ChartTooltip";

type BarPoint = ModuleRow & { share: number };

const chartData: BarPoint[] = modulesByVolume.map((row) => ({
  ...row,
  share: (row.calls30d / totals.loggedRequests) * 100,
}));

function TrafficTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: BarPoint }>;
}) {
  if (!active || !payload?.[0]) return null;
  const row = payload[0].payload;
  return (
    <ChartTooltip
      title={row.label}
      rows={[
        { label: "Requests · 30d", value: fmtInt(row.calls30d) },
        { label: "Share of traffic", value: fmtPct(row.share) },
        { label: "Status", value: row.billable ? "Billable" : "Already free" },
      ]}
    />
  );
}

function formatAxis(value: number): string {
  if (value === 0) return "0";
  if (value >= 1000) return `${Math.round(value / 1000)}k`;
  return fmtInt(value);
}

export function TrafficChart() {
  const colors = useChartColors();
  const compact = useMediaQuery("(max-width: 720px)");
  const yWidth = compact ? 92 : 158;

  return (
    <div className="chart-frame chart-frame--bar">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{
            top: 4,
            right: compact ? 12 : 56,
            bottom: 8,
            left: 4,
          }}
          barSize={18}
        >
          <CartesianGrid
            stroke={colors.line}
            horizontal={false}
            strokeDasharray="0"
          />
          <XAxis
            type="number"
            tickFormatter={formatAxis}
            tick={{ fill: colors.muted, fontSize: 11 }}
            axisLine={{ stroke: colors.line }}
            tickLine={false}
            domain={[0, 200000]}
            ticks={
              compact
                ? [0, 100000, 200000]
                : [0, 50000, 100000, 150000, 200000]
            }
          />
          <YAxis
            type="category"
            dataKey={compact ? "chartLabel" : "label"}
            width={yWidth}
            tick={{ fill: colors.text, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            interval={0}
          />
          <Tooltip
            cursor={{ fill: "var(--hover)" }}
            content={<TrafficTooltip />}
            isAnimationActive={false}
          />
          <Bar dataKey="calls30d" isAnimationActive={false} radius={[0, 2, 2, 0]}>
            {chartData.map((row) => (
              <Cell
                key={row.id}
                fill={row.billable ? colors.accent : colors.accentMuted}
              />
            ))}
            {!compact ? (
              <LabelList
                dataKey="calls30d"
                position="right"
                formatter={(value: number) => fmtInt(value)}
                style={{ fill: colors.muted, fontSize: 11 }}
              />
            ) : null}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
