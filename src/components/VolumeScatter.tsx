import type { ReactElement } from "react";
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import {
  billingStatus,
  MODULES,
  type ModuleRow,
} from "../data";
import { fmtInt, fmtPct, fmtRt } from "../format";
import { useChartColors, useMediaQuery } from "../hooks";
import { ChartTooltip } from "./ChartTooltip";

type LabelLayout = {
  dx: number;
  dy: number;
  anchor: "start" | "middle" | "end";
};

const LABEL_LAYOUT: Record<string, LabelLayout> = {
  heatmap: { dx: 10, dy: -12, anchor: "start" },
  "breakdown-by-strike": { dx: -10, dy: -12, anchor: "end" },
  "intraday-timeslots": { dx: -10, dy: -12, anchor: "end" },
  depthview: { dx: 10, dy: -12, anchor: "start" },
  "breakdown-by-expiration": { dx: 10, dy: -16, anchor: "start" },
  "expiration-dates": { dx: 10, dy: 18, anchor: "start" },
};

const COMPACT_LAYOUT: Record<string, LabelLayout> = {
  heatmap: { dx: 8, dy: -10, anchor: "start" },
  "breakdown-by-strike": { dx: -8, dy: -12, anchor: "end" },
  "intraday-timeslots": { dx: -8, dy: 16, anchor: "end" },
  depthview: { dx: 8, dy: -12, anchor: "start" },
  "breakdown-by-expiration": { dx: 8, dy: -16, anchor: "start" },
  "expiration-dates": { dx: 8, dy: 14, anchor: "start" },
};

function ScatterTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ModuleRow }>;
}) {
  if (!active || !payload?.[0]) return null;
  const row = payload[0].payload;
  return (
    <ChartTooltip
      title={row.label}
      rows={[
        { label: "Requests · 30d", value: fmtInt(row.calls30d) },
        { label: "Avg. response time", value: fmtRt(row.avgRtS) },
        { label: "≥1s", value: fmtPct(row.pctGe1s) },
        { label: "Current billing", value: billingStatus(row) },
        {
          label: "Proposed units",
          value: String(row.proposedUnits),
        },
      ]}
    />
  );
}

function formatX(value: number): string {
  if (value === 0) return "0";
  return `${Math.round(value / 1000)}k`;
}

function LabeledDot({
  cx,
  cy,
  payload,
  fill,
  stroke,
  compact,
}: {
  cx?: number;
  cy?: number;
  payload?: ModuleRow;
  fill: string;
  stroke: string;
  compact: boolean;
}): ReactElement {
  if (cx == null || cy == null || !payload) return <g />;
  const layout = (compact ? COMPACT_LAYOUT : LABEL_LAYOUT)[payload.id];
  const label = payload.chartLabel;
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={compact ? 5.5 : 6.5}
        fill={fill}
        stroke={stroke}
        strokeWidth={payload.billable ? 0 : 1.5}
      />
      {layout ? (
        <text
          x={cx + layout.dx}
          y={cy + layout.dy}
          textAnchor={layout.anchor}
          className="scatter-label"
        >
          {label}
        </text>
      ) : null}
    </g>
  );
}

function renderDot(
  props: unknown,
  fill: string,
  stroke: string,
  compact: boolean,
): ReactElement {
  const point = props as {
    cx?: number;
    cy?: number;
    payload?: ModuleRow;
  };
  return (
    <LabeledDot
      cx={point.cx}
      cy={point.cy}
      payload={point.payload}
      fill={fill}
      stroke={stroke}
      compact={compact}
    />
  );
}

export function VolumeScatter() {
  const colors = useChartColors();
  const compact = useMediaQuery("(max-width: 720px)");
  const billable = MODULES.filter((row) => row.billable);
  const free = MODULES.filter((row) => !row.billable);

  const renderBillable = (props: unknown) =>
    renderDot(props, colors.accent, colors.accent, compact);

  const renderFree = (props: unknown) =>
    renderDot(props, "var(--bg)", colors.accentMuted, compact);

  return (
    <div className="chart-frame chart-frame--scatter">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{
            top: 28,
            right: compact ? 36 : 36,
            bottom: 28,
            left: 4,
          }}
        >
          <CartesianGrid stroke={colors.line} />
          <XAxis
            type="number"
            dataKey="calls30d"
            name="Requests"
            tickFormatter={formatX}
            tick={{ fill: colors.muted, fontSize: 11 }}
            axisLine={{ stroke: colors.line }}
            tickLine={false}
            domain={[0, 220000]}
            ticks={[0, 50000, 100000, 150000, 200000]}
            label={{
              value: "Requests over 30 days",
              position: "insideBottom",
              offset: -2,
              fill: colors.muted,
              fontSize: 11,
            }}
          />
          <YAxis
            type="number"
            dataKey="avgRtS"
            name="Avg. response time"
            tickFormatter={(value: number) => `${value.toFixed(1)}s`}
            tick={{ fill: colors.muted, fontSize: 11 }}
            axisLine={{ stroke: colors.line }}
            tickLine={false}
            domain={[0, 2.8]}
            padding={{ top: 8, bottom: 20 }}
            width={40}
          />
          <ZAxis range={[80, 80]} />
          <Tooltip
            cursor={{
              stroke: colors.line,
              strokeDasharray: "3 3",
            }}
            content={<ScatterTooltip />}
            isAnimationActive={false}
          />
          <Scatter
            name="Billable"
            data={billable}
            isAnimationActive={false}
            shape={renderBillable}
          />
          <Scatter
            name="Not billed"
            data={free}
            isAnimationActive={false}
            shape={renderFree}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
