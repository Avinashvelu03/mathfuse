/**
 * @module stats
 * Descriptive statistics, probability distributions, and correlation analysis.
 */

/** Validates that an array is non-empty and contains only finite numbers */
function assertNonEmpty(data: number[], label = 'data'): void {
  if (!Array.isArray(data) || data.length === 0) {
    throw new RangeError(`${label} must be a non-empty array`);
  }
  if (data.some((v) => !Number.isFinite(v))) {
    throw new TypeError(`${label} must contain only finite numbers`);
  }
}

// ─── Central Tendency ────────────────────────────────────────────────────────

/**
 * Arithmetic mean of an array of numbers.
 * @example mean([1, 2, 3, 4, 5]) // 3
 */
export function mean(data: number[]): number {
  assertNonEmpty(data);
  return data.reduce((s, v) => s + v, 0) / data.length;
}

/**
 * Geometric mean — useful for growth rates and log-normally distributed data.
 * @example geometricMean([1, 2, 4, 8]) // 2.8284...
 */
export function geometricMean(data: number[]): number {
  assertNonEmpty(data);
  if (data.some((v) => v <= 0)) {
    throw new RangeError('geometricMean requires all values to be positive');
  }
  return Math.exp(data.reduce((s, v) => s + Math.log(v), 0) / data.length);
}

/**
 * Harmonic mean — ideal for rates and ratios.
 * @example harmonicMean([1, 2, 4]) // 1.7142...
 */
export function harmonicMean(data: number[]): number {
  assertNonEmpty(data);
  if (data.some((v) => v <= 0)) {
    throw new RangeError('harmonicMean requires all values to be positive');
  }
  return data.length / data.reduce((s, v) => s + 1 / v, 0);
}

/**
 * Median value of an array (middle value or average of two middle values).
 * @example median([3, 1, 4, 1, 5]) // 3
 */
export function median(data: number[]): number {
  assertNonEmpty(data);
  const sorted = [...data].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Mode(s) — value(s) appearing most frequently.
 * Returns all tied modes sorted ascending.
 * @example mode([1, 2, 2, 3, 3]) // [2, 3]
 */
export function mode(data: number[]): number[] {
  assertNonEmpty(data);
  const freq = new Map<number, number>();
  for (const v of data) freq.set(v, (freq.get(v) ?? 0) + 1);
  const max = Math.max(...freq.values());
  return [...freq.entries()]
    .filter(([, c]) => c === max)
    .map(([v]) => v)
    .sort((a, b) => a - b);
}

/**
 * Weighted mean — each value scaled by its corresponding weight.
 * @example weightedMean([1, 2, 3], [1, 2, 3]) // 2.333...
 */
export function weightedMean(values: number[], weights: number[]): number {
  if (values.length !== weights.length) {
    throw new RangeError('values and weights must have equal length');
  }
  assertNonEmpty(values, 'values');
  assertNonEmpty(weights, 'weights');
  const totalWeight = weights.reduce((s, w) => s + w, 0);
  if (totalWeight === 0) throw new RangeError('sum of weights must not be zero');
  return (
    values.reduce((s, v, i) => s + v * weights[i], 0) / totalWeight
  );
}

// ─── Spread / Dispersion ─────────────────────────────────────────────────────

/**
 * Variance — average squared deviation from the mean.
 * @param population - if true, divides by N; otherwise by N−1 (default: false)
 */
export function variance(data: number[], population = false): number {
  assertNonEmpty(data);
  if (!population && data.length < 2) {
    throw new RangeError('sample variance requires at least 2 data points');
  }
  const m = mean(data);
  const sum = data.reduce((s, v) => s + (v - m) ** 2, 0);
  return sum / (population ? data.length : data.length - 1);
}

/**
 * Standard deviation — square root of variance.
 * @param population - if true, uses population std dev (default: false)
 */
export function stdDev(data: number[], population = false): number {
  return Math.sqrt(variance(data, population));
}

/**
 * Range — difference between max and min.
 */
export function range(data: number[]): number {
  assertNonEmpty(data);
  return Math.max(...data) - Math.min(...data);
}

/**
 * Inter-quartile range (IQR) — difference between Q3 and Q1.
 */
export function iqr(data: number[]): number {
  return percentile(data, 75) - percentile(data, 25);
}

/**
 * Mean absolute deviation from the median (robust measure of spread).
 */
export function mad(data: number[]): number {
  assertNonEmpty(data);
  const med = median(data);
  return median(data.map((v) => Math.abs(v - med)));
}

// ─── Percentiles & Quantiles ─────────────────────────────────────────────────

/**
 * Percentile using linear interpolation (same as NumPy default).
 * @param p - percentile in [0, 100]
 * @example percentile([1,2,3,4,5], 50) // 3
 */
export function percentile(data: number[], p: number): number {
  assertNonEmpty(data);
  if (p < 0 || p > 100) throw new RangeError('p must be between 0 and 100');
  const sorted = [...data].sort((a, b) => a - b);
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

/**
 * Five-number summary: [min, Q1, median, Q3, max]
 */
export function fiveNumberSummary(
  data: number[]
): [number, number, number, number, number] {
  assertNonEmpty(data);
  return [
    Math.min(...data),
    percentile(data, 25),
    median(data),
    percentile(data, 75),
    Math.max(...data),
  ];
}

// ─── Shape ───────────────────────────────────────────────────────────────────

/**
 * Skewness — measure of distribution asymmetry (Fisher's moment coefficient).
 * Positive = right-skewed, negative = left-skewed.
 */
export function skewness(data: number[]): number {
  assertNonEmpty(data);
  if (data.length < 3) throw new RangeError('skewness requires at least 3 data points');
  const m = mean(data);
  const s = stdDev(data);
  if (s === 0) return 0;
  const n = data.length;
  const sum = data.reduce((acc, v) => acc + ((v - m) / s) ** 3, 0);
  return (n / ((n - 1) * (n - 2))) * sum;
}

/**
 * Excess kurtosis (Fisher's definition, normal distribution = 0).
 */
export function kurtosis(data: number[]): number {
  assertNonEmpty(data);
  if (data.length < 4) throw new RangeError('kurtosis requires at least 4 data points');
  const m = mean(data);
  const s = stdDev(data);
  if (s === 0) return 0;
  const n = data.length;
  const sum = data.reduce((acc, v) => acc + ((v - m) / s) ** 4, 0);
  const kurt =
    ((n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3))) * sum -
    (3 * (n - 1) ** 2) / ((n - 2) * (n - 3));
  return kurt;
}

// ─── Correlation & Covariance ────────────────────────────────────────────────

/**
 * Pearson correlation coefficient between two arrays.
 * Returns a value in [−1, 1].
 */
export function pearsonCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length) {
    throw new RangeError('x and y must have equal length');
  }
  assertNonEmpty(x, 'x');
  assertNonEmpty(y, 'y');
  const n = x.length;
  const mx = mean(x);
  const my = mean(y);
  let num = 0, dx2 = 0, dy2 = 0;
  for (let i = 0; i < n; i++) {
    const dx = x[i] - mx;
    const dy = y[i] - my;
    num += dx * dy;
    dx2 += dx * dx;
    dy2 += dy * dy;
  }
  const denom = Math.sqrt(dx2 * dy2);
  if (denom === 0) return 0;
  return num / denom;
}

