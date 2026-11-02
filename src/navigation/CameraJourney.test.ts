import {describe,expect,it} from 'vitest';
import {PerspectiveCamera,Vector3} from 'three';
import {CameraJourney,smootherstep} from './CameraJourney';
import {CameraAim} from './CameraAim';
import {skyDirection,destinationIndicator,starAhead} from './guidance';
import {catalog} from '../data/catalog';
const camera=()=>{const c=new PerspectiveCamera(55,1,0.01,100000);c.position.set(24,16,30);c.lookAt(0,0,0);c.updateMatrixWorld();return c;};
describe('independent translation and orientation',()=>{
 it.each([10,20,40,60])('uses exactly %s seconds of active travel time',duration=>{const c=camera(),j=new CameraJourney(),target=new Vector3(...catalog[1].position);j.start(c,target,duration);j.step(c,duration/2);expect(j.progress).toBe(.5);expect(j.active).toBe(true);j.step(c,duration/2);expect(j.active).toBe(false);expect(c.position.distanceTo(target)).toBeCloseTo(3,10);});
 it('defaults to 20 seconds',()=>{const j=new CameraJourney();j.start(camera(),new Vector3());expect(j.duration).toBe(20);});
 it('pauses without losing elapsed time and resumes from the same point',()=>{const c=camera(),j=new CameraJourney();j.start(c,new Vector3());j.step(c,5);j.paused=true;const p=c.position.clone();j.step(c,200);expect(c.position.equals(p)).toBe(true);expect(j.elapsed).toBe(5);j.paused=false;j.step(c,15);expect(j.progress).toBe(1);});
 it('never overwrites manual orientation, including at arrival',()=>{const c=camera(),j=new CameraJourney();j.start(c,new Vector3());j.step(c,8);c.rotation.set(.3,.8,.1);const q=c.quaternion.clone();j.step(c,12);expect(c.quaternion.equals(q)).toBe(true);});
 it('cancellation freezes translation',()=>{const c=camera(),j=new CameraJourney();j.start(c,new Vector3());j.step(c,8);const p=c.position.clone();j.cancel();j.step(c,12);expect(c.position.equals(p)).toBe(true);});
 it('handles retargeting, repeated destinations, poles and coincident positions',()=>{const c=camera(),j=new CameraJourney();for(const target of [new Vector3(...catalog[1].position),new Vector3(...catalog[2].position),new Vector3(...catalog[2].position),c.position.clone()]){const p=c.position.clone();j.start(c,target,10);expect(c.position.equals(p)).toBe(true);j.step(c,10);expect(c.position.distanceTo(target)).toBeCloseTo(3,8);}});
 it('has smooth endpoints with no overshoot',()=>{expect(smootherstep(.01)).toBeLessThan(.00002);expect(1-smootherstep(.99)).toBeLessThan(.00002);for(let i=0;i<=100;i++){expect(smootherstep(i/100)).toBeGreaterThanOrEqual(0);expect(smootherstep(i/100)).toBeLessThanOrEqual(1);}});
 it('smooth aiming changes orientation only, and can be interrupted',()=>{const c=camera(),aim=new CameraAim(),target=new Vector3(-20,-6,8),p=c.position.clone(),q=c.quaternion.clone();aim.start(c,target);aim.step(c,0);expect(c.quaternion.equals(q)).toBe(true);aim.step(c,1.5);expect(c.position.equals(p)).toBe(true);expect(c.getWorldDirection(new Vector3()).dot(target.clone().sub(p).normalize())).toBeCloseTo(1,10);aim.start(c,new Vector3(8,9,10));aim.step(c,.3);aim.cancel();const stopped=c.quaternion.clone();aim.step(c,10);expect(c.quaternion.equals(stopped)).toBe(true);});
});
describe('navigation references',()=>{
 it('maps rendered axes to ICRS directions and distinguishes rest',()=>{expect(skyDirection([1,0,0])).toEqual({ra:0,dec:0});expect(skyDirection([0,0,-1])).toEqual({ra:90,dec:0});expect(skyDirection([0,1,0])?.dec).toBe(90);expect(skyDirection([0,0,0])).toBeNull();});
 it('projects destinations ahead, beside and behind the camera',()=>{const c=new PerspectiveCamera(55,1,.01,1000);c.updateMatrixWorld();expect(destinationIndicator(c,[0,0,-10]).visible).toBe(true);expect(destinationIndicator(c,[10,0,-1]).visible).toBe(false);expect(destinationIndicator(c,[0,0,10]).behind).toBe(true);expect(Number.isFinite(destinationIndicator(c,[0,0,10]).angle)).toBe(true);});
 it('finds the closest star in the forward cone, not behind the observer',()=>{const stars=[{...catalog[0],name:'Behind',position:[0,0,1] as [number,number,number]},{...catalog[0],name:'Ahead',position:[0,0,-5] as [number,number,number]}];expect(starAhead(stars,[0,0,0],[0,0,-1])?.name).toBe('Ahead');expect(starAhead(stars,[0,0,0],[1,0,0])).toBeNull();});
});
