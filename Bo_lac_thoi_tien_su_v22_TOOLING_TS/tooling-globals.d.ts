declare module 'node:test' { const test: (name: string, fn: (...args: unknown[]) => unknown) => unknown; export default test; }
declare module 'node:assert/strict' { const assert: { equal(a: unknown,b: unknown,msg?: string): void; deepEqual(a: unknown,b: unknown,msg?: string): void; ok(v: unknown,msg?: string): void; match(v: string,r: RegExp,msg?: string): void }; export default assert; }
declare module 'node:fs' { const fs: any; export default fs; }
declare module 'node:path' { const path: any; export default path; }
declare module 'node:module' { export function createRequire(url: string): (id: string)=>any; }
declare const process: any;
declare const Buffer: any;
declare function setImmediate(cb: (...args: unknown[])=>void): unknown;
