/** Shared runtime contracts for the Java ME interpreter. */
export type JavaPrimitive = number | bigint | string | null;
export type JavaValue = JavaPrimitive | JavaObject | JavaValue[] | ArrayBufferView | Promise<JavaValue> | unknown;

export interface JavaObject {
  javaClass: string;
  fields: Record<string, JavaValue>;
  [key: string]: unknown;
}
export interface FieldDef { name: string; desc: string; access: number; value?: JavaValue; }
export interface ExceptionHandler { start: number; end: number; handler: number; type?: string | null; }
export interface MethodDef { name: string; desc: string; access: number; locals?: number; code: number[] | Uint8Array; exceptions?: ExceptionHandler[]; }
export interface ClassDef {
  name: string; super?: string | null; interfaces: string[]; fields: FieldDef[]; methods: MethodDef[]; cp: unknown[];
  methodMap?: Map<string, MethodDef>;
}
export interface ResolvedMethod { owner: string; method?: MethodDef; }
export interface VMFrame { owner: string; method: MethodDef; code: number[] | Uint8Array; locals: JavaValue[]; stack: JavaValue[]; pc: number; lastPC: number; }
export interface VMThread { id: number; frames: VMFrame[]; wake: number; waiting: boolean; done: boolean; yield?: boolean; }
export interface NativeBridge {
  vm?: unknown; paintThread?: VMThread | null; textBridge?: { intercept(...args: unknown[]): boolean };
  clock(): number; invoke(...args: unknown[]): unknown; onError?(error: unknown): void;
}
export interface MIDPOptions {
  canvas: HTMLCanvasElement; makeCanvas(width: number, height: number): HTMLCanvasElement;
  decodeImage(data: Uint8Array): Promise<CanvasImageSource & {width:number;height:number}>;
  resources: Record<string, ArrayLike<number>>; manifest: Record<string, string>; storage: {getItem(key:string):string|null;setItem(key:string,value:string):void;removeItem(key:string):void};
  clock?: () => number; onError?: (error: unknown) => void; onStatus?: (message: string) => void;
  audio?: unknown; renderScale?: number; art?: unknown;
}
