/**
 * mathfuse — A modern, zero-dependency TypeScript math utility library.
 *
 * @packageDocumentation
 */

export * as stats from './stats/index.js';
export * as algebra from './algebra/index.js';
export * as nt from './number-theory/index.js';
export * as numerical from './numerical/index.js';

// Convenience re-exports for the most-used functions
export {
  mean, median, mode, stdDev, variance, percentile,
  pearsonCorrelation, linearRegression, zScore, minMaxNormalize,
} from './stats/index.js';

export {
  vadd, vsub, vdot, vnorm, vnormalize, vdistance,
  mmul, mdet, minverse, msolve, mtranspose, midentity,
} from './algebra/index.js';

export {
  isPrime, primesUpTo, gcd, lcm, factorial, binomial,
  fibonacci, nthFibonacci, primeFactors,
} from './number-theory/index.js';

export {
  bisection, newtonRaphson, brent,
  derivative, integrate, lerp, clamp, roundTo, approxEqual,
} from './numerical/index.js';

export const VERSION = '1.0.0';
