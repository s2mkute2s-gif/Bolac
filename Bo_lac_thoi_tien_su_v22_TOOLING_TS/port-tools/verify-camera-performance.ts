import assert from 'node:assert/strict';
import {TouchControls} from '../original-web/touch.js';
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
const midp=new MIDP({renderScale:ART_SCALE,art,canvas,makeCanvas:createCanvas,decodeImage:bytes=>loadImage(Buffer.from(bytes)),resources,manifest,storage,clock:()=>time,onError:e=>console.error(e.stack),onStatus:console.log});midp.textBridge=new VietnameseText(midp,locale);const vm=new VM(classes,midp);const app=vm.newObject('tribes');vm.start(app,'<init>','()V');const touch=new TouchControls(midp);
const snap=(..._args: any[])=>{};
async function advance(ms){for(let i=0;i<ms/16;i++){time+=16;touch.tick(time);vm.tick(time,120000,8);midp.render(time,4);await new Promise(r=>setImmediate(r));if(vm.threads.some(t=>t.waiting))await Promise.all([...midp.images.values()]);if(vm.errors.length)break;}}

const f=(n,d='I')=>vm.get(midp.current,'f',n,d);
const state=()=>({v:f('v','B'),q:f('Q','B'),mode:f('w','B'),z:f('Z'),cursor:[f('y','B'),f('A','B')],camera:[f('I','B'),f('K','B')],unit:f('l','B'),wb:f('W','B'),selected:f('am','B'),menu:[f('as','B'),f('aX'),f('aW'),f('aY'),vm.statics['f.aV:I']],top:f('bb')-f('ax','B'),bottom:320-f('ba'),rows:touch.menuRows});
async function tap(x,y,name,wait=1200){touch.tap(x,y);await advance(wait);console.log(name,JSON.stringify(state()));snap(name);assert.equal(vm.errors.length,0)}
await advance(32);vm.start(app,'startApp','()V');await advance(14000);console.log('boot',JSON.stringify(state()));
await tap(120,94,'language');await tap(15,307,'sound');
await tap(120,134,'options');assert.equal(f('Q','B'),12);
await tap(228,308,'back');assert.equal(f('Q','B'),0);
await tap(120,94,'start');await tap(120,124,'campaign');await tap(120,134,'easy');
for(let i=0;i<100;i++){await tap(15,308,'advance-'+i,420);if(f('v','B')===1)break}
await advance(2000);console.log('WORLD',JSON.stringify(state()));snap('world');

const durations=[];const startFrames=midp.presentedFrames;const start=performance.now();
for(let i=0;i<600;i++){
 if(i%60===0)touch.beginDrag(120,170);
 if(i%60<50)touch.moveDrag(120-Math.sin(i/20)*95,170-Math.sin(i/17)*80);
 if(i%60===50)touch.endDrag(120,170);
 const t=performance.now();time+=1000/60;touch.tick(time);vm.tick(time,120000,8);midp.render(time,4);durations.push(performance.now()-t);await new Promise(r=>setImmediate(r));
}
durations.sort((a,b)=>a-b);
const report={environment:'Node native Canvas; not Android/browser FPS',frames:600,presented:midp.presentedFrames-startFrames,simulatedSeconds:10,meanMs:durations.reduce((a,b)=>a+b)/durations.length,p95Ms:durations[570],maxMs:durations.at(-1),errors:vm.errors.map(e=>e.message),camera:[f('I','B'),f('K','B')]};
console.log('PERFORMANCE',JSON.stringify(report));fs.writeFileSync('port-tools/camera-performance-report.json',JSON.stringify(report,null,2));assert.equal(vm.errors.length,0);assert.ok(report.presented>0);snap('camera-final');
