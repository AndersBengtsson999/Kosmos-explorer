"""Offline rebuild of shared radii, temperatures and class-based estimates.
Sirius A: Davis et al., PASA 28 (2011), DOI 10.1071/AS10010.
Dwarf sequence: Pecaut & Mamajek (2013), online update 2022.04.16.
"""
import json,re,pathlib,hashlib
root=pathlib.Path(__file__).resolve().parents[1]
props={'sun':dict(radiusSolar=1,temperature=5772,source='IAU 2015 B3, nominella solvärden',url='https://arxiv.org/abs/1510.07674'), 'HIP 32349':dict(radiusSolar=1.713,temperature=9845,source='Davis et al. 2011, interferometri + Hipparcos; radie ±0,009 solradier',url='https://doi.org/10.1071/AS10010')}
systems=json.loads((root/'src/planets/extrasolar.json').read_text());nasa=json.loads((root/'data/planets/exoplanets-full.json').read_text())
for s in systems:
 p=next(p for p in nasa if p['pl_name']==s['planets'][0]['id']);props[s['hostId']]=dict(radiusSolar=s['starRadiusKm']/695700,temperature=p['st_teff'],source='NASA Exoplanet Archive, källbelagd modellskattning',url=s['starRadiusSource'])
(root/'src/data/stellar-properties.json').write_text(json.dumps(props,ensure_ascii=False,indent=2)+'\n')
rows={}
for line in (root/'data/dwarf-sequence.txt').read_text().splitlines():
 if line.startswith('#'):continue
 parts=line.split()
 if len(parts)>6 and re.fullmatch(r'[OBAFGKM]\d(?:\.\d)?V',parts[0]):
  try:rows[parts[0]]=float(parts[6])
  except ValueError:pass
(root/'src/data/dwarf-radii.json').write_text(json.dumps(rows,indent=2)+'\n')
(root/'data/stellar-properties-sources.json').write_text(json.dumps(dict(dwarfSequenceUrl='https://www.pas.rochester.edu/~emamajek/EEM_dwarf_UBVIJHK_colors_Teff.txt',dwarfVersion='2022.04.16',dwarfSha256=hashlib.sha256((root/'data/dwarf-sequence.txt').read_bytes()).hexdigest(),note='Dwarf values are class means, not measurements of individual stars. Only exact supplied dwarf spectral classes use these estimates. Sirius radius 1.713 +/- 0.009 Rsun and Teff 9845 +/- 64 K; source DOI 10.1071/AS10010. Other properties use existing NASA snapshots, or IAU nominal Sun.'),indent=2)+'\n')
print('Built',len(props),'shared stellar records and',len(rows),'class means')
