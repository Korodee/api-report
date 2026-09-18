import { useMemo, useState } from "react";
import { MODULES, type ModuleRow } from "../data";
import { fmtInt, fmtPct, fmtRt } from "../format";

type SortKey = "calls30d" | "avgRtS" | "proposedUnits";

const HEADERS: Array<{
  key: SortKey | null;
  label: string;
  align?: "right";
}> = [
  { key: null, label: "Module" },
  { key: "calls30d", label: "Requests · 30d", align: "right" },
  { key: "avgRtS", label: "Avg. response time", align: "right" },
  { key: null, label: "Billable?" },
  { key: null, label: "Users", align: "right" },
  { key: null, label: "≥1s", align: "right" },
  { key: "proposedUnits", label: "Proposed units", align: "right" },
];

function compare(a: ModuleRow, b: ModuleRow, key: SortKey, dir: 1 | -1) {
  if (a[key] === b[key]) return b.calls30d - a.calls30d;
  return (a[key] < b[key] ? -1 : 1) * dir;
}

export function ModuleTable() {
  const [sortKey, setSortKey] = useState<SortKey>("calls30d");
  const [dir, setDir] = useState<1 | -1>(-1);

  const rows = useMemo(
    () => [...MODULES].sort((a, b) => compare(a, b, sortKey, dir)),
    [sortKey, dir],
  );

  function onSort(key: SortKey) {
    if (sortKey === key) {
      setDir((current) => (current === -1 ? 1 : -1));
      return;
    }
    setSortKey(key);
    setDir(-1);
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {HEADERS.map((header) => (
              <th
                key={header.label}
                className={header.align === "right" ? "num" : undefined}
              >
                {header.key ? (
                  <button
                    type="button"
                    className="sort-btn"
                    onClick={() => onSort(header.key!)}
                    aria-label={`Sort by ${header.label}`}
                  >
                    {header.label}
                    {sortKey === header.key ? (
                      <span className="sort-mark is-active">
                        {dir === -1 ? "↓" : "↑"}
                      </span>
                    ) : null}
                  </button>
                ) : (
                  header.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.label}</td>
              <td className="num">{fmtInt(row.calls30d)}</td>
              <td className="num">{fmtRt(row.avgRtS)}</td>
              <td>{row.billable ? "Yes" : "No"}</td>
              <td className="num">{fmtInt(row.users30d)}</td>
              <td className="num">{fmtPct(row.pctGe1s)}</td>
              <td className="num">{row.proposedUnits}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
