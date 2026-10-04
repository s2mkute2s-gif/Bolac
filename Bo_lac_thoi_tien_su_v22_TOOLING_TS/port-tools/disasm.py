import json,sys,pathlib
cs=json.loads((pathlib.Path(__file__).resolve().parents[1]/'original-web/classes.json').read_text())
names='nop aconst_null iconst_m1 iconst_0 iconst_1 iconst_2 iconst_3 iconst_4 iconst_5 lconst_0 lconst_1 fconst_0 fconst_1 fconst_2 dconst_0 dconst_1 bipush sipush ldc ldc_w ldc2_w iload lload fload dload aload iload_0 iload_1 iload_2 iload_3 lload_0 lload_1 lload_2 lload_3 fload_0 fload_1 fload_2 fload_3 dload_0 dload_1 dload_2 dload_3 aload_0 aload_1 aload_2 aload_3 iaload laload faload daload aaload baload caload saload istore lstore fstore dstore astore istore_0 istore_1 istore_2 istore_3 lstore_0 lstore_1 lstore_2 lstore_3 fstore_0 fstore_1 fstore_2 fstore_3 dstore_0 dstore_1 dstore_2 dstore_3 astore_0 astore_1 astore_2 astore_3 iastore lastore fastore dastore aastore bastore castore sastore pop pop2 dup dup_x1 dup_x2 dup2 dup2_x1 dup2_x2 swap iadd ladd fadd dadd isub lsub fsub dsub imul lmul fmul dmul idiv ldiv fdiv ddiv irem lrem frem drem ineg lneg fneg dneg ishl lshl ishr lshr iushr lushr iand land ior lor ixor lxor iinc i2l i2f i2d l2i l2f l2d f2i f2l f2d d2i d2l d2f i2b i2c i2s lcmp fcmpl fcmpg dcmpl dcmpg ifeq ifne iflt ifge ifgt ifle if_icmpeq if_icmpne if_icmplt if_icmpge if_icmpgt if_icmple if_acmpeq if_acmpne goto jsr ret tableswitch lookupswitch ireturn lreturn freturn dreturn areturn return getstatic putstatic getfield putfield invokevirtual invokespecial invokestatic invokeinterface invokedynamic new newarray anewarray arraylength athrow checkcast instanceof monitorenter monitorexit wide multianewarray ifnull ifnonnull goto_w jsr_w'.split()
def dis(c,m):
 b=m.get('code',[]);i=0;out=[]
 while i<len(b):
  pc=i;op=b[i];i+=1;args=[]
  def u(n=1,s=False):
   nonlocal i
   v=int.from_bytes(bytes(b[i:i+n]),'big',signed=s);i+=n;return v
  if op in [16,188] or 21<=op<=25 or 54<=op<=58 or op==169:args=[u(s=op==16)]
  elif op==17:args=[u(2,True)]
  elif op==132:args=[u(),u(s=True)]
  elif 153<=op<=168 or op in [198,199]:args=['->'+str(pc+u(2,True))]
  elif op in [200,201]:args=['->'+str(pc+u(4,True))]
  elif op in [170,171]:
   i=(i+3)&~3;default=pc+u(4,True);data={}
   if op==170:
    lo=u(4,True);hi=u(4,True)
    for key in range(lo,hi+1):data[key]=pc+u(4,True)
   else:
    for _ in range(u(4)):key=u(4,True);data[key]=pc+u(4,True)
   args=[data,'default:'+str(default)]
  elif op==196:
   o=u();args=[names[o],u(2)]
   if o==132:args+=[u(2,True)]
  elif op in [18,19,20,178,179,180,181,182,183,184,185,186,187,189,192,193,197]:
   ix=u(1 if op==18 else 2);e=c['cp'][ix];args=[f'#{ix}',f"{e['owner']}.{e['name']}{e['desc']}" if 'owner'in e else e.get('v',e.get('name',e))]
   if op in [185,186]:args+=[u(),u()]
   if op==197:args+=[u()]
  out.append((pc,names[op] if op<len(names)else str(op),args))
 return out
if __name__=='__main__':
 for cn in sys.argv[1:]or ['f']:
  c=cs[cn]
  for m in c['methods']:
   ops=dis(c,m)
   if cn=='f' and not ('String' in m['desc'] or any('charAt' in str(v) for v in ops)):continue
   print('\nMETHOD',cn,m['name'],m['desc'])
   for pc,op,args in ops:print(f'{pc:4} {op:18}',*args)
