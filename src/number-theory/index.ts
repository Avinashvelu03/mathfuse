/**
 * @module number-theory
 * Primes, GCD/LCM, combinatorics, modular arithmetic, and sequences.
 */

function assertNonNegInt(n: number, label = 'n'): void {
  if (!Number.isInteger(n) || n < 0) {
    throw new TypeError(`${label} must be a non-negative integer`);
  }
}

function assertPosInt(n: number, label = 'n'): void {
  if (!Number.isInteger(n) || n < 1) {
    throw new TypeError(`${label} must be a positive integer`);
  }
}

// ─── Primes ───────────────────────────────────────────────────────────────────

/**
 * Miller-Rabin primality test (deterministic for n < 3,317,044,064,679,887,385,961,981).
 */
export function isPrime(n: number): boolean {
  assertNonNegInt(n);
  if (n < 2) return false;
  if (n === 2 || n === 3 || n === 5 || n === 7) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;

  // Write n-1 as 2^r * d
  let d = n - 1;
  let r = 0;
  while (d % 2 === 0) { d >>= 1; r++; }

  const mulmod = (a: number, b: number, m: number): number => {
    let result = 0;
    a %= m;
    while (b > 0) {
      if (b & 1) result = (result + a) % m;
      a = (a * 2) % m;
      b >>= 1;
    }
    return result;
  };

  const powmod = (base: number, exp: number, mod: number): number => {
    let result = 1;
    base %= mod;
    while (exp > 0) {
      if (exp & 1) result = mulmod(result, base, mod);
      base = mulmod(base, base, mod);
      exp >>= 1;
    }
    return result;
  };

  const witnesses = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37];
  outer: for (const a of witnesses) {
    if (a >= n) continue;
    let x = powmod(a, d, n);
    if (x === 1 || x === n - 1) continue;
    for (let i = 0; i < r - 1; i++) {
      x = mulmod(x, x, n);
      if (x === n - 1) continue outer;
    }
    return false;
  }
  return true;
}

/**
 * Sieve of Eratosthenes — returns all primes up to (and including) limit.
 * @example primesUpTo(20) // [2, 3, 5, 7, 11, 13, 17, 19]
 */
export function primesUpTo(limit: number): number[] {
  assertNonNegInt(limit, 'limit');
  if (limit < 2) return [];
  const sieve = new Uint8Array(limit + 1).fill(1);
  sieve[0] = sieve[1] = 0;
  for (let i = 2; i * i <= limit; i++) {
    if (sieve[i]) {
      for (let j = i * i; j <= limit; j += i) sieve[j] = 0;
    }
  }
  const primes: number[] = [];
  for (let i = 2; i <= limit; i++) if (sieve[i]) primes.push(i);
  return primes;
}

/**
 * Next prime strictly greater than n.
 * @example nextPrime(10) // 11
 */
export function nextPrime(n: number): number {
  assertNonNegInt(n);
  let candidate = n + 1;
  if (candidate <= 2) return 2;
  if (candidate % 2 === 0) candidate++;
  while (!isPrime(candidate)) candidate += 2;
  return candidate;
}

/**
 * Prime factorization — returns sorted array of prime factors (with repeats).
 * @example primeFactors(60) // [2, 2, 3, 5]
 */
export function primeFactors(n: number): number[] {
  assertPosInt(n);
  const factors: number[] = [];
  let remaining = n;
  for (let f = 2; f * f <= remaining; f++) {
    while (remaining % f === 0) {
      factors.push(f);
      remaining /= f;
    }
  }
  if (remaining > 1) factors.push(remaining);
  return factors;
}

// ─── GCD / LCM ───────────────────────────────────────────────────────────────

/**
 * Greatest common divisor via Euclidean algorithm.
 * @example gcd(48, 18) // 6
 */
export function gcd(a: number, b: number): number {
  if (!Number.isInteger(a) || !Number.isInteger(b)) {
    throw new TypeError('gcd requires integer inputs');
  }
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

/**
 * GCD of an array of integers.
 */
export function gcdMany(nums: number[]): number {
  if (nums.length === 0) throw new RangeError('gcdMany requires at least one number');
  return nums.reduce(gcd);
}

/**
 * Least common multiple.
 * @example lcm(4, 6) // 12
 */
export function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return Math.abs(a) / gcd(a, b) * Math.abs(b);
}

/**
 * LCM of an array of integers.
 */
