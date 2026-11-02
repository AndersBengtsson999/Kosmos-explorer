import {PerspectiveCamera, Vector3} from 'three';
export const ARRIVAL_DISTANCE = 3;
export const JOURNEY_DURATIONS = [10,20,40,60] as const;
export function smootherstep(t:number) { const x=Math.max(0,Math.min(1,t));return x*x*x*(x*(x*6-15)+10); }
/** Translation only. Orientation is independently owned by CameraAim or manual look. */
export class CameraJourney {
 private startPosition=new Vector3();
 private endPosition=new Vector3();
 readonly target=new Vector3();
 active=false;paused=false;elapsed=0;duration=20;progress=0;
 start(camera:PerspectiveCamera,target:Vector3,duration=20) {
  if(!JOURNEY_DURATIONS.some(value=>value===duration))throw new Error('Ogiltig restid');
  this.startPosition.copy(camera.position);this.target.copy(target);
  const approach=camera.position.clone().sub(target);
  if(approach.lengthSq()<1e-12)camera.getWorldDirection(approach).negate();
  this.endPosition.copy(target).addScaledVector(approach.normalize(),ARRIVAL_DISTANCE);
  this.duration=duration;this.elapsed=0;this.progress=0;this.paused=false;this.active=true;
 }
 step(camera:PerspectiveCamera,delta:number) {
  if(!this.active||this.paused)return false;
  this.elapsed=Math.min(this.duration,this.elapsed+Math.max(0,Number.isFinite(delta)?delta:0));
  this.progress=Math.min(1,this.elapsed/this.duration);
  camera.position.lerpVectors(this.startPosition,this.endPosition,smootherstep(this.progress));
  if(this.progress>=1)this.active=false;
  return true;
 }
 remaining(camera:PerspectiveCamera){return camera.position.distanceTo(this.endPosition);}
 cancel(){this.active=false;this.paused=false;}
}
