import struct,json,zipfile,pathlib,collections,hashlib
class R:
 def __init__(self,b):self.b=b;self.i=0
 def read(self,n):v=self.b[self.i:self.i+n];self.i+=n;return v
 def u1(self):return self.read(1)[0]
 def u2(self):return int.from_bytes(self.read(2),'big')
 def u4(self):return int.from_bytes(self.read(4),'big')
def parse(b):
 r=R(b);r.read(8);n=r.u2();cp=[None]*n;i=1
 while i<n:
  t=r.u1()
  if t==1:cp[i]={'t':t,'s':r.read(r.u2()).decode('utf-8','replace')}
  elif t in [3,4]:cp[i]={'t':t,'v':struct.unpack('>i' if t==3 else '>f',r.read(4))[0]}
  elif t in [5,6]:cp[i]={'t':t,'v':str(struct.unpack('>q' if t==5 else '>d',r.read(8))[0])};i+=1
  elif t in [7,8]:cp[i]={'t':t,'a':r.u2()}
  elif t in [9,10,11,12]:cp[i]={'t':t,'a':r.u2(),'b':r.u2()}
  else:raise Exception(t)
  i+=1
 def txt(i):return cp[i]['s']
 def cls(i):return txt(cp[i]['a']) if i else None
 for e in cp:
  if not e:continue
  t=e['t']
  if t==7:e['name']=txt(e['a'])
  if t==8:e['v']=txt(e['a'])
  if t in [9,10,11]:
   nt=cp[e['b']];e.update(owner=cls(e['a']),name=txt(nt['a']),desc=txt(nt['b']))
 access=r.u2();name=cls(r.u2());sup=cls(r.u2());interfaces=[cls(r.u2()) for _ in range(r.u2())]
 def attrs():return [(txt(r.u2()),r.read(r.u4())) for _ in range(r.u2())]
 fields=[]
 for _ in range(r.u2()):
  a=r.u2();n=txt(r.u2());d=txt(r.u2());at=attrs();f={'access':a,'name':n,'desc':d}
  for an,av in at:
   if an=='ConstantValue':f['value']=cp[int.from_bytes(av,'big')].get('v')
  fields.append(f)
 methods=[]
 for _ in range(r.u2()):
  a=r.u2();n=txt(r.u2());d=txt(r.u2());at=attrs();m={'access':a,'name':n,'desc':d}
  for an,av in at:
   if an=='Code':
    cr=R(av);m['stack']=cr.u2();m['locals']=cr.u2();m['code']=list(cr.read(cr.u4()));m['exceptions']=[{'start':cr.u2(),'end':cr.u2(),'handler':cr.u2(),'type':cls(cr.u2())} for _ in range(cr.u2())]
  methods.append(m)
 return {'name':name,'super':sup,'interfaces':interfaces,'access':access,'cp':cp,'fields':fields,'methods':methods}
p=pathlib.Path(__file__).resolve().parents[1];z=zipfile.ZipFile(p/'reference/Bolacthoitiensu.jar');out=p/'original-web';(out/'resources').mkdir(parents=True,exist_ok=True)
classes={};refs=set();resources=[]
for n in z.namelist():
 if n.endswith('.class') and not n.startswith('WapTai'):
  c=parse(z.read(n));classes[c['name']]=c
  for e in c['cp']:
   if e and e['t'] in [9,10,11] and '/' in e['owner']:refs.add((e['owner'],e['name'],e['desc']))
 elif not n.endswith('/') and not n.endswith('.class'):
  target=out/'resources'/n;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(z.read(n));resources.append(n)
(out/'classes.json').write_text(json.dumps(classes,separators=(',',':')))
(out/'resources.json').write_text(json.dumps(resources))
(p/'port-tools/native-references.txt').write_text('\n'.join(' '.join(x) for x in sorted(refs)))
print('Classes:',[(n,len(c['methods'])) for n,c in classes.items()]);print('Native references:',len(refs));print((p/'port-tools/native-references.txt').read_text())
