import {VietnameseText} from '../original-web/unicode-text.js';
import fs from 'node:fs';import path from 'node:path';import {createRequire} from 'node:module';import {VM} from '../original-web/vm.js';import {MIDP} from '../original-web/midp.js';
const require=createRequire(import.meta.url),{createCanvas,loadImage,GlobalFonts}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/@napi-rs/canvas':'@napi-rs/canvas');
GlobalFonts.registerFromPath(new URL('../original-web/fonts/TribesVN.ttf',import.meta.url).pathname,'TribesVN');
const locale=JSON.parse(fs.readFileSync(new URL('../original-web/locale/vi.json',import.meta.url)));
const base=new URL('../original-web/',import.meta.url),classes=JSON.parse(fs.readFileSync(new URL('classes.json',base))),resources: Record<string, any>={};
for(const name of JSON.parse(fs.readFileSync(new URL('resources.json',base))))resources[name]=new Uint8Array(fs.readFileSync(new URL('resources/'+name,base)));
const manifest=Object.fromEntries(Buffer.from(resources['META-INF/MANIFEST.MF']).toString().split(/\r?\n/).filter(x=>x.includes(': ')).map(x=>[x.slice(0,x.indexOf(': ')),x.slice(x.indexOf(': ')+2)]));
const canvas=createCanvas(240,320),data=new Map();let time=1000000;const storage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};
const midp=new MIDP({canvas,makeCanvas:createCanvas,decodeImage:bytes=>loadImage(Buffer.from(bytes)),resources,manifest,storage,clock:()=>time,onError:e=>console.error(e.stack),onStatus:console.log});midp.textBridge=new VietnameseText(midp,locale);const vm=new VM(classes,midp);const app=vm.newObject('tribes');vm.start(app,'<init>','()V');
const snap=n=>fs.writeFileSync(new URL('../port-tools/'+n+'.png',import.meta.url),canvas.toBuffer('image/png'));
async function advance(ms){for(let i=0;i<ms/16;i++){time+=16;vm.tick(time,50000);midp.paint();await new Promise(r=>setImmediate(r));if(vm.threads.some(t=>t.waiting))await Promise.all([...midp.images.values()]);if(vm.errors.length)break;}}
await advance(32);vm.start(app,'startApp','()V');await advance(14000);snap('original-boot');console.log('STATUS',JSON.stringify({instructions:vm.count,threads:vm.threads.map(t=>({id:t.id,wait:t.waiting,frames:t.frames.map(f=>f.owner+'.'+f.method.name+f.method.desc+':'+f.pc)})),current:midp.current?.javaClass,errors:vm.errors.map(e=>e.message),trace:vm.trace}));
fs.writeFileSync(new URL('../port-tools/runtime-log.json',import.meta.url),JSON.stringify({errors:vm.errors.map(e=>e.message),exceptions:vm.trace,calls:[...midp.nativeCalls]},null,2));
async function press(key,wait=800){midp.key(key,true);await advance(96);midp.key(key,false);await advance(wait)}

await press(53);await press(53);const before={...midp.current.fields};await press(56);const after=midp.current.fields;console.log('MENU FIELD DIFF',JSON.stringify(Object.fromEntries(Object.entries(after).filter(([k,v])=>typeof v==='number'&&before[k]!==v).map(([k,v])=>[k,[before[k],v]]))));
