export function fmtInt(value: number): string {
  return Math.round(value).toLocaleString("en-US");
}

export function fmtRt(seconds: number): string {
  return `${seconds.toFixed(2)}s`;
}

export function fmtPct(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`;
}

export function fmtMultiplier(value: number): string {
  return `${value.toFixed(2)}×`;
}

export function fmtTb(value: number): string {
  if (value >= 100) return `${Math.round(value).toLocaleString("en-US")} TB`;
  if (value >= 10) return `${value.toFixed(1)} TB`;
  return `${value.toFixed(2)} TB`;
}

export function fmtMs(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(2)}s`;
  return `${Math.round(value)} ms`;
}

export function niceCeil(value: number): number {
  if (value <= 0) return 1;
  const mag = 10 ** Math.floor(Math.log10(value));
  const n = value / mag;
  const step =
    n <= 1
      ? 1
      : n <= 2
        ? 2
        : n <= 2.5
          ? 2.5
          : n <= 3
            ? 3
            : n <= 4
              ? 4
              : n <= 5
                ? 5
                : n <= 6
                  ? 6
                  : n <= 8
                    ? 8
                    : 10;
  return step * mag;
}

export function axisTicks(max: number, count = 5): number[] {
  const step = max / (count - 1);
  return Array.from({ length: count }, (_, i) => Math.round(step * i));
}
