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
