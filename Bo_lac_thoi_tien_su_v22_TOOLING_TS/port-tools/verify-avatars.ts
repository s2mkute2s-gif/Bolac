import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {GameArt} from '../original-web/art.js';
import {MIDP} from '../original-web/midp.js';
const require=createRequire(import.meta.url),{createCanvas,loadImage}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/@napi-rs/canvas');
const source=await loadImage(fs.readFileSync(new URL('../original-web/art/villager-avatars.webp',import.meta.url))),art=new GameArt({'villager-avatars.webp':source},{replacements:{}}),canvas=createCanvas(960,1200);canvas.renderScale=3;
const native=new MIDP({canvas,makeCanvas:createCanvas,decodeImage:loadImage,resources:{},manifest:{},storage:{},renderScale:3,art}),g=native.screenGraphics;
const resident={};const data=new Int8Array(1600);native.vm={get:(_o,_owner,name)=>name==='e'?data:name==='l'?2:3};
for(const header of [4,12])for(const sex of [0,1]){data[1517]=header===4?sex:1-sex;data[1518]=header===12?sex:1-sex;const t={frames:[{owner:'f',method:{name:'a',desc:'(BII)V'},locals:[resident,header]}]};for(let row=0;row<5;row++)for(let column=0;column<4;column++){art.avatarIds=new Set();assert.equal(art.avatar(native,g,{width:121,height:151},column*30.25,row*30.2,28,28,8+column*80,8+row*80,t),true);const id=[...art.avatarIds][0];assert.ok(sex===0?id<12:id>=12,`header ${header}, sex ${sex}, source ${row*4+column}, avatar ${id}`)}}
assert.equal(art.avatar(native,g,{width:121,height:151},0,0,28,28,0,0,{frames:[]}),false);
fs.writeFileSync(new URL('./avatar-render-check.png',import.meta.url),canvas.toBuffer('image/png'));
console.log('80 mappings passed: both sexes, both selection headers, all 20 source positions; unknown context preserves original portrait.');
