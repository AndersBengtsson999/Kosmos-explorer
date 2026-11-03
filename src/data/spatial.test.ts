import {it,expect} from 'vitest';
import {catalog,parseCatalog} from './catalog';
import {spatialCatalog} from './spatial';
import {radiusInfo,SOLAR_RADIUS_LY} from '../math/stellar';
import {distance,type Vec3} from '../math/coordinates';
it('finds near stars across cell edges without changing catalog coordinates',()=>{const stars=[{...catalog[1],position:[1,0,0] as Vec3},{...catalog[2],position:[50,0,0] as Vec3}],index=spatialCatalog(stars);expect(index.close([1-1e-6,0,0]).map(s=>s.index)).toEqual([0]);expect(index.close([30,0,0])).toEqual([]);expect(index).toBe(spatialCatalog(stars));expect(stars[0].position).toEqual([1,0,0]);});
it('keeps camera poses outside a surface, including an exact center',()=>{const stars=[catalog[1]],index=spatialCatalog(stars);const corrected=index.outside(stars[0].position,[0,0,1]);expect(distance(corrected,stars[0].position)/radiusInfo(stars[0]).ly).toBeCloseTo(1.05,7);const away:Vec3=[20,20,20];expect(index.outside(away,[0,0,1])).toEqual(away);});
it('handles large documented radii outside immediate grid cells',()=>{const stars=[{...catalog[1],position:[5,0,0] as Vec3,radiusSolar:10/SOLAR_RADIUS_LY,radiusSource:'test fixture'}];expect(spatialCatalog(stars).close([0,0,0])).toHaveLength(1);expect(distance(spatialCatalog(stars).outside([0,0,0],[0,0,1]),stars[0].position)).toBeCloseTo(10.5);});
it('requires a source for imported positive finite radii',()=>{const base={...catalog[1],radiusSolar:2};expect(()=>parseCatalog([base])).toThrow();expect(parseCatalog([{...base,radiusSource:'test fixture'}])[0].radiusSolar).toBe(2);expect(()=>parseCatalog([{...base,radiusSolar:-1,radiusSource:'test fixture'}])).toThrow();});
