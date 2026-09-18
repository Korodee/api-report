import { TrafficChart } from "./components/TrafficChart";
import { VolumeScatter } from "./components/VolumeScatter";
import { ModuleTable } from "./components/ModuleTable";
import { PathTable } from "./components/PathTable";
import { PlanTable } from "./components/PlanTable";
import { ShareTable } from "./components/ShareTable";
import {
  API_GREEKS,
  API_HEATMAP_PARAM_TOTAL,
  API_HTTP_WINDOW_LABEL,
  API_MODULES,
  API_STRIKE_EXPIRY,
  API_STRIKE_METRICS,
  API_STRIKE_PARAM_TOTAL,
  apiTotals,
  apiTrafficInsightApplies,
  CH_WINDOW_LABEL,
  modulesByProposedUnits,
  PLAN_ADV,
  PLAN_CORE,
  PLAN_FEATURES,
  PULLED_AT,
  planCoverage,
  unitMultiplier,
  WAREHOUSE,
  WEB_GREEK_TOTAL,
  WEB_GREEKS,
  WEB_HTTP_WINDOW_LABEL,
  WEB_MODULES,
  WEB_PATHS,
  WEB_STRIKE_EXPIRY,
  WEB_STRIKE_METRICS,
  WEB_STRIKE_PARAM_TOTAL,
  webTotals,
  type SurfaceId,
} from "./data";
import { fmtInt, fmtMs, fmtMultiplier, fmtRt, fmtTb } from "./format";
import { useSurface, useTheme } from "./hooks";

function SurfaceToggle({
  surface,
  onChange,
}: {
  surface: SurfaceId;
  onChange: (next: SurfaceId) => void;
}) {
  return (
    <div className="tabs" role="tablist" aria-label="Surface">
      <button
        type="button"
        role="tab"
        aria-selected={surface === "web"}
        className={surface === "web" ? "tab is-active" : "tab"}
        onClick={() => onChange("web")}
      >
        Web app
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={surface === "api"}
        className={surface === "api" ? "tab is-active" : "tab"}
        onClick={() => onChange("api")}
      >
        Developer API
      </button>
    </div>
  );
}

