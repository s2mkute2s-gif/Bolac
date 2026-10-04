import type {ClassDef, NativeBridge, VMThread, VMFrame, JavaValue, ResolvedMethod} from './runtime-types.js';
// Java bytecode interpreter. Game methods and constants are read unchanged from the supplied JAR.
export class JavaFault extends Error { javaClass:string; fields:Record<string, unknown>; constructor(type:string,message=''){super(message);this.javaClass=type;this.fields={};}}
const zero=d=>d==='J'?0n:d[0]==='['||d[0]==='L'?null:0;
const signatures=new Map();
export function signature(d){if(signatures.has(d))return signatures.get(d);let a=[],i=1;while(d[i]!==')'){let start=i;while(d[i]==='[')i++;if(d[i]==='L')i=d.indexOf(';',i)+1;else i++;a.push(d.slice(start,i))}const result={args:a,ret:d.slice(i+1)};signatures.set(d,result);return result}
const isWide=x=>typeof x==='bigint';
export class VM {
 classes; fieldCache; referenceKeys; methodCache; native; threads; nextThread; errors; count; classState; statics; now; trace;
 constructor(classes,native){this.classes=classes;this.fieldCache=new Map();this.referenceKeys=new WeakMap();this.methodCache=new Map();this.native=native;native.vm=this;this.threads=[];this.nextThread=1;this.errors=[];this.count=0;this.classState={};this.statics={};this.now=0;this.trace=[];for(const c of Object.values(classes) as ClassDef[]){c.methodMap=new Map(c.methods.map(m=>[m.name+m.desc,m]));for(const f of c.fields)if(f.access&8)this.statics[this.fkey(c.name,f.name,f.desc)]=f.value??zero(f.desc)}}
 referenceKey(ref){let key=this.referenceKeys.get(ref);if(key===undefined){key=this.fkey(this.fieldOwner(ref.owner,ref.name,ref.desc),ref.name,ref.desc);this.referenceKeys.set(ref,key)}return key}
 fkey(c,n,d){return c+'.'+n+':'+d}
 fieldOwner(c,n,d){const key=c+'.'+n+':'+d;if(this.fieldCache.has(key))return this.fieldCache.get(key);const owner=this.findFieldOwner(c,n,d);this.fieldCache.set(key,owner);return owner}
 findFieldOwner(c,n,d){while(this.classes[c]){if(this.classes[c].fields.some(f=>f.name===n&&f.desc===d))return c;c=this.classes[c].super}return c}
 newObject(c){const o={javaClass:c,fields:{}};let k=c;while(this.classes[k]){for(const f of this.classes[k].fields)if(!(f.access&8))o.fields[this.fkey(k,f.name,f.desc)]=zero(f.desc);k=this.classes[k].super}return o}
 get(o,c,n,d){this.notNull(o);return o.fields[this.fkey(this.fieldOwner(c,n,d),n,d)]??zero(d)}
 set(o,c,n,d,v){this.notNull(o);o.fields[this.fkey(this.fieldOwner(c,n,d),n,d)]=v}
 notNull(o){if(o===null||o===undefined)throw new JavaFault('java/lang/NullPointerException')}
 resolve(c,n,d){const key=c+'.'+n+d;if(this.methodCache.has(key))return this.methodCache.get(key);const result=this.findMethod(c,n,d);this.methodCache.set(key,result);return result}
 findMethod(c,n,d){let visited=new Set();while(c&&!visited.has(c)){visited.add(c);const cls=this.classes[c];if(!cls)return {owner:c};const m=cls.methodMap.get(n+d);if(m)return {owner:c,method:m};c=cls.super}return {owner:c}}
 frame(owner,m,obj,args){let locals=Array(m.locals||16).fill(null),i=0;if(!(m.access&8))locals[i++]=obj;let sig=signature(m.desc);args.forEach((a,k)=>{locals[i++]=a;if(sig.args[k]==='J'||sig.args[k]==='D')i++});return {owner,method:m,code:m.code,locals,stack:[],pc:0,lastPC:0}}
 start(obj,n,d,args=[],owner=obj?.javaClass){const r=this.resolve(owner,n,d);if(!r.method)throw Error('Cannot start '+owner+'.'+n+d);const t={id:this.nextThread++,frames:[this.frame(r.owner,r.method,obj,args)],wake:0,waiting:false,done:false};this.threads.push(t);return t}
 ensure(c,t,caller,pc){if(!this.classes[c]||this.classState[c])return true;this.classState[c]=1;const cls=this.classes[c];const m=cls.methodMap.get('<clinit>()V');if(m){caller.pc=pc;t.frames.push(this.frame(c,m,null,[]));return false}return true}
 instance(o,c){if(o==null)return false;if(c==='java/lang/Object')return true;if(c[0]==='[')return Array.isArray(o)||ArrayBuffer.isView(o);let k=typeof o==='string'?'java/lang/String':o.javaClass;while(k){if(k===c)return true;const def=this.classes[k];if(def?.interfaces.includes(c))return true;k=def?.super}if(o instanceof JavaFault)return c==='java/lang/Throwable'||c==='java/lang/Exception'||c==='java/lang/RuntimeException';return false}
 fault(t,e){if(!(e instanceof JavaFault)){const f=t.frames.at(-1);e.message+=' at '+f?.owner+'.'+f?.method.name+f?.method.desc+' pc '+f?.lastPC;this.errors.push(e);t.done=true;this.native.onError?.(e);return}this.trace.push({type:e.javaClass,msg:e.message,where:t.frames.at(-1)?.owner,pc:t.frames.at(-1)?.lastPC});if(this.trace.length>100)this.trace.shift();while(t.frames.length){const f=t.frames.at(-1),h=f.method.exceptions?.find(x=>f.lastPC>=x.start&&f.lastPC<x.end&&(!x.type||this.instance(e,x.type)));if(h){f.stack=[e];f.pc=h.handler;return}t.frames.pop()}t.done=true;this.errors.push(e);this.native.onError?.(e)}
 call(t,f,ref,args,obj,virtual){let owner=virtual?(typeof obj==='string'?'java/lang/String':obj?.javaClass):ref.owner;this.notNull(virtual?obj:true);let r=this.resolve(owner,ref.name,ref.desc);if(this.native.textBridge?.intercept(r.owner,ref.name,ref.desc,obj,args))return;if(r.method){t.frames.push(this.frame(r.owner,r.method,obj,args));return}const sig=signature(ref.desc);const v=this.native.invoke(r.owner||owner,ref.name,ref.desc,obj,args,t);if(v&&typeof v.then==='function'){t.waiting=true;v.then(value=>{if(sig.ret!=='V')f.stack.push(value);t.waiting=false}).catch(e=>{t.waiting=false;this.fault(t,e)})}else if(sig.ret!=='V')f.stack.push(v)}
 runThread(t,now,budget,deadline=Infinity){let n=0;t.yield=false;while(!t.done&&!t.waiting&&!t.yield&&t.wake<=now&&n<budget){if((n&255)===0&&performance.now()>=deadline)break;n++;try{this.instruction(t)}catch(e){this.fault(t,e)}}this.count+=n;return n}
 tick(now=this.native.clock(),budget=200000,maxMs=Infinity){this.now=now;const deadline=maxMs===Infinity?Infinity:performance.now()+maxMs;const paint=this.native.paintThread;
 // Finish a suspended paint before allowing game buffers to change again.
 if(paint&&!paint.done){if(!paint.waiting&&paint.wake<=now)this.runThread(paint,now,budget,deadline);this.threads=this.threads.filter(t=>!t.done);return}
 for(const t of this.threads.slice()){if(t.done||t.waiting||t.wake>now)continue;if(performance.now()>=deadline)break;this.runThread(t,now,budget,deadline)}this.threads=this.threads.filter(t=>!t.done);}

