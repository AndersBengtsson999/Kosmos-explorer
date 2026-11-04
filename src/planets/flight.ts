import {Vector3} from 'three';
export type FlightModel='exploration'|'simulation';
export const AU_METRES=149597870700;
export const SURFACE_MARGIN=1.02;
/** SI units. Exploration is an assisted velocity controller; simulation is Newtonian thrust only. */
export function flightStep(velocity:Vector3,direction:Vector3,delta:number,model:FlightModel,speed:number,acceleration:number,brake=false){
 const dt=Math.min(.1,Math.max(0,Number.isFinite(delta)?delta:0));
 const input=direction.clone().clampLength(0,1),before=velocity.clone();
 if(model==='exploration'){
  if(brake||!input.lengthSq()){const a=Math.max(1,speed/.2),t=Math.min(dt,before.length()/a),after=before.clone().clampLength(0,Math.max(0,before.length()-a*dt));return {velocity:after,displacement:before.add(after).multiplyScalar(t*.5)};}

  const target=input.multiplyScalar(brake?0:speed),decay=Math.exp(-dt/0.12);
  return {velocity:target.clone().add(before.clone().sub(target).multiplyScalar(decay)),displacement:target.clone().multiplyScalar(dt).add(before.sub(target).multiplyScalar(.12*(1-decay)))};
 }
 if(brake){const a=Math.max(1,acceleration*8),t=Math.min(dt,before.length()/a),after=before.clone().clampLength(0,Math.max(0,before.length()-a*dt));return {velocity:after,displacement:before.add(after).multiplyScalar(t*.5)};}
 const change=input.multiplyScalar(acceleration*dt);
 return {velocity:before.clone().add(change),displacement:before.multiplyScalar(dt).addScaledVector(change,dt*.5)};
}
export interface FlightBody {name:string;position:Vector3;radius:number}
/** Swept sphere intersection: even a whole-frame high-speed crossing cannot tunnel through a body. AU. */
export function safeFlightStep(start:Vector3,end:Vector3,bodies:FlightBody[]){
 const origin=start.clone();let hit=false;
 for(const b of bodies){const r=b.radius*SURFACE_MARGIN,offset=origin.clone().sub(b.position);if(offset.length()<r){if(!offset.lengthSq())offset.set(0,0,1);origin.copy(b.position).add(offset.normalize().multiplyScalar(r));hit=true;}}
 if(hit)return {position:origin,hit};
 const delta=end.clone().sub(origin),a=delta.lengthSq();let fraction=1;
 if(a>0)for(const b of bodies){const offset=origin.clone().sub(b.position),r=b.radius*SURFACE_MARGIN,dot=offset.dot(delta),discriminant=dot*dot-a*(offset.lengthSq()-r*r);if(discriminant<0||dot>=0)continue;const t=(-dot-Math.sqrt(discriminant))/a;if(t>=-1e-12&&t<=fraction){fraction=Math.max(0,t-1e-10);hit=true;}}
 return {position:origin.addScaledVector(delta,fraction),hit};
}
export function nearestBody(position:Vector3,bodies:FlightBody[]){return bodies.map(b=>({name:b.name,distance:Math.max(0,position.distanceTo(b.position)-b.radius)})).sort((a,b)=>a.distance-b.distance)[0];}
