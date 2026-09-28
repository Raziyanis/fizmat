import math
def arbuz(t): a=list(map(int,t.split()[1:])); return f"{min(a)} {max(a)}"
def nuli(t):
    best=cur=0
    for c in t.strip():
        cur = cur+1 if c=='0' else 0; best=max(best,cur)
    return str(best)
def zag(t):
    s,p=map(int,t.split())
    for x in range(1,s):
        if x*(s-x)==p: return f"{x} {s-x}"
def summa(t): n=int(t); return str(sum(range(1,n+1)) if n>=1 else sum(range(n,2)))
def dz(t):
    l=t.split('\n'); a=list(map(int,l[1].split())); s=sum(x for x in a if x>0)
    i,j=sorted((a.index(min(a)),a.index(max(a)))); p=1
    for k in range(i+1,j): p*=a[k]
    return f"{s} {p}"
def sq(t): n=int(t); return ' '.join(str(i*i) for i in range(1,math.isqrt(n)+1))
def md(t):
    n=int(t); d=2
    while n%d: d+=1
    return str(d)
def p2(t):
    n=int(t); r=[]; p=1
    while p<=n: r.append(p); p*=2
    return ' '.join(map(str,r))
def fact(t): return str(math.factorial(int(t)))
def gold(t):
    n=int(t)
    pr=lambda k:k>1 and all(k%d for d in range(2,math.isqrt(k)+1))
    for a in range(2,n):
        if pr(a) and pr(n-a): return f"{a} {n-a}"
ex=[(fact,'5','120'),(fact,'3','6'),(fact,'1','1'),(fact,'0','1'),(arbuz,'5\n5 1 6 5 9','1 9'),(nuli,'00101110000110','4'),
(zag,'4 4','2 2'),(zag,'5 6','2 3'),(summa,'5','15'),(dz,'5\n-7 5 -1 3 9','17 -15'),(dz,'8\n3 14 -9 4 -5 1 -12 4','26 180'),
(dz,'10\n-5 1 2 3 4 5 6 7 8 -3','36 5040'),(sq,'10','1 4 9'),(sq,'50','1 4 9 16 25 36 49'),(md,'15','3'),(md,'35','5'),(p2,'10','1 2 4 8'),(p2,'50','1 2 4 8 16 32')]
for f,i,o in ex: print('OK ' if f(i)==o else 'BAD', f.__name__, repr(i), f(i), o)
for n in ['6','10','98','998']: print('gold',n,gold(n))
