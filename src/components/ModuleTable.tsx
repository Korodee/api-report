import { useMemo, useState } from "react";
import type { TrafficRow } from "../data";
import { fmtInt, fmtPct, fmtRt } from "../format";

type SortKey = "calls" | "avgRtS" | "proposedUnits";

export function ModuleTable({
  rows,
  mode,
}: {
  rows: TrafficRow[];
  mode: "api" | "web";
}) {
  const [sortKey, setSortKey] = useState<SortKey>("calls");
  const [dir, setDir] = useState<1 | -1>(-1);

  const headers: Array<{
    key: SortKey | null;
    label: string;
    align?: "right";
  }> =
    mode === "api"
      ? [
          { key: null, label: "Module" },
          { key: "calls", label: "Requests · 30d", align: "right" },
          { key: "avgRtS", label: "Avg. response time", align: "right" },
          { key: null, label: "Billable?" },
          { key: null, label: "Users", align: "right" },
          { key: null, label: "≥1s", align: "right" },
          { key: "proposedUnits", label: "Proposed units", align: "right" },
        ]
      : [
          { key: null, label: "Module" },
          { key: "calls", label: "Requests · this week", align: "right" },
          { key: "avgRtS", label: "Avg. response time", align: "right" },
          { key: null, label: "Kind" },
          { key: null, label: "≥1s", align: "right" },
        ];

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      const av = a[sortKey] ?? 0;
      const bv = b[sortKey] ?? 0;
      if (av === bv) return b.calls - a.calls;
      return (av < bv ? -1 : 1) * dir;
    });
  }, [rows, sortKey, dir]);

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
            {headers.map((header) => (
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
          {sorted.map((row) => (
            <tr key={row.id}>
              <td>{row.label}</td>
              <td className="num">{fmtInt(row.calls)}</td>
              <td className="num">{fmtRt(row.avgRtS)}</td>
              {mode === "api" ? (
                <>
                  <td>{row.billable ? "Yes" : "No"}</td>
                  <td className="num">{fmtInt(row.users ?? 0)}</td>
                  <td className="num">{fmtPct(row.pctGe1s)}</td>
                  <td className="num">{row.proposedUnits}</td>
                </>
              ) : (
                <>
                  <td>{row.kind === "helper" ? "Helper" : "Chart"}</td>
                  <td className="num">{fmtPct(row.pctGe1s)}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}