/**
 * @module numerical
 * Root finding, numerical integration, differentiation, and interpolation.
 */
export type Fn = (x: number) => number;

// ─── Root Finding ─────────────────────────────────────────────────────────────
export interface RootResult {
  root: number;
  iterations: number;
  converged: boolean;
  error: number;
}

/**
 * Bisection method — guaranteed convergence on a bracketed root.
 * @param f - continuous function
 * @param a - left bracket
 * @param b - right bracket (f(a) and f(b) must have opposite signs)
 */
export function bisection(
  f: Fn,
  a: number,
  b: number,
  tol = 1e-10,
  maxIter = 100
): RootResult {
  if (f(a) * f(b) > 0) {
    throw new RangeError('f(a) and f(b) must have opposite signs (bracket the root)');
  }
  let lo = a, hi = b, mid = a, iter = 0;
  while (iter < maxIter) {
    mid = (lo + hi) / 2;
    const fmid = f(mid);
    const error = (hi - lo) / 2;
    if (error < tol || fmid === 0) {
      return { root: mid, iterations: iter + 1, converged: true, error };
    }
    if (f(lo) * fmid < 0) hi = mid; else lo = mid;
    iter++;
  }
  return { root: mid, iterations: maxIter, converged: false, error: (hi - lo) / 2 };
}

/**
 * Newton-Raphson method — fast quadratic convergence near smooth roots.
 * @param f - function
 * @param df - derivative (if omitted, estimated numerically)
 */
export function newtonRaphson(
  f: Fn,
  x0: number,
  df?: Fn,
  tol = 1e-10,
  maxIter = 100
): RootResult {
  const h = 1e-7;
  const deriv = df ?? ((x: number): number => (f(x + h) - f(x - h)) / (2 * h));
  let x = x0;
  for (let iter = 0; iter < maxIter; iter++) {
    const fx = f(x);
    const dfx = deriv(x);
    if (Math.abs(dfx) < 1e-14) throw new RangeError('derivative is zero — Newton-Raphson failed');
    const dx = fx / dfx;
    x -= dx;
    if (Math.abs(dx) < tol) {
      return { root: x, iterations: iter + 1, converged: true, error: Math.abs(dx) };
    }
  }
  return { root: x, iterations: maxIter, converged: false, error: Math.abs(f(x)) };
}

/**
 * Brent's method — combines bisection, secant, and inverse quadratic interpolation.
 * Robust and fast — the recommended general-purpose root finder.
 */
export function brent(
  f: Fn,
  a: number,
  b: number,
  tol = 1e-10,
  maxIter = 100
): RootResult {
  let fa = f(a), fb = f(b);
  if (fa * fb > 0) {
    throw new RangeError('f(a) and f(b) must have opposite signs');
  }
  if (Math.abs(fa) < Math.abs(fb)) { [a, b] = [b, a]; [fa, fb] = [fb, fa]; }
  let c = a, fc = fa, s = 0;
  let mflag = true, d = 0;
  for (let iter = 0; iter < maxIter; iter++) {
    if (Math.abs(b - a) < tol) {
      return { root: b, iterations: iter + 1, converged: true, error: Math.abs(b - a) };
    }
    if (fa !== fc && fb !== fc) {
      s = (a * fb * fc) / ((fa - fb) * (fa - fc)) +
        (b * fa * fc) / ((fb - fa) * (fb - fc)) +
        (c * fa * fb) / ((fc - fa) * (fc - fb));
    } else {
      s = b - fb * (b - a) / (fb - fa);
    }
    const cond1 = (s < (3 * a + b) / 4 || s > b);
    const cond2 = mflag && Math.abs(s - b) >= Math.abs(b - c) / 2;
    const cond3 = !mflag && Math.abs(s - b) >= Math.abs(c - d) / 2;
    if (cond1 || cond2 || cond3) {
      s = (a + b) / 2;
      mflag = true;
    } else {
      mflag = false;
    }
    const fs = f(s);
    d = c; c = b; fc = fb;
    if (fa * fs < 0) { b = s; fb = fs; } else { a = s; fa = fs; }
    if (Math.abs(fa) < Math.abs(fb)) { [a, b] = [b, a]; [fa, fb] = [fb, fa]; }
  }
  return { root: b, iterations: maxIter, converged: false, error: Math.abs(f(b)) };
}

// ─── Numerical Differentiation ────────────────────────────────────────────────
/**
 * First derivative using central differences (O(h²) accuracy).
 */
export function derivative(f: Fn, x: number, h = 1e-5): number {
  return (f(x + h) - f(x - h)) / (2 * h);
}

/**
 * Second derivative using central differences.
 */
export function secondDerivative(f: Fn, x: number, h = 1e-4): number {
  return (f(x + h) - 2 * f(x) + f(x - h)) / h ** 2;
}

/**
 * Gradient of a multivariate function at point x.
 * @param f - function accepting a vector and returning a scalar
 * @param x - point at which to compute the gradient
 */
export function gradient(
  f: (x: number[]) => number,
  x: number[],
  h = 1e-5
): number[] {
  return x.map((_, i) => {
    const xp = [...x]; xp[i] += h;
    const xm = [...x]; xm[i] -= h;
    return (f(xp) - f(xm)) / (2 * h);
  });
}

