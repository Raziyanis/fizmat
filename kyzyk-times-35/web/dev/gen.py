import base64,sys
def uri(f): return 'data:image/png;base64,'+base64.b64encode(open(f,'rb').read()).decode()
rep={'%%BAND%%':uri('band_s.png'),'%%LOGO%%':uri('logo_s.png'),'%%MOTIF%%':uri('motif_s.png')}
out=sys.argv[1]
for n in ['Participant','Jury']:
    s=open(n+'.src.html').read()
    for k,v in rep.items(): s=s.replace(k,v)
    open(out+'/'+n+'.html','w').write(s)
print('ok')
