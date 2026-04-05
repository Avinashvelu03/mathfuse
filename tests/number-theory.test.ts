import {
  isPrime, primesUpTo, nextPrime, primeFactors,
  gcd, gcdMany, lcm, lcmMany,
  factorial, binomial, permutations,
  modPow, eulerTotient,
  fibonacci, nthFibonacci, collatz, digitalRoot,
} from '../src/number-theory';

describe('number-theory › primes', () => {
  test('isPrime small primes', () => {
    [2, 3, 5, 7, 11, 13, 17, 19, 23].forEach(p => expect(isPrime(p)).toBe(true));
  });
  test('isPrime composites', () => {
    [0, 1, 4, 6, 8, 9, 10, 15].forEach(n => expect(isPrime(n)).toBe(false));
  });
  test('isPrime large prime', () => expect(isPrime(999_983)).toBe(true));
  test('primesUpTo(20)', () => expect(primesUpTo(20)).toEqual([2,3,5,7,11,13,17,19]));
  test('primesUpTo(1)', () => expect(primesUpTo(1)).toEqual([]));
  test('nextPrime(10)', () => expect(nextPrime(10)).toBe(11));
  test('nextPrime(0)', () => expect(nextPrime(0)).toBe(2));
  test('primeFactors(60)', () => expect(primeFactors(60)).toEqual([2,2,3,5]));
  test('primeFactors(1)', () => expect(primeFactors(1)).toEqual([]));
});

describe('number-theory › gcd/lcm', () => {
  test('gcd(48, 18)', () => expect(gcd(48, 18)).toBe(6));
  test('gcd(0, 5)', () => expect(gcd(0, 5)).toBe(5));
  test('gcd(7, 7)', () => expect(gcd(7, 7)).toBe(7));
  test('gcdMany', () => expect(gcdMany([12, 18, 24])).toBe(6));
  test('lcm(4, 6)', () => expect(lcm(4, 6)).toBe(12));
  test('lcm(0, 5)', () => expect(lcm(0, 5)).toBe(0));
  test('lcmMany', () => expect(lcmMany([4, 6, 10])).toBe(60));
});

describe('number-theory › combinatorics', () => {
  test('factorial(0)', () => expect(factorial(0)).toBe(1));
  test('factorial(10)', () => expect(factorial(10)).toBe(3_628_800));
  test('factorial cached', () => {
    factorial(10); // warm cache
    expect(factorial(10)).toBe(3_628_800);
  });
  test('factorial overflows at 171', () => expect(() => factorial(171)).toThrow(RangeError));
  test('binomial(10, 3)', () => expect(binomial(10, 3)).toBe(120));
  test('binomial(5, 0)', () => expect(binomial(5, 0)).toBe(1));
  test('binomial(5, 5)', () => expect(binomial(5, 5)).toBe(1));
  test('binomial k > n', () => expect(binomial(3, 5)).toBe(0));
  test('permutations(5, 3)', () => expect(permutations(5, 3)).toBe(60));
  test('permutations r > n', () => expect(permutations(3, 5)).toBe(0));
});

describe('number-theory › modular arithmetic', () => {
  test('modPow(2, 10, 1000)', () => expect(modPow(2, 10, 1000)).toBe(24));
  test('modPow(3, 0, 7)', () => expect(modPow(3, 0, 7)).toBe(1));
  test('eulerTotient(1)', () => expect(eulerTotient(1)).toBe(1));
  test('eulerTotient(prime)', () => expect(eulerTotient(7)).toBe(6));
  test('eulerTotient(8)', () => expect(eulerTotient(8)).toBe(4));
});

describe('number-theory › sequences', () => {
  test('fibonacci(8)', () => expect(fibonacci(8)).toEqual([0,1,1,2,3,5,8,13]));
  test('fibonacci(1)', () => expect(fibonacci(1)).toEqual([0]));
  test('nthFibonacci(10)', () => expect(nthFibonacci(10)).toBe(55));
  test('nthFibonacci(0)', () => expect(nthFibonacci(0)).toBe(0));
  test('collatz(1)', () => expect(collatz(1)).toEqual([1]));
  test('collatz terminates', () => {
    const seq = collatz(27);
    expect(seq[seq.length - 1]).toBe(1);
    expect(seq.length).toBeGreaterThan(1);
  });
  test('digitalRoot(9875)', () => expect(digitalRoot(9875)).toBe(2));
  test('digitalRoot(9)', () => expect(digitalRoot(9)).toBe(9));
});

