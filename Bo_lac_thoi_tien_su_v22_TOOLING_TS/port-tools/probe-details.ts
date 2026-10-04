import {GameArt,ART_SCALE} from '../original-web/art.js';
import {VietnameseText} from '../original-web/unicode-text.js';
import fs from 'node:fs';import path from 'node:path';import {createRequire} from 'node:module';import {VM} from '../original-web/vm.js';import {MIDP} from '../original-web/midp.js';
const require=createRequire(import.meta.url),{createCanvas,loadImage,GlobalFonts}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/@napi-rs/canvas':'@napi-rs/canvas');
GlobalFonts.registerFromPath(new URL('../original-web/fonts/TribesVN.ttf',import.meta.url).pathname,'TribesVN');
const locale=JSON.parse(fs.readFileSync(new URL('../original-web/locale/vi.json',import.meta.url)));
const base=new URL('../original-web/',import.meta.url),classes=JSON.parse(fs.readFileSync(new URL('classes.json',base))),resources: Record<string, any>={};
for(const name of JSON.parse(fs.readFileSync(new URL('resources.json',base))))resources[name]=new Uint8Array(fs.readFileSync(new URL('resources/'+name,base)));
const manifest=Object.fromEntries(Buffer.from(resources['META-INF/MANIFEST.MF']).toString().split(/\r?\n/).filter(x=>x.includes(': ')).map(x=>[x.slice(0,x.indexOf(': ')),x.slice(x.indexOf(': ')+2)]));
const artManifest=JSON.parse(fs.readFileSync(new URL('art/manifest.json',base))),artImages: Record<string, any>={};for(const name of artManifest.files)artImages[name]=await loadImage(fs.readFileSync(new URL('art/'+name,base)));const art=new GameArt(artImages,artManifest,createCanvas);
const canvas=createCanvas(240*ART_SCALE,320*ART_SCALE),data=new Map();canvas.renderScale=ART_SCALE;let time=1000000;const storage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};
const midp=new MIDP({renderScale:ART_SCALE,art,canvas,makeCanvas:createCanvas,decodeImage:bytes=>loadImage(Buffer.from(bytes)),resources,manifest,storage,clock:()=>time,onError:e=>console.error(e.stack),onStatus:console.log});midp.textBridge=new VietnameseText(midp,locale);const vm=new VM(classes,midp);const app=vm.newObject('tribes');vm.start(app,'<init>','()V');
const snap=n=>fs.writeFileSync(new URL('../port-tools/'+n+'.png',import.meta.url),canvas.toBuffer('image/png'));
async function advance(ms){for(let i=0;i<ms/16;i++){time+=16;vm.tick(time,50000);midp.paint();await new Promise(r=>setImmediate(r));if(vm.threads.some(t=>t.waiting))await Promise.all([...midp.images.values()]);if(vm.errors.length)break;}}
await advance(32);vm.start(app,'startApp','()V');await advance(14000);snap('hd-boot');console.log('STATUS',JSON.stringify({instructions:vm.count,threads:vm.threads.map(t=>({id:t.id,wait:t.waiting,frames:t.frames.map(f=>f.owner+'.'+f.method.name+f.method.desc+':'+f.pc)})),current:midp.current?.javaClass,errors:vm.errors.map(e=>e.message),trace:vm.trace}));
fs.writeFileSync(new URL('../port-tools/runtime-log.json',import.meta.url),JSON.stringify({errors:vm.errors.map(e=>e.message),exceptions:vm.trace,calls:[...midp.nativeCalls]},null,2));
async function press(key,wait=800){midp.key(key,true);await advance(96);midp.key(key,false);await advance(wait)}
for(let i=1;i<=7;i++){await press(53);snap('hd-step-'+i);console.log('KEY',i,'errors',vm.errors.length,'instructions',vm.count)}
for(let i=8;i<=18;i++){await press(53,1000);snap('hd-step-'+i);console.log('KEY',i,'errors',vm.errors.length,'instructions',vm.count)}
await advance(15000);snap('hd-running');console.log('END',JSON.stringify({instructions:vm.count,errors:vm.errors.map(e=>e.message),trace:vm.trace,threads:vm.threads.map(t=>({id:t.id,wait:t.waiting,frames:t.frames.map(f=>f.owner+'.'+f.method.name+f.method.desc+':'+f.pc)})),stores:[...data].map(([k,v])=>[k,v.length])}));
for(let i=19;i<=60;i++){await press(53,400);if(i%5===0)snap('hd-step-'+i);if(vm.errors.length)break}await advance(20000);snap('hd-world');console.log('WORLD',JSON.stringify({instructions:vm.count,errors:vm.errors.map(e=>e.message),exceptions:vm.trace}));
for(let i=61;i<=90;i++){await press(53,160);if(vm.errors.length)break}await advance(2000);snap('hd-gameplay');
for(const [i,key]of [-7,50,53,48,-7,-7,-6,54,54,54,53].entries()){await press(key,300);snap('detail-probe-'+i);console.log('PROBE',i,key,JSON.stringify(Object.fromEntries(Object.entries(midp.current.fields).filter(([k,v])=>typeof v==='number'&&(/Z:I|w:I|x:I|y:I|aa:I/.test(k))))))}

if(vm.errors.length)throw Error(vm.errors.map(e=>e.message).join(';'));
fs.writeFileSync(new URL('../port-tools/details-report.json',import.meta.url),JSON.stringify({instructions:vm.count,errors:vm.errors.map(e=>e.message),verified:['selected villager header','information explanation','deselect','villager list','second villager header'],avatarDraws:art.avatarDraws||0,avatarIds:[...(art.avatarIds||[])],environment:'Node Canvas, original Java key events'},null,2));
