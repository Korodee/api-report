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
import type { TrafficRow } from "../data";
import { axisTicks, fmtInt, fmtPct, niceCeil } from "../format";
import { useChartColors, useMediaQuery } from "../hooks";
import { ChartTooltip } from "./ChartTooltip";

type BarPoint = TrafficRow & { share: number };

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
        { label: "Requests", value: fmtInt(row.calls) },
        { label: "Share of this chart", value: fmtPct(row.share) },
        {
          label: "Kind",
          value: row.kind === "helper" ? "Helper / polling" : "Chart payload",
        },
      ]}
    />
  );
}

function formatAxis(value: number): string {
  if (value === 0) return "0";
  if (value >= 1_000_000) return `${Math.round(value / 100_000) / 10}m`;
  if (value >= 1000) return `${Math.round(value / 1000)}k`;
  return fmtInt(value);
}

export function TrafficChart({
  rows,
  height = 300,
  colorBy = "kind",
}: {
  rows: TrafficRow[];
  height?: number;
  colorBy?: "kind" | "billable";
}) {
  const colors = useChartColors();
  const compact = useMediaQuery("(max-width: 720px)");
  const yWidth = compact ? 100 : 132;
  const total = rows.reduce((sum, row) => sum + row.calls, 0) || 1;
  const chartData: BarPoint[] = [...rows]
    .sort((a, b) => b.calls - a.calls)
    .map((row) => ({ ...row, share: (row.calls / total) * 100 }));
  const max = niceCeil(Math.max(...chartData.map((row) => row.calls)));
  const ticks = axisTicks(max, compact ? 3 : 5);

  return (
    <div className="chart-frame chart-frame--bar" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{
            top: 4,
            right: compact ? 16 : 96,
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
            domain={[0, max]}
            ticks={ticks}
          />
          <YAxis
            type="category"
            dataKey="chartLabel"
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
          <Bar dataKey="calls" isAnimationActive={false} radius={[0, 2, 2, 0]}>
            {chartData.map((row) => (
              <Cell
                key={row.id}
                fill={
                  (colorBy === "billable" ? row.billable : row.kind === "chart")
                    ? colors.accent
                    : colors.accentMuted
                }
              />
            ))}
            {!compact ? (
              <LabelList
                dataKey="calls"
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