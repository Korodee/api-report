import { TrafficChart } from "./components/TrafficChart";
import { VolumeScatter } from "./components/VolumeScatter";
import { ModuleTable } from "./components/ModuleTable";
import {
  modulesByProposedUnits,
  PULLED_AT,
  SOURCE,
  totals,
  trafficInsightApplies,
  unitMultiplier,
  WINDOW_LABEL,
} from "./data";
import { fmtInt, fmtMultiplier, fmtRt } from "./format";
import { useTheme } from "./hooks";

export default function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="page">
      <header className="header">
        <div className="header__main">
          <p className="kicker">OptionsDepth · Engineering</p>
          <h1>API Units vs Infrastructure Cost</h1>
          <p className="subtitle">
            Production API usage analysis · {WINDOW_LABEL}
          </p>
        </div>
        <dl className="meta">
          <div>
            <dt>Source</dt>
            <dd>{SOURCE}</dd>
          </div>
          <div>
            <dt>Pulled</dt>
            <dd>{PULLED_AT}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>Internal analysis</dd>
          </div>
          <div className="meta__theme">
            <button type="button" className="theme-toggle" onClick={toggleTheme}>
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </button>
          </div>
        </dl>
      </header>

      <p className="lede">
        Right now, every successful billable API request costs 1 unit,
        regardless of how expensive the endpoint is to run. The data shows a
        noticeable difference in response times between modules, especially
        Heatmap, Strike, and Depth View. This page looks at what that
        difference could mean for API unit pricing.
      </p>

      <section className="metrics" aria-label="Key numbers">
        <div className="metric">
          <div className="metric__value">{fmtInt(totals.loggedRequests)}</div>
          <div className="metric__label">logged requests · 30d</div>
        </div>
        <div className="metric">
          <div className="metric__value">{fmtInt(totals.billableRequests)}</div>
          <div className="metric__label">requests across billable modules</div>
        </div>
        <div className="metric">
          <div className="metric__value">{fmtInt(totals.freeRequests)}</div>
          <div className="metric__label">requests already free</div>
        </div>
        <div className="metric">
          <div className="metric__value">{fmtRt(totals.heatmapAvgRt)}</div>
          <div className="metric__label">Heatmap avg. response time</div>
        </div>
      </section>

      <section className="section">
        <div className="section__head">
          <h2>Where the API traffic goes</h2>
          <p>Request volume across the main API modules over the last 30 days.</p>
        </div>
        <TrafficChart />
        <div className="legend">
          <span>
            <i className="swatch swatch--billable" /> Billable
          </span>
          <span>
            <i className="swatch swatch--free" /> Already free
          </span>
        </div>
        {trafficInsightApplies ? (
          <p className="insight">
            Strike and timeslots account for most of the traffic. Heatmap
            handles fewer requests than Strike but takes considerably longer
            to respond.
          </p>
        ) : null}
      </section>

      <section className="section">
        <div className="section__head">
          <h2>Request volume vs. response time</h2>
          <p>
            Each point is one API module. The vertical axis is average response
            time.
          </p>
        </div>
        <VolumeScatter />
        <div className="legend">
          <span>
            <i className="swatch swatch--billable" /> Billable
          </span>
          <span>
            <i className="swatch swatch--free swatch--hollow" /> Already free
          </span>
        </div>
        <p className="insight">
          Heatmap stands out because it combines high request volume with the
          highest average response time. Depth View, by comparison, is much
          faster per request.
        </p>
      </section>

      <section className="section">
        <div className="section__head">
          <h2>The pricing question</h2>
        </div>
        <div className="split">
          <div>
            <h3>Current model</h3>
            <p className="model-stat">
              <strong>1 unit</strong>
              <span>per successful billable request</span>
            </p>
            <p className="body-copy">
              At the moment, Strike, Heatmap, and Depth View all consume the
              same number of units per successful request.
            </p>
          </div>
          <div>
            <div className="model-head">
              <h3>Illustrative model</h3>
              <p className="caption">Illustrative proposal — not deployed</p>
            </div>
            <table className="price-table">
              <thead>
                <tr>
                  <th>Module</th>
                  <th className="num">Proposed units</th>
                </tr>
              </thead>
              <tbody>
                {modulesByProposedUnits.map((row) => (
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
              {fmtInt(totals.flatUnits)} units
            </div>
          </div>
          <div>
            <div className="comparison__label">Illustrative weighted model</div>
            <div className="comparison__value">
              {fmtInt(totals.weightedUnits)} units
            </div>
          </div>
          <div>
            <div className="comparison__label">Difference</div>
            <div className="comparison__value">
              {fmtMultiplier(unitMultiplier)} the flat baseline
            </div>
          </div>
        </div>
        <p className="note">
          This is a pricing scenario, not a direct infrastructure-cost
          calculation. The weights are based on response-time differences and
          need to be validated against ClickHouse-level metrics before being
          adopted.
        </p>
      </section>

      <section className="section">
        <div className="section__head">
          <h2>Module breakdown</h2>
          <p>Sort by request volume, response time, or proposed units.</p>
        </div>
        <ModuleTable />
      </section>

      <section className="section section--last">
        <h2>Before changing the pricing model</h2>
        <ol className="next-steps">
          <li>
            Check ClickHouse query logs to see whether response time reflects
            actual query cost.
          </li>
          <li>
            Model how different unit weights would affect existing API customers
            and their quotas.
          </li>
          <li>
            Decide how free endpoints should behave when a customer reaches the
            global overage limit.
          </li>
        </ol>
      </section>
    </div>
  );
}
