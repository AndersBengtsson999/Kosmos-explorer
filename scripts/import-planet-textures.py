"""Fetch NASA/JPL maps; run from the repository root. Provenance is saved locally."""
import subprocess,re,pathlib,json
out=pathlib.Path('public/planets');out.mkdir(exist_ok=True); manifest=[]
for id,name in zip(range(199,900,100),['mercury','venus','earth','mars','jupiter','saturn','uranus','neptune']):
 page='https://space.jpl.nasa.gov/tmaps/'+name+'.html'
 r=subprocess.run(['curl','-fsSL','--max-time','20',page],capture_output=True,text=True)
 links=re.findall(r'href=[\"\']?(pix/[^\s>\"\']+\.jpg)',r.stdout)
 if links:
  url='https://space.jpl.nasa.gov/tmaps/'+links[0]
  p=subprocess.run(['curl','-fsSL','--max-time','30',url,'-o',str(out/f'{id}.jpg')])
  if p.returncode==0:manifest.append(dict(id=str(id),page=page,url=url))
assert len(manifest)==8, 'Incomplete texture download; existing manifest retained'
pathlib.Path('data/planets/textures.json').write_text(json.dumps(manifest,indent=2))
print(manifest)
