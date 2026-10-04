// Touch input for the original Java game. Only UI selection/camera fields change;
// selecting, assigning work, construction and saving still use the Java key handlers.
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
type TouchAction = { code?: number; after?: number; guard?: string; run?: () => void; delay?: number; down?: boolean; until?: number } & Record<string, unknown>;
export class TouchControls {
 native; key:(k:number,on:boolean)=>void; feedback:(x?:number,y?:number)=>void; queue:TouchAction[]=[]; active=null; now=0; menuRows=null; drag=null; pendingCamera=null;
 constructor(native,{key=(k:number,on:boolean)=>native.key(k,on),feedback=()=>{}}:{key?:(k:number,on:boolean)=>void;feedback?:(x?:number,y?:number)=>void}={}){this.native=native;this.key=key;this.feedback=feedback;this.queue=[];this.active=null;this.now=0;this.menuRows=null;this.drag=null;native.touch=this}
 get vm(){return this.native.vm} get game(){return this.native.current?.javaClass==='f'?this.native.current:null}
 get(n:string,d:string='I'){return this.game?this.vm.get(this.game,'f',n,d):0} set(n:string,d:string,v){if(this.game)this.vm.set(this.game,'f',n,d,v)}
 signature(){return [this.native.current?.javaClass,this.get('v','B'),this.get('Q','B'),this.get('w','B')].join(':')}
 captureText(o,count:number){if(!this.game||this.get('v','B')!==0)return;const rows=(o.vnSlots||[]).slice(0,count).map((s,i:number)=>({...s,index:i,x:this.vm.get(o,'c','f','[S')[i],y:this.vm.get(o,'c','e','[S')[i]}));if(rows.some((r)=>r.label>=57&&r.label<=96))this.menuRows={screen:this.get('Q','B'),rows}}
 enqueue(action:TouchAction){if(this.queue.length<12)this.queue.push(action)}
 pulse(code:number,after=160){this.enqueue({code,after,guard:this.signature()})}
 tick(now:number){this.now=now;this.flushCamera();const d=this.drag;if(d&&!d.moved&&!d.holding&&now-d.started>=500&&d.signature===this.signature()&&!this.get('n','Z')){if(d.groupKey){d.holding=d.groupKey;this.key(d.holding,true)}else if(d.world&&!d.inBar&&[0,1].includes(this.get('w','B'))&&d.y>=this.get('bb')-this.get('ax','B')&&d.y<320-this.get('ba')){this.placeCursor(d.x,d.y);d.holding=53;this.key(53,true)}}if(this.active){if(now<this.active.until)return;if(this.active.down){this.key(this.active.code,false);this.active={until:now+this.active.after};return}this.active=null}if(!this.queue.length||!this.game||this.get('n','Z'))return;const action=this.queue.shift()!;if(action.run){action.run();this.active={until:now+(action.delay||160)};return}if(action.guard&&action.guard!==this.signature())return;this.key(action.code!,true);this.active={...action,down:true,until:now+120}}
 cancel(){this.pendingCamera=null;if(this.drag?.holding)this.key(this.drag.holding,false);if(this.active?.down)this.key(this.active.code,false);this.queue=[];this.active=null;this.drag=null}
 menuTap(x:number,y:number){const q=this.get('Q','B'),m=this.menuRows;if(m?.screen===q){const row=m.rows.find((r)=>r.label>=57&&r.label<=96&&r.label!==76&&Math.abs(y-(r.y+4))<=10);if(row){this.set('Z','I',q===12&&[72,73].includes(row.label)?row.index+1:row.index);this.pulse(53);return true}}return false}
 tap(x:number,y:number){if(!this.game||this.active||this.queue.length)return false;x=clamp(x,0,239);y=clamp(y,0,319);this.feedback(x,y);const world=this.get('v','B')===1;
  // Tap the actual on-screen softkey areas, without an extra keypad.
  if(y>=296&&x<32){this.pulse(-6);return true}if(y>=296&&x>208){this.pulse(-7);return true}
  if(!world){if(this.menuTap(x,y))return true;const q=this.get('Q','B');if([14,0,1,2,3,4,5,6,7,8,9,10,11,12,13].includes(q))return false;this.pulse(x>208&&y>260?-7:53);return true}
  const bottom=320-this.get('ba'),top=this.get('bb')-this.get('ax','B'),mode=this.get('w','B');
  if(y<Math.max(20,top)){this.pulse(48);return true}
  if(mode===2&&y>=bottom){const count=this.get('aW'),start=this.get('aX'),spacing=this.vm.statics['f.aV:I']||35,left=this.get('aY');if(x<28){this.pulse(52);return true}if(x>212){this.pulse(54);return true}const index=start+clamp(Math.floor((x-left)/spacing),0,Math.max(0,count-1));if(index<this.get('ar','B')){this.set('as','B',index);this.vm.start(this.game,'ai','()V',[],'f');this.enqueue({run:()=>{},delay:180});this.pulse(53);return true}}
  if(y>=bottom){if([0,1].includes(mode)&&x>=75&&x<=165)this.pulse(x<120?55:57);else if([0,1].includes(mode)&&x>165&&x<208)this.pulse(51);else this.pulse(x<120?-6:-7);return true}
  if(mode===2){this.pulse(-7);return true}
  this.worldTap(x,y);return true
 }
 worldTap(x:number,y:number){if(this.get('v','B')!==1)return;this.placeCursor(x,y);this.enqueue({run:()=>{},delay:180});this.pulse(53)}
 placeCursor(x:number,y:number){const top=this.get('bb')-this.get('ax','B'),cameraX=this.get('I','B'),cameraY=this.get('K','B'),columns=this.get('c','S'),rows=this.get('d','S');
  let col=clamp(Math.floor(x/22),0,Math.min(this.get('O','B')-1,columns-cameraX-1)),row=clamp(Math.floor((y-top)/16),0,Math.min(this.get('P','B')-1,rows-cameraY-2));
  // Character bodies extend above their occupied tile: match the visible body first.
  const data=this.get('e','[B'),grid=this.get('c','[[B');let nearest=null;
  if(data&&grid&&this.get('w','B')!==3){for(let id=1;id<=100;id++){const tx=data[id],ty=data[101+id];if(tx<0||ty<0||grid[ty]?.[tx]!==id)continue;const px=(tx-cameraX)*22+11+data[202+id],py=(ty-cameraY)*16+8+data[303+id]+top;const distance=Math.hypot((x-px)/.85,y-(py-9));if(distance<15&&(!nearest||distance<nearest.distance))nearest={id,tx,ty,distance}}if(nearest){col=nearest.tx-cameraX;row=nearest.ty-cameraY}}
  this.set('y','B',clamp(col,0,columns-cameraX-1));this.set('A','B',clamp(row,0,rows-cameraY-2));
  // Refresh the original nearby-object lookup before confirm (also used by keyboard).
  this.vm.start(this.game,'k','()V',[],'f');
 }
 beginDrag(x:number,y:number){if(!this.game||this.active||this.queue.length)return false;this.drag={x,y,started:this.now,groupKey:this.get('v','B')===1&&[0,1].includes(this.get('w','B'))&&y>=320-this.get('ba')&&x>=75&&x<=165?(x<120?55:57):null,cameraX:this.get('I','B'),cameraY:this.get('K','B'),signature:this.signature(),world:this.get('v','B')===1,inBar:this.get('w','B')===2&&y>=320-this.get('ba'),moved:false};return true}
 moveDrag(x:number,y:number){const d=this.drag;if(d?.holding){if(d.holding===53){d.moved=true;this.placeCursor(x,y)}return}if(!d||d.signature!==this.signature())return;const dx=x-d.x,dy=y-d.y;if(Math.hypot(dx,dy)<7&&!d.moved)return;d.moved=true;if(!d.world||d.inBar)return;const cx=clamp(d.cameraX-Math.round(dx/22),0,Math.max(0,this.get('c','S')-this.get('O','B')-1)),cy=clamp(d.cameraY-Math.round(dy/16),0,Math.max(0,this.get('d','S')-this.get('P','B')-2));if(cx===this.get('I','B')&&cy===this.get('K','B'))return;this.pendingCamera={cx,cy,game:this.game,signature:this.signature()};this.flushCamera()}
 // Coalesce pointer events and apply the latest camera position only between
 // complete Java updates/paints, never while an offscreen map is being rebuilt.
 flushCamera(){const p=this.pendingCamera;if(!p)return;if(p.game!==this.game||p.signature!==this.signature()){this.pendingCamera=null;return}if(this.native.paintThread&&!this.native.paintThread.done)return;if(this.vm.threads.some((t)=>!t.done&&!t.waiting&&!t.yield&&t.wake<=this.vm.now))return;this.pendingCamera=null;this.set('I','B',p.cx);this.set('K','B',p.cy);for(const n of ['af','ag','ad','ae'])this.set(n,'I',0);this.set('A','Z',1);this.native.repaint=true}
 endDrag(x:number,y:number){const d=this.drag;this.drag=null;if(!d)return;if(d.holding){this.key(d.holding,false);if(d.holding===53&&d.moved){this.enqueue({run:()=>{},delay:180});this.pulse(53)}return}if(d.signature!==this.signature())return;if(!d.moved){this.tap(x,y);return}if(!d.world){const delta=y-d.y;this.pulse(delta<0?56:50);return}if(d.inBar)this.pulse(x<d.x?54:52)}
}

