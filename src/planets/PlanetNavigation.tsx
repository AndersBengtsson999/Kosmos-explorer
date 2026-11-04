import {localFlightInput as input,localFlightCodes} from './flightInput';
import {flightStep,safeFlightStep,nearestBody,AU_METRES} from './flight';
import {AU_LY} from '../math/distanceFormat';
import {radiusInfo} from '../math/stellar';
import {useEffect,useRef} from 'react';
import {useFrame,useThree} from '@react-three/fiber';
import {PerspectiveCamera,Vector3,Euler} from 'three';
import {OrbitControls} from 'three-stdlib';
import {CameraJourney} from '../navigation/CameraJourney';
import {CameraAim} from '../navigation/CameraAim';
import {arrivalDistance} from '../math/stellar';
import {useStore} from '../state';
import {usePlanetStore as store} from './state';
import {orbitalPosition,advanceDays} from './orbits';
import {type PlanetSystem,visualRadius} from './model';
export const localCameraDiagnostics={position:[0,18,32],quaternion:[0,0,0,1],owner:'orbit',starRadiusAU:0};
export function PlanetNavigation({system}:{system:PlanetSystem}){
 const {camera:cam,gl}=useThree(),camera=cam as PerspectiveCamera;
 const velocity=useRef(new Vector3()),previousFlight=useRef(false),previousModel=useRef(store.getState().flightModel);
 const orbit=useRef<OrbitControls|null>(null),trip=useRef(new CameraJourney()),aim=useRef(new CameraAim()),seen=useRef(0),cancel=useRef(0),tick=useRef(0);
 useEffect(()=>{const c=new OrbitControls(camera,gl.domElement);c.minDistance=1e-8;c.maxDistance=200;c.enableDamping=false;c.target.set(0,0,0);c.update();orbit.current=c;return()=>c.dispose();},[camera,gl]);
 useEffect(()=>{
  let dragging=false,lastX=0,lastY=0;
  const down=(e:KeyboardEvent)=>{if(!store.getState().flight)return;if(e.code==='Escape'){store.setState({flight:false});input.clear();return;}if(e.target instanceof Element&&e.target.closest('input,select,textarea'))return;if(localFlightCodes.has(e.code)){e.preventDefault();input.keys.add(e.code);}};
  const up=(e:KeyboardEvent)=>input.keys.delete(e.code);
  const clear=()=>{input.clear();dragging=false;};
  const pointerDown=(e:PointerEvent)=>{if(!store.getState().flight||e.button!==0)return;gl.domElement.tabIndex=0;gl.domElement.focus({preventScroll:true});dragging=true;lastX=e.clientX;lastY=e.clientY;gl.domElement.setPointerCapture(e.pointerId);};
  const move=(e:PointerEvent)=>{if(!dragging||!store.getState().flight)return;input.lookX+=e.clientX-lastX;input.lookY+=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;};
  const release=()=>{dragging=false;};
  window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',clear);document.addEventListener('visibilitychange',clear);
  gl.domElement.addEventListener('pointerdown',pointerDown);gl.domElement.addEventListener('pointermove',move);window.addEventListener('pointerup',release);window.addEventListener('pointercancel',clear);
  return()=>{clear();window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',clear);document.removeEventListener('visibilitychange',clear);gl.domElement.removeEventListener('pointerdown',pointerDown);gl.domElement.removeEventListener('pointermove',move);window.removeEventListener('pointerup',release);window.removeEventListener('pointercancel',clear);};
 },[gl]);
 useFrame((_,dt)=>{const s=store.getState(),c=orbit.current;if(!c)return;
  const host=useStore.getState().stars.find(star=>star.id===system.hostId)!;const starRadius=radiusInfo(host).ly/AU_LY;
  const p=system.planets.find(p=>p.id===s.selected)!;
  const days=advanceDays(s.days,dt,s.rate,s.paused||s.active||s.flight||document.hidden);
  if(days!==s.days)store.setState({days});
  const target=s.targetKind==='star'?new Vector3():new Vector3(...orbitalPosition(p,days));
  const destinationRadius=s.targetKind==='star'?starRadius:visualRadius(p,s.enlarged);
  const bodies=[{name:system.starName,position:new Vector3(),radius:starRadius},...system.planets.map(body=>({name:body.name,position:new Vector3(...orbitalPosition(body,days)),radius:visualRadius(body,s.enlarged)}))];
  if(s.flight!==previousFlight.current||s.flightModel!==previousModel.current){
   input.clear();velocity.current.set(0,0,0);store.setState({speedMs:0,braking:false,paused:true});
   if(s.flight){trip.current.cancel();aim.current.cancel();c.enabled=false;store.setState({active:false,arrived:false});}
   else {const pose=camera.position.clone(),rotation=camera.quaternion.clone();camera.up.set(0,1,0).applyQuaternion(rotation);c.target.copy(camera.getWorldDirection(new Vector3()).multiplyScalar(Math.max(starRadius,nearestBody(camera.position,bodies).distance)).add(camera.position));c.update();camera.position.copy(pose);camera.quaternion.copy(rotation);}
   previousFlight.current=s.flight;previousModel.current=s.flightModel;
  }
  if(s.request!==seen.current){seen.current=s.request;c.enabled=false;trip.current.start(camera,target,useStore.getState().duration,arrivalDistance(destinationRadius,camera.fov,camera.aspect));aim.current.start(camera,target);store.setState({active:true,paused:true,arrived:false,travelPaused:false});}
  if(s.cancel!==cancel.current){cancel.current=s.cancel;trip.current.cancel();aim.current.cancel();store.setState({active:false,arrived:false});c.target.copy(camera.getWorldDirection(new Vector3()).multiplyScalar(Math.max(.0001,camera.position.distanceTo(target))).add(camera.position));c.enabled=true;}
  if(s.flight){
   c.enabled=false;
   if(input.lookX||input.lookY){const look=new Euler().setFromQuaternion(camera.quaternion,'YXZ');look.y-=input.lookX*.003;look.x=Math.max(-Math.PI/2+.001,Math.min(Math.PI/2-.001,look.x-input.lookY*.003));input.lookX=input.lookY=0;camera.quaternion.setFromEuler(look);}
   const k=input.keys,boost=k.has('ShiftLeft')||k.has('ShiftRight')?5:1;
   const direction=new Vector3(Number(k.has('KeyD'))-Number(k.has('KeyA')),Number(k.has('Space'))-Number(k.has('KeyC')),Number(k.has('KeyS'))-Number(k.has('KeyW'))).clampLength(0,1).applyQuaternion(camera.quaternion);
   const nearest=nearestBody(camera.position,bodies);
   const speed=Math.min(s.cruiseAU*boost,Math.max(1e-10,nearest.distance*.5))*AU_METRES;
   const step=flightStep(velocity.current,direction,document.hidden?0:dt,s.flightModel,speed,s.acceleration*boost,s.braking||k.has('KeyB'));
   const safe=safeFlightStep(camera.position,camera.position.clone().addScaledVector(step.displacement,1/AU_METRES),bodies);
   camera.position.copy(safe.position);velocity.current.copy(safe.hit?new Vector3():step.velocity);
   if(safe.hit!==s.surfaceStop)store.setState({surfaceStop:safe.hit});
  } else if(trip.current.active){trip.current.paused=s.travelPaused||document.hidden;trip.current.step(camera,dt);if(!trip.current.paused)aim.current.step(camera,dt);if(!trip.current.active){c.target.copy(target);c.minDistance=destinationRadius*1.02;c.enabled=true;c.update();store.setState({active:false,arrived:true});}}
  else {c.enabled=true;c.update();}
  // Keep the camera outside every rendered sphere, including during pan and time changes.
  if(!s.flight){const safe=safeFlightStep(camera.position,camera.position,bodies);camera.position.copy(safe.position);}
  localCameraDiagnostics.position=camera.position.toArray();localCameraDiagnostics.quaternion=camera.quaternion.toArray();localCameraDiagnostics.owner=s.flight?'flight':trip.current.active?'journey':'orbit';localCameraDiagnostics.starRadiusAU=starRadius;
  tick.current+=dt;if(tick.current>.08){tick.current=0;camera.updateMatrixWorld();
   const labels:{id:string;name:string;x:number;y:number}[]=[];
   const candidates=[{id:system.hostId,name:system.starName,pos:new Vector3()},...system.planets.map(body=>({id:body.id,name:body.name,pos:new Vector3(...orbitalPosition(body,days))}))];
   for(const item of candidates){const ndc=item.pos.project(camera);if(ndc.z< -1||ndc.z>1||Math.abs(ndc.x)>1||Math.abs(ndc.y)>1)continue;const x=(ndc.x+1)*50,y=(1-ndc.y)*50;if(labels.some(l=>Math.abs(l.x-x)*gl.domElement.clientWidth/100<75&&Math.abs(l.y-y)*gl.domElement.clientHeight/100<24))continue;labels.push({id:item.id,name:item.name,x,y});}
   const nearest=nearestBody(camera.position,bodies);
   store.setState({speedMs:velocity.current.length(),nearestName:nearest.name,nearestAU:nearest.distance,labels,progress:trip.current.progress,remaining:trip.current.remaining(camera),distance:camera.position.distanceTo(target)});}
 });return null;
}
