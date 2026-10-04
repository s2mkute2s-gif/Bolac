import type { JavaObject, JavaValue, VMFrame } from './runtime-types.js';

export function isJavaObject(value: unknown): value is JavaObject {
  return !!value && typeof value === 'object' && typeof (value as {javaClass?:unknown}).javaClass === 'string';
}
export function asNumber(value: JavaValue, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : typeof value === 'bigint' ? Number(value) : fallback;
}
export function asInt(value: JavaValue, fallback = 0): number { return asNumber(value, fallback) | 0; }
export function asBoolean(value: JavaValue): boolean { return asInt(value) !== 0; }
export function popValue(frame: VMFrame): JavaValue { return frame.stack.pop() ?? null; }
export function popInt(frame: VMFrame): number { return asInt(popValue(frame)); }
export function pushValue(frame: VMFrame, value: JavaValue): void { frame.stack.push(value); }
export function local(frame: VMFrame, index: number): JavaValue { return frame.locals[index] ?? null; }
export function setLocal(frame: VMFrame, index: number, value: JavaValue): void { frame.locals[index] = value; }
