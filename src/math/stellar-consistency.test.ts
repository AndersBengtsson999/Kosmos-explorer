import {describe,it,expect} from 'vitest';
import {catalog} from '../data/catalog';
import {radiusInfo,angularDiameter,sphereBlend,SOLAR_RADIUS_LY,arrivalDistance} from './stellar';
import {systems} from '../planets/model';
import {AU_LY,AU_KM} from './distanceFormat';
describe('one physical stellar size across views',()=>{
 it.each(['sun','HIP 32349','Gaia DR3 2635476908753563008'])('grows continuously at approach: %s',id=>{const star=catalog.find(s=>s.id===id)!,r=radiusInfo(star).ly;let angle=0;for(const scale of [100000,10000,5000,2000,1000,100,10,2,1.02]){const next=angularDiameter(r,r*scale);expect(next).toBeGreaterThan(angle);expect(angularDiameter(r/AU_LY,r*scale/AU_LY)).toBeCloseTo(next,12);angle=next;}expect(angle).toBeGreaterThan(2.7);});
 it('uses sourced Sirius and host radii rather than one arbitrary solar radius',()=>{expect(radiusInfo(catalog.find(s=>s.id==='HIP 32349')!).solar).toBe(1.713);for(const system of systems){const r=radiusInfo(catalog.find(s=>s.id===system.hostId)!);expect(r.known).toBe(true);expect(r.ly/AU_LY*AU_KM).toBeCloseTo(system.starRadiusKm,6);}});
 it('larger stars look larger at the same physical distance',()=>{const r=radiusInfo(catalog.find(s=>s.id==='HIP 32349')!).ly;expect(angularDiameter(r,1e-5)).toBeGreaterThan(angularDiameter(SOLAR_RADIUS_LY,1e-5));});
 it('blends complementary point/sphere weights continuously and fits arrival outside surface',()=>{for(const a of [.000399,.0004,.000401,.0014,.002399,.0024,.002401]){const b=sphereBlend(a);expect(b+(1-b)).toBe(1);expect(Math.abs(sphereBlend(a+1e-8)-b)).toBeLessThan(.00001);}expect(sphereBlend(.0014)).toBeCloseTo(.5);expect(arrivalDistance(SOLAR_RADIUS_LY,55)).toBeGreaterThan(SOLAR_RADIUS_LY*1.02);});
 it('only estimates a dwarf radius when that classification is supplied',()=>{const star={...catalog[1],id:'unmeasured',radiusSolar:undefined,radiusSource:undefined,spectralClass:'A0V'};expect(radiusInfo(star)).toMatchObject({solar:2.193,known:false,estimated:true});expect(radiusInfo({...star,spectralClass:'M5V'}).solar).toBeLessThan(1);expect(radiusInfo({...star,spectralClass:undefined})).toMatchObject({solar:1,known:false,estimated:false});});
});
