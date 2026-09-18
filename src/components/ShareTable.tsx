import type { ShareRow } from "../data";
import { fmtInt, fmtPct } from "../format";

export function ShareTable({
  rows,
  total,
  nameHeader,
}: {
  rows: ShareRow[];
  total: number;
  nameHeader: string;
}) {
  const denom = total || 1;
  return (
    <div className="table-wrap">
      <table className="price-table warehouse-table">
        <thead>
          <tr>
            <th>{nameHeader}</th>
            <th className="num">Requests</th>
            <th className="num">Share</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.label}</td>
              <td className="num">{fmtInt(row.calls)}</td>
              <td className="num">{fmtPct((row.calls / denom) * 100)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
