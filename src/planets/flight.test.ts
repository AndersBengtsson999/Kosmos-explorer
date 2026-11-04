import {describe,it,expect} from 'vitest';
import {Vector3} from 'three';
import {flightStep,safeFlightStep,SURFACE_MARGIN,nearestBody,AU_METRES} from './flight';
const zero=()=>new Vector3();
describe('separate free flight models in SI units',()=>{
 it('exploration responds then automatically brakes',()=>{let v=zero();for(let i=0;i<60;i++)v=flightStep(v,new Vector3(0,0,-1),1/60,'exploration',100,10).velocity;expect(v.z).toBeLessThan(-99);for(let i=0;i<120;i++)v=flightStep(v,zero(),1/60,'exploration',100,10).velocity;expect(v.length()).toBeLessThan(.001);});
 it('simulation accelerates and coasts without invented gravity or drag',()=>{let v=zero(),p=zero();for(let i=0;i<100;i++){const step=flightStep(v,new Vector3(1,0,0),.01,'simulation',0,10);v=step.velocity;p.add(step.displacement);}expect(v.x).toBeCloseTo(10);expect(p.x).toBeCloseTo(5);const step=flightStep(v,zero(),.1,'simulation',0,10);expect(step.velocity.equals(v)).toBe(true);expect(step.displacement.x).toBeCloseTo(1);});
 it('brakes without reversing, including a stop inside the frame',()=>{const step=flightStep(new Vector3(1,0,0),zero(),.1,'simulation',0,10,true);expect(step.velocity.length()).toBe(0);expect(step.displacement.x).toBeCloseTo(.5/80);});
 it('normalizes diagonal thrust and handles backwards, sideways and vertical motion',()=>{for(const direction of [new Vector3(1,0,0),new Vector3(-1,0,0),new Vector3(0,1,0),new Vector3(0,-1,0),new Vector3(0,0,1),new Vector3(1,1,1)]){const step=flightStep(zero(),direction,.1,'simulation',0,10);expect(step.velocity.length()).toBeCloseTo(1);expect(step.velocity.dot(direction.clone().normalize())).toBeCloseTo(1);}});
 it('is frame-rate independent for constant inputs and uses exact AU metres',()=>{const run=(dt:number)=>{let v=zero(),p=zero();for(let i=0;i<Math.round(1/dt);i++){const s=flightStep(v,new Vector3(1,0,0),dt,'exploration',100,1);v=s.velocity;p.add(s.displacement);}return p.x;};expect(run(.01)).toBeCloseTo(run(.02),9);expect(AU_METRES).toBe(149597870700);expect(flightStep(zero(),zero(),NaN,'simulation',0,1).velocity.length()).toBe(0);});
});
describe('surface safety',()=>{
 const bodies=[{name:'star',position:zero(),radius:1}];
 it('stops at the first surface even when the end point is beyond the whole star',()=>{const s=safeFlightStep(new Vector3(-100,0,0),new Vector3(100,0,0),bodies);expect(s.hit).toBe(true);expect(s.position.x).toBeCloseTo(-SURFACE_MARGIN,6);expect(s.position.length()).toBeGreaterThanOrEqual(SURFACE_MARGIN);});
 it('allows tangential flight and retreat, recovers from an inside pose',()=>{expect(safeFlightStep(new Vector3(2,2,0),new Vector3(-2,2,0),bodies).hit).toBe(false);expect(safeFlightStep(new Vector3(1.03,0,0),new Vector3(5,0,0),bodies).hit).toBe(false);expect(safeFlightStep(zero(),zero(),bodies).position.length()).toBeCloseTo(SURFACE_MARGIN);});
 it('chooses the first collision and reports surface distance',()=>{const all=[...bodies,{name:'planet',position:new Vector3(-3,0,0),radius:.5}];expect(safeFlightStep(new Vector3(-10,0,0),new Vector3(10,0,0),all).position.x).toBeCloseTo(-3-.5*SURFACE_MARGIN,6);expect(nearestBody(new Vector3(-4,0,0),all)).toEqual({name:'planet',distance:.5});});
});
