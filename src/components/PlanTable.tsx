import type { PlanFeatureRow } from "../data";
import { PLAN_ADV, PLAN_CORE, PLAN_LITE } from "../data";

export function PlanTable({ rows }: { rows: PlanFeatureRow[] }) {
  return (
    <div className="table-wrap">
      <table className="price-table warehouse-table plan-table">
        <thead>
          <tr>
            <th></th>
            <th>
              {PLAN_LITE.name} · ${PLAN_LITE.monthly}/mo
            </th>
            <th>
              {PLAN_CORE.name} · ${PLAN_CORE.monthly}/mo
            </th>
            <th>
              {PLAN_ADV.name} · ${PLAN_ADV.monthly}/mo
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.label}</td>
              <td>{row.lite}</td>
              <td>{row.core}</td>
              <td>{row.advanced}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
