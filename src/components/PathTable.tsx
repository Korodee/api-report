import type { PathRow } from "../data";
import { fmtInt, fmtRt } from "../format";

function shortPath(path: string): string {
  return path.replace(/^\/api\/v1\/charts\//, "");
}

export function PathTable({ rows }: { rows: PathRow[] }) {
  return (
    <div className="table-wrap">
      <table className="data-table data-table--paths">
        <thead>
          <tr>
            <th>Path under /api/v1/charts/</th>
            <th>Module</th>
            <th className="num">Requests</th>
            <th className="num">2xx</th>
            <th className="num">Avg. RT</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.path}>
              <td>
                <code className="path">{shortPath(row.path)}</code>
              </td>
              <td>{row.module}</td>
              <td className="num">{fmtInt(row.calls)}</td>
              <td className="num">{fmtInt(row.ok)}</td>
              <td className="num">{fmtRt(row.avgRtS)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}