"""Fetch a reproducible Gaia DR3 sample and build compact little-endian catalogs."""
import subprocess
import csv,hashlib,io,json,pathlib,struct,urllib.parse,urllib.request,datetime
root=pathlib.Path(__file__).resolve().parent.parent
query='SELECT TOP 100000 source_id,ra,dec,parallax,parallax_error,phot_g_mean_mag,bp_rp,teff_gspphot FROM gaiadr3.gaia_source WHERE parallax > 5 AND parallax_over_error > 20 AND ruwe < 1.4 ORDER BY parallax DESC, source_id ASC'
urls=['https://gea.esac.esa.int/tap-server/tap/sync','https://gaia.ari.uni-heidelberg.de/tap/sync']
raw=None
for endpoint in urls:
 try:
  request=endpoint+'?'+urllib.parse.urlencode(dict(REQUEST='doQuery',LANG='ADQL',FORMAT='csv',MAXREC='100000',QUERY=query))
  raw=subprocess.run(['curl','-fsSL','--max-time','180',request],check=True,capture_output=True).stdout
  rows=list(csv.DictReader(io.StringIO(raw.decode())))
  if len(rows)!=100000 or 'source_id' not in rows[0]:raise ValueError('Expected exactly 100000 Gaia rows')
  break
 except Exception as error:
  print(f'{endpoint}: {error}',flush=True);raw=None
if raw is None:raise SystemExit('Catalog unavailable: existing files preserved')
(root/'data/gaia-dr3-100k.csv').write_bytes(raw)
fields=['ra','dec','parallax','parallax_error','phot_g_mean_mag','bp_rp','teff_gspphot']
output=root/'public/catalog';output.mkdir(parents=True,exist_ok=True)
for count in (10000,100000):
 packed=b''.join(struct.pack('<Q7d',int(row['source_id']),*[float(row[f]) if row[f] else float('nan') for f in fields]) for row in rows[:count])
 (output/f'gaia-{count}.bin').write_bytes(packed)
meta=dict(source='ESA Gaia DR3 via '+endpoint,query=query,retrieved=datetime.datetime.now(datetime.timezone.utc).isoformat(),count=len(rows),epoch=2016.0,frame='ICRS',raw_sha256=hashlib.sha256(raw).hexdigest(),format='64 bytes/row: little-endian uint64 source_id followed by 7 float64; null = NaN',fields=fields,units=['deg','deg','mas','mas','mag','mag','K'])
(output/'metadata.json').write_text(json.dumps(meta,indent=2)+'\n')
print(json.dumps(meta),flush=True)
