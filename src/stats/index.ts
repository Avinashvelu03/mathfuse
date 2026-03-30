/**
 * @module stats
 * Descriptive statistics, correlation, normalization, and regression.
 */

// ─── Helpers ────────────────────────────────────────────────────────────────

function assertNonEmpty(data: number[], label = 'data'): void {
  if (data.length === 0) throw new RangeError(`${label} must be non-empty`);
}

// ─── Central Tendency ───────────────────────────────────────────────────────

export function mean(data: number[]): number {
  assertNonEmpty(data);
  return data.reduce((s, v) => s + v, 0) / data.length;
}

export function geometricMean(data: number[]): number {
  assertNonEmpty(data);
  const logSum = data.reduce((s, v) => s + Math.log(v), 0);
  return Math.exp(logSum / data.length);
}

export function harmonicMean(data: number[]): number {
  assertNonEmpty(data);
  const recipSum = data.reduce((s, v) => s + 1 / v, 0);
  return data.length / recipSum;
}

export function median(data: number[]): number {
  assertNonEmpty(data);
  const sorted = [...data].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function mode(data: number[]): number[] {
  assertNonEmpty(data);
  const freq = new Map<number, number>();
  for (const v of data) freq.set(v, (freq.get(v) ?? 0) + 1);
  const maxFreq = Math.max(...freq.values());
  return [...freq.entries()]
    .filter(([, f]) => f === maxFreq)
    .map(([v]) => v)
    .sort((a, b) => a - b);
}

export function weightedMean(data: number[], weights: number[]): number {
  assertNonEmpty(data);
  const wSum = weights.reduce((s, w) => s + w, 0);
  return data.reduce((s, v, i) => s + v * weights[i], 0) / wSum;
}

// ─── Spread ─────────────────────────────────────────────────────────────────

export function variance(data: number[], population = false): number {
  assertNonEmpty(data);
  const m = mean(data);
  const sum = data.reduce((s, v) => s + (v - m) ** 2, 0);
  return sum / (population ? data.length : data.length - 1);
}

export function stdDev(data: number[], population = false): number {
  return Math.sqrt(variance(data, population));
}

export function range(data: number[]): number {
  assertNonEmpty(data);
  return Math.max(...data) - Math.min(...data);
}

export function iqr(data: number[]): number {
  assertNonEmpty(data);
  return percentile(data, 75) - percentile(data, 25);
}

export function mad(data: number[]): number {
  assertNonEmpty(data);
  const m = median(data);
  return median(data.map((v) => Math.abs(v - m)));
}

// ─── Percentile ─────────────────────────────────────────────────────────────

export function percentile(data: number[], p: number): number {
  assertNonEmpty(data);
  const sorted = [...data].sort((a, b) => a - b);
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  return sorted[lo] + (idx - lo) * (sorted[hi] - sorted[lo]);
}

export function fiveNumberSummary(data: number[]): [number, number, number, number, number] {
  assertNonEmpty(data);
  const sorted = [...data].sort((a, b) => a - b);
  return [
    sorted[0],
    percentile(data, 25),
    median(data),
    percentile(data, 75),
    sorted[sorted.length - 1],
  ];
}

// ─── Shape ──────────────────────────────────────────────────────────────────

export function skewness(data: number[]): number {
  assertNonEmpty(data);
  const m = mean(data);
  const s = stdDev(data);
  if (s === 0) return 0;
  const n = data.length;
  return (
    (n / ((n - 1) * (n - 2))) *
    data.reduce((sum, v) => sum + ((v - m) / s) ** 3, 0)
  );
}

export function kurtosis(data: number[]): number {
  assertNonEmpty(data);
  const m = mean(data);
  const s = stdDev(data);
  if (s === 0) return 0;
  const n = data.length;
  const k4 = data.reduce((sum, v) => sum + ((v - m) / s) ** 4, 0);
  return k4 / n - 3;
}

// ─── Correlation & Covariance ───────────────────────────────────────────────

export function covariance(x: number[], y: number[]): number {
  if (x.length !== y.length) throw new RangeError('x and y must have equal length');
  assertNonEmpty(x);
  const mx = mean(x), my = mean(y);
  return x.reduce((s, v, i) => s + (v - mx) * (y[i] - my), 0) / (x.length - 1);
}

export function pearsonCorrelation(x: number[], y: number[]): number {
  return covariance(x, y) / (stdDev(x) * stdDev(y));
}

export function spearmanCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length) throw new RangeError('x and y must have equal length');
  const rankArr = (arr: number[]): number[] => {
    const sorted = [...arr].sort((a, b) => a - b);
    return arr.map((v) => sorted.indexOf(v) + 1);
  };
  return pearsonCorrelation(rankArr(x), rankArr(y));
}

// ─── Normalization ──────────────────────────────────────────────────────────

export function zScore(data: number[]): number[] {
  const m = mean(data);
  const s = stdDev(data);
  return data.map((v) => (v - m) / s);
}

export function minMaxNormalize(data: number[]): number[] {
  assertNonEmpty(data);
  const mn = Math.min(...data);
  const mx = Math.max(...data);
  const r = mx - mn;
  if (r === 0) return data.map(() => 0);
  return data.map((v) => (v - mn) / r);
}

// ─── Linear Regression ──────────────────────────────────────────────────────

export interface RegressionResult {
  slope: number;
  intercept: number;
  r2: number;
  predict: (x: number) => number;
}

export function linearRegression(x: number[], y: number[]): RegressionResult {
  if (x.length !== y.length) throw new RangeError('x and y must have equal length');
  assertNonEmpty(x);
  const n = x.length;
  const sx = x.reduce((s, v) => s + v, 0);
  const sy = y.reduce((s, v) => s + v, 0);
  const sxy = x.reduce((s, v, i) => s + v * y[i], 0);
  const sxx = x.reduce((s, v) => s + v * v, 0);
  const slope = (n * sxy - sx * sy) / (n * sxx - sx * sx);
  const intercept = (sy - slope * sx) / n;
  const yMean = sy / n;
  const ssTot = y.reduce((s, v) => s + (v - yMean) ** 2, 0);
  const ssRes = y.reduce((s, v, i) => s + (v - (slope * x[i] + intercept)) ** 2, 0);
  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;
  return { slope, intercept, r2, predict: (xv: number): number => slope * xv + intercept };
}
