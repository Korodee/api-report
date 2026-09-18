/**
 * Two surfaces, never mixed:
 *
 * - Developer API: prod APIRequestLog for /options-depth-api/v1 (30d) plus
 *   ClickHouse Cloud query_log attributed to the API droplet public IP.
 * - Web app: Loki nginx JSON for /api/v1/charts/* on both web boxes,
 *   regular trading hours this week (9:30am–4pm ET). Tuesday after the
 *   open and Wednesday are missing from Loki. ClickHouse is still 30d,
 *   split by the two web droplet public IPs.
 *
 * ClickHouse window: Aug 19 – Sep 18, 2026. Initial Select queries from
 * clickhouse-driver as user `default`. Heatmap SQL is uniquely split
 * (ranked_* = API, latest_* / charts_* = web). Strike and Depth View share
 * SQL between surfaces, so those modules are not split in query_log.
 */

export type SurfaceId = "web" | "api";

export type TrafficRow = {
  id: string;
  label: string;
  chartLabel: string;
  calls: number;
  ok: number;
  avgRtS: number;
  pctGe1s: number;
  users?: number;
  /** Chart payloads vs polling / range helpers. */
  kind: "chart" | "helper";
  billable?: boolean;
  proposedUnits?: number;
};

export type PathRow = {
  path: string;
  module: string;
  calls: number;
  ok: number;
  avgRtS: number;
};

export type ShareRow = {
  id: string;
  label: string;
  calls: number;
};

export type WarehouseSlice = {
  queries: number;
  tb: number;
  avgMs: number;
};

export const PULLED_AT = "September 18, 2026, 21:00 UTC";
export const CH_WINDOW_LABEL = "Aug 19 – Sep 18, 2026";
export const API_HTTP_WINDOW_LABEL = "Aug 19 – Sep 18, 2026";
export const WEB_HTTP_WINDOW_LABEL = "Mon / Thu / Fri · 9:30am–4pm ET";

export const API_MODULES: TrafficRow[] = [
  {
    id: "breakdown-by-strike",
    label: "Breakdown by Strike",
    chartLabel: "Strike",
    kind: "chart",
    billable: true,
    calls: 187051,
    ok: 150717,
    users: 50,
    avgRtS: 1.218,
    pctGe1s: 50.2,
    proposedUnits: 4,
  },
  {
    id: "intraday-timeslots",
    label: "Intraday timeslots",
    chartLabel: "Timeslots",
    kind: "helper",
    billable: false,
    calls: 171516,
    ok: 121098,
    users: 49,
    avgRtS: 0.091,
    pctGe1s: 6.7,
    proposedUnits: 0,
  },
  {
    id: "depthview",
    label: "Depth View",
    chartLabel: "Depth View",
    kind: "chart",
    billable: true,
    calls: 137976,
    ok: 119004,
    users: 49,
    avgRtS: 0.274,
    pctGe1s: 15.1,
    proposedUnits: 1,
  },
  {
    id: "heatmap",
    label: "Heatmap",
    chartLabel: "Heatmap",
    kind: "chart",
    billable: true,
    calls: 129549,
    ok: 101278,
    users: 53,
    avgRtS: 2.529,
    pctGe1s: 63.7,
    proposedUnits: 9,
  },
  {
    id: "breakdown-by-expiration",
    label: "Breakdown by Expiration",
    chartLabel: "Expiration",
    kind: "chart",
    billable: true,
    calls: 6705,
    ok: 6633,
    users: 15,
    avgRtS: 0.149,
    pctGe1s: 11.5,
    proposedUnits: 1,
  },
  {
    id: "expiration-dates",
    label: "Expiration dates",
    chartLabel: "Exp. dates",
    kind: "helper",
    billable: true,
    calls: 17,
    ok: 16,
    users: 1,
    avgRtS: 0.0,
    pctGe1s: 0.0,
    proposedUnits: 0,
  },
];

