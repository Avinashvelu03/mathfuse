/**
 * @module algebra
 * Vector and matrix operations using plain JS arrays.
 * All operations return new values — inputs are never mutated.
 */

export type Vector = number[];
export type Matrix = number[][];

// ─── Vector Operations ────────────────────────────────────────────────────────

function assertSameLength(a: number[], b: number[], label = 'vectors'): void {
  if (a.length !== b.length) {
    throw new RangeError(`${label} must have equal length (got ${a.length} and ${b.length})`);
  }
}

/**
 * Vector addition: a + b
 */
export function vadd(a: Vector, b: Vector): Vector {
  assertSameLength(a, b);
  return a.map((v, i) => v + b[i]);
}

/**
 * Vector subtraction: a − b
 */
export function vsub(a: Vector, b: Vector): Vector {
  assertSameLength(a, b);
  return a.map((v, i) => v - b[i]);
}

/**
 * Scalar multiplication: c * v
 */
export function vscale(v: Vector, c: number): Vector {
  return v.map((x) => x * c);
}

/**
 * Dot product: a · b
 */
export function vdot(a: Vector, b: Vector): number {
  assertSameLength(a, b);
  return a.reduce((s, v, i) => s + v * b[i], 0);
}

/**
 * L2 (Euclidean) norm of a vector.
 */
export function vnorm(v: Vector, p = 2): number {
  if (p === Infinity) return Math.max(...v.map(Math.abs));
  if (p <= 0) throw new RangeError('p-norm requires p > 0');
  return v.reduce((s, x) => s + Math.abs(x) ** p, 0) ** (1 / p);
}

/**
 * Normalized unit vector (direction only).
 */
export function vnormalize(v: Vector): Vector {
  const n = vnorm(v);
  if (n === 0) throw new RangeError('cannot normalize a zero vector');
  return vscale(v, 1 / n);
}

/**
 * Euclidean distance between two vectors.
 */
export function vdistance(a: Vector, b: Vector): number {
  assertSameLength(a, b);
  return vnorm(vsub(a, b));
}

/**
 * Cosine similarity between two vectors: (a · b) / (|a| |b|)
 */
export function cosineSimilarity(a: Vector, b: Vector): number {
  assertSameLength(a, b);
  const denom = vnorm(a) * vnorm(b);
  if (denom === 0) throw new RangeError('cosine similarity requires non-zero vectors');
  return vdot(a, b) / denom;
}

/**
 * Cross product of two 3D vectors.
 */
export function cross3d(a: Vector, b: Vector): Vector {
  if (a.length !== 3 || b.length !== 3) {
    throw new RangeError('cross3d requires 3D vectors');
  }
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

/**
 * Element-wise (Hadamard) product.
 */
export function vhadamard(a: Vector, b: Vector): Vector {
  assertSameLength(a, b);
  return a.map((v, i) => v * b[i]);
}

// ─── Matrix Helpers ──────────────────────────────────────────────────────────

function rows(m: Matrix): number { return m.length; }
function cols(m: Matrix): number { return m.length > 0 ? m[0].length : 0; }

function assertMatrix(m: Matrix, label = 'matrix'): void {
  if (!m || m.length === 0) throw new RangeError(`${label} must be non-empty`);
  const c = m[0].length;
  if (m.some((row) => row.length !== c)) {
    throw new RangeError(`${label} rows must have equal length`);
  }
}

function assertSquare(m: Matrix, label = 'matrix'): void {
  assertMatrix(m, label);
  if (rows(m) !== cols(m)) {
    throw new RangeError(`${label} must be square (got ${rows(m)}×${cols(m)})`);
  }
}

/**
 * Create an n×m matrix filled with a value (default 0).
 */
export function mzeros(n: number, m: number): Matrix {
  return Array.from({ length: n }, (): number[] => new Array(m).fill(0));
}

/**
 * Create an n×n identity matrix.
 */
export function midentity(n: number): Matrix {
  const I = mzeros(n, n);
  for (let i = 0; i < n; i++) I[i][i] = 1;
  return I;
}

/**
 * Transpose a matrix.
 */
export function mtranspose(m: Matrix): Matrix {
  assertMatrix(m);
  return Array.from({ length: cols(m) }, (_, c): number[] =>
    Array.from({ length: rows(m) }, (__, r) => m[r][c])
  );
}

/**
 * Matrix addition.
 */
export function madd(a: Matrix, b: Matrix): Matrix {
  assertMatrix(a, 'a'); assertMatrix(b, 'b');
  if (rows(a) !== rows(b) || cols(a) !== cols(b)) {
    throw new RangeError('matrices must have the same dimensions for addition');
  }
  return a.map((row, i) => row.map((v, j) => v + b[i][j]));
}

/**
 * Matrix scalar multiplication.
 */
export function mscale(m: Matrix, c: number): Matrix {
  assertMatrix(m);
  return m.map((row) => row.map((v) => v * c));
}

/**
 * Matrix multiplication (naive O(n³)).
 */
export function mmul(a: Matrix, b: Matrix): Matrix {
  assertMatrix(a, 'a'); assertMatrix(b, 'b');
  if (cols(a) !== rows(b)) {
    throw new RangeError(`incompatible dimensions: ${rows(a)}×${cols(a)} · ${rows(b)}×${cols(b)}`);
  }
  const r = rows(a), c = cols(b), inner = cols(a);
  const result = mzeros(r, c);
  for (let i = 0; i < r; i++)
    for (let k = 0; k < inner; k++)
      if (a[i][k] !== 0)
        for (let j = 0; j < c; j++)
          result[i][j] += a[i][k] * b[k][j];
  return result;
}

/**
 * Matrix-vector product: m · v
 */
export function mvmul(m: Matrix, v: Vector): Vector {
  assertMatrix(m);
  if (cols(m) !== v.length) {
    throw new RangeError(`matrix columns (${cols(m)}) must match vector length (${v.length})`);
  }
  return m.map((row) => vdot(row, v));
}

// ─── Determinant & Inverse ────────────────────────────────────────────────────

/**
 * Determinant via LU decomposition (in-place, returns sign + value).
 * @example mdet([[1,2],[3,4]]) // -2
 */
export function mdet(m: Matrix): number {
  assertSquare(m);
  const n = rows(m);
  if (n === 1) return m[0][0];
  if (n === 2) return m[0][0] * m[1][1] - m[0][1] * m[1][0];
  // Copy
  const a: number[][] = m.map((row) => [...row]);
  let sign = 1;
  for (let col = 0; col < n; col++) {
    // Find pivot
    let maxRow = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(a[row][col]) > Math.abs(a[maxRow][col])) maxRow = row;
    }
    if (maxRow !== col) {
      [a[col], a[maxRow]] = [a[maxRow], a[col]];
      sign *= -1;
    }
    if (a[col][col] === 0) return 0;
    for (let row = col + 1; row < n; row++) {
      const factor = a[row][col] / a[col][col];
      for (let j = col; j < n; j++) {
        a[row][j] -= factor * a[col][j];
      }
    }
  }
  let det = sign;
  for (let i = 0; i < n; i++) det *= a[i][i];
  return det;
}

