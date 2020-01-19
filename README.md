# f-calculus ![](https://github.com/javiergelatti/f-calculus/workflows/Node%20CI/badge.svg)

A simple, functional, dynamically-typed programming language, where there are _only_ functions :raised_hands:

### Example programs
```
(\x.x) 10
```
Evaluates to `10`

---

```
let ∘ = \f.\g.\x.f (g x).
let + = \a.\b. asNumber \f.a f ∘ b f.

2 + 2
```
Evaluates to `4`