/** Loki nginx JSON, both web boxes, RTH this week (Mon / Thu / Fri). */
export const WEB_MODULES: TrafficRow[] = [
  {
    id: "mm-exposure",
    label: "Price range limits",
    chartLabel: "Range limits",
    kind: "helper",
    calls: 2_302_434,
    ok: 2_295_130,
    avgRtS: 1.925,
    pctGe1s: 43.5,
  },
  {
    id: "heatmap",
    label: "Heatmap",
    chartLabel: "Heatmap",
    kind: "chart",
    calls: 1_919_473,
    ok: 1_914_742,
    avgRtS: 3.291,
    pctGe1s: 53.3,
  },
  {
    id: "breakdown-by-strike",
    label: "Breakdown by Strike",
    chartLabel: "Strike",
    kind: "chart",
    calls: 1_015_470,
    ok: 1_008_113,
    avgRtS: 3.758,
    pctGe1s: 57.4,
  },
  {
    id: "depthview",
    label: "Depth View",
    chartLabel: "Depth View",
    kind: "chart",
    calls: 773_931,
    ok: 771_686,
    avgRtS: 2.708,
    pctGe1s: 49.6,
  },
  {
    id: "breakdown-by-expiration",
    label: "Breakdown by Expiration",
    chartLabel: "Expiration",
    kind: "chart",
    calls: 99_325,
    ok: 95_987,
    avgRtS: 2.539,
    pctGe1s: 55.0,
  },
  {
    id: "intraday-timeslots",
    label: "Timeslots",
    chartLabel: "Timeslots",
    kind: "helper",
    calls: 69_482,
    ok: 62_330,
    avgRtS: 1.008,
    pctGe1s: 27.0,
  },
  {
    id: "candles",
    label: "Candlesticks",
    chartLabel: "Candles",
    kind: "chart",
    calls: 37_573,
    ok: 36_951,
    avgRtS: 0.991,
    pctGe1s: 18.8,
  },
  {
    id: "expiration-dates",
    label: "Expiration dates",
    chartLabel: "Exp. dates",
    kind: "helper",
    calls: 6_662,
    ok: 5_356,
    avgRtS: 0.373,
    pctGe1s: 7.8,
  },
];

export const WEB_PATHS: PathRow[] = [
  {
    path: "/api/v1/charts/mm-exposure-price-range-limits/",
    module: "Range limits",
    calls: 2_302_434,
    ok: 2_295_130,
    avgRtS: 1.925,
  },
  {
    path: "/api/v1/charts/plotly-gamma/",
    module: "Heatmap",
    calls: 809_899,
    ok: 807_995,
    avgRtS: 4.08,
  },
  {
    path: "/api/v1/charts/plotly-charm/",
    module: "Heatmap",
    calls: 769_383,
    ok: 767_964,
    avgRtS: 2.707,
  },
  {
    path: "/api/v1/charts/depth-view-table/",
    module: "Depth View",
    calls: 732_505,
    ok: 730_482,
    avgRtS: 2.682,
  },
  {
    path: "/api/v1/charts/breakdown-by-strike/",
    module: "Strike",
    calls: 591_803,
    ok: 585_654,
    avgRtS: 2.658,
  },
  {
    path: "/api/v1/charts/breakdown-by-strike-wicks/",
    module: "Strike",
    calls: 423_667,
    ok: 422_459,
    avgRtS: 5.294,
  },
  {
    path: "/api/v1/charts/plotly-vanna/",
    module: "Heatmap",
    calls: 258_950,
    ok: 258_232,
    avgRtS: 2.765,
  },
  {
    path: "/api/v1/charts/breakdown-by-expiration/",
    module: "Expiration",
    calls: 98_325,
    ok: 94_989,
    avgRtS: 2.52,
  },
  {
    path: "/api/v1/charts/depth-view-heatmap/",
    module: "Depth View",
    calls: 41_426,
    ok: 41_204,
    avgRtS: 3.166,
  },
  {
    path: "/api/v1/charts/plotly-candlesticks/",
    module: "Candles",
    calls: 37_569,
    ok: 36_948,
    avgRtS: 0.991,
  },
  {
    path: "/api/v1/charts/straddle-level-timeslots/",
    module: "Timeslots",
    calls: 36_359,
    ok: 31_438,
    avgRtS: 1.496,
  },
  {
    path: "/api/v1/charts/gamma-3d/",
    module: "Heatmap",
    calls: 35_091,
    ok: 34_868,
    avgRtS: 2.789,
  },
  {
    path: "/api/v1/charts/gamma-3d-marker/",
    module: "Heatmap",
    calls: 34_779,
    ok: 34_393,
    avgRtS: 2.324,
  },
  {
    path: "/api/v1/charts/intraday-timeslots/",
    module: "Timeslots",
    calls: 33_123,
    ok: 30_892,
    avgRtS: 0.472,
  },
];

/** Strike without wicks. Query string, same RTH window as WEB_PATHS. */
export const WEB_STRIKE_PARAM_TOTAL = 591_803;

export const WEB_GREEKS: ShareRow[] = [
  { id: "gamma", label: "Gamma", calls: 809_899 },
  { id: "charm", label: "Charm", calls: 769_383 },
  { id: "vanna", label: "Vanna", calls: 258_950 },
  { id: "gamma-3d", label: "Gamma 3D", calls: 69_870 },
  { id: "charm-3d", label: "Charm 3D", calls: 7_647 },
  { id: "vanna-3d", label: "Vanna 3D", calls: 3_724 },
];