/**
 * Matrix inverse via Gauss-Jordan elimination.
 * Throws if the matrix is singular.
 */
export function minverse(m: Matrix): Matrix {
  assertSquare(m);
  const n = rows(m);
  const aug: number[][] = m.map((row, i) => [
    ...row,
    ...Array.from({ length: n }, (_, j) => (j === i ? 1 : 0)),
  ]);
  for (let col = 0; col < n; col++) {
    // Find pivot
    let maxRow = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(aug[row][col]) > Math.abs(aug[maxRow][col])) maxRow = row;
    }
    [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];
    if (Math.abs(aug[col][col]) < 1e-12) {
      throw new RangeError('matrix is singular and cannot be inverted');
    }
    const pivot = aug[col][col];
    for (let j = 0; j < 2 * n; j++) aug[col][j] /= pivot;
    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = aug[row][col];
      for (let j = 0; j < 2 * n; j++) {
        aug[row][j] -= factor * aug[col][j];
      }
    }
  }
  return aug.map((row): number[] => row.slice(n) as number[]);
}

/**
 * Matrix trace — sum of diagonal elements.
 */
export function mtrace(m: Matrix): number {
  assertSquare(m);
  return m.reduce((s, row, i) => s + row[i], 0);
}

/**
 * Matrix rank via Gaussian elimination.
 */
export function mrank(m: Matrix): number {
  assertMatrix(m);
  const a = m.map((row) => [...row]);
  const r = rows(a), c = cols(a);
  let rank = 0;
  for (let col = 0; col < c && rank < r; col++) {
    let pivotRow = -1;
    for (let row = rank; row < r; row++) {
      if (Math.abs(a[row][col]) > 1e-10) { pivotRow = row; break; }
    }
    if (pivotRow < 0) continue;
    [a[rank], a[pivotRow]] = [a[pivotRow], a[rank]];
    const scale = a[rank][col];
    for (let j = col; j < c; j++) a[rank][j] /= scale;
    for (let row = 0; row < r; row++) {
      if (row === rank || Math.abs(a[row][col]) < 1e-10) continue;
      const f = a[row][col];
      for (let j = col; j < c; j++) a[row][j] -= f * a[rank][j];
    }
    rank++;
  }
  return rank;
}

// ─── Solve Linear Systems ─────────────────────────────────────────────────────

/**
 * Solve Ax = b using Gauss-Jordan elimination.
 * @returns solution vector x
 */
export function msolve(A: Matrix, b: Vector): Vector {
  assertSquare(A, 'A');
  if (rows(A) !== b.length) {
    throw new RangeError('A rows must equal b length');
  }
  const n = rows(A);
  const aug: number[][] = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    let maxRow = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(aug[row][col]) > Math.abs(aug[maxRow][col])) maxRow = row;
    }
    [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];
    if (Math.abs(aug[col][col]) < 1e-12) {
      throw new RangeError('matrix is singular — system has no unique solution');
    }
    const pivot = aug[col][col];
    for (let j = col; j <= n; j++) aug[col][j] /= pivot;
    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const f = aug[row][col];
      for (let j = col; j <= n; j++) aug[row][j] -= f * aug[col][j];
    }
  }
  return aug.map((row) => row[n]);
}