export function lcmMany(nums: number[]): number {
  if (nums.length === 0) throw new RangeError('lcmMany requires at least one number');
  return nums.reduce(lcm);
}

// ─── Combinatorics ────────────────────────────────────────────────────────────

/**
 * Factorial n! — uses a cache for performance.
 * @example factorial(10) // 3628800
 */
const factCache: number[] = [1, 1];
export function factorial(n: number): number {
  assertNonNegInt(n);
  if (n > 170) throw new RangeError('factorial overflows Number for n > 170');
  if (factCache[n] !== undefined) return factCache[n];
  for (let i = factCache.length; i <= n; i++) {
    factCache[i] = factCache[i - 1] * i;
  }
  return factCache[n];
}

/**
 * Binomial coefficient C(n, k) — "n choose k".
 * @example binomial(10, 3) // 120
 */
export function binomial(n: number, k: number): number {
  assertNonNegInt(n, 'n');
  assertNonNegInt(k, 'k');
  if (k > n) return 0;
  if (k === 0 || k === n) return 1;
  k = Math.min(k, n - k);
  let result = 1;
  for (let i = 0; i < k; i++) {
    result = (result * (n - i)) / (i + 1);
  }
  return Math.round(result);
}

/**
 * Number of permutations P(n, r) = n! / (n−r)!
 */
export function permutations(n: number, r: number): number {
  assertNonNegInt(n, 'n');
  assertNonNegInt(r, 'r');
  if (r > n) return 0;
  let result = 1;
  for (let i = n; i > n - r; i--) result *= i;
  return result;
}

// ─── Modular Arithmetic ───────────────────────────────────────────────────────

/**
 * Modular exponentiation: (base^exp) mod m
 * @example modPow(2, 10, 1000) // 24
 */
export function modPow(base: number, exp: number, m: number): number {
  assertNonNegInt(base, 'base');
  assertNonNegInt(exp, 'exp');
  assertPosInt(m, 'm');
  let result = 1;
  base %= m;
  while (exp > 0) {
    if (exp & 1) result = (result * base) % m;
    base = (base * base) % m;
    exp >>= 1;
  }
  return result;
}

/**
 * Euler's totient φ(n) — count of integers in [1, n] coprime to n.
 */
export function eulerTotient(n: number): number {
  assertPosInt(n);
  let result = n;
  let temp = n;
  for (let p = 2; p * p <= temp; p++) {
    if (temp % p === 0) {
      while (temp % p === 0) temp /= p;
      result -= result / p;
    }
  }
  if (temp > 1) result -= result / temp;
  return Math.round(result);
}

// ─── Integer Sequences ────────────────────────────────────────────────────────

/**
 * Fibonacci sequence up to length n.
 * @example fibonacci(8) // [0, 1, 1, 2, 3, 5, 8, 13]
 */
export function fibonacci(n: number): number[] {
  assertPosInt(n);
  if (n === 1) return [0];
  const seq = [0, 1];
  for (let i = 2; i < n; i++) seq.push(seq[i - 1] + seq[i - 2]);
  return seq;
}

/**
 * nth Fibonacci number (0-indexed, fast doubling algorithm).
 * @example nthFibonacci(10) // 55
 */
export function nthFibonacci(n: number): number {
  assertNonNegInt(n);
  // Fast doubling: F(2k) = F(k)[2F(k+1) − F(k)], F(2k+1) = F(k)² + F(k+1)²
  function fastDouble(k: number): [number, number] {
    if (k === 0) return [0, 1];
    const [a, b] = fastDouble(Math.floor(k / 2));
    const c = a * (2 * b - a);
    const d = a * a + b * b;
    return k % 2 === 0 ? [c, d] : [d, c + d];
  }
  return fastDouble(n)[0];
}

/**
 * Collatz sequence starting at n (stops at 1).
 * @example collatz(6) // [6, 3, 10, 5, 16, 8, 4, 2, 1]
 */
export function collatz(n: number): number[] {
  assertPosInt(n);
  const seq = [n];
  while (n !== 1) {
    n = n % 2 === 0 ? n / 2 : 3 * n + 1;
    seq.push(n);
  }
  return seq;
}

/**
 * Digital root of a positive integer (repeated digit sum until single digit).
 * @example digitalRoot(9875) // 2
 */
export function digitalRoot(n: number): number {
  assertPosInt(n);
  if (n % 9 === 0) return 9;
  return n % 9;
}
