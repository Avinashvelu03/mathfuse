# Changelog

All notable changes to mathfuse will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-03-30

### Added

#### `mathfuse/stats`
- `mean`, `geometricMean`, `harmonicMean`, `median`, `mode`, `weightedMean`
- `variance`, `stdDev`, `range`, `iqr`, `mad`
- `percentile`, `fiveNumberSummary`
- `skewness`, `kurtosis`
- `pearsonCorrelation`, `spearmanCorrelation`, `covariance`
- `zScore`, `minMaxNormalize`
- `linearRegression` with R², slope, intercept, and predict function

#### `mathfuse/algebra`
- Vector: `vadd`, `vsub`, `vscale`, `vdot`, `vnorm`, `vnormalize`, `vdistance`, `cosineSimilarity`, `cross3d`, `vhadamard`
- Matrix: `mzeros`, `midentity`, `mtranspose`, `madd`, `mscale`, `mmul`, `mvmul`, `mdet`, `minverse`, `mtrace`, `mrank`, `msolve`

#### `mathfuse/number-theory`
- Primes: `isPrime` (Miller-Rabin), `primesUpTo` (sieve), `nextPrime`, `primeFactors`
- GCD/LCM: `gcd`, `gcdMany`, `lcm`, `lcmMany`
- Combinatorics: `factorial`, `binomial`, `permutations`
- Modular: `modPow`, `eulerTotient`
- Sequences: `fibonacci`, `nthFibonacci` (fast doubling), `collatz`, `digitalRoot`

#### `mathfuse/numerical`
- Root finding: `bisection`, `newtonRaphson`, `brent`
- Differentiation: `derivative`, `secondDerivative`, `gradient`
- Integration: `integrate` (adaptive Simpson), `gaussLegendre`
- Interpolation: `lerp`, `inverseLerp`, `tableInterpolate`, `lagrange`
- Utilities: `clamp`, `roundTo`, `approxEqual`, `remap`, `kahanSum`
