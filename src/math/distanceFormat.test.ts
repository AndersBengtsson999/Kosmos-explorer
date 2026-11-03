import {it,expect} from 'vitest';
import {formatDistance,AU_LY,LY_KM,journeyPercent,journeyStatus} from './distanceFormat';
import {arrivalDistance,radiusInfo,angularDiameter} from './stellar';
import {catalog} from '../data/catalog';
it('uses Swedish units and standard notation across boundaries',()=>{
 expect(formatDistance(8.6)).toBe('8,60 ljusår');expect(formatDistance(1)).toBe('1,00 ljusår');expect(formatDistance(1-1e-9)).toMatch(/ AU$/);expect(formatDistance(AU_LY)).toBe('1,00 AU');expect(formatDistance(.1*AU_LY)).toBe('0,10 AU');expect(formatDistance(.1*AU_LY-1e-12)).toMatch(/ km$/);expect(formatDistance(1000/LY_KM)).toBe('1 000 km');expect(formatDistance(.2/LY_KM)).toBe('< 1 km');expect(formatDistance(0)).toBe('0 km');expect(formatDistance(NaN)).toBe('—');for(const n of [2.09e-8,3.72e-7,1e30,1e-30])expect(formatDistance(n)).not.toMatch(/e[+-]?\d/i);
});
it('clamps progress, reserves 100 percent for arrival, and prioritizes pause',()=>{expect(journeyPercent(.456)).toBe(45);expect(journeyPercent(.9999)).toBe(99);expect(journeyPercent(1,true)).toBe(100);expect(journeyPercent(-1)).toBe(0);expect(journeyStatus(.2,false)).toBe('Pågår');expect(journeyStatus(.95,false)).toBe('Ankommer');expect(journeyStatus(.95,true)).toBe('Pausad');});
it('Sirius uses an explicitly illustrative radius and remains outside it at arrival',()=>{const star=catalog.find(s=>s.id==='HIP 32349')!,r=radiusInfo(star);expect(r.known).toBe(false);for(const aspect of [.46,1,1.78]){const d=arrivalDistance(r.ly,55,aspect);expect(d).toBeGreaterThan(r.ly*1.05);expect(angularDiameter(r.ly,d)).toBeLessThan(55*Math.PI/180);expect(formatDistance(d)).toMatch(/ km$/);}});
