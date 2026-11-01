"""Rebuild local JSON from the unmodified Gaia TAP CSV. Python standard library only."""
import csv,json,pathlib
root=pathlib.Path(__file__).resolve().parent.parent
names={'Gaia DR3 5853498713190525696':'Proxima Centauri','Gaia DR3 4472832130942575872':'Barnards stjärna'}
rows=[]
for r in csv.DictReader((root/'data/gaia-dr3.csv').open()):
 def value(k): return float(r[k]) if r[k] else None
 rows.append(dict(id=r['designation'],name=names.get(r['designation'],r['designation']),ra=value('ra'),dec=value('dec'),parallax=value('parallax'),parallaxError=value('parallax_error'),mag=value('phot_g_mean_mag'),bpRp=value('bp_rp'),epoch=value('ref_epoch'),source='Gaia DR3'))
assert len(rows)>=100
(root/'src/data/stars.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n')
print(f'Converted {len(rows)} measured sources')