// ─── Numerical Integration ────────────────────────────────────────────────────
/**
 * Adaptive Simpson's rule — highly accurate for smooth functions.
 */
export function integrate(
  f: Fn,
  a: number,
  b: number,
  tol = 1e-8,
  maxDepth = 50
): number {
  function simpsonRule(fa: number, fm: number, fb: number, width: number): number {
    return (width / 6) * (fa + 4 * fm + fb);
  }
  function adaptive(
    x0: number,
    x1: number,
    fa: number,
    fm: number,
    fb: number,
    whole: number,
    depth: number
  ): number {
    const mid = (x0 + x1) / 2;
    const m0 = (x0 + mid) / 2;
    const m1 = (mid + x1) / 2;
    const fm0 = f(m0);
    const fm1 = f(m1);
    const leftV = simpsonRule(fa, fm0, fm, mid - x0);
    const rightV = simpsonRule(fm, fm1, fb, x1 - mid);
    const delta = leftV + rightV - whole;
    if (depth >= maxDepth || Math.abs(delta) <= 15 * tol) {
      return leftV + rightV + delta / 15;
    }
    return (
      adaptive(x0, mid, fa, fm0, fm, leftV, depth + 1) +
      adaptive(mid, x1, fm, fm1, fb, rightV, depth + 1)
    );
  }
  const mid = (a + b) / 2;
  const fa = f(a), fm = f(mid), fb = f(b);
  const whole = simpsonRule(fa, fm, fb, b - a);
  return adaptive(a, b, fa, fm, fb, whole, 0);
}

/**
 * Gauss-Legendre quadrature (5-point) — excellent for polynomials and smooth functions.
 * @param f - function to integrate
 * @param a - lower bound
 * @param b - upper bound
 */
export function gaussLegendre(f: Fn, a: number, b: number): number {
  // 5-point GL nodes and weights on [-1, 1]
  const nodes = [
    -0.9061798459386640, -0.5384693101056831, 0,
    0.5384693101056831, 0.9061798459386640,
  ];
  const weights = [
    0.2369268850561891, 0.4786286704993665, 0.5688888888888889,
    0.4786286704993665, 0.2369268850561891,
  ];
  const half = (b - a) / 2;
  const mid = (a + b) / 2;
  return half * nodes.reduce((s, t, i) => s + weights[i] * f(mid + half * t), 0);
}

// ─── Interpolation ────────────────────────────────────────────────────────────
/**
 * Linear interpolation between two points.
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Inverse lerp — find t such that lerp(a, b, t) === value.
 */
export function inverseLerp(a: number, b: number, value: number): number {
  if (a === b) throw new RangeError('a and b must be different for inverse lerp');
  return (value - a) / (b - a);
}

/**
 * Linear interpolation from a data table (sorted x values required).
 * @param xs - sorted x values
 * @param ys - corresponding y values
 * @param x - query x value
 */
export function tableInterpolate(xs: number[], ys: number[], x: number): number {
  if (xs.length !== ys.length || xs.length < 2) {
    throw new RangeError('xs and ys must have equal length >= 2');
  }
  if (x <= xs[0]) return ys[0];
  if (x >= xs[xs.length - 1]) return ys[ys.length - 1];
  let lo = 0, hi = xs.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (xs[mid] <= x) lo = mid; else hi = mid;
  }
  return ys[lo] + ((x - xs[lo]) / (xs[hi] - xs[lo])) * (ys[hi] - ys[lo]);
}

/**
 * Lagrange polynomial interpolation at a query point.
 */
export function lagrange(xs: number[], ys: number[], x: number): number {
  if (xs.length !== ys.length) throw new RangeError('xs and ys must have equal length');
  const n = xs.length;
  let result = 0;
  for (let i = 0; i < n; i++) {
    let term = ys[i];
    for (let j = 0; j < n; j++) {
      if (j !== i) {
        if (xs[i] === xs[j]) throw new RangeError('xs must have distinct values');
        term *= (x - xs[j]) / (xs[i] - xs[j]);
      }
    }
    result += term;
  }
  return result;
}

// ─── Misc Numerical Utilities ─────────────────────────────────────────────────
/**
 * Clamp a value to [min, max].
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Round to n decimal places.
 */
export function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/**
 * Check if two floats are approximately equal.
 */
export function approxEqual(
  a: number,
  b: number,
  relTol = 1e-9,
  absTol = 0
): boolean {
  return Math.abs(a - b) <= Math.max(relTol * Math.max(Math.abs(a), Math.abs(b)), absTol);
}

/**
 * Map a value from one range to another.
 * @example remap(5, 0, 10, 0, 100) // 50
 */
export function remap(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
}

/**
 * Sum of an array using compensated Kahan summation (reduces floating-point error).
 */
export function kahanSum(data: number[]): number {
  let sum = 0, comp = 0;
  for (const v of data) {
    const y = v - comp;
    const t = sum + y;
    comp = t - sum - y;
    sum = t;
  }
  return sum;
}
