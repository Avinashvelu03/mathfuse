import {
  mean, geometricMean, harmonicMean, median, mode, weightedMean,
  variance, stdDev, range, iqr, mad, percentile, fiveNumberSummary,
  skewness, kurtosis, pearsonCorrelation, spearmanCorrelation,
  covariance, zScore, minMaxNormalize, linearRegression,
} from '../src/stats';

const close = (a: number, b: number, tol = 1e-9) =>
  expect(Math.abs(a - b)).toBeLessThan(tol);

describe('stats › central tendency', () => {
  test('mean', () => {
    expect(mean([1, 2, 3, 4, 5])).toBe(3);
    close(mean([1.5, 2.5, 3.5]), 2.5);
  });
  test('mean throws on empty', () => {
    expect(() => mean([])).toThrow(RangeError);
  });
  test('geometricMean', () => {
    close(geometricMean([1, 2, 4, 8]), Math.pow(64, 0.25), 1e-10);
    close(geometricMean([4, 1]), 2, 1e-10);
  });
  test('geometricMean throws on non-positive', () => {
    expect(() => geometricMean([1, 0, 3])).toThrow(RangeError);
    expect(() => geometricMean([-1, 2, 3])).toThrow(RangeError);
  });
  test('harmonicMean', () => {
    close(harmonicMean([1, 2, 4]), 12 / 7, 1e-10);
  });
  test('harmonicMean throws on zero', () => {
    expect(() => harmonicMean([1, 0, 3])).toThrow(RangeError);
  });
  test('median odd length', () => expect(median([3, 1, 4, 1, 5])).toBe(3));
  test('median even length', () => expect(median([1, 2, 3, 4])).toBe(2.5));
  test('mode single', () => expect(mode([1, 2, 2, 3])).toEqual([2]));
  test('mode multiple', () => expect(mode([1, 2, 2, 3, 3])).toEqual([2, 3]));
  test('weightedMean', () => {
    close(weightedMean([1, 2, 3], [1, 2, 3]), 14 / 6, 1e-10);
  });
  test('weightedMean throws on mismatched lengths', () => {
    expect(() => weightedMean([1, 2, 3], [1, 2])).toThrow(RangeError);
  });
});

describe('stats › spread', () => {
  const data = [2, 4, 4, 4, 5, 5, 7, 9];
  test('variance population', () => close(variance(data, true), 4, 1e-10));
  test('variance sample', () => close(variance(data), 4.571428571, 1e-7));
  test('variance sample throws on n=1', () => expect(() => variance([1])).toThrow(RangeError));
  test('stdDev', () => close(stdDev([2, 4, 4, 4, 5, 5, 7, 9], true), 2, 1e-10));
  test('range', () => expect(range([1, 3, 7, 2])).toBe(6));
  test('iqr', () => {
    const vals = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    expect(iqr(vals)).toBeGreaterThan(0);
  });
  test('mad', () => {
    close(mad([1, 1, 2, 2, 4, 6, 9]), 1, 1e-10);
  });
});

describe('stats › percentile', () => {
  const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  test('p50 = median', () => expect(percentile(data, 50)).toBe(median(data)));
  test('p0 = min', () => expect(percentile(data, 0)).toBe(1));
  test('p100 = max', () => expect(percentile(data, 100)).toBe(10));
  test('fiveNumberSummary', () => {
    const [min, q1, med, q3, max] = fiveNumberSummary(data);
    expect(min).toBe(1);
    expect(max).toBe(10);
    expect(med).toBe(median(data));
    expect(q1).toBeLessThan(med);
    expect(q3).toBeGreaterThan(med);
  });
});

describe('stats › shape', () => {
  const normal = [2, 4, 4, 4, 5, 5, 7, 9];
  test('skewness is a number', () => expect(typeof skewness(normal)).toBe('number'));
  test('skewness throws on < 3 data points', () => {
    expect(() => skewness([1])).toThrow(RangeError);
    expect(() => skewness([1, 2])).toThrow(RangeError);
  });
  test('kurtosis is a number', () => {
    const data = [1, 2, 3, 4, 5, 6, 7, 8];
    expect(typeof kurtosis(data)).toBe('number');
  });
  test('kurtosis throws on < 4 data points', () => {
    expect(() => kurtosis([1, 2, 3])).toThrow(RangeError);
  });
});