export const WEB_GREEK_TOTAL = WEB_GREEKS.reduce(
  (sum, row) => sum + row.calls,
  0,
);

export const WEB_STRIKE_METRICS: ShareRow[] = [
  { id: "NET_POSITION", label: "Net position", calls: 327_398 },
  { id: "GEX", label: "GEX", calls: 199_380 },
  { id: "DEX", label: "DEX", calls: 34_304 },
  { id: "VEX", label: "VEX", calls: 23_695 },
  { id: "CEX", label: "CEX", calls: 7_026 },
];

export const WEB_STRIKE_EXPIRY: ShareRow[] = [
  { id: "0dte", label: "0DTE only", calls: 427_948 },
  { id: "list", label: "Picked a list of expirations", calls: 103_400 },
  { id: "none", label: "No expiration on the request", calls: 31_851 },
  { id: "3m", label: "~3 month window", calls: 18_951 },
  { id: "other", label: "Other ranges / later DTE", calls: 9_653 },
];

export const API_HEATMAP_PARAM_TOTAL = 121_778;
export const API_STRIKE_PARAM_TOTAL = 186_785;

export const API_GREEKS: ShareRow[] = [
  { id: "gamma", label: "Gamma", calls: 54_429 },
  { id: "charm", label: "Charm", calls: 38_931 },
  { id: "vanna", label: "Vanna", calls: 28_311 },
];

export const API_STRIKE_METRICS: ShareRow[] = [
  { id: "GEX", label: "GEX", calls: 78_153 },
  { id: "NET_POSITION", label: "Net position", calls: 38_887 },
  { id: "CEX", label: "CEX", calls: 32_276 },
  { id: "DEX", label: "DEX", calls: 31_195 },
  { id: "VEX", label: "VEX", calls: 6_236 },
];

export const API_STRIKE_EXPIRY: ShareRow[] = [
  { id: "all", label: "All expirations", calls: 77_888 },
  { id: "0dte", label: "0DTE", calls: 46_827 },
  { id: "specific", label: "Specific dates", calls: 45_609 },
  { id: "range", label: "Range", calls: 16_013 },
  { id: "upcoming", label: "Upcoming", calls: 424 },
];

/** Suggested web tiers. $249 is today’s Pro Max. */
export const PLAN_LITE = { name: "Lite", monthly: 99, yearly: 990 };
export const PLAN_CORE = { name: "Core", monthly: 149, yearly: 1490 };
export const PLAN_ADV = { name: "Pro Max", monthly: 249, yearly: 2499 };

export type PlanFeatureRow = {
  id: string;
  label: string;
  lite: string;
  core: string;
  advanced: string;
};

export const PLAN_FEATURES: PlanFeatureRow[] = [
  { id: "live", label: "Live / intraday", lite: "Yes", core: "Yes", advanced: "Yes" },
  { id: "ticker", label: "Tickers", lite: "SPX", core: "SPX", advanced: "SPX + VIX" },
  {
    id: "heatmap",
    label: "Heatmap",
    lite: "Gamma · 2D",
    core: "Gamma, Charm · 2D",
    advanced: "All greeks · 3D",
  },
  {
    id: "metrics",
    label: "Strike / Depth metrics",
    lite: "Net position, GEX",
    core: "Net position, GEX",
    advanced: "+ DEX, VEX, CEX",
  },
  {
    id: "expiry",
    label: "Expirations",
    lite: "0DTE only",
    core: "0DTE + short presets",
    advanced: "Any date, lists, full term",
  },
  {
    id: "depth",
    label: "Depth View",
    lite: "—",
    core: "Table",
    advanced: "Table + heatmap",
  },
  {
    id: "by-exp",
    label: "Breakdown by Expiration",
    lite: "—",
    core: "—",
    advanced: "Yes",
  },
  { id: "vol", label: "Vol dashboard", lite: "—", core: "—", advanced: "Yes" },
  { id: "api", label: "Developer API", lite: "—", core: "—", advanced: "Yes" },
];

const heatmapLiteCalls =
  WEB_GREEKS.find((row) => row.id === "gamma")?.calls ?? 0;
const heatmapCoreCalls = WEB_GREEKS.filter(
  (row) => row.id === "gamma" || row.id === "charm",
).reduce((sum, row) => sum + row.calls, 0);
const strike0dteCalls =
  WEB_STRIKE_EXPIRY.find((row) => row.id === "0dte")?.calls ?? 0;
