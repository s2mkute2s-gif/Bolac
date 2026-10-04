// Plays the original MIDI event stream with a lightweight browser synthesizer.
// Notes, tempo and program changes are preserved; timbre varies from handset synthesis.
export type MidiEvent = { tick: number; time?: number; tempo?: number; type?: number; channel?: number; a?: number; b?: number };
export type MidiPlayer = { data: ArrayLike<number>; mediaTime?: bigint | number; volume?: number; state?: number; listener?: {javaClass:string} };
type ActiveNote = { osc: OscillatorNode; gain: GainNode };
type PlayerState = { events: MidiEvent[]; index: number; elapsed: number; program: number[]; volume: number[]; notes: Map<string, ActiveNote> };

export function parseMidi(bytes: ArrayLike<number>): MidiEvent[]{let b=Uint8Array.from(bytes),p=0;const str=(n:number)=>{let s='';while(n--)s+=String.fromCharCode(b[p++]);return s},u16=()=>b[p++]*256+b[p++],u32=()=>b[p++]*16777216+b[p++]*65536+b[p++]*256+b[p++],vlq=()=>{let v=0,k;do{k=b[p++];v=(v<<7)|(k&127)}while(k&128);return v};if(str(4)!=='MThd')return [];let len=u32();u16();let tracks=u16(),division=u16();p+=len-6;if(division&0x8000)return [];let raw: MidiEvent[]=[];
 for(let n=0;n<tracks&&p<b.length;n++){const kind=str(4),length=u32(),end=p+length;if(kind!=='MTrk'){p=end;continue}let tick=0,running=0;while(p<end){tick+=vlq();let status=b[p++];if(status<128){p--;status=running}else if(status<240)running=status;if(status===255){let type=b[p++],l=vlq();if(type===81&&l===3)raw.push({tick,tempo:b[p]*65536+b[p+1]*256+b[p+2]});p+=l;if(type===47)break}else if(status===240||status===247){p+=vlq()}else {let type=status>>4,channel=status&15,a=b[p++],c=type===12||type===13?0:b[p++];raw.push({tick,type,channel,a,b:c})}}p=end}
 raw.sort((a,b)=>a.tick-b.tick);let tick=0,tempo=500000,seconds=0;for(const e of raw){seconds+=(e.tick-tick)*tempo/division/1e6;tick=e.tick;e.time=seconds;if(e.tempo)tempo=e.tempo}return raw;}
export class MidiAudio{
 context: AudioContext | null = null;
 players = new Map<MidiPlayer, PlayerState>();
 muted = false;
 paused = false;
 onEnd: ((player: MidiPlayer) => void) | null = null;
 constructor(){}
 async unlock(){try{const AC=globalThis.AudioContext || (globalThis as typeof globalThis & {webkitAudioContext?: typeof AudioContext}).webkitAudioContext;if(!AC)return;if(!this.context)this.context=new AC();await this.context.resume()}catch{}}
 start(player: MidiPlayer){if(this.players.has(player))return;let events;try{events=parseMidi(player.data)}catch{return}if(!events.length)return;this.players.set(player,{events,index:0,elapsed:Number(player.mediaTime||0n)/1e6,program:Array(16).fill(0),volume:Array(16).fill(100),notes:new Map()})}
 stop(player: MidiPlayer){const p=this.players.get(player);if(p){for(const note of p.notes.values())this.release(note);this.players.delete(player)}}
 setVolume(player: MidiPlayer,level: number){player.volume=level}
 release(note: ActiveNote){try{const ctx=this.context;if(!ctx)return;const now=ctx.currentTime;note.gain.gain.cancelScheduledValues(now);note.gain.gain.setTargetAtTime(.0001,now,.035);note.osc.stop(now+.2)}catch{}}
 tick(dt: number){if(this.paused)return;for(const [player,p] of this.players){p.elapsed+=dt;while(p.index<p.events.length&&(p.events[p.index].time ?? 0)<=p.elapsed){const e=p.events[p.index++], channel=e.channel ?? 0, a=e.a ?? 0, b=e.b ?? 0, key=channel+':'+a;if(e.type===12)p.program[channel]=a;if(e.type===11&&a===7)p.volume[channel]=b;if(e.type===8||e.type===9&&!b){if(p.notes.has(key)){this.release(p.notes.get(key)!);p.notes.delete(key)}}else if(e.type===9&&b&&this.context?.state==='running'&&!this.muted){if(p.notes.has(key))this.release(p.notes.get(key)!);const ctx=this.context,osc=ctx.createOscillator(),gain=ctx.createGain(),pr=p.program[channel],now=ctx.currentTime;osc.type=pr>=80&&pr<88?'sawtooth':pr>=72&&pr<80?'sine':pr<8?'triangle':pr>=24&&pr<40?'triangle':'sine';osc.frequency.value=440*Math.pow(2,(a-69)/12);let vol=.075*(b/127)*(p.volume[channel]/127)*((player.volume??80)/100);gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(vol,now+.01);gain.gain.setTargetAtTime(vol*.45,now+.035,.18);osc.connect(gain);gain.connect(ctx.destination);osc.start();if(channel===9){gain.gain.setTargetAtTime(.0001,now+.03,.045);osc.stop(now+.22)}p.notes.set(key,{osc,gain});}}
 if(p.index>=p.events.length&&p.elapsed>(p.events.at(-1)?.time||0)+.2){this.stop(player);player.state=300;this.onEnd?.(player)}}}
 pause(value: boolean){this.paused=value;if(this.context){if(value)this.context.suspend();else this.context.resume().catch(()=>{})}}
}