// ─── Number-theory error branches ──────────────────────────────────────────────
describe('number-theory › error branches', () => {
  // assertNonNegInt throws on float
  test('isPrime float throws', () =>
    expect(() => isPrime(1.5)).toThrow(TypeError));
  test('primesUpTo float throws', () =>
    expect(() => primesUpTo(1.5)).toThrow(TypeError));
  test('nextPrime float throws', () =>
    expect(() => nextPrime(1.5)).toThrow(TypeError));
  // assertPosInt throws on 0 or float
  test('primeFactors(0) throws', () =>
    expect(() => primeFactors(0)).toThrow(TypeError));
  test('primeFactors float throws', () =>
    expect(() => primeFactors(1.5)).toThrow(TypeError));
  test('eulerTotient(0) throws', () =>
    expect(() => eulerTotient(0)).toThrow(TypeError));
  test('collatz(0) throws', () =>
    expect(() => collatz(0)).toThrow(TypeError));
  test('collatz float throws', () =>
    expect(() => collatz(1.5)).toThrow(TypeError));
  test('digitalRoot(0) throws', () =>
    expect(() => digitalRoot(0)).toThrow(TypeError));
  test('digitalRoot float throws', () =>
    expect(() => digitalRoot(1.5)).toThrow(TypeError));
  test('factorial float throws', () =>
    expect(() => factorial(1.5)).toThrow(TypeError));
  test('factorial negative throws', () =>
    expect(() => factorial(-1)).toThrow(TypeError));
  test('binomial float n throws', () =>
    expect(() => binomial(1.5, 1)).toThrow(TypeError));
  test('binomial float k throws', () =>
    expect(() => binomial(3, 1.5)).toThrow(TypeError));
  test('permutations float n throws', () =>
    expect(() => permutations(1.5, 1)).toThrow(TypeError));
  test('permutations float r throws', () =>
    expect(() => permutations(3, 1.5)).toThrow(TypeError));
  test('modPow float base throws', () =>
    expect(() => modPow(1.5, 2, 7)).toThrow(TypeError));
  test('modPow float exp throws', () =>
    expect(() => modPow(2, 1.5, 7)).toThrow(TypeError));
  test('modPow m=0 throws', () =>
    expect(() => modPow(2, 3, 0)).toThrow(TypeError));
  test('fibonacci(0) throws', () =>
    expect(() => fibonacci(0)).toThrow(TypeError));
  test('fibonacci float throws', () =>
    expect(() => fibonacci(1.5)).toThrow(TypeError));
  test('nthFibonacci float throws', () =>
    expect(() => nthFibonacci(1.5)).toThrow(TypeError));
  test('nthFibonacci negative throws', () =>
    expect(() => nthFibonacci(-1)).toThrow(TypeError));
  test('gcdMany empty throws', () =>
    expect(() => gcdMany([])).toThrow(RangeError));
  test('lcmMany empty throws', () =>
    expect(() => lcmMany([])).toThrow(RangeError));
  test('gcd float throws', () =>
    expect(() => gcd(1.5, 2)).toThrow(TypeError));
  // isPrime large composite triggers full Miller-Rabin path
  test('isPrime large composite returns false', () =>
    expect(isPrime(3 * 999983)).toBe(false));
  // digitalRoot divisible by 9
  test('digitalRoot(9) returns 9 (9%9===0 branch)', () =>
    expect(digitalRoot(9)).toBe(9));
  test('digitalRoot(18) returns 9', () =>
    expect(digitalRoot(18)).toBe(9));
});

// ─── Number-theory coverage completions ────────────────────────────────────────
describe('number-theory › coverage completions', () => {
  test('isPrime composite through Miller-Rabin returns false', () => {
    // 25, 35, 49 are composites not divisible by 2 or 3
    // They go through the full Miller-Rabin loop hitting return false (line 69)
    expect(isPrime(25)).toBe(false);
    expect(isPrime(35)).toBe(false);
    expect(isPrime(49)).toBe(false);
  });
    test('nextPrime odd n triggers even candidate branch (line 101)', () => {
    // nextPrime(3): candidate=4 (even > 2), candidate++ -> 5; returns 5
    expect(nextPrime(3)).toBe(5);
    // nextPrime(7): candidate=8 (even > 2), candidate++ -> 9; but 9 composite, +2 -> 11
    expect(nextPrime(7)).toBe(11);
  });
});
