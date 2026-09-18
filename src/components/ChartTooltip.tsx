import type { ReactNode } from "react";

type TooltipRow = {
  label: string;
  value: string;
};

export function ChartTooltip({
  title,
  rows,
  footnote,
}: {
  title: string;
  rows: TooltipRow[];
  footnote?: ReactNode;
}) {
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip__title">{title}</div>
      {rows.map((row) => (
        <div className="chart-tooltip__row" key={row.label}>
          <span>{row.label}</span>
          <strong>{row.value}</strong>
        </div>
      ))}
      {footnote ? (
        <div className="chart-tooltip__note">{footnote}</div>
      ) : null}
    </div>
  );
}
