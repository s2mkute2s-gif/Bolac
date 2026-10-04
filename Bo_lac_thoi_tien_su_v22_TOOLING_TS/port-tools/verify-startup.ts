import assert from 'node:assert/strict';
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

const introStates=[];const invoke=midp.invoke.bind(midp);midp.invoke=function(owner,name,desc,obj,args,t){const result=invoke(owner,name,desc,obj,args,t);if(name==='drawImage'&&obj===this.screenGraphics&&this.current?.javaClass==='d'){const state=vm.get(this.current,'d','a','B');introStates.push(state);if(introStates.length===1)snap('startup-hd-verified')}return result};
await advance(32);vm.start(app,'startApp','()V');await advance(14000);snap('startup-language');
assert.ok(introStates.length>0,'HD startup should render');assert.ok(introStates.every(x=>x>=2),'Old logo screens must not render');assert.equal(midp.skippedIntroDelays,3,'Remove all 5 seconds of old logo waits');assert.equal(vm.errors.length,0);assert.equal(midp.current.javaClass,'f');
assert.ok(!midp.images.has(Array.from(resources.l0).join(','))&&!midp.images.has(Array.from(resources.l1).join(',')),'Old logo images must not decode');
async function press(code){midp.key(code,true);await advance(96);midp.key(code,false);await advance(800)}
await press(53);await press(53);snap('startup-main-menu');assert.equal(vm.errors.length,0);
fs.writeFileSync(new URL('./startup-report.json',import.meta.url),JSON.stringify({introStates:[...new Set(introStates)],skippedIntroDelays:midp.skippedIntroDelays,oldLogoImagesDecoded:false,uncaughtErrors:vm.errors.map(e=>e.message),currentCanvas:midp.current.javaClass,instructions:vm.count,environment:'Node native Canvas; cold boot and real game key events'},null,2));
