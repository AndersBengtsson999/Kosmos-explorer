"""Rebuild pinned Horizons snapshot; --fetch refreshes sequentially at the same epoch."""
import json,re,pathlib,sys,urllib.parse,subprocess,hashlib
root=pathlib.Path(__file__).resolve().parents[1]; raw=root/'data/planets'; planets=[]
names=['Merkurius','Venus','Jorden','Mars','Jupiter','Saturnus','Uranus','Neptunus']
for idx,name in enumerate(names):
 id=(idx+1)*100+99; path=raw/f'horizons-{id}.json'
 if '--fetch' in sys.argv:
  params=dict(format='json',COMMAND=f"'{id}'",CENTER="'500@10'",EPHEM_TYPE="'ELEMENTS'",START_TIME="'2026-11-03'",STOP_TIME="'2026-11-04'",STEP_SIZE="'1 d'",OUT_UNITS="'AU-D'",REF_PLANE="'ECLIPTIC'",REF_SYSTEM="'ICRF'",CSV_FORMAT="'YES'",OBJ_DATA="'YES'")
  subprocess.run(['curl','-fsSL','--max-time','60','https://ssd.jpl.nasa.gov/api/horizons.api?'+urllib.parse.urlencode(params),'-o',str(path)],check=True)
 data=json.loads(path.read_text()); text=data['result']
 assert data['signature']['version']=='1.2' and 'Ecliptic of J2000.0' in text
 row=text.split('$$SOE')[1].strip().splitlines()[0].split(','); f=lambda i:float(row[i])
 radius=float(re.search(r'Vol\.\s*Mean Radius \(km\)\s*=\s*([\d.]+)',text,re.I)[1])
 mass=re.search(r'Mass x\s*10\^(\d+) \(kg\)\s*=\s*([\d.]+)',text)
 planets.append(dict(id=str(id),name=name,radiusKm=radius,massKg=float(mass[2])*10**int(mass[1]) if mass else None,a=f(11),e=f(2),i=f(4),node=f(5),peri=f(6),mean=f(9),period=f(13),epoch=f(0),source='https://ssd.jpl.nasa.gov/horizons/',sha256=hashlib.sha256(path.read_bytes()).hexdigest()))
(root/'src/planets/solar.json').write_text(json.dumps(planets,indent=2,ensure_ascii=False)+'\n')
print('Imported',len(planets),'verified planets')
