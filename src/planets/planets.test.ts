import {describe,it,expect} from 'vitest';
import {PerspectiveCamera,Vector3} from 'three';
import {systems,systemFor,visualRadius,number} from './model';
import {orbitalPosition,advanceDays} from './orbits';
import {CameraJourney} from '../navigation/CameraJourney';
import {CameraAim} from '../navigation/CameraAim';
import {arrivalDistance} from '../math/stellar';
const planets=systems[0].planets;
describe('Verified solar system',()=>{
 it('maps only to the correct catalog host and retains 8 Horizons bodies',()=>{expect(systemFor('sun')?.planets).toHaveLength(8);expect(systemFor('HIP 32349')).toBeUndefined();expect(planets[2].radiusKm).toBe(6371.01);expect(planets[2].a).toBeCloseTo(1.000174971194147,12);});
 it('closes each Kepler orbit and keeps distances within apsides',()=>{for(const p of planets){const a=orbitalPosition(p,0),b=orbitalPosition(p,p.period);expect(new Vector3(...a).distanceTo(new Vector3(...b))).toBeLessThan(1e-10);for(let n=0;n<100;n++){const r=Math.hypot(...orbitalPosition(p,n*p.period/100));expect(r).toBeGreaterThanOrEqual(p.a*(1-p.e)-1e-10);expect(r).toBeLessThanOrEqual(p.a*(1+p.e)+1e-10);}}});
 it('pauses time, scales it and discards long background gaps',()=>{expect(advanceDays(3,.05,10,true)).toBe(3);expect(advanceDays(3,.05,10,false)).toBe(3.5);expect(advanceDays(3,20,10,false)).toBe(4);});
 it('preserves measurements under illustrative enlargement and shows unknowns',()=>{const p=planets[2],r=p.radiusKm;expect(visualRadius(p,true)).toBeGreaterThan(visualRadius(p,false));expect(p.radiusKm).toBe(r);expect(number(null)).toBe('Okänt');});
 it('travels repeatedly outside every surface and faces the destination',()=>{const c=new PerspectiveCamera(55,390/844,1e-8,500);c.position.set(0,18,32);for(const p of planets){const target=new Vector3(...orbitalPosition(p,0)),r=visualRadius(p,false),end=arrivalDistance(r,c.fov,c.aspect);const trip=new CameraJourney(),aim=new CameraAim();trip.start(c,target,10,end);aim.start(c,target);trip.step(c,5);trip.paused=true;const pos=c.position.clone();trip.step(c,3);expect(c.position.equals(pos)).toBe(true);trip.paused=false;trip.step(c,5);aim.step(c,2);expect(c.position.distanceTo(target)).toBeCloseTo(end,10);expect(c.position.distanceTo(target)).toBeGreaterThan(r);expect(c.getWorldDirection(new Vector3()).dot(target.clone().sub(c.position).normalize())).toBeCloseTo(1,9);}});
});
