import json,pathlib,zipfile,hashlib,collections
p=pathlib.Path(__file__).resolve().parents[1];cs=json.loads((p/'original-web/classes.json').read_text());jar=p/'reference/Bolacthoitiensu.jar';z=zipfile.ZipFile(jar);counts=collections.Counter();classes=[]
lengths={16:2,17:3,18:2,19:3,20:3,132:3,169:2,185:5,186:5,188:2,197:4,200:5,201:5}
for op in list(range(21,26))+list(range(54,59)):lengths[op]=2
for op in list(range(153,169))+list(range(178,185))+[187,189,192,193,198,199]:lengths[op]=3
for name,c in cs.items():
 methodReport=[]
 for m in c['methods']:
  b=m.get('code',[]);i=0
  while i<len(b):
   op=b[i];counts[op]+=1
   if op in [170,171]:
    j=(i+4)&~3
    def r(k):return int.from_bytes(bytes(b[k:k+4]),'big',signed=True)
    if op==170:i=j+12+(r(j+8)-r(j+4)+1)*4
    else:i=j+8+r(j+4)*8
   elif op==196:i+=6 if b[i+1]==132 else 4
   else:i+=lengths.get(op,1)
  assert i==len(b),(name,m['name'],i,len(b))
  methodReport.append({'name':m['name'],'descriptor':m['desc'],'bytecode_size':len(b),'sha256':hashlib.sha256(bytes(b)).hexdigest()})
 classes.append({'class':name,'original_class_sha256':hashlib.sha256(z.read(name+'.class')).hexdigest(),'methods':methodReport})
resources=[]
for n in json.loads((p/'original-web/resources.json').read_text()):
 b=(p/'original-web/resources'/n).read_bytes();assert b==z.read(n);resources.append({'path':n,'size':len(b),'sha256':hashlib.sha256(b).hexdigest()})
report={'jar_sha256':hashlib.sha256(jar.read_bytes()).hexdigest(),'game_class_count':len(cs),'method_count':sum(len(c['methods']) for c in cs.values()),'bytecode_bytes':sum(sum(len(m.get('code',[])) for m in c['methods'])for c in cs.values()),'opcode_counts':dict(sorted(counts.items())),'classes':classes,'resources':resources,'excluded_entrypoint':'WapTai/COM/WapTai — separate advertising MIDlet; game entrypoint is tribes','scope':'All game bytecode methods and all packaged non-class resources retained. This is code/data preservation, not a claim that every campaign has been playtested.'}
(p/'port-tools/preservation-audit.json').write_text(json.dumps(report,indent=2));print({k:report[k] for k in ['jar_sha256','game_class_count','method_count','bytecode_bytes']});print('resources',len(resources),'opcodes',len(counts));print('double instructions',[n for n in [14,15,24,38,39,40,41,49,57,71,72,73,74,82,99,103,107,111,115,119,135,138,141,142,143,144,151,152,175]if n in counts])
