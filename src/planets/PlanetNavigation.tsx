import {useEffect,useRef} from 'react';
import {useFrame,useThree} from '@react-three/fiber';
import {PerspectiveCamera,Vector3} from 'three';
import {OrbitControls} from 'three-stdlib';
import {CameraJourney} from '../navigation/CameraJourney';
import {CameraAim} from '../navigation/CameraAim';
import {arrivalDistance} from '../math/stellar';
import {useStore} from '../state';
import {usePlanetStore as store} from './state';
import {orbitalPosition,advanceDays} from './orbits';
import {type PlanetSystem,visualRadius,AU_KM} from './model';
export function PlanetNavigation({system}:{system:PlanetSystem}){
 const {camera:cam,gl}=useThree(),camera=cam as PerspectiveCamera;
 const orbit=useRef<OrbitControls|null>(null),trip=useRef(new CameraJourney()),aim=useRef(new CameraAim()),seen=useRef(0),cancel=useRef(0),tick=useRef(0);
 useEffect(()=>{const c=new OrbitControls(camera,gl.domElement);c.minDistance=1e-8;c.maxDistance=200;c.enableDamping=false;c.target.set(0,0,0);c.update();orbit.current=c;return()=>c.dispose();},[camera,gl]);
 useFrame((_,dt)=>{const s=store.getState(),c=orbit.current;if(!c)return;
  const p=system.planets.find(p=>p.id===s.selected)!;
  const days=advanceDays(s.days,dt,s.rate,s.paused||s.active||document.hidden);
  if(days!==s.days)store.setState({days});
  const target=new Vector3(...orbitalPosition(p,days));
  if(s.request!==seen.current){seen.current=s.request;c.enabled=false;trip.current.start(camera,target,useStore.getState().duration,arrivalDistance(visualRadius(p,s.enlarged),camera.fov,camera.aspect));aim.current.start(camera,target);store.setState({active:true,paused:true,arrived:false,travelPaused:false});}
  if(s.cancel!==cancel.current){cancel.current=s.cancel;trip.current.cancel();aim.current.cancel();store.setState({active:false,arrived:false});c.target.copy(camera.getWorldDirection(new Vector3()).multiplyScalar(Math.max(.0001,camera.position.distanceTo(target))).add(camera.position));c.enabled=true;}
  if(trip.current.active){trip.current.paused=s.travelPaused||document.hidden;trip.current.step(camera,dt);if(!trip.current.paused)aim.current.step(camera,dt);if(!trip.current.active){c.target.copy(target);c.minDistance=visualRadius(p,s.enlarged)*1.1;c.enabled=true;c.update();store.setState({active:false,arrived:true});}}
  else {c.enabled=true;c.update();}
  // Keep the camera outside every rendered sphere, including during pan and time changes.
  const bodies=[{pos:new Vector3(),radius:system.starRadiusKm/AU_KM},...system.planets.map(body=>({pos:new Vector3(...orbitalPosition(body,days)),radius:visualRadius(body,s.enlarged)}))];
  for(const body of bodies){const offset=camera.position.clone().sub(body.pos),r=body.radius*1.05;if(offset.length()<r){if(offset.lengthSq()===0)offset.set(0,0,1);camera.position.copy(body.pos).add(offset.normalize().multiplyScalar(r));}}
  tick.current+=dt;if(tick.current>.08){tick.current=0;camera.updateMatrixWorld();
   const labels:{id:string;name:string;x:number;y:number}[]=[];
   const candidates=[{id:system.hostId,name:system.starName,pos:new Vector3()},...system.planets.map(body=>({id:body.id,name:body.name,pos:new Vector3(...orbitalPosition(body,days))}))];
   for(const item of candidates){const ndc=item.pos.project(camera);if(ndc.z< -1||ndc.z>1||Math.abs(ndc.x)>1||Math.abs(ndc.y)>1)continue;const x=(ndc.x+1)*50,y=(1-ndc.y)*50;if(labels.some(l=>Math.abs(l.x-x)*gl.domElement.clientWidth/100<75&&Math.abs(l.y-y)*gl.domElement.clientHeight/100<24))continue;labels.push({id:item.id,name:item.name,x,y});}
   store.setState({labels,progress:trip.current.progress,remaining:trip.current.remaining(camera),distance:camera.position.distanceTo(target)});}
 });return null;
}
