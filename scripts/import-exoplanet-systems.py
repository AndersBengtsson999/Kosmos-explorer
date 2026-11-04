"""Rebuild systems + guaranteed hosts from pinned SIMBAD, Gaia and NASA data.
Refresh sources with scripts/fetch-planet-hosts.py; this step is offline.
"""
import csv,json,pathlib,re,hashlib
root=pathlib.Path(__file__).resolve().parents[1]
raw=root/'data/planets';nasa=json.loads((raw/'exoplanets-full.json').read_text());hosts=list(csv.DictReader((raw/'hosts-simbad.csv').open()));gaia={r['source_id']:r for r in csv.DictReader((root/'data/gaia-dr3-100k.csv').open())}
def norm(s):return re.sub('[^a-z0-9]','',s.lower())
def reference(html):
 m=re.search(r'href=([^ >]+)',html or '')
 return m[1] if m and m[1].startswith('https://') else 'https://exoplanetarchive.ipac.caltech.edu/docs/pscp_calc.html'
for entry in json.loads((raw/'hosts-metadata.json').read_text()):
 assert hashlib.sha256((raw/entry['file']).read_bytes()).hexdigest()==entry['sha256'], 'Source checksum mismatch'
stars=[];systems=[]
for h in hosts:
 aliases=[' '.join(s.split()).removeprefix('NAME ') for s in h['ids'].split('|')]
 name=h['main_id'].removeprefix('NAME ');aliases=list(dict.fromkeys([name,*aliases]));gid=next(a for a in aliases if a.startswith('Gaia DR3 '));g=gaia[gid.removeprefix('Gaia DR3 ')]
 rows=[p for p in nasa if norm(p['hostname']) in {norm(a) for a in aliases}]
 assert rows and all(p['pl_controv_flag']==0 for p in rows)
 star=dict(id=gid,name=name,aliases=aliases,ra=float(g['ra']),dec=float(g['dec']),parallax=float(g['parallax']),parallaxError=float(g['parallax_error']),mag=float(g['phot_g_mean_mag']),bpRp=float(g['bp_rp']),epoch=2016,source='Gaia DR3; identifierare: SIMBAD',sourceUrl='https://simbad.harvard.edu/simbad/sim-id?Ident='+name.replace(' ','%20'))
 stars.append(star);planets=[]
 for index,p in enumerate(rows):
  assert p['pl_orbsmax']>0 and p['pl_orbper']>0
  derived='CALCULATED_VALUE' in (p['pl_rade_reflink'] or '')
  planets.append(dict(id=p['pl_name'],name=name+' '+p['pl_letter'],aliases=[p['pl_name'],name+' '+p['pl_letter']],radiusKm=p['pl_rade']*6378.1 if p['pl_rade'] is not None else None,radiusDerived=derived,massKg=p['pl_bmasse']*5.97219e24 if p['pl_bmasse'] is not None else None,massMinimum=p['pl_bmassprov']=='Msini',a=p['pl_orbsmax'],e=p['pl_orbeccen'] if p['pl_orbeccen'] is not None else 0,i=0,node=0,peri=0,mean=index*360/len(rows),period=p['pl_orbper'],epoch=None,source='https://exoplanetarchive.ipac.caltech.edu/overview/'+p['pl_name'].replace(' ','%20'),illustrativeOrbit=True,observedInclination=p['pl_orbincl'],eccentricityUnknown=p['pl_orbeccen'] is None,references={k:reference(p.get(k+'_reflink')) for k in ['pl_rade','pl_bmasse','pl_orbper','pl_orbsmax','pl_orbeccen','pl_orbincl']}))
 systems.append(dict(hostId=gid,name=name,starName=name,starRadiusKm=rows[0]['st_rad']*695700,starRadiusSource=reference(rows[0]['st_rad_reflink']),illustrativeOrbit=True,planets=planets))
assert len(next(s for s in systems if s['name']=='TRAPPIST-1')['planets'])==7
(root/'src/data/planet-hosts.json').write_text(json.dumps(stars,ensure_ascii=False,indent=2)+'\n')
(root/'src/planets/extrasolar.json').write_text(json.dumps(systems,ensure_ascii=False,indent=2)+'\n')
print('Built',len(stars),'verified hosts and',sum(len(s['planets']) for s in systems),'confirmed planets')

(raw/'system-import.json').write_text(json.dumps(dict(gaiaSha256=hashlib.sha256((root/'data/gaia-dr3-100k.csv').read_bytes()).hexdigest(),frame='ICRS',epoch=2016,earthRadiusKm=6378.1,earthMassKg=5.97219e24,solarRadiusKm=695700,orbitNote='Extrasolar node, periapsis, inclination and initial mean anomaly are illustrative rendering angles, not measured positions; epoch is null.',hosts=[s['id'] for s in stars]),indent=2)+'\n')
