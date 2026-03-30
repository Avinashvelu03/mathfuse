import {
  vadd, vsub, vscale, vdot, vnorm, vnormalize, vdistance,
  cosineSimilarity, cross3d, vhadamard,
  mzeros, midentity, mtranspose, madd, mscale, mmul, mvmul,
  mdet, minverse, mtrace, mrank, msolve,
} from '../src/algebra';
import {
  bisection, newtonRaphson, brent,
  derivative, secondDerivative,
  integrate, gaussLegendre,
  lerp, inverseLerp, tableInterpolate, lagrange,
  clamp, roundTo, approxEqual, remap, kahanSum,
} from '../src/numerical';

const close = (a: number, b: number, tol = 1e-7) =>
  expect(Math.abs(a - b)).toBeLessThan(tol);

// ─── Algebra ─────────────────────────────────────────────────────────────────

describe('algebra › vectors', () => {
  test('vadd', () => expect(vadd([1,2,3],[4,5,6])).toEqual([5,7,9]));
  test('vsub', () => expect(vsub([4,5,6],[1,2,3])).toEqual([3,3,3]));
  test('vscale', () => expect(vscale([1,2,3], 2)).toEqual([2,4,6]));
  test('vdot', () => expect(vdot([1,2,3],[4,5,6])).toBe(32));
  test('vnorm L2', () => close(vnorm([3,4]), 5));
  test('vnorm L1', () => close(vnorm([3,4], 1), 7));
  test('vnorm Linf', () => close(vnorm([3,4], Infinity), 4));
  test('vnormalize', () => close(vnorm(vnormalize([3,4])), 1));
  test('vdistance', () => close(vdistance([0,0],[3,4]), 5));
  test('cosineSimilarity parallel', () => close(cosineSimilarity([1,0],[1,0]), 1));
  test('cosineSimilarity orthogonal', () => close(cosineSimilarity([1,0],[0,1]), 0));
  test('cross3d', () => {
    const c = cross3d([1,0,0],[0,1,0]);
    expect(c).toEqual([0,0,1]);
  });
  test('vhadamard', () => expect(vhadamard([1,2,3],[4,5,6])).toEqual([4,10,18]));
});

describe('algebra › matrices', () => {
  test('mzeros', () => {
    const m = mzeros(2,3);
    expect(m.length).toBe(2);
    expect(m[0].length).toBe(3);
    expect(m[0][0]).toBe(0);
  });
  test('midentity', () => {
    const I = midentity(3);
    expect(I[0][0]).toBe(1);
    expect(I[0][1]).toBe(0);
    expect(I[1][1]).toBe(1);
  });
  test('mtranspose', () => {
    expect(mtranspose([[1,2,3],[4,5,6]])).toEqual([[1,4],[2,5],[3,6]]);
  });
  test('madd', () => {
    expect(madd([[1,2],[3,4]],[[5,6],[7,8]])).toEqual([[6,8],[10,12]]);
  });
  test('mscale', () => {
    expect(mscale([[1,2],[3,4]], 2)).toEqual([[2,4],[6,8]]);
  });
  test('mmul identity', () => {
    const A = [[1,2],[3,4]];
    const I = midentity(2);
    expect(mmul(A, I)).toEqual(A);
  });
  test('mmul 2x2', () => {
    const A = [[1,2],[3,4]];
    const B = [[5,6],[7,8]];
    expect(mmul(A, B)).toEqual([[19,22],[43,50]]);
  });
  test('mvmul', () => {
    expect(mvmul([[1,2],[3,4]], [1,2])).toEqual([5,11]);
  });
  test('mdet 2x2', () => close(mdet([[1,2],[3,4]]), -2));
  test('mdet 3x3', () => {
    close(mdet([[1,2,3],[4,5,6],[7,8,10]]), -3);
  });
  test('mdet singular = 0', () => close(mdet([[1,2],[2,4]]), 0));
  test('minverse 2x2', () => {
    const inv = minverse([[1,2],[3,4]]);
    close(inv[0][0], -2);
    close(inv[0][1], 1);
    close(inv[1][0], 1.5);
    close(inv[1][1], -0.5);
  });
  test('minverse singular throws', () => {
    expect(() => minverse([[1,2],[2,4]])).toThrow(RangeError);
  });
  test('mtrace', () => expect(mtrace([[1,2],[3,4]])).toBe(5));
  test('mrank full rank', () => expect(mrank([[1,0],[0,1]])).toBe(2));
  test('mrank deficient', () => expect(mrank([[1,2],[2,4]])).toBe(1));
  test('msolve', () => {
    // [[1,2],[3,4]] * [1,2] = [5,11]
    const x = msolve([[1,2],[3,4]], [5, 11]);
    close(x[0], 1);
    close(x[1], 2);
  });
});