/**
 * Spearman rank correlation — robust to outliers and non-linear monotonic relationships.
 */
export function spearmanCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length) {
    throw new RangeError('x and y must have equal length');
  }
  const rank = (arr: number[]) => {
    const sorted = [...arr].sort((a, b) => a - b);
    return arr.map((v) => sorted.indexOf(v) + 1);
  };
  return pearsonCorrelation(rank(x), rank(y));
}

/**
 * Sample covariance between two arrays.
 */
export function covariance(x: number[], y: number[]): number {
  if (x.length !== y.length) {
    throw new RangeError('x and y must have equal length');
  }
  assertNonEmpty(x, 'x');
  if (x.length < 2) throw new RangeError('covariance requires at least 2 data points');
  const mx = mean(x);
  const my = mean(y);
  return (
    x.reduce((s, xi, i) => s + (xi - mx) * (y[i] - my), 0) / (x.length - 1)
  );
}

// ─── Normalization ───────────────────────────────────────────────────────────

/**
 * Z-score normalization: (x − mean) / stdDev
 */
export function zScore(data: number[]): number[] {
  assertNonEmpty(data);
  const m = mean(data);
  const s = stdDev(data);
  if (s === 0) return data.map(() => 0);
  return data.map((v) => (v - m) / s);
}

/**
 * Min-max normalization to [0, 1].
 */
export function minMaxNormalize(data: number[]): number[] {
  assertNonEmpty(data);
  const min = Math.min(...data);
  const max = Math.max(...data);
  if (min === max) return data.map(() => 0);
  return data.map((v) => (v - min) / (max - min));
}

// ─── Simple Linear Regression ────────────────────────────────────────────────

export interface LinearRegressionResult {
  slope: number;
  intercept: number;
  r2: number;
  predict: (x: number) => number;
}

/**
 * Ordinary least-squares (OLS) simple linear regression.
 * @returns slope, intercept, R² coefficient, and a predict function.
 */
export function linearRegression(
  x: number[],
  y: number[]
): LinearRegressionResult {
  if (x.length !== y.length) {
    throw new RangeError('x and y must have equal length');
  }
  assertNonEmpty(x, 'x');
  assertNonEmpty(y, 'y');
  const n = x.length;
  const mx = mean(x);
  const my = mean(y);
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) {
    num += (x[i] - mx) * (y[i] - my);
    den += (x[i] - mx) ** 2;
  }
  if (den === 0) throw new RangeError('x values must not all be identical');
  const slope = num / den;
  const intercept = my - slope * mx;
  const predict = (xi: number) => slope * xi + intercept;
  const ssRes = y.reduce((s, yi, i) => s + (yi - predict(x[i])) ** 2, 0);
  const ssTot = y.reduce((s, yi) => s + (yi - my) ** 2, 0);
  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;
  return { slope, intercept, r2, predict };
}
