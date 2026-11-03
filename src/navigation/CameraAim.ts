import {PerspectiveCamera,Quaternion,Vector3} from 'three';
import {smootherstep} from './CameraJourney';
export class CameraAim {
 private from=new Quaternion();private to=new Quaternion();elapsed=0;active=false;
 start(camera:PerspectiveCamera,target:Vector3){
  const toward=target.clone().sub(camera.position);
  if(toward.lengthSq()<1e-28){this.active=false;return;}
  this.from.copy(camera.quaternion);
  const view=camera.clone();
  if(Math.abs(toward.normalize().dot(view.up))>.999999)view.up.copy(Math.abs(toward.z)<.9?new Vector3(0,0,1):new Vector3(1,0,0));
  view.lookAt(target);this.to.copy(view.quaternion);this.elapsed=0;this.active=true;
 }
 step(camera:PerspectiveCamera,delta:number){
  if(!this.active)return;
  this.elapsed+=Math.max(0,delta);const t=Math.min(1,this.elapsed/1.5);
  camera.quaternion.slerpQuaternions(this.from,this.to,smootherstep(t));
  if(t===1)this.active=false;
 }
 cancel(){this.active=false;}
}
