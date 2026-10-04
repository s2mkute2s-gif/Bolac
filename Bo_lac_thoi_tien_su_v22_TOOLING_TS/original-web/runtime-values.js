export function isJavaObject(value) {
    return !!value && typeof value === 'object' && typeof value.javaClass === 'string';
}
export function asNumber(value, fallback = 0) {
    return typeof value === 'number' && Number.isFinite(value) ? value : typeof value === 'bigint' ? Number(value) : fallback;
}
export function asInt(value, fallback = 0) { return asNumber(value, fallback) | 0; }
export function asBoolean(value) { return asInt(value) !== 0; }
export function popValue(frame) { return frame.stack.pop() ?? null; }
export function popInt(frame) { return asInt(popValue(frame)); }
export function pushValue(frame, value) { frame.stack.push(value); }
export function local(frame, index) { return frame.locals[index] ?? null; }
export function setLocal(frame, index, value) { frame.locals[index] = value; }
//# sourceMappingURL=runtime-values.js.map