const strikeCoreMetricCalls = WEB_STRIKE_METRICS.filter(
  (row) => row.id === "NET_POSITION" || row.id === "GEX",
).reduce((sum, row) => sum + row.calls, 0);

export const planCoverage = {
  heatmapLitePct: (heatmapLiteCalls / WEB_GREEK_TOTAL) * 100,
  heatmapCorePct: (heatmapCoreCalls / WEB_GREEK_TOTAL) * 100,
  strike0dtePct: (strike0dteCalls / WEB_STRIKE_PARAM_TOTAL) * 100,
  strikeNetGexPct: (strikeCoreMetricCalls / WEB_STRIKE_PARAM_TOTAL) * 100,
};

export const WAREHOUSE: {
  web: WarehouseSlice & {
    heatmapLive: WarehouseSlice;
    heatmapDaily: WarehouseSlice;
    timeslots: WarehouseSlice;
  };
  api: WarehouseSlice & {
    heatmapRanked: WarehouseSlice;
    timeslots: WarehouseSlice;
  };
  otherHost: WarehouseSlice & { heatmapLive: WarehouseSlice };
} = {
  web: {
    queries: 3_229_002,
    tb: 678.5,
    avgMs: 215.0,
    heatmapLive: { queries: 15_248, tb: 48.2, avgMs: 2897.5 },
    heatmapDaily: { queries: 10_595, tb: 0.22, avgMs: 231.3 },
    timeslots: { queries: 5_816, tb: 2.1, avgMs: 270.4 },
  },
  api: {
    queries: 1_001_799,
    tb: 319.0,
    avgMs: 126.8,
    heatmapRanked: { queries: 21_606, tb: 186.2, avgMs: 3212.4 },
    timeslots: { queries: 39_976, tb: 21.7, avgMs: 236.6 },
  },
  otherHost: {
    queries: 511_647,
    tb: 172.0,
    avgMs: 332.7,
    heatmapLive: { queries: 25_851, tb: 95.8, avgMs: 3787.4 },
  },
};

function sum(rows: TrafficRow[], pick: (row: TrafficRow) => number): number {
  return rows.reduce((total, row) => total + pick(row), 0);
}

export function billingStatus(module: TrafficRow): string {
  if (module.billable == null) return "Not billed (web)";
  return module.billable ? "Billable · 1 unit" : "Not billed";
}

export const apiBillable = API_MODULES.filter((row) => row.billable);
export const apiFree = API_MODULES.filter((row) => !row.billable);

export const apiTotals = {
  loggedRequests: sum(API_MODULES, (row) => row.calls),
  billableRequests: sum(apiBillable, (row) => row.calls),
  freeRequests: sum(apiFree, (row) => row.calls),
  heatmapAvgRt: API_MODULES.find((row) => row.id === "heatmap")!.avgRtS,
  flatUnits: sum(apiBillable, (row) => row.ok),
  weightedUnits: sum(
    apiBillable,
    (row) => row.ok * (row.proposedUnits ?? 0),
  ),
};

export const unitMultiplier = apiTotals.weightedUnits / apiTotals.flatUnits;

export const webTotals = {
  loggedRequests: sum(WEB_MODULES, (row) => row.calls),
  heatmapCalls: WEB_MODULES.find((row) => row.id === "heatmap")!.calls,
  strikeAvgRt: WEB_MODULES.find((row) => row.id === "breakdown-by-strike")!
    .avgRtS,
  heatmapAvgRt: WEB_MODULES.find((row) => row.id === "heatmap")!.avgRtS,
};

export function modulesByVolume(rows: TrafficRow[]): TrafficRow[] {
  return [...rows].sort((a, b) => b.calls - a.calls);
}

export function modulesByProposedUnits(rows: TrafficRow[]): TrafficRow[] {
  return [...rows].sort((a, b) => {
    const au = a.proposedUnits ?? 0;
    const bu = b.proposedUnits ?? 0;
    if (bu !== au) return bu - au;
    return b.calls - a.calls;
  });
}

const apiStrike = API_MODULES.find((row) => row.id === "breakdown-by-strike")!;
const apiTimeslots = API_MODULES.find((row) => row.id === "intraday-timeslots")!;
const apiHeatmap = API_MODULES.find((row) => row.id === "heatmap")!;

export const apiTrafficInsightApplies =
  apiStrike.calls > apiTimeslots.calls &&
  apiTimeslots.calls > apiHeatmap.calls &&
  apiHeatmap.avgRtS > apiStrike.avgRtS;