function WebReport() {
  const heatmapShare =
    (webTotals.heatmapCalls / webTotals.loggedRequests) * 100;

  return (
    <div className="surface-body">
      <p className="lede">
        This is the web app. Charts loaded from{" "}
        <code>backend.optionsdepth.com/api/v1/charts/</code>. Not API units.
      </p>
      <p className="lede lede--follow">
        Request counts are this week, 9:30am–4pm ET. Tuesday after the open
        and Wednesday are missing from logs. ClickHouse is still the last 30
        days, web servers only.
      </p>

      <section className="metrics" aria-label="Web key numbers">
        <div className="metric">
          <div className="metric__value">
            {fmtInt(webTotals.loggedRequests)}
          </div>
          <div className="metric__label">chart-family requests</div>
        </div>
        <div className="metric">
          <div className="metric__value">{heatmapShare.toFixed(0)}%</div>
          <div className="metric__label">Heatmap share of mix</div>
        </div>
        <div className="metric">
          <div className="metric__value">{fmtTb(WAREHOUSE.web.tb)}</div>
          <div className="metric__label">ClickHouse read · 30d</div>
        </div>
        <div className="metric">
          <div className="metric__value">
            {fmtMultiplier(WAREHOUSE.web.tb / WAREHOUSE.api.tb)}
          </div>
          <div className="metric__label">web vs API ClickHouse</div>
        </div>
      </section>

      <section className="section">
        <div className="section__head">
          <h2>What we hit this week</h2>
          <p>Regular hours, both web boxes.</p>
        </div>
        <TrafficChart rows={WEB_MODULES} height={340} />
        <div className="legend">
          <span>
            <i className="swatch swatch--billable" /> Chart payload
          </span>
          <span>
            <i className="swatch swatch--free" /> Helper / polling
          </span>
        </div>
        <p className="insight">
          Range limits is the heatmap polling strike bounds — not a billed
          module. After that it is Heatmap, Strike, and Depth View. Strike
          wicks are still the slow ones (~5.3s).
        </p>
      </section>

      <section className="section">
        <div className="section__head">
          <h2>Volume vs response time</h2>
          <p>
            Same market-hours window. Hollow dots are helpers (polling /
            range limits).
          </p>
        </div>
        <VolumeScatter rows={WEB_MODULES} />
        <div className="legend">
          <span>
            <i className="swatch swatch--billable" /> Chart payload
          </span>
          <span>
            <i className="swatch swatch--free swatch--hollow" /> Helper / polling
          </span>
        </div>
        <p className="insight">
          Strike is the painful one on web — busy and slow (avg{" "}
          {fmtRt(webTotals.strikeAvgRt)}). Heatmap is right there with it at{" "}
          {fmtRt(webTotals.heatmapAvgRt)}. Depth View is cheaper per call than
          those two, but still over 2s, which is a lot slower than Depth View
          on the developer API.
        </p>
      </section>

      <section className="section">
        <div className="section__head">
          <h2>Paths we counted</h2>
          <p>
            Combined from both load-balanced boxes, same hours. Heatmap in
            this table is plotly-gamma / vanna / charm plus the 3D variants.
          </p>
        </div>
        <PathTable rows={WEB_PATHS} />
      </section>

      <section className="section">
        <div className="section__head">
          <h2>By module</h2>
        </div>
        <ModuleTable rows={WEB_MODULES} mode="web" />
      </section>

      <section className="section">
        <div className="section__head">
          <h2>What they actually pick</h2>
          <p>
            Same hours. Strike query string, not wicks. Heatmap greek is
            which plotly path they hit.
          </p>
        </div>
        <div className="split">
          <div>
            <h3>Heatmap greeks</h3>
            <ShareTable
              rows={WEB_GREEKS}
              total={WEB_GREEK_TOTAL}
              nameHeader="Greek"
            />
          </div>
          <div>
            <h3>Strike metric</h3>
            <ShareTable
              rows={WEB_STRIKE_METRICS}
              total={WEB_STRIKE_PARAM_TOTAL}
              nameHeader="Metric"
            />
          </div>
        </div>
        <h3 className="subhead">Strike expiration</h3>
        <ShareTable
          rows={WEB_STRIKE_EXPIRY}
          total={WEB_STRIKE_PARAM_TOTAL}
          nameHeader="Selection"
        />
        <p className="insight">
          Almost all of this is SPX. Gamma and Charm, Strike on 0DTE with net
          position or GEX — that is the cheap-plan mix. Vanna, 3D, DEX / VEX /
          CEX, and picking a list of expirations are the thinner usage.
        </p>
      </section>

      <section className="section">
        <div className="section__head">
          <h2>If we split the $249 plan</h2>
          <p>
            Pro Max is $249 today and includes everything. Most of the traffic
            sits in a smaller box. Core is live SPX for that box. Pro Max stays
            $249 for the rest.
          </p>
        </div>
        <div className="metrics" aria-label="Suggested plan prices">
          <div className="metric">
            <div className="metric__value">${PLAN_CORE.monthly}</div>
            <div className="metric__label">
              Core / mo · ${fmtInt(PLAN_CORE.yearly)} / yr
            </div>
          </div>
          <div className="metric">
            <div className="metric__value">${PLAN_ADV.monthly}</div>
            <div className="metric__label">
              Pro Max / mo · ${fmtInt(PLAN_ADV.yearly)} / yr
            </div>
          </div>
          <div className="metric">
            <div className="metric__value">
              {planCoverage.heatmapCorePct.toFixed(0)}%
            </div>
            <div className="metric__label">heatmap calls Core covers</div>
          </div>
          <div className="metric">
            <div className="metric__value">
              {planCoverage.strike0dtePct.toFixed(0)}%
            </div>
            <div className="metric__label">strike calls that are 0DTE</div>
          </div>
        </div>
        <PlanTable rows={PLAN_FEATURES} />
        <p className="insight">
          Core still has to be live. 0DTE is 72% of Strike — delayed daily data
          does not compete there. Delayed Pro at $199 would sit above a $149 live
          Core, so that tier probably gets folded or dropped. Developer API and
          the vol dashboard stay on Pro Max. Do not put “all expirations” on
          Core; that is the expensive API habit, not the web default.
        </p>
      </section>

      <section className="section section--last">
        <div className="section__head">
          <h2>ClickHouse, last 30 days</h2>
          <p>Web servers only. Bytes scanned, not a bill.</p>
        </div>
        <div className="comparison">
          <div>
            <div className="comparison__label">Select queries</div>
            <div className="comparison__value">
              {fmtInt(WAREHOUSE.web.queries)}
            </div>
          </div>
          <div>
            <div className="comparison__label">Data read</div>
            <div className="comparison__value">{fmtTb(WAREHOUSE.web.tb)}</div>
          </div>
          <div>
            <div className="comparison__label">Avg. query time</div>
            <div className="comparison__value">
              {fmtMs(WAREHOUSE.web.avgMs)}
            </div>
          </div>
        </div>
        <table className="price-table warehouse-table">
          <thead>
            <tr>
              <th>SQL match</th>
              <th className="num">Queries</th>
              <th className="num">Data read</th>
              <th className="num">Avg. ms</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Heatmap live <code>latest_*</code></td>
              <td className="num">
                {fmtInt(WAREHOUSE.web.heatmapLive.queries)}
              </td>
              <td className="num">{fmtTb(WAREHOUSE.web.heatmapLive.tb)}</td>
              <td className="num">{fmtMs(WAREHOUSE.web.heatmapLive.avgMs)}</td>
            </tr>
            <tr>
              <td>Heatmap daily <code>charts_gamma/vanna/charm</code></td>
              <td className="num">
                {fmtInt(WAREHOUSE.web.heatmapDaily.queries)}
              </td>
              <td className="num">{fmtTb(WAREHOUSE.web.heatmapDaily.tb)}</td>
              <td className="num">{fmtMs(WAREHOUSE.web.heatmapDaily.avgMs)}</td>
            </tr>
            <tr>
              <td>Timeslots <code>unioned_timeslots</code></td>
              <td className="num">
                {fmtInt(WAREHOUSE.web.timeslots.queries)}
              </td>
              <td className="num">{fmtTb(WAREHOUSE.web.timeslots.tb)}</td>
              <td className="num">{fmtMs(WAREHOUSE.web.timeslots.avgMs)}</td>
            </tr>
          </tbody>
        </table>
        <p className="note">
          Heatmap is the only chart we can tell apart in SQL. Strike and Depth
          View look the same as the API now, so they are not split here.
          There is also some heatmap traffic from another DigitalOcean host (
          {fmtInt(WAREHOUSE.otherHost.heatmapLive.queries)} queries,{" "}
          {fmtTb(WAREHOUSE.otherHost.heatmapLive.tb)}) that is not on the
          current web boxes or the API box.
        </p>
      </section>
    </div>
  );
}

