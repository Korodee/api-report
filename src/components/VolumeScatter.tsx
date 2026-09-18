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
import { billingStatus, type TrafficRow } from "../data";
import { fmtInt, fmtPct, fmtRt, niceCeil } from "../format";
import { useChartColors, useMediaQuery } from "../hooks";
import { ChartTooltip } from "./ChartTooltip";

type LabelLayout = {
  dx: number;
  dy: number;
  anchor: "start" | "middle" | "end";
};

const LABEL_LAYOUT: Record<string, LabelLayout> = {
  heatmap: { dx: 10, dy: -12, anchor: "start" },
  "breakdown-by-strike": { dx: 0, dy: -20, anchor: "middle" },
  "intraday-timeslots": { dx: 0, dy: -18, anchor: "middle" },
  depthview: { dx: 10, dy: 18, anchor: "start" },
  "breakdown-by-expiration": { dx: 10, dy: -16, anchor: "start" },
  "expiration-dates": { dx: 10, dy: 16, anchor: "start" },
  "mm-exposure": { dx: -10, dy: 16, anchor: "end" },
  candles: { dx: -10, dy: 16, anchor: "end" },
};

const COMPACT_LAYOUT: Record<string, LabelLayout> = {
  heatmap: { dx: -8, dy: -10, anchor: "end" },
  "breakdown-by-strike": { dx: 0, dy: -16, anchor: "middle" },
  "intraday-timeslots": { dx: 0, dy: -16, anchor: "middle" },
  depthview: { dx: 8, dy: 16, anchor: "start" },
  "breakdown-by-expiration": { dx: 8, dy: -14, anchor: "start" },
  "expiration-dates": { dx: 8, dy: 14, anchor: "start" },
  "mm-exposure": { dx: -8, dy: 14, anchor: "end" },
  candles: { dx: -8, dy: 14, anchor: "end" },
};

function ScatterTooltip({
  active,
  payload,
  showBilling,
}: {
  active?: boolean;
  payload?: Array<{ payload: TrafficRow }>;
  showBilling: boolean;
}) {
  if (!active || !payload?.[0]) return null;
  const row = payload[0].payload;
  const rows = [
    { label: "Requests", value: fmtInt(row.calls) },
    { label: "Avg. response time", value: fmtRt(row.avgRtS) },
    { label: "≥1s", value: fmtPct(row.pctGe1s) },
  ];
  if (showBilling) {
    rows.push({ label: "Current billing", value: billingStatus(row) });
    if (row.proposedUnits != null) {
      rows.push({ label: "Proposed units", value: String(row.proposedUnits) });
    }
  } else {
    rows.push({
      label: "Kind",
      value: row.kind === "helper" ? "Helper / polling" : "Chart payload",
    });
  }
  return <ChartTooltip title={row.label} rows={rows} />;
}

function formatX(value: number): string {
  if (value === 0) return "0";
  if (value >= 1_000_000) return `${Math.round(value / 100_000) / 10}m`;
  return `${Math.round(value / 1000)}k`;
}

function LabeledDot({
  cx,
  cy,
  payload,
  fill,
  stroke,
  compact,
  hollow,
}: {
  cx?: number;
  cy?: number;
  payload?: TrafficRow;
  fill: string;
  stroke: string;
  compact: boolean;
  hollow: boolean;
}): ReactElement {
  if (cx == null || cy == null || !payload) return <g />;
  const layout = (compact ? COMPACT_LAYOUT : LABEL_LAYOUT)[payload.id];
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={compact ? 5.5 : 6.5}
        fill={fill}
        stroke={stroke}
        strokeWidth={hollow ? 1.5 : 0}
      />
      {layout ? (
        <text
          x={cx + layout.dx}
          y={cy + layout.dy}
          textAnchor={layout.anchor}
          className="scatter-label"
        >
          {payload.chartLabel}
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
  hollow: boolean,
): ReactElement {
  const point = props as {
    cx?: number;
    cy?: number;
    payload?: TrafficRow;
  };
  return (
    <LabeledDot
      cx={point.cx}
      cy={point.cy}
      payload={point.payload}
      fill={fill}
      stroke={stroke}
      compact={compact}
      hollow={hollow}
    />
  );
}

export function VolumeScatter({
  rows,
  showBilling = false,
  colorBy = "kind",
}: {
  rows: TrafficRow[];
  showBilling?: boolean;
  colorBy?: "kind" | "billable";
}) {
  const colors = useChartColors();
  const compact = useMediaQuery("(max-width: 720px)");
  const primary =
    colorBy === "billable"
      ? rows.filter((row) => row.billable)
      : rows.filter((row) => row.kind === "chart");
  const secondary =
    colorBy === "billable"
      ? rows.filter((row) => !row.billable)
      : rows.filter((row) => row.kind === "helper");
  const maxX = niceCeil(Math.max(...rows.map((row) => row.calls)) * 1.08);
  const maxY = niceCeil(Math.max(...rows.map((row) => row.avgRtS)) * 1.12);

  const renderChart = (props: unknown) =>
    renderDot(props, colors.accent, colors.accent, compact, false);
  const renderHelper = (props: unknown) =>
    renderDot(props, "var(--bg)", colors.accentMuted, compact, true);

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
            dataKey="calls"
            name="Requests"
            tickFormatter={formatX}
            tick={{ fill: colors.muted, fontSize: 11 }}
            axisLine={{ stroke: colors.line }}
            tickLine={false}
            domain={[0, maxX]}
            label={{
              value: "Requests",
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
            domain={[0, maxY]}
            padding={{ top: 8, bottom: 20 }}
            width={40}
          />
          <ZAxis range={[80, 80]} />
          <Tooltip
            cursor={{
              stroke: colors.line,
              strokeDasharray: "3 3",
            }}
            content={(props) => (
              <ScatterTooltip
                active={props.active}
                payload={
                  props.payload as Array<{ payload: TrafficRow }> | undefined
                }
                showBilling={showBilling}
              />
            )}
            isAnimationActive={false}
          />
          <Scatter
            name="Primary"
            data={primary}
            isAnimationActive={false}
            shape={renderChart}
          />
          <Scatter
            name="Secondary"
            data={secondary}
            isAnimationActive={false}
            shape={renderHelper}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}