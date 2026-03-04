// ============================================
// templates/maths.js — Maths Templates
// ============================================
window.__MDV_TEMPLATES_MATHS = [
    {
      name: 'Algebra & Calculus',
      category: 'maths',
      icon: 'bi-calculator',
      description: 'Fundamental algebra and calculus with step-by-step evaluations',
      content: `# 📐 Algebra & Calculus — Interactive Math

> Click **▶ Evaluate** on any math block to compute it live.
> Powered by [math.js](https://mathjs.org/) — a comprehensive math library.

---

## 1. Basic Arithmetic & Expressions

math.js handles operator precedence, parentheses, and large numbers.

\`\`\`math
2 + 3 * 4
(2 + 3) * 4
2 ^ 10
sqrt(144)
abs(-42)
\`\`\`

**Explanation:**
- \`2 + 3 * 4\` → multiplication first: 2 + 12 = **14**
- \`(2 + 3) * 4\` → parentheses first: 5 × 4 = **20**
- \`2 ^ 10\` → 2 raised to the 10th power = **1024**
- \`sqrt(144)\` → square root = **12**

---

## 2. Variables & Algebra

Variables persist across lines within the same block.

\`\`\`math
x = 5
y = 3
x^2 + y^2
sqrt(x^2 + y^2)
\`\`\`

**Pythagorean theorem:** Given sides x=5 and y=3, the hypotenuse is \`√(25 + 9) = √34 ≈ 5.83\`

### Quadratic Formula

For $ax^2 + bx + c = 0$, the roots are $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$

\`\`\`math
a = 1
b = -5
c = 6
// Discriminant
D = b^2 - 4*a*c
// Roots
x1 = (-b + sqrt(D)) / (2*a)
x2 = (-b - sqrt(D)) / (2*a)
\`\`\`

**Result:** The equation $x^2 - 5x + 6 = 0$ has roots **x = 3** and **x = 2**

---

## 3. Trigonometry

\`\`\`math
// Angles in radians
sin(pi / 6)
cos(pi / 3)
tan(pi / 4)
// Convert degrees to radians
45 * (pi / 180)
sin(45 * pi / 180)
\`\`\`

**Key values:**
- sin(30°) = sin(π/6) = **0.5**
- cos(60°) = cos(π/3) = **0.5**
- tan(45°) = tan(π/4) = **1**

---

## 4. Logarithms & Exponentials

\`\`\`math
// Natural log
log(e)
log(e^3)
// Base-10 log
log10(1000)
log10(50)
// Exponential
exp(1)
exp(0)
\`\`\`

**Explanation:**
- \`log(e)\` = ln(e) = **1** (natural log)
- \`log10(1000)\` = **3** (since 10³ = 1000)
- \`exp(1)\` = e¹ ≈ **2.718** (Euler's number)

---

## 5. Calculus Concepts

While math.js doesn't do symbolic calculus, we can approximate **derivatives** and compute **summations**:

### Numerical Derivative

Approximate f'(x) using the limit definition: $f'(x) \\approx \\frac{f(x+h) - f(x-h)}{2h}$

\`\`\`math
// f(x) = x^3 at x = 2
// Exact derivative: f'(x) = 3x^2 = 12
h = 0.0001
f_plus = (2 + h)^3
f_minus = (2 - h)^3
derivative = (f_plus - f_minus) / (2 * h)
\`\`\`

**Result:** The numerical derivative of x³ at x=2 ≈ **12** (exact: 3·2² = 12 ✓)

### Summation (Σ)

$$\\sum_{k=1}^{100} k = \\frac{100 \\times 101}{2} = 5050$$

\`\`\`math
// Sum of 1 to 100
sum(1:100)
// Verify with formula
100 * 101 / 2
\`\`\`
`
    },
    {
      name: 'Statistics & Probability',
      category: 'maths',
      icon: 'bi-bar-chart-line',
      description: 'Statistical computations — mean, standard deviation, combinations, and distributions',
      content: `# 📊 Statistics & Probability

> Click **▶ Evaluate** to compute each block. Variables carry over within a block.

---

## 1. Descriptive Statistics

### Central Tendency

\`\`\`math
data = [85, 90, 78, 92, 88, 76, 95, 89, 84, 91]
mean(data)
median(data)
min(data)
max(data)
\`\`\`

**Interpretation:**
- **Mean** = average of all values
- **Median** = middle value when sorted (robust to outliers)

### Spread & Variability

\`\`\`math
data = [85, 90, 78, 92, 88, 76, 95, 89, 84, 91]
// Variance
variance(data)
// Standard deviation
std(data)
// Range
max(data) - min(data)
\`\`\`

**Explanation:**
- **Variance** σ² = average of squared deviations from the mean
- **Std Dev** σ = √variance — measures spread in same units as data
- **Range** = max − min — simplest measure of spread

---

## 2. Combinatorics

Counting arrangements and selections.

### Factorials & Permutations

\`\`\`math
// Factorial: n!
factorial(5)
factorial(10)
// Permutations: P(n,r) = n! / (n-r)!
// "How many ways to arrange 3 items from 5?"
factorial(5) / factorial(5 - 3)
\`\`\`

### Combinations

$$C(n, r) = \\binom{n}{r} = \\frac{n!}{r!(n-r)!}$$

\`\`\`math
// Combinations: C(n,r) = n! / (r! * (n-r)!)
// "How many ways to choose 3 items from 10?"
combinations(10, 3)
// Lottery: choose 6 from 49
combinations(49, 6)
\`\`\`

**Lottery odds:** Choosing 6 numbers from 49 → **13,983,816** possible combinations. That's roughly 1 in 14 million!

---

## 3. Probability

### Basic Probability Calculations

\`\`\`math
// Probability of rolling a 6 on a fair die
p_six = 1/6
// Probability of NOT rolling a 6
p_not_six = 1 - p_six
// Probability of rolling a 6 at least once in 4 rolls
p_at_least_one = 1 - (5/6)^4
\`\`\`

**Explanation:**
- P(at least one 6 in 4 rolls) = 1 − P(no 6 in any roll) = 1 − (5/6)⁴ ≈ **51.8%**

### Expected Value

\`\`\`math
// Fair coin: +$10 for heads, -$6 for tails
// E[X] = Σ(value × probability)
E_coin = 10 * 0.5 + (-6) * 0.5
// Weighted die: sides 1-6 with double chance for 6
// Total probability weight: 5*1 + 1*2 = 7
E_die = (1+2+3+4+5) * (1/7) + 6 * (2/7)
\`\`\`

---

## 4. Sequences & Series

### Geometric Series

$$S = a \\cdot \\frac{1 - r^n}{1 - r}$$

\`\`\`math
// Geometric series: a=2, r=3, n=5 terms
a = 2
r = 3
n = 5
S = a * (1 - r^n) / (1 - r)
// Verify by summing terms: 2 + 6 + 18 + 54 + 162
2 + 6 + 18 + 54 + 162
\`\`\`

### Compound Interest

$$A = P \\left(1 + \\frac{r}{n}\\right)^{nt}$$

\`\`\`math
// $1000 at 5% annual interest, compounded monthly, for 10 years
P = 1000
r = 0.05
n = 12
t = 10
A = P * (1 + r/n)^(n*t)
\`\`\`

**Result:** \\$1,000 grows to ≈ **\\$1,647** over 10 years at 5% compounded monthly.

---

## 5. Normal Distribution (Z-scores)

\`\`\`math
// Student scores: mean = 75, std = 10
// A student scored 92. What's their z-score?
mu = 75
sigma = 10
score = 92
z = (score - mu) / sigma
// How many std deviations above the mean?
\`\`\`

**Interpretation:** A z-score of **1.7** means the student scored 1.7 standard deviations above the mean — roughly in the **top 5%**.
`
    },
    {
      name: 'Linear Algebra',
      category: 'maths',
      icon: 'bi-grid-3x3',
      description: 'Matrix operations — multiplication, determinants, inverses, and transforms',
      content: `# 🔢 Linear Algebra — Matrix Operations

> Click **▶ Evaluate** to compute. math.js has full matrix support!

---

## 1. Creating Matrices

\`\`\`math
// 2×2 matrix
A = [[1, 2], [3, 4]]
A
// 3×3 identity matrix
I = identity(3)
I
\`\`\`

**Notation:** Matrices are written as arrays of rows: \`[[row1], [row2], ...]\`

---

## 2. Matrix Arithmetic

\`\`\`math
A = [[1, 2], [3, 4]]
B = [[5, 6], [7, 8]]
// Addition
add(A, B)
// Scalar multiplication
multiply(3, A)
// Element-wise multiplication
dotMultiply(A, B)
\`\`\`

### Matrix Multiplication

\`\`\`math
A = [[1, 2], [3, 4]]
B = [[5, 6], [7, 8]]
// Matrix product (A × B)
multiply(A, B)
\`\`\`

**How it works:**
$$AB = \\begin{bmatrix} 1 \\cdot 5 + 2 \\cdot 7 & 1 \\cdot 6 + 2 \\cdot 8 \\\\ 3 \\cdot 5 + 4 \\cdot 7 & 3 \\cdot 6 + 4 \\cdot 8 \\end{bmatrix} = \\begin{bmatrix} 19 & 22 \\\\ 43 & 50 \\end{bmatrix}$$

---

## 3. Determinant & Inverse

\`\`\`math
A = [[1, 2], [3, 4]]
// Determinant
det(A)
// Inverse
inv(A)
// Verify: A × A⁻¹ = I
multiply(A, inv(A))
\`\`\`

**Explanation:**
- det([[a,b],[c,d]]) = ad − bc = (1)(4) − (2)(3) = **−2**
- A matrix is invertible if and only if det ≠ 0
- A × A⁻¹ always equals the identity matrix

---

## 4. Transpose & Trace

\`\`\`math
A = [[1, 2, 3], [4, 5, 6]]
// Transpose: flip rows and columns
transpose(A)
// Trace: sum of diagonal elements (square matrix)
B = [[1, 2], [3, 4]]
trace(B)
\`\`\`

**Properties:**
- Transpose of a 2×3 matrix gives a 3×2 matrix
- Trace(B) = 1 + 4 = **5** (sum of main diagonal)

---

## 5. Solving Linear Systems

Solve Ax = b:

$$\\begin{cases} 2x + y = 5 \\\\ x + 3y = 10 \\end{cases}$$

\`\`\`math
// Coefficient matrix A and constants vector b
A = [[2, 1], [1, 3]]
b = [5, 10]
// Solve for x: x = A⁻¹b
x = multiply(inv(A), b)
\`\`\`

**Solution:** x = **1**, y = **3**

**Verification:** 2(1) + 3 = 5 ✓ and 1 + 3(3) = 10 ✓

---

## 6. Eigenvalues

\`\`\`math
A = [[4, 1], [2, 3]]
eigs(A).values
\`\`\`

**Eigenvalues** of a matrix A are scalars λ where Av = λv for some non-zero vector v. They reveal important properties like stability, growth rates, and principal directions.

---

## 7. Vector Operations

\`\`\`math
u = [3, 4]
v = [1, 2]
// Dot product
dot(u, v)
// Cross product (3D)
a = [1, 0, 0]
b = [0, 1, 0]
cross(a, b)
// Vector norm (length)
norm(u)
\`\`\`

**Key results:**
- Dot product: 3·1 + 4·2 = **11**
- Cross product of x̂ and ŷ unit vectors = **ẑ** = [0, 0, 1]
- Norm of [3,4]: √(9+16) = **5**
`
    },
];