function ApiReport() {
  return (
    <div className="surface-body">
      <p className="lede">
        This is the developer API (<code>/options-depth-api/v1</code>). We
        charge 1 unit per successful call today, Heatmap and Depth View the
        same. Counts are 30 days of APIRequestLog. ClickHouse is the API box
        only.
      </p>

      <section className="metrics" aria-label="API key numbers">
        <div className="metric">
          <div className="metric__value">
            {fmtInt(apiTotals.loggedRequests)}
          </div>
          <div className="metric__label">30-day logged requests</div>
        </div>
        <div className="metric">
          <div className="metric__value">
            {fmtInt(apiTotals.billableRequests)}
          </div>
          <div className="metric__label">billable-module requests</div>
        </div>
        <div className="metric">
          <div className="metric__value">{fmtInt(apiTotals.freeRequests)}</div>
          <div className="metric__label">already free</div>
        </div>
        <div className="metric">
          <div className="metric__value">{fmtRt(apiTotals.heatmapAvgRt)}</div>
          <div className="metric__label">Heatmap avg. RT</div>
        </div>
      </section>

      <section className="section">
        <div className="section__head">
          <h2>Where the API traffic goes</h2>
          <p>
            Main modules from APIRequestLog, {API_HTTP_WINDOW_LABEL}.
          </p>
        </div>
        <TrafficChart rows={API_MODULES} colorBy="billable" />
        <div className="legend">
          <span>
            <i className="swatch swatch--billable" /> Billable
          </span>
          <span>
            <i className="swatch swatch--free" /> Already free
          </span>
        </div>
        {apiTrafficInsightApplies ? (
          <p className="insight">
            Strike and timeslots are most of the volume. Heatmap is fewer
            calls than Strike and a lot slower.
          </p>
        ) : null}
      </section>

      <section className="section">
        <div className="section__head">
          <h2>Volume vs response time</h2>
          <p>
            One point per API module. Height is average response time from
            APIRequestLog.
          </p>
        </div>
        <VolumeScatter rows={API_MODULES} showBilling colorBy="billable" />
        <div className="legend">
          <span>
            <i className="swatch swatch--billable" /> Billable
          </span>
          <span>
            <i className="swatch swatch--free swatch--hollow" /> Already free
          </span>
        </div>
        <p className="insight">
          Heatmap is the outlier — still a lot of traffic, and the slowest.
          Depth View is cheap per call next to it.
        </p>
      </section>

      <section className="section">
        <div className="section__head">
          <h2>What they actually pick</h2>
          <p>
            Same 30 days of APIRequestLog. Heatmap greek is the{" "}
            <code>type</code> query param. Strike expiration is{" "}
            <code>expiration_type</code>.
          </p>
        </div>
        <div className="split">
          <div>
            <h3>Heatmap greeks</h3>
            <ShareTable
              rows={API_GREEKS}
              total={API_HEATMAP_PARAM_TOTAL}
              nameHeader="Greek"
            />
          </div>
          <div>
            <h3>Strike metric</h3>
            <ShareTable
              rows={API_STRIKE_METRICS}
              total={API_STRIKE_PARAM_TOTAL}
              nameHeader="Metric"
            />
          </div>
        </div>
        <h3 className="subhead">Strike expiration</h3>
        <ShareTable
          rows={API_STRIKE_EXPIRY}
          total={API_STRIKE_PARAM_TOTAL}
          nameHeader="Selection"
        />
        <p className="insight">
          Gamma is still first, but Vanna is a much bigger share here than
          on web (~23% vs ~14%). The catch for a cheaper API tier:{" "}
          <code>expiration_type=all</code> is the most popular strike
          selection, and it is the expensive one. 0DTE and a specific date
          are the other two big buckets. Do not put “all expirations” in
          basic just because people ask for it.
        </p>
      </section>

      <section className="section">
        <div className="section__head">
          <h2>What if we weighted units?</h2>
        </div>
        <div className="split">
          <div>
            <h3>What we do today</h3>
            <p className="model-stat">
              <strong>1 unit</strong>
              <span>per successful billable request</span>
            </p>
            <p className="body-copy">
              Strike, Heatmap, and Depth View all cost 1 unit today. That is
              the thing we are questioning.
            </p>
          </div>
          <div>
            <div className="model-head">
              <h3>What if</h3>
              <p className="caption">Not shipped. Just a sketch.</p>
            </div>
            <table className="price-table">
              <thead>
                <tr>
                  <th>Module</th>
                  <th className="num">Proposed units</th>
                </tr>
              </thead>
              <tbody>
                {modulesByProposedUnits(API_MODULES).map((row) => (
                  <tr key={row.id}>
                    <td>{row.label}</td>
                    <td className="num">{row.proposedUnits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="comparison">
          <div>
            <div className="comparison__label">Flat model</div>
            <div className="comparison__value">
              {fmtInt(apiTotals.flatUnits)} units
            </div>
          </div>
          <div>
            <div className="comparison__label">If we weighted it</div>
            <div className="comparison__value">
              {fmtInt(apiTotals.weightedUnits)} units
            </div>
          </div>
          <div>
            <div className="comparison__label">vs flat</div>
            <div className="comparison__value">
              {fmtMultiplier(unitMultiplier)} the flat baseline
            </div>
          </div>
        </div>
        <p className="note">
          This is only about the developer API, and it is a sketch, not a
          pricing change. The 9 / 4 / 1 weights started from API response
          times. ClickHouse agrees heatmap is the expensive family on this
          box: {fmtInt(WAREHOUSE.api.heatmapRanked.queries)} ranked heatmap
          queries read {fmtTb(WAREHOUSE.api.heatmapRanked.tb)} of{" "}
          {fmtTb(WAREHOUSE.api.tb)} — about{" "}
          {Math.round(
            (WAREHOUSE.api.heatmapRanked.tb / WAREHOUSE.api.tb) * 100,
          )}
          % of the API warehouse.
        </p>
      </section>

      <section className="section">
        <div className="section__head">
          <h2>Module table</h2>
          <p>Sort however you want.</p>
        </div>
        <ModuleTable rows={API_MODULES} mode="api" />
      </section>

      <section className="section section--last">
        <div className="section__head">
          <h2>ClickHouse, last 30 days</h2>
          <p>API box only.</p>
        </div>
        <div className="comparison">
          <div>
            <div className="comparison__label">Select queries</div>
            <div className="comparison__value">
              {fmtInt(WAREHOUSE.api.queries)}
            </div>
          </div>
          <div>
            <div className="comparison__label">Data read</div>
            <div className="comparison__value">{fmtTb(WAREHOUSE.api.tb)}</div>
          </div>
          <div>
            <div className="comparison__label">Avg. query time</div>
            <div className="comparison__value">
              {fmtMs(WAREHOUSE.api.avgMs)}
            </div>
          </div>
        </div>
        <table className="price-table warehouse-table">
          <thead>
            <tr>
              <th>SQL match</th>
              <th className="num">Queries</th>
              <th className="num">Data read</th>
              <th className="num">Avg. ms</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Heatmap <code>ranked_*</code></td>
              <td className="num">
                {fmtInt(WAREHOUSE.api.heatmapRanked.queries)}
              </td>
              <td className="num">{fmtTb(WAREHOUSE.api.heatmapRanked.tb)}</td>
              <td className="num">
                {fmtMs(WAREHOUSE.api.heatmapRanked.avgMs)}
              </td>
            </tr>
            <tr>
              <td>Timeslots <code>unioned_timeslots</code></td>
              <td className="num">
                {fmtInt(WAREHOUSE.api.timeslots.queries)}
              </td>
              <td className="num">{fmtTb(WAREHOUSE.api.timeslots.tb)}</td>
              <td className="num">{fmtMs(WAREHOUSE.api.timeslots.avgMs)}</td>
            </tr>
          </tbody>
        </table>
        <p className="note">
          Timeslots is free and still scanned{" "}
          {fmtTb(WAREHOUSE.api.timeslots.tb)} over 30 days. Strike and Depth
          View look the same as web in SQL, so they are not split here.
        </p>
      </section>
    </div>
  );
}

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { surface, setSurface } = useSurface();

  return (
    <div className="page">
      <header className="header">
        <div className="header__main">
          <p className="kicker">OptionsDepth · Engineering</p>
          <h1>Web vs API Units</h1>
          <p className="subtitle">
            What we pulled from prod · {CH_WINDOW_LABEL}
          </p>
          <SurfaceToggle surface={surface} onChange={setSurface} />
        </div>
        <dl className="meta">
          <div>
            <dt>HTTP</dt>
            <dd>
              {surface === "web"
                ? `nginx · ${WEB_HTTP_WINDOW_LABEL}`
                : "APIRequestLog"}
            </dd>
          </div>
          <div>
            <dt>Warehouse</dt>
            <dd>ClickHouse query_log, split by server IP</dd>
          </div>
          <div>
            <dt>Pulled</dt>
            <dd>{PULLED_AT}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>Working notes</dd>
          </div>
          <div className="meta__theme">
            <button type="button" className="theme-toggle" onClick={toggleTheme}>
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </button>
          </div>
        </dl>
      </header>

      <section
        className={surface === "web" ? "surface is-active" : "surface"}
        data-surface="web"
        aria-hidden={surface !== "web"}
      >
        <h2 className="print-only">Web app</h2>
        <WebReport />
      </section>

      <section
        className={surface === "api" ? "surface is-active" : "surface"}
        data-surface="api"
        aria-hidden={surface !== "api"}
      >
        <h2 className="print-only">Developer API</h2>
        <ApiReport />
      </section>
    </div>
  );
}