describe('stats › correlation', () => {
  const x = [1, 2, 3, 4, 5];
  const y = [2, 4, 6, 8, 10];
  test('pearson perfect positive', () => close(pearsonCorrelation(x, y), 1));
  test('pearson perfect negative', () => close(pearsonCorrelation(x, y.map(v => -v)), -1));
  test('spearman', () => close(spearmanCorrelation(x, y), 1));
  test('spearman with ties', () => {
    // tied values should use average ranks
    const xt = [1, 2, 2, 3];
    const yt = [1, 2, 3, 4];
    const r = spearmanCorrelation(xt, yt);
    expect(typeof r).toBe('number');
    expect(r).toBeGreaterThan(0.9);
  });
  test('covariance', () => close(covariance(x, y), 5.0));
  test('covariance throws on n=1', () => expect(() => covariance([1], [2])).toThrow(RangeError));
  test('pearson flat / zero variance', () => expect(pearsonCorrelation([1, 1, 1], [1, 2, 3])).toBe(0));
});

describe('stats › normalization', () => {
  test('zScore mean ≈ 0', () => close(mean(zScore([1, 2, 3, 4, 5])), 0, 1e-10));
  test('zScore std ≈ 1', () => close(stdDev(zScore([1, 2, 3, 4, 5])), 1, 1e-10));
  test('minMax min = 0', () => expect(Math.min(...minMaxNormalize([3, 1, 4, 1, 5]))).toBe(0));
  test('minMax max = 1', () => expect(Math.max(...minMaxNormalize([3, 1, 4, 1, 5]))).toBe(1));
});

describe('stats › linear regression', () => {
  const x = [1, 2, 3, 4, 5];
  const y = [2, 4, 6, 8, 10];
  const reg = linearRegression(x, y);
  test('slope = 2', () => close(reg.slope, 2));
  test('intercept = 0', () => close(reg.intercept, 0));
  test('r² = 1', () => close(reg.r2, 1));
  test('predict', () => close(reg.predict(6), 12));
  test('linearRegression throws on n=1', () => expect(() => linearRegression([1], [1])).toThrow(RangeError));
  test('linearRegression throws on collinear x', () => expect(() => linearRegression([2,2,2], [1,2,3])).toThrow(RangeError));
});

// ─── Stats zero-variance edge cases ───────────────────────────────────────────────
describe('stats › zero-variance edge cases', () => {
  test('skewness constant data returns 0', () =>
    expect(skewness([5, 5, 5, 5])).toBe(0));
  test('kurtosis constant data returns 0', () =>
    expect(kurtosis([5, 5, 5, 5, 5])).toBe(0));
  test('minMaxNormalize constant array returns zeros', () =>
    minMaxNormalize([4, 4, 4]).forEach(v => expect(v).toBe(0)));
  test('pearsonCorrelation sy===0 returns 0', () =>
    expect(pearsonCorrelation([1, 2, 3], [5, 5, 5])).toBe(0));
  test('spearmanCorrelation all-ties returns 0', () =>
    expect(spearmanCorrelation([1, 1, 1], [2, 2, 2])).toBe(0));
  test('linearRegression ssTot=0 returns r2=1', () => {
    const reg = linearRegression([1, 2, 3], [5, 5, 5]);
    expect(reg.r2).toBe(1);
  });
  test('spearmanCorrelation length mismatch throws', () =>
    expect(() => spearmanCorrelation([1, 2], [1, 2, 3])).toThrow(RangeError));
  test('covariance length mismatch throws', () =>
    expect(() => covariance([1, 2], [1])).toThrow(RangeError));
  test('zScore constant data returns NaN (s=0 division)', () => {
    const z = zScore([3, 3, 3]);
    z.forEach(v => expect(isNaN(v)).toBe(true));
  });
});

// ─── Stats coverage completions ────────────────────────────────────────────────
describe('stats › coverage completions', () => {
  test('linearRegression length mismatch throws', () =>
    expect(() => linearRegression([1, 2, 3], [1, 2])).toThrow(RangeError));
});
