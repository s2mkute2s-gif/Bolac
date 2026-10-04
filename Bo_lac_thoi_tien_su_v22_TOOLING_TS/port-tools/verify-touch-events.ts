import assert from 'node:assert/strict';
import fs from 'node:fs';
import {bindTouch} from '../original-web/touch.js';
for(const [width,height]of [[360,480],[720,960],[240,320]]){
 const listeners: Record<string, any>={},calls: any[]=[];let enabled=true;
 const canvas={addEventListener:(n,f)=>listeners[n]=f,getBoundingClientRect:()=>({left:12,top:20,width,height}),setPointerCapture:()=>{},focus:()=>{}};
 const controller={beginDrag:(...p)=>{calls.push(['start',...p]);return true},moveDrag:(...p)=>calls.push(['move',...p]),endDrag:(...p)=>calls.push(['end',...p]),cancel:()=>calls.push(['cancel'])};
 bindTouch(canvas,controller,{enabled:()=>enabled});
 const event=(id,x,y)=>({pointerId:id,button:0,clientX:12+x*width/240,clientY:20+y*height/320,preventDefault:()=>{}});
 listeners.pointerdown(event(1,120,160));listeners.pointerdown(event(2,20,20));listeners.pointermove(event(2,30,30));listeners.pointerup(event(2,30,30));listeners.pointermove(event(1,90,110));listeners.pointerup(event(1,90,110));listeners.lostpointercapture();
 assert.deepEqual(calls,[['start',120,160],['move',90,110],['end',90,110]]);
 listeners.pointerdown(event(3,20,40));listeners.pointercancel();assert.equal(calls.at(-1)[0],'cancel');const n=calls.length;enabled=false;listeners.pointerdown(event(4,20,40));assert.equal(calls.length,n);
}
assert.ok(!fs.readFileSync(new URL('../original-web/index.html',import.meta.url),'utf8').includes('data-key='));
console.log('Pointer scaling at three sizes, drag, secondary finger, cancel, capture loss, pause gate and keypad removal passed.');
