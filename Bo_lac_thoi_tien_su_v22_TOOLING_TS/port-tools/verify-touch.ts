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
const snap=n=>fs.writeFileSync('/tmp/touch-check-'+n+'.png',canvas.toBuffer('image/png'));
async function advance(ms){for(let i=0;i<ms/16;i++){time+=16;touch.tick(time);vm.tick(time,50000);midp.paint();await new Promise(r=>setImmediate(r));if(vm.threads.some(t=>t.waiting))await Promise.all([...midp.images.values()]);if(vm.errors.length)break;}}

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
const residents=f('e','[B');console.log('UNITS',JSON.stringify(Array.from({length:10},(_,i)=>({id:i+1,x:residents[i+1],y:residents[102+i],ox:residents[203+i],oy:residents[304+i]}))));
fs.writeFileSync('/tmp/touch-first-report.json',JSON.stringify({state:state(),errors:vm.errors.map(e=>e.message)},null,2));

async function dismiss(){for(let i=0;i<50&&f('v','B')===0;i++){touch.tap(15,308);await advance(500)}assert.equal(f('v','B'),1)}
await tap(121,175,'select-mumbo');await dismiss();assert.equal(f('k','B'),3,'tap the body selects Mumbo');
await tap(121,200,'move-mumbo',1000);await dismiss();await tap(121,200,'move-after-hint',2800);await dismiss();console.log('MOVE',JSON.stringify({position:[residents[3],residents[104]],target:[residents[3134],residents[3235]],action:residents[2831]}));
touch.beginDrag(140,150);touch.moveDrag(52,86);touch.endDrag(52,86);await advance(800);await dismiss();console.log('PAN',JSON.stringify(state()));snap('pan');
await tap(230,310,'cancel-selection');await dismiss();await tap(15,310,'world-menu');await dismiss();console.log('BAR',JSON.stringify(state()));
await tap(f('aY')+3*34+12,305,'villager-list');await dismiss();console.log('LIST',JSON.stringify(state()));
assert.deepEqual([residents[3134],residents[3235]],[5,11],'movement target from map tap');
assert.equal(f('l','B'),1,'villager list opened');
await tap(f('aY')+34+12,305,'choose-tazza');await dismiss();assert.equal(f('k','B'),2,'second list item selects Tazza');
await tap(230,310,'unselect-tazza');await dismiss();
touch.beginDrag(40,90);touch.moveDrag(216,202);touch.endDrag(216,202);await advance(800);console.log('CAMERA_HOME',JSON.stringify(state()));
await tap(15,310,'build-menu');await tap(f('aY')+12,305,'buildings');console.log('BUILD_ITEMS',JSON.stringify({s:state(),items:Array.from(f('r','[B')).slice(0,f('ar','B'))}));
await tap(f('aY')+2*34+12,305,'choose-hut');console.log('BUILD_MODE',JSON.stringify(state()));
const cellBefore=f('c','[[B')[13][5];await tap(121,232,'place-hut');console.log('BUILD_CELL',JSON.stringify({before:cellBefore,after:f('c','[[B')[13][5]}));await dismiss();console.log('BUILD_PLACED',JSON.stringify(state()));
for(let i=0;i<4&&f('w','B')!==0;i++){await tap(230,310,'close-build-'+i);await dismiss()}
await tap(230,310,'pause-menu');console.log('SAVE_MENU',JSON.stringify(state()));
const saveRow=touch.menuRows?.rows.find(r=>r.label===64);assert.ok(saveRow,'save menu visible');await tap(120,saveRow.y+4,'save',4000);console.log('SAVES',JSON.stringify([...data].map(([key,value])=>({key,length:value.length}))));

await tap(15,308,'save-ack');await tap(120,94,'resume-after-save');await dismiss();
touch.beginDrag(70,125);await advance(1600);console.log('HOLD',JSON.stringify({u:f('u','Z'),F:f('F','B'),w:f('w','B'),t:f('t','Z')}));touch.moveDrag(160,208);await advance(400);touch.endDrag(160,208);await advance(1200);assert.equal(f('u','Z'),0);assert.equal(f('w','B'),1);assert.ok(f('a','[[B')[f('F','B')].filter(Boolean).length>1,'hold-drag selects a group');console.log('GROUP',JSON.stringify({u:f('u','Z'),F:f('F','B'),w:f('w','B'),k:f('k','B'),groups:f('a','[[B')?.map(a=>Array.from(a).filter(Boolean))}));snap('group');
assert.equal(vm.errors.length,0);fs.writeFileSync(new URL('./touch-report.json',import.meta.url),JSON.stringify({errors:[],checks:['language','main menu','options','campaign','dialogues','body selection','movement to target [5,11]','camera drag','action bar','villager list selection','build menu, placement cursor and cancel','save menu','hold and drag group selection'],saveRecords:[...data].map(([key,value])=>({key,length:value.length})),instructions:vm.count},null,2));