export function bindTouch(canvas:HTMLCanvasElement,controls:TouchControls,{enabled=()=>true,onInteract=()=>{}}:{enabled?:()=>boolean;onInteract?:()=>void}={}){
 let pointer:number|null=null;const point=(e:PointerEvent)=>{const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)*240/r.width,y:(e.clientY-r.top)*320/r.height}};
 const cancel=()=>{pointer=null;controls.cancel()};
 canvas.addEventListener('pointerdown',(e:PointerEvent)=>{if(!enabled()||pointer!==null||e.button>0)return;e.preventDefault();pointer=e.pointerId;canvas.setPointerCapture(pointer);canvas.focus({preventScroll:true});onInteract();const p=point(e);if(!controls.beginDrag(p.x,p.y))pointer=null});
 canvas.addEventListener('pointermove',(e:PointerEvent)=>{if(e.pointerId!==pointer)return;e.preventDefault();const p=point(e);controls.moveDrag(p.x,p.y)});
 canvas.addEventListener('pointerup',(e:PointerEvent)=>{if(e.pointerId!==pointer)return;e.preventDefault();pointer=null;const p=point(e);if(enabled())controls.endDrag(p.x,p.y);else controls.cancel()});
 canvas.addEventListener('pointercancel',cancel);canvas.addEventListener('lostpointercapture',()=>{if(pointer!==null)cancel()});canvas.addEventListener('contextmenu',(e:MouseEvent)=>e.preventDefault());return cancel;
}
