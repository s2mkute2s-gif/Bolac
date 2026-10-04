import {VietnameseText} from '../original-web/unicode-text.js';
import fs from 'node:fs';import path from 'node:path';import {createRequire} from 'node:module';import {VM} from '../original-web/vm.js';import {MIDP} from '../original-web/midp.js';
const require=createRequire(import.meta.url),{createCanvas,loadImage,GlobalFonts}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/@napi-rs/canvas':'@napi-rs/canvas');
GlobalFonts.registerFromPath(new URL('../original-web/fonts/TribesVN.ttf',import.meta.url).pathname,'TribesVN');
const locale=JSON.parse(fs.readFileSync(new URL('../original-web/locale/vi.json',import.meta.url)));
const base=new URL('../original-web/',import.meta.url),classes=JSON.parse(fs.readFileSync(new URL('classes.json',base))),resources: Record<string, any>={};
for(const name of JSON.parse(fs.readFileSync(new URL('resources.json',base))))resources[name]=new Uint8Array(fs.readFileSync(new URL('resources/'+name,base)));
const manifest=Object.fromEntries(Buffer.from(resources['META-INF/MANIFEST.MF']).toString().split(/\r?\n/).filter(x=>x.includes(': ')).map(x=>[x.slice(0,x.indexOf(': ')),x.slice(x.indexOf(': ')+2)]));
const canvas=createCanvas(240,320),data=new Map();let time=1000000;const storage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};
const midp=new MIDP({canvas,makeCanvas:createCanvas,decodeImage:bytes=>loadImage(Buffer.from(bytes)),resources,manifest,storage,clock:()=>time,onError:e=>console.error(e.stack),onStatus:console.log});midp.textBridge=new VietnameseText(midp,locale);const crops=new Map();const invoke=midp.invoke.bind(midp);midp.invoke=function(owner,name,desc,obj,args,t){if(name==='drawRegion'&&[76,105].includes(args[0]?.canvas?.width)){const record=[args[0].canvas.width,args[0].canvas.height,...args.slice(1,5)];crops.set(record.join(','),record)}return invoke(owner,name,desc,obj,args,t)};const vm=new VM(classes,midp);const app=vm.newObject('tribes');vm.start(app,'<init>','()V');
const snap=n=>fs.writeFileSync(new URL('../port-tools/'+n+'.png',import.meta.url),canvas.toBuffer('image/png'));
async function advance(ms){for(let i=0;i<ms/16;i++){time+=16;vm.tick(time,50000);midp.paint();await new Promise(r=>setImmediate(r));if(vm.threads.some(t=>t.waiting))await Promise.all([...midp.images.values()]);if(vm.errors.length)break;}}
await advance(32);vm.start(app,'startApp','()V');await advance(14000);snap('original-boot');console.log('STATUS',JSON.stringify({instructions:vm.count,threads:vm.threads.map(t=>({id:t.id,wait:t.waiting,frames:t.frames.map(f=>f.owner+'.'+f.method.name+f.method.desc+':'+f.pc)})),current:midp.current?.javaClass,errors:vm.errors.map(e=>e.message),trace:vm.trace}));
fs.writeFileSync(new URL('../port-tools/runtime-log.json',import.meta.url),JSON.stringify({errors:vm.errors.map(e=>e.message),exceptions:vm.trace,calls:[...midp.nativeCalls]},null,2));
async function press(key,wait=800){midp.key(key,true);await advance(96);midp.key(key,false);await advance(wait)}
for(let i=1;i<=7;i++){await press(53);snap('original-step-'+i);console.log('KEY',i,'errors',vm.errors.length,'instructions',vm.count)}
for(let i=8;i<=18;i++){await press(53,1000);snap('original-step-'+i);console.log('KEY',i,'errors',vm.errors.length,'instructions',vm.count)}
await advance(15000);snap('original-running');console.log('END',JSON.stringify({instructions:vm.count,errors:vm.errors.map(e=>e.message),trace:vm.trace,threads:vm.threads.map(t=>({id:t.id,wait:t.waiting,frames:t.frames.map(f=>f.owner+'.'+f.method.name+f.method.desc+':'+f.pc)})),stores:[...data].map(([k,v])=>[k,v.length])}));
for(let i=19;i<=60;i++){await press(53,400);if(i%5===0)snap('original-step-'+i);if(vm.errors.length)break}await advance(20000);snap('original-world');console.log('WORLD',JSON.stringify({instructions:vm.count,errors:vm.errors.map(e=>e.message),exceptions:vm.trace}));
for(let i=61;i<=90;i++){await press(53,160);if(vm.errors.length)break}await advance(2000);snap('original-gameplay');await press(-7);snap('original-pause');console.log('PAUSE',vm.errors.map(e=>e.message));
await press(-6,1500);snap('original-softleft');await press(-7,1500);snap('original-softright');await press(48,1500);snap('original-zero');console.log('LAST errors',vm.errors.map(e=>e.message));
await press(-7);await press(-7);snap('original-system-menu');
await press(56);await press(53,1500);snap('original-save-dialog');console.log('SAVE stores',JSON.stringify([...data].map(([k,v])=>[k,v.length])));fs.writeFileSync(new URL('../port-tools/original-rms-test.json',import.meta.url),JSON.stringify(Object.fromEntries(data),null,2));

fs.writeFileSync(new URL("../port-tools/character-crops.json",import.meta.url),JSON.stringify([...crops.values()],null,2));
