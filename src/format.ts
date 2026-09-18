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
