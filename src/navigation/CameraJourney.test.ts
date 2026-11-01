import {describe, expect, it} from 'vitest';
import {PerspectiveCamera, Quaternion, Vector3} from 'three';
import {ARRIVAL_DISTANCE, CameraJourney, smootherstep} from './CameraJourney';
import {catalog} from '../data/catalog';

function cameraAt(position:Vector3) {
  const camera = new PerspectiveCamera(); camera.position.copy(position); camera.lookAt(0,0,0); return camera;
}
function finish(journey:CameraJourney,camera:PerspectiveCamera) {
  for(let i=0;i<400&&journey.active;i++) journey.step(camera,1/60);
  expect(journey.active).toBe(false);
}
function expectFacing(camera:PerspectiveCamera,target:Vector3) {
  const toward=target.clone().sub(camera.position).normalize();
  expect(camera.getWorldDirection(new Vector3()).dot(toward)).toBeCloseTo(1,10);
}

describe('camera journey in render-world light years',()=>{
 it('arrives exactly at the defined distance and looks at a real star',()=>{
  const camera=cameraAt(new Vector3(24,16,30)),target=new Vector3(...catalog[1].position),journey=new CameraJourney();
  journey.start(camera,target);finish(journey,camera);
  expect(camera.position.distanceTo(target)).toBeCloseTo(ARRIVAL_DISTANCE,10);expectFacing(camera,target);
 });
 it('starts without changing position or orientation',()=>{
  const camera=cameraAt(new Vector3(20,-3,12)),p=camera.position.clone(),q=camera.quaternion.clone(),journey=new CameraJourney();
  journey.start(camera,new Vector3(4,6,-10));journey.step(camera,0);
  expect(camera.position.equals(p)).toBe(true);expect(camera.quaternion.angleTo(q)).toBeCloseTo(0);
 });
 it('accelerates and brakes with zero endpoint velocity and no overshoot',()=>{
  expect(smootherstep(0)).toBe(0);expect(smootherstep(1)).toBe(1);
  expect(smootherstep(.01)).toBeLessThan(.00002);expect(1-smootherstep(.99)).toBeLessThan(.00002);
  let previous=0;for(let i=0;i<=100;i++){const t=smootherstep(i/100);expect(t).toBeGreaterThanOrEqual(previous);expect(t).toBeLessThanOrEqual(1);previous=t;}
 });
 it('keeps the route outside the target marker from arbitrary directions',()=>{
  for(const start of [new Vector3(-8,5,3),new Vector3(0,40,0),new Vector3(0,-40,0)]){
   const camera=cameraAt(start),journey=new CameraJourney(),target=new Vector3();journey.start(camera,target);
   for(let i=0;i<400&&journey.active;i++){journey.step(camera,1/60);expect(camera.position.length()).toBeGreaterThanOrEqual(ARRIVAL_DISTANCE-1e-10);}
   expectFacing(camera,target);
  }
 });
 it('retreats safely if already closer than the arrival distance',()=>{
  const camera=cameraAt(new Vector3(.5,0,0)),journey=new CameraJourney();journey.start(camera,new Vector3());
  for(let i=0;i<400&&journey.active;i++){journey.step(camera,1/60);expect(camera.position.x).toBeGreaterThanOrEqual(.5);}
  expect(camera.position.x).toBeCloseTo(3);
 });
 it('handles a coincident camera and target without NaN',()=>{
  const camera=cameraAt(new Vector3()),journey=new CameraJourney();journey.start(camera,new Vector3());finish(journey,camera);
  expect(camera.position.length()).toBeCloseTo(3);expectFacing(camera,new Vector3());
 });
 it('cancellation freezes the current pose rather than snapping to either endpoint',()=>{
  const camera=cameraAt(new Vector3(30,5,8)),journey=new CameraJourney();journey.start(camera,new Vector3(1,2,3));
  for(let i=0;i<40;i++)journey.step(camera,1/60);
  const p=camera.position.clone(),q=camera.quaternion.clone();journey.cancel();journey.step(camera,10);
  expect(camera.position.equals(p)).toBe(true);expect(camera.quaternion.equals(q)).toBe(true);
 });
 it('travels between two non-solar stars and supports repeated destinations',()=>{
  const camera=cameraAt(new Vector3(24,16,30)),journey=new CameraJourney();
  for(const star of [catalog[1],catalog[2],catalog[2],catalog[1]]){
   const target=new Vector3(...star.position);journey.start(camera,target);finish(journey,camera);
   expect(camera.position.distanceTo(target)).toBeCloseTo(3);expectFacing(camera,target);
  }
 });
 it('retargeting starts from the current interpolated pose',()=>{
  const camera=cameraAt(new Vector3(20,20,20)),journey=new CameraJourney();journey.start(camera,new Vector3());
  for(let i=0;i<30;i++)journey.step(camera,1/60);
  const p=camera.position.clone(),q=camera.quaternion.clone();journey.start(camera,new Vector3(9,-10,5));journey.step(camera,0);
  expect(camera.position.equals(p)).toBe(true);expect(camera.quaternion.angleTo(q)).toBeCloseTo(0);
 });
 it('uses shortest quaternion interpolation and bounded time steps',()=>{
  const camera=cameraAt(new Vector3(12,0,0));camera.quaternion.copy(new Quaternion().setFromAxisAngle(new Vector3(0,1,0),Math.PI));
  const journey=new CameraJourney();journey.start(camera,new Vector3());journey.step(camera,60);
  expect(journey.elapsed).toBe(.05);expect(journey.progress).toBeLessThan(.05);
  expect(camera.quaternion.length()).toBeCloseTo(1);
 });
});
