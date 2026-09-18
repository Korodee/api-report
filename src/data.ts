/**
 * Production APIRequestLog study for options-depth-api/v1.
 * Pulled 2026-09-18 19:08 UTC. Module counts and timings come from the
 * existing analysis; page totals are derived from these rows.
 */
export type ModuleRow = {
  id: string;
  label: string;
  chartLabel: string;
  billable: boolean;
  calls30d: number;
  ok30d: number;
  users30d: number;
  avgRtS: number;
  pctGe1s: number;
  proposedUnits: number;
};

export const PULLED_AT = "September 18, 2026, 19:08 UTC";
export const SOURCE = "prod APIRequestLog";
export const WINDOW_LABEL = "Aug 19 – Sep 18, 2026";

export const MODULES: ModuleRow[] = [
  {
    id: "breakdown-by-strike",
    label: "Breakdown by Strike",
    chartLabel: "Strike",
    billable: true,
    calls30d: 187051,
    ok30d: 150717,
    users30d: 50,
    avgRtS: 1.218,
    pctGe1s: 50.2,
    proposedUnits: 4,
  },
  {
    id: "intraday-timeslots",
    label: "Intraday timeslots",
    chartLabel: "Timeslots",
    billable: false,
    calls30d: 171516,
    ok30d: 121098,
    users30d: 49,
    avgRtS: 0.091,
    pctGe1s: 6.7,
    proposedUnits: 0,
  },
  {
    id: "depthview",
    label: "Depth View",
    chartLabel: "Depth View",
    billable: true,
    calls30d: 137976,
    ok30d: 119004,
    users30d: 49,
    avgRtS: 0.274,
    pctGe1s: 15.1,
    proposedUnits: 1,
  },
  {
    id: "heatmap",
    label: "Heatmap",
    chartLabel: "Heatmap",
    billable: true,
    calls30d: 129549,
    ok30d: 101278,
    users30d: 53,
    avgRtS: 2.529,
    pctGe1s: 63.7,
    proposedUnits: 9,
  },
  {
    id: "breakdown-by-expiration",
    label: "Breakdown by Expiration",
    chartLabel: "By Expiration",
    billable: true,
    calls30d: 6705,
    ok30d: 6633,
    users30d: 15,
    avgRtS: 0.149,
    pctGe1s: 11.5,
    proposedUnits: 1,
  },
  {
    id: "expiration-dates",
    label: "Expiration dates",
    chartLabel: "Exp. dates",
    billable: true,
    calls30d: 17,
    ok30d: 16,
    users30d: 1,
    avgRtS: 0.0,
    pctGe1s: 0.0,
    proposedUnits: 0,
  },
];

export function billingStatus(module: ModuleRow): string {
  return module.billable ? "Billable · 1 unit" : "Not billed";
}

function sum(rows: ModuleRow[], pick: (row: ModuleRow) => number): number {
  return rows.reduce((total, row) => total + pick(row), 0);
}

export const billableModules = MODULES.filter((row) => row.billable);
export const freeModules = MODULES.filter((row) => !row.billable);

export const totals = {
  loggedRequests: sum(MODULES, (row) => row.calls30d),
  billableRequests: sum(billableModules, (row) => row.calls30d),
  freeRequests: sum(freeModules, (row) => row.calls30d),
  heatmapAvgRt: MODULES.find((row) => row.id === "heatmap")!.avgRtS,
  flatUnits: sum(billableModules, (row) => row.ok30d),
  weightedUnits: sum(
    billableModules,
    (row) => row.ok30d * row.proposedUnits,
  ),
};

export const unitMultiplier = totals.weightedUnits / totals.flatUnits;

export const modulesByVolume = [...MODULES].sort(
  (a, b) => b.calls30d - a.calls30d,
);

export const modulesByProposedUnits = [...MODULES].sort((a, b) => {
  if (b.proposedUnits !== a.proposedUnits) {
    return b.proposedUnits - a.proposedUnits;
  }
  return b.calls30d - a.calls30d;
});

export const strike = MODULES.find((row) => row.id === "breakdown-by-strike")!;
export const timeslots = MODULES.find((row) => row.id === "intraday-timeslots")!;
export const heatmap = MODULES.find((row) => row.id === "heatmap")!;
export const depthView = MODULES.find((row) => row.id === "depthview")!;

/** Shown only when the underlying ranking still holds. */
export const trafficInsightApplies =
  strike.calls30d > timeslots.calls30d &&
  timeslots.calls30d > heatmap.calls30d &&
  heatmap.avgRtS > strike.avgRtS;
