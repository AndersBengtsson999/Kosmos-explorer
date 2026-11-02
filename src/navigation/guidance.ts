import {PerspectiveCamera,Vector3} from 'three';
import type {Star} from '../data/catalog';
import type {Vec3} from '../math/coordinates';
export function skyDirection(vector:Vec3){
 const v=new Vector3(...vector);if(v.lengthSq()<1e-12)return null;v.normalize();
 return {ra:(Math.atan2(-v.z,v.x)*180/Math.PI+360)%360,dec:Math.asin(Math.max(-1,Math.min(1,v.y)))*180/Math.PI};
}
export function destinationIndicator(camera:PerspectiveCamera,target:Vec3){
 const local=new Vector3(...target).sub(camera.position).applyQuaternion(camera.quaternion.clone().invert());
 if(local.lengthSq()<1e-12)return {x:0,y:0,visible:true,behind:false,angle:0};
 const projected=new Vector3(...target).project(camera);
 const visible=local.z<0&&Math.abs(projected.x)<.85&&Math.abs(projected.y)<.75;
 const dx=local.x,dy=-local.y;
 const angle=Math.atan2(Math.abs(dx)+Math.abs(dy)<1e-10?1:dy,dx);
 return {x:visible?projected.x:Math.cos(angle)*.8,y:visible?-projected.y:Math.sin(angle)*.7,visible,behind:local.z>=0,angle:angle*180/Math.PI};
}
export function starAhead(stars:Star[],position:Vec3,forward:Vec3){
 const length=Math.hypot(...forward)||1,threshold=Math.cos(12*Math.PI/180);
 let nearest:Star|null=null,best=Infinity;
 for(const star of stars){const dx=star.position[0]-position[0],dy=star.position[1]-position[1],dz=star.position[2]-position[2],range=Math.hypot(dx,dy,dz);
  if(range>1e-6&&range<best&&(dx*forward[0]+dy*forward[1]+dz*forward[2])/(range*length)>=threshold){nearest=star;best=range;}
 }
 return nearest?{name:nearest.name,distance:best}:null;
}
