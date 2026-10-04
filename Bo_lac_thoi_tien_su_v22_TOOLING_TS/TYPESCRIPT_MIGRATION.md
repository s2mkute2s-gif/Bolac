# TypeScript migration status — v20

Runtime source remains fully TypeScript. This pass canonicalizes tsconfig and enables `useUnknownInCatchVariables`, with error-boundary narrowing in MIDP/shell. Build and 15 regression tests pass.

Remaining strictness work: `noImplicitAny` and `strictNullChecks` are still disabled because the JVM interpreter and MIDP compatibility layer rely on dynamic Java values/object fields. Tooling/test scripts under `tests/` and `port-tools/` remain `.mjs`; generated `dist/*.js` is expected browser output and is not migration debt.

Run `npm run audit:ts` for counts.