 instruction(t){const f=t.frames.at(-1);if(!f){t.done=true;return}const s=f.stack,l=f.locals,c=f.code,cp=this.classes[f.owner].cp,pc=f.pc;f.lastPC=pc;const op=c[f.pc++],u1=()=>c[f.pc++],u2=()=>u1()*256+u1(),i2=()=>{let x=u2();return x>32767?x-65536:x},i4=()=>u1()<<24|u1()<<16|u1()<<8|u1(),pop=()=>s.pop(),push=x=>s.push(x);let a,b,v,i,ref,k;
 if(op>=2&&op<=8){push(op-3);return}if(op>=26&&op<=45){push(l[(op-26)%4]);return}if(op>=59&&op<=78){l[(op-59)%4]=pop();return}
 if(op>=46&&op<=53){i=pop();a=pop();this.notNull(a);if(i<0||i>=a.length)throw new JavaFault('java/lang/ArrayIndexOutOfBoundsException',i+'/'+a.length);push(a[i]);return}
 if(op>=79&&op<=86){v=pop();i=pop();a=pop();this.notNull(a);if(i<0||i>=a.length)throw new JavaFault('java/lang/ArrayIndexOutOfBoundsException',i+'/'+a.length);a[i]=v;return}
 switch(op){case 0:break;case 1:push(null);break;case 9:case 10:push(BigInt(op-9));break;case 11:case 12:case 13:push(op-11);break;case 14:case 15:push(op-14);break;case 16:v=u1();push(v>127?v-256:v);break;case 17:push(i2());break;
 case 18:case 19:case 20:ref=cp[op===18?u1():u2()];push(ref.t===5?BigInt(ref.v):ref.t===7?{javaClass:'java/lang/Class',name:ref.name}:ref.v);break;
 case 21:case 22:case 23:case 24:case 25:push(l[u1()]);break;case 54:case 55:case 56:case 57:case 58:l[u1()]=pop();break;
 case 87:pop();break;case 88:a=pop();if(!isWide(a))pop();break;case 89:a=pop();push(a);push(a);break;case 90:a=pop();b=pop();push(a);push(b);push(a);break;case 91:a=pop();b=pop();if(isWide(b)){push(a);push(b);push(a)}else{v=pop();push(a);push(v);push(b);push(a)}break;
 case 92:a=pop();if(isWide(a)){push(a);push(a)}else{b=pop();push(b);push(a);push(b);push(a)}break;
 case 93:a=pop();if(isWide(a)){b=pop();push(a);push(b);push(a)}else{b=pop();v=pop();push(b);push(a);push(v);push(b);push(a)}break;
 case 94:{a=pop();let top=isWide(a)?[a]:[pop(),a];b=pop();let bot=isWide(b)?[b]:[pop(),b];s.push(...top,...bot,...top);break}case 95:a=pop();b=pop();push(a);push(b);break;
 case 96:b=pop();push((pop()+b)|0);break;case 97:b=pop();push(BigInt.asIntN(64,pop()+b));break;case 98:case 99:b=pop();push(pop()+b);break;
 case 100:b=pop();push((pop()-b)|0);break;case 101:b=pop();push(BigInt.asIntN(64,BigInt(pop())-BigInt(b)));break;case 102:case 103:b=pop();push(pop()-b);break;
 case 104:b=pop();push(Math.imul(pop(),b));break;case 105:b=pop();push(BigInt.asIntN(64,BigInt(pop())*BigInt(b)));break;case 106:case 107:b=pop();push(pop()*b);break;
 case 108:b=pop();a=pop();if(!b)throw new JavaFault('java/lang/ArithmeticException','/ by zero');push((a/b)|0);break;case 109:b=pop();a=pop();if(!b)throw new JavaFault('java/lang/ArithmeticException');push(BigInt.asIntN(64,BigInt(a)/BigInt(b)));break;case 110:case 111:b=pop();push(pop()/b);break;
 case 112:b=pop();a=pop();if(!b)throw new JavaFault('java/lang/ArithmeticException');push(a%b|0);break;case 113:b=pop();push(BigInt(pop())%BigInt(b));break;case 114:case 115:b=pop();push(pop()%b);break;case 116:push(-pop()|0);break;case 117:push(BigInt.asIntN(64,-BigInt(pop())));break;case 118:case 119:push(-pop());break;
 case 120:b=pop();push(pop()<<b);break;case 121:b=pop();push(BigInt.asIntN(64,pop()<<BigInt(b&63)));break;case 122:b=pop();push(pop()>>b);break;case 123:b=pop();push(pop()>>BigInt(b&63));break;case 124:b=pop();push((pop()>>>b)|0);break;case 125:b=pop();push(BigInt.asIntN(64,BigInt.asUintN(64,pop())>>BigInt(b&63)));break;
 case 126:case 127:b=pop();push(pop()&b);break;case 128:case 129:b=pop();push(pop()|b);break;case 130:case 131:b=pop();push(pop()^b);break;case 132:i=u1();v=u1();l[i]=(l[i]+(v>127?v-256:v))|0;break;
 case 133:push(BigInt(pop()));break;case 134:case 137:case 144:push(Math.fround(Number(pop())));break;case 135:case 138:case 141:push(Number(pop()));break;case 136:push(Number(BigInt.asIntN(32,pop())));break;case 139:case 142:push(Number(pop())|0);break;case 140:case 143:push(BigInt(Math.trunc(pop())));break;case 145:push(pop()<<24>>24);break;case 146:push(pop()&65535);break;case 147:push(pop()<<16>>16);break;
 case 148:b=pop();a=pop();push(a===b?0:a>b?1:-1);break;case 149:case 150:case 151:case 152:b=pop();a=pop();push(Number.isNaN(a)||Number.isNaN(b)?(op%2?-1:1):a===b?0:a>b?1:-1);break;
 case 153:case 154:case 155:case 156:case 157:case 158:v=i2();a=pop();if([a===0,a!==0,a<0,a>=0,a>0,a<=0][op-153])f.pc=pc+v;break;
 case 159:case 160:case 161:case 162:case 163:case 164:case 165:case 166:v=i2();b=pop();a=pop();if([a===b,a!==b,a<b,a>=b,a>b,a<=b,a===b,a!==b][op-159])f.pc=pc+v;break;
 case 167:f.pc=pc+i2();break;case 168:v=i2();push(f.pc);f.pc=pc+v;break;case 169:f.pc=l[u1()];break;
 case 170:{while(f.pc%4)u1();let def=i4(),lo=i4(),hi=i4(),key=pop(),off=def;for(i=lo;i<=hi;i++){v=i4();if(key===i)off=v}f.pc=pc+off;break}
 case 171:{while(f.pc%4)u1();let def=i4(),n=i4(),key=pop(),off=def;for(i=0;i<n;i++){a=i4();v=i4();if(key===a)off=v}f.pc=pc+off;break}
 case 172:case 173:case 174:case 175:case 176:v=pop();t.frames.pop();if(t.frames.length)t.frames.at(-1).stack.push(v);else {t.done=true;t.result=v}break;case 177:t.frames.pop();if(!t.frames.length)t.done=true;break;
 case 178:case 179:ref=cp[u2()];if(!this.ensure(ref.owner,t,f,pc))break;k=this.referenceKey(ref);if(op===178)push(this.statics[k]??zero(ref.desc));else this.statics[k]=pop();break;
 case 180:ref=cp[u2()];a=pop();this.notNull(a);push(a.fields[this.referenceKey(ref)]??zero(ref.desc));break;case 181:ref=cp[u2()];v=pop();a=pop();this.notNull(a);a.fields[this.referenceKey(ref)]=v;break;
 case 182:case 183:case 184:case 185:ref=cp[u2()];if(op===185){u1();u1()}if(op===184&&!this.ensure(ref.owner,t,f,pc))break;{const sig=signature(ref.desc);a=s.splice(s.length-sig.args.length,sig.args.length);b=op===184?null:pop();if(op!==184)this.notNull(b);this.call(t,f,ref,a,b,op===182||op===185)}break;
 case 187:ref=cp[u2()];if(this.ensure(ref.name,t,f,pc))push(this.newObject(ref.name));break;case 188:i=u1();v=pop();if(v<0)throw new JavaFault('java/lang/NegativeArraySizeException');a=i===8?new Int8Array(v):i===9?new Int16Array(v):i===5?new Uint16Array(v):i===10?new Int32Array(v):i===11?Array(v).fill(0n):Array(v).fill(0);a.javaClass='['+({4:'Z',5:'C',6:'F',7:'D',8:'B',9:'S',10:'I',11:'J'}[i]);push(a);break;
 case 189:ref=cp[u2()];v=pop();if(v<0)throw new JavaFault('java/lang/NegativeArraySizeException');a=Array(v).fill(null);a.javaClass='[L'+ref.name+';';push(a);break;case 190:a=pop();this.notNull(a);push(a.length);break;case 191:throw pop();
 case 192:ref=cp[u2()];a=pop();if(a!=null&&!this.instance(a,ref.name))throw new JavaFault('java/lang/ClassCastException',(((a as {javaClass?:string}).javaClass)??typeof a)+' to '+ref.name);push(a);break;case 193:ref=cp[u2()];push(this.instance(pop(),ref.name)?1:0);break;case 194:case 195:this.notNull(pop());break;
 case 196:{let code=u1(),index=u2();if(code===132)l[index]=(l[index]+i2())|0;else if(code>=21&&code<=25)push(l[index]);else if(code>=54&&code<=58)l[index]=pop();else if(code===169)f.pc=l[index];else throw Error('Invalid wide opcode '+code);break}
 case 197:ref=cp[u2()];v=u1();a=s.splice(s.length-v,v);{const mk=(depth)=>{let arr=Array(a[depth]).fill(null);if(depth<a.length-1)arr=arr.map(()=>mk(depth+1));else if(ref.name.slice(depth+1).length===1)arr.fill(zero(ref.name.at(-1)));(arr as unknown as {javaClass:string}).javaClass=ref.name.slice(depth);return arr};push(mk(0))}break;
 case 198:case 199:v=i2();a=pop();if(op===198?a==null:a!=null)f.pc=pc+v;break;case 200:f.pc=pc+i4();break;default:throw Error('Unsupported bytecode '+op+' at '+pc);
 }
 }
}
