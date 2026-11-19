import sys, itertools
sys.path.insert(0,'.')
from content2 import *
def py(e): return e.replace('¬','not ').replace('∧',' and ').replace('∨',' or ')
def table(vars_, cols):
    rows=[]
    for vals in itertools.product([0,1],repeat=len(vars_)):
        env=dict(zip(vars_,vals)); rows.append(list(vals)+[int(bool(eval(py(c[1] if isinstance(c,list) else c),{},env))) for c in cols])
    return rows
bad=0
for t in PRAC+TASKS:
    r=table(t['vars'],t['cols']); ones=sum(x[-1] for x in r)
    print(t['id'], 'rows',len(r),'F=1:',ones, 'q:',t.get('q',{}).get('ans'))
for t in PRAC+TASKS:
    if 'q' in t and 'саны' in t['q']['text']:
        ones=sum(x[-1] for x in table(t['vars'],t['cols']))
        if t['q']['ans'][0]!=str(ones): print('Q BAD',t['id']); bad+=1
p5=table(PRAC[4]['vars'],PRAC[4]['cols']); print('P5 equal', all(x[3]==x[6] for x in p5))
c2=table(TASKS[5]['vars'],TASKS[5]['cols']); print('C2 equal', all(x[4]==x[6] for x in c2))
p6=table(PRAC[5]['vars'],PRAC[5]['cols']); print('P6 min ones when F=1', min(sum(x[:3]) for x in p6 if x[-1]))
for d in DBG:
    r=table(d['vars'],d['cols'])
    for row,col,w in d['errs']:
        if r[row][col]==w: print('DBG ERR NOT AN ERROR',d['t'],row,col); bad+=1
for e in EXAMPLES: print('EX',e['sig'],[x[-1] for x in table(e['vars'],e['cols'])])
print('ex5 equal', all(x[3]==x[6] for x in table(EXAMPLES[4]['vars'],EXAMPLES[4]['cols'])))
print('BAD',bad)
