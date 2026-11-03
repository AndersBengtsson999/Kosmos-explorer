"""Rebuild the pinned SIMBAD supplement; --fetch refreshes its raw source via official TAP."""
import csv,json,pathlib,subprocess,sys,urllib.parse,hashlib,datetime
root=pathlib.Path(__file__).resolve().parent.parent
entries=[('HIP 32349','Sirius A',['Sirius','Alpha Canis Majoris','Alpha Canis Majoris A','α CMa','α CMa A']),('HIP 71683','Alpha Centauri A',['Alpha Cen A','α Cen A','Rigil Kentaurus']),('HIP 71681','Alpha Centauri B',['Alpha Cen B','α Cen B','Toliman']),('HIP 91262','Vega',['Alpha Lyrae','α Lyr']),('HIP 69673','Arcturus',['Alpha Bootis','Alpha Boötis','α Boo']),('HIP 27989','Betelgeuse',['Alpha Orionis','α Ori']),('HIP 24436','Rigel',['Beta Orionis','β Ori']),('HIP 70890','Proxima Centauri',['Proxima','Alpha Centauri C','α Cen C']),('HIP 87937','Barnards stjärna',["Barnard's star",'Barnard Star'])]
query="SELECT b.main_id,b.ra,b.dec,b.plx_value,b.plx_err,b.coo_bibcode,b.plx_bibcode,i.ids FROM basic b JOIN ident n ON b.oid=n.oidref JOIN ids i ON b.oid=i.oidref WHERE n.id IN ("+','.join("'"+e[0]+"'" for e in entries)+")"
raw=root/'data/known-stars-simbad.csv';endpoint='https://simbad.harvard.edu/simbad/sim-tap/sync'
if '--fetch' in sys.argv:
 url=endpoint+'?'+urllib.parse.urlencode(dict(REQUEST='doQuery',LANG='ADQL',FORMAT='csv',QUERY=query))
 data=subprocess.run(['curl','-fsSL','--max-time','60',url],check=True,capture_output=True).stdout
 rows=list(csv.DictReader(data.decode().splitlines()))
 if len(rows)!=len(entries):raise ValueError('Unexpected source count; existing data preserved')
 raw.write_bytes(data)
 (root/'data/known-stars-metadata.json').write_text(json.dumps(dict(endpoint=endpoint,query=query,retrieved=datetime.datetime.now(datetime.timezone.utc).isoformat(),sha256=hashlib.sha256(data).hexdigest(),frame='ICRS',epoch=2000.0,coordinateReference='https://simbad.cds.unistra.fr/Pages/guide/ch15.htx'),indent=2)+'\n')
rows=list(csv.DictReader(raw.open()));result=[]
for hip,name,aliases in entries:
 row=next(r for r in rows if hip in [' '.join(i.split()) for i in r['ids'].split('|')])
 identifiers=[' '.join(i.split()) for i in row['ids'].split('|')]
 chosen=[i for i in identifiers if i.startswith(('HIP ','HD ','Gaia DR','* alf','* bet','NAME '))]
 chosen=[i.removeprefix('NAME ').removeprefix('* ') for i in chosen]
 gaia=next((i for i in identifiers if i.startswith('Gaia DR3 ')),None)
 result.append(dict(id=gaia or hip,name=name,aliases=list(dict.fromkeys([hip,*aliases,*chosen])),ra=float(row['ra']),dec=float(row['dec']),parallax=float(row['plx_value']),parallaxError=float(row['plx_err']),mag=None,bpRp=None,epoch=2000,source='SIMBAD / '+row['coo_bibcode']+'; parallax '+row['plx_bibcode'],sourceUrl='https://simbad.harvard.edu/simbad/sim-id?Ident='+urllib.parse.quote(hip),componentNote='Sirius A. Sirius B är en separat komponent (Gaia DR3 2947050466531873024) och ingår inte i standardurvalet.' if hip=='HIP 32349' else ''))
(root/'src/data/known-stars.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print('Wrote',len(result),'verified supplemental stars')
