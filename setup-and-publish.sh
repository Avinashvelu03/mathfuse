#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# mathfuse — GitHub + NPM upload script
# Run this once from inside the mathfuse/ directory
# ─────────────────────────────────────────────────────────────

set -e

echo "📦 mathfuse — repo & publish setup"
echo "─────────────────────────────────────"

# 1. Init git
git init
git add .
git commit -m "feat: initial release v1.0.0

- stats: mean, median, mode, variance, stdDev, percentile, skewness,
  kurtosis, correlation (Pearson/Spearman), linear regression, z-score
- algebra: vector ops, matrix multiply/inverse/determinant/rank/solve
- number-theory: Miller-Rabin prime test, sieve, GCD/LCM, factorial,
  binomial, modPow, Fibonacci, Collatz
- numerical: bisection/Newton-Raphson/Brent root finders, adaptive
  Simpson + Gauss-Legendre integration, numerical derivatives, Lagrange
  interpolation, Kahan summation
- Full TypeScript, ESM + CJS dual build, zero dependencies
- 124 passing tests with coverage report
- GitHub Actions CI across Node 18/20/22"

# 2. Create GitHub repo (requires GitHub CLI — brew install gh)
echo ""
echo "▶ Creating GitHub repo..."
gh repo create scientistmaths/mathfuse \
  --public \
  --description "Modern zero-dependency TypeScript math utility library — stats, algebra, number theory & numerical methods" \
  --homepage "https://www.npmjs.com/package/mathfuse"

git branch -M main
git remote add origin https://github.com/scientistmaths/mathfuse.git
git push -u origin main

echo ""
echo "✅ Pushed to GitHub!"
echo ""

# 3. Add GitHub topics (stars-friendly tags)
gh repo edit scientistmaths/mathfuse \
  --add-topic math \
  --add-topic mathematics \
  --add-topic statistics \
  --add-topic linear-algebra \
  --add-topic typescript \
  --add-topic zero-dependency \
  --add-topic numerical-methods \
  --add-topic number-theory \
  --add-topic npm-package \
  --add-topic tree-shakeable

echo "✅ Topics added!"
echo ""

# 4. Publish to NPM
echo "▶ Publishing to NPM..."
npm login     # opens browser login
npm publish --access public

echo ""
echo "🎉 Published! View at: https://www.npmjs.com/package/mathfuse"
echo ""
echo "Next steps to grow stars:"
echo "  1. Post on Reddit: r/javascript, r/typescript, r/node"
echo "  2. Share on Hacker News (Show HN)"
echo "  3. Add to awesome-typescript list"
echo "  4. Write a dev.to / Medium article"
echo "  5. Answer relevant StackOverflow questions and link the lib"