// ─── Numerical ───────────────────────────────────────────────────────────────

describe('numerical › root finding', () => {
  const f = (x: number) => x ** 2 - 2; // root at √2
  test('bisection √2', () => {
    const { root, converged } = bisection(f, 1, 2);
    expect(converged).toBe(true);
    close(root, Math.SQRT2, 1e-8);
  });
  test('bisection wrong bracket throws', () => {
    expect(() => bisection(f, 0, 1)).toThrow(RangeError);
  });
  test('newtonRaphson √2 with derivative', () => {
    const { root, converged } = newtonRaphson(f, 1.5, (x) => 2 * x);
    expect(converged).toBe(true);
    close(root, Math.SQRT2, 1e-9);
  });
  test('newtonRaphson √2 without derivative', () => {
    const { root } = newtonRaphson(f, 1.5);
    close(root, Math.SQRT2, 1e-8);
  });
  test('brent √2', () => {
    const { root, converged } = brent(f, 1, 2);
    expect(converged).toBe(true);
    close(root, Math.SQRT2, 1e-9);
  });
});

describe('numerical › differentiation', () => {
  test('derivative sin at π/2', () => close(derivative(Math.sin, Math.PI / 2), 0, 1e-5));
  test('derivative x² at x=3', () => close(derivative(x => x**2, 3), 6, 1e-5));
  test('secondDerivative x³ at x=2', () => close(secondDerivative(x => x**3, 2), 12, 1e-3));
});

describe('numerical › integration', () => {
  test('integrate sin 0..π = 2', () => close(integrate(Math.sin, 0, Math.PI), 2, 1e-6));
  test('integrate x² 0..1 = 1/3', () => close(integrate(x => x**2, 0, 1), 1/3, 1e-8));
  test('gaussLegendre x² 0..1', () => close(gaussLegendre(x => x**2, 0, 1), 1/3, 1e-10));
  test('gaussLegendre sin 0..π', () => close(gaussLegendre(Math.sin, 0, Math.PI), 2, 1e-6));
});

describe('numerical › interpolation', () => {
  test('lerp midpoint', () => expect(lerp(0, 10, 0.5)).toBe(5));
  test('lerp endpoints', () => { expect(lerp(0,10,0)).toBe(0); expect(lerp(0,10,1)).toBe(10); });
  test('inverseLerp', () => close(inverseLerp(0, 10, 5), 0.5));
  test('tableInterpolate', () => {
    const xs = [0, 1, 2, 3];
    const ys = [0, 1, 4, 9];
    close(tableInterpolate(xs, ys, 1.5), 2.5);
  });
  test('lagrange x²', () => {
    close(lagrange([0,1,2], [0,1,4], 1.5), 2.25, 1e-10);
  });
});

describe('numerical › utilities', () => {
  test('clamp', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
  });
  test('roundTo', () => {
    expect(roundTo(3.14159, 2)).toBe(3.14);
    expect(roundTo(2.675, 2)).toBe(2.68);
    expect(roundTo(1.004999, 2)).toBe(1.00);
  });
  test('approxEqual', () => {
    expect(approxEqual(1.0, 1.0 + 1e-10)).toBe(true);
    expect(approxEqual(1.0, 2.0)).toBe(false);
  });
  test('remap', () => close(remap(5, 0, 10, 0, 100), 50));
  test('kahanSum', () => {
    const data = Array(100).fill(0.1);
    close(kahanSum(data), 10, 1e-10);
  });
});
