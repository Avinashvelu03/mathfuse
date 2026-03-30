# mathfuse

[![CI](https://github.com/scientistmaths/mathfuse/actions/workflows/ci.yml/badge.svg)](https://github.com/scientistmaths/mathfuse/actions)
[![npm version](https://img.shields.io/npm/v/mathfuse.svg)](https://www.npmjs.com/package/mathfuse)
[![npm downloads](https://img.shields.io/npm/dm/mathfuse.svg)](https://www.npmjs.com/package/mathfuse)
[![Coverage](https://codecov.io/gh/scientistmaths/mathfuse/branch/main/graph/badge.svg)](https://codecov.io/gh/scientistmaths/mathfuse)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/mathfuse)](https://bundlephobia.com/package/mathfuse)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

**A modern, zero-dependency TypeScript math utility library.**  
Tree-shakeable · ESM + CJS · Browser & Node.js · Fully typed

---

## Features

| Module | What's included |
|--------|----------------|
| **`stats`** | Mean, median, mode, std dev, variance, percentiles, IQR, MAD, skewness, kurtosis, Pearson/Spearman correlation, covariance, z-score, min-max normalization, linear regression |
| **`algebra`** | Vector ops (add, dot, norm, normalize, cosine similarity, cross product), matrix ops (multiply, determinant, inverse, rank, transpose, solve) |
| **`number-theory`** | Miller-Rabin primality, Sieve of Eratosthenes, GCD/LCM, factorial, binomial, permutations, modular exponentiation, Euler's totient, Fibonacci, Collatz |
| **`numerical`** | Bisection, Newton-Raphson, Brent's method, numerical derivative/gradient, adaptive Simpson integration, Gauss-Legendre quadrature, Lagrange interpolation, Kahan summation |

---

## Install

```bash
npm install mathfuse
# or
yarn add mathfuse
# or
pnpm add mathfuse
```

---

## Quick Start

```typescript
import { mean, stdDev, linearRegression } from 'mathfuse';
// or tree-shake specific modules:
import { mean, stdDev } from 'mathfuse/stats';
import { isPrime, fibonacci } from 'mathfuse/number-theory';
import { newtonRaphson, integrate } from 'mathfuse/numerical';
import { mmul, mdet, msolve } from 'mathfuse/algebra';
```

---

## API Reference

### 📊 Statistics (`mathfuse/stats`)

#### Central Tendency

```typescript
import { mean, median, mode, geometricMean, harmonicMean, weightedMean } from 'mathfuse/stats';

mean([1, 2, 3, 4, 5])              // 3
median([3, 1, 4, 1, 5])            // 3
mode([1, 2, 2, 3, 3])              // [2, 3]
geometricMean([1, 2, 4, 8])        // 2.828...
harmonicMean([1, 2, 4])            // 1.714...
weightedMean([1, 2, 3], [1, 2, 3]) // 2.333...
```

#### Spread & Dispersion

```typescript
import { variance, stdDev, range, iqr, mad } from 'mathfuse/stats';

variance([2, 4, 4, 4, 5, 5, 7, 9])           // 4.571 (sample)
variance([2, 4, 4, 4, 5, 5, 7, 9], true)      // 4.0   (population)
stdDev([2, 4, 4, 4, 5, 5, 7, 9], true)        // 2.0
iqr([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])          // 4.5
mad([1, 1, 2, 2, 4, 6, 9])                    // 1.0
```

#### Percentiles

```typescript
import { percentile, fiveNumberSummary } from 'mathfuse/stats';

percentile([1,2,3,4,5,6,7,8,9,10], 90) // 9.1
fiveNumberSummary([1,2,3,4,5])          // [1, 1.5, 3, 4.5, 5]
```

#### Correlation & Regression

```typescript
import { pearsonCorrelation, spearmanCorrelation, linearRegression } from 'mathfuse/stats';

const x = [1, 2, 3, 4, 5];
const y = [2, 4, 5, 4, 5];

pearsonCorrelation(x, y)   // 0.8320...
spearmanCorrelation(x, y)  // 0.8207...

const reg = linearRegression(x, y);
reg.slope      // 0.7
reg.intercept  // 1.7
reg.r2         // 0.6923
reg.predict(6) // 5.9
```

#### Normalization

```typescript
import { zScore, minMaxNormalize } from 'mathfuse/stats';

zScore([1, 2, 3, 4, 5])          // [-1.41, -0.71, 0, 0.71, 1.41]
minMaxNormalize([1, 2, 3, 4, 5]) // [0, 0.25, 0.5, 0.75, 1]
```

---

### 🔢 Number Theory (`mathfuse/number-theory`)

```typescript
import { isPrime, primesUpTo, nextPrime, primeFactors } from 'mathfuse/number-theory';

isPrime(999_983)       // true  (Miller-Rabin)
primesUpTo(20)         // [2, 3, 5, 7, 11, 13, 17, 19]
nextPrime(100)         // 101
primeFactors(360)      // [2, 2, 2, 3, 3, 5]
```

```typescript
import { gcd, lcm, factorial, binomial, fibonacci } from 'mathfuse/number-theory';

gcd(48, 18)            // 6
lcm(4, 6)              // 12
factorial(10)          // 3_628_800
binomial(10, 3)        // 120
fibonacci(8)           // [0, 1, 1, 2, 3, 5, 8, 13]
nthFibonacci(50)       // 12586269025
```

---

### 🧮 Linear Algebra (`mathfuse/algebra`)

#### Vectors

```typescript
import { vadd, vdot, vnorm, cosineSimilarity, cross3d } from 'mathfuse/algebra';

vadd([1,2,3], [4,5,6])              // [5, 7, 9]
vdot([1,2,3], [4,5,6])              // 32
vnorm([3, 4])                       // 5
cosineSimilarity([1,0], [1,1])      // 0.7071...
cross3d([1,0,0], [0,1,0])           // [0, 0, 1]
```

#### Matrices

```typescript
import { mmul, mdet, minverse, msolve } from 'mathfuse/algebra';

const A = [[2,1], [-1,3]];
mdet(A)           // 7
minverse(A)       // [[0.428, -0.142], [0.142, 0.285]]
msolve(A, [5,0])  // [3, 1]  (solves Ax = b)
```

---

### 📐 Numerical Methods (`mathfuse/numerical`)

#### Root Finding

```typescript
import { bisection, newtonRaphson, brent } from 'mathfuse/numerical';

const f = (x: number) => x ** 2 - 2;  // root at √2

bisection(f, 1, 2).root       // 1.4142135623...
newtonRaphson(f, 1.5).root    // 1.4142135623...
brent(f, 1, 2).root           // 1.4142135623...
```

#### Calculus

```typescript
import { derivative, integrate } from 'mathfuse/numerical';

derivative(Math.sin, Math.PI / 4)   // ≈ cos(π/4) ≈ 0.7071
integrate(Math.sin, 0, Math.PI)     // ≈ 2.0  (exact: 2)
integrate(x => x ** 2, 0, 1)        // ≈ 0.333 (exact: 1/3)
```

#### Interpolation

```typescript
import { lerp, tableInterpolate, lagrange } from 'mathfuse/numerical';

lerp(0, 100, 0.3)                         // 30
tableInterpolate([0,1,2,3], [0,1,4,9], 1.5) // 2.5
lagrange([0, 1, 2], [0, 1, 4], 1.5)       // 2.25
```

---

## Tree Shaking

mathfuse is fully tree-shakeable. Import only what you need:

```typescript
// ✅ Only the functions you import will be bundled
import { mean, stdDev } from 'mathfuse/stats';
import { isPrime } from 'mathfuse/number-theory';
```

---

## Browser Support

mathfuse targets ES2020 and works in all modern browsers and Node.js ≥ 16.

---

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) and open an issue before submitting a PR for large changes.

```bash
git clone https://github.com/scientistmaths/mathfuse.git
cd mathfuse
npm install
npm test
```

---

## License

[MIT](LICENSE) © Scientist Maths
