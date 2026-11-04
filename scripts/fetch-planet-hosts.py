"""Refresh pinned host cross-identifications and confirmed planet rows. Run from any directory."""
import subprocess,urllib.parse,pathlib,json,hashlib,datetime
requests=[('hosts-simbad.csv','https://simbad.harvard.edu/simbad/sim-tap/sync',dict(REQUEST='doQuery',LANG='ADQL',FORMAT='csv',QUERY="SELECT b.main_id,b.ra,b.dec,b.plx_value,b.plx_err,b.coo_bibcode,b.plx_bibcode,i.ids FROM basic b JOIN ident n ON b.oid=n.oidref JOIN ids i ON b.oid=i.oidref WHERE n.id IN ('TRAPPIST-1','HIP 70890')")),('exoplanets-full.json','https://exoplanet.ipac.caltech.edu/TAP/sync',dict(query="select * from pscomppars where hostname='TRAPPIST-1' or hostname='Proxima Cen'",format='json'))]
root=pathlib.Path(__file__).resolve().parents[1]/'data/planets'
meta=[];pending=[]
for file,endpoint,params in requests:
 r=subprocess.run(['curl','-fsSL','--max-time','60',endpoint+'?'+urllib.parse.urlencode(params)],capture_output=True)
 print(file,r.returncode,r.stdout[:150],r.stderr,flush=True)
 if r.returncode:raise RuntimeError(file)
 pending.append((root/file,r.stdout))
 meta.append(dict(file=file,endpoint=endpoint,parameters=params,retrieved=datetime.datetime.now(datetime.timezone.utc).isoformat(),sha256=hashlib.sha256(r.stdout).hexdigest()))
for path,data in pending:path.write_bytes(data)
(root/'hosts-metadata.json').write_text(json.dumps(meta,indent=2)+'\n')
