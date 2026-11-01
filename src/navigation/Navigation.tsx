import {useEffect,useRef} from 'react';
import {useFrame,useThree} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import {Vector3,Euler} from 'three';
import type {OrbitControls as OrbitImpl} from 'three-stdlib';
import {useStore} from '../state';
import {movement} from '../simulation/motion';
import {flightInput,flightCodes} from './flightInput';
export function Navigation(){
 const {camera,gl}=useThree(),mode=useStore(s=>s.mode),travel=useStore(s=>s.travel);
 const controls=useRef<OrbitImpl>(null),goal=useRef<Vector3|null>(null),target=useRef(new Vector3()),tick=useRef(0);
 useEffect(()=>{const star=useStore.getState().stars.find(s=>s.id===travel.id);if(star){target.current.fromArray(star.position);goal.current=target.current.clone().add(new Vector3(3,2,5));}},[travel]);
 useEffect(()=>{flightInput.clear();goal.current=null;if(mode==='map'&&controls.current){const dir=new Vector3();camera.getWorldDirection(dir);controls.current.target.copy(camera.position).addScaledVector(dir,5);}},[mode,camera]);
 useEffect(()=>{
 const down=(e:KeyboardEvent)=>{
  if(useStore.getState().mode!=='ship'||!flightCodes.has(e.code))return;
  if(e.target instanceof Element&&e.target.closest('input,select,textarea,[contenteditable="true"]'))return;
  flightInput.press(`keyboard:${e.code}`,e.code);goal.current=null;e.preventDefault();
 };
 const up=(e:KeyboardEvent)=>flightInput.release(`keyboard:${e.code}`);
 const clear=()=>{flightInput.clear();dragging=false;};
 const visibility=()=>{if(document.hidden)clear();};
 let dragging=false,lastX=0,lastY=0;
 const pointerDown=(e:PointerEvent)=>{if(useStore.getState().mode==='ship'){dragging=true;lastX=e.clientX;lastY=e.clientY;gl.domElement.setPointerCapture(e.pointerId);goal.current=null;}};
 const pointerUp=()=>{dragging=false;};
 const move=(e:PointerEvent)=>{if(!dragging||useStore.getState().mode!=='ship')return;const dx=e.clientX-lastX,dy=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;const r=new Euler().setFromQuaternion(camera.quaternion,'YXZ');r.y-=dx*0.003;r.x=Math.max(-1.5,Math.min(1.5,r.x-dy*0.003));camera.quaternion.setFromEuler(r);};
 window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',clear);document.addEventListener('visibilitychange',visibility);gl.domElement.addEventListener('pointerdown',pointerDown);window.addEventListener('pointerup',pointerUp);window.addEventListener('pointercancel',pointerUp);gl.domElement.addEventListener('pointermove',move);
 return()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',clear);document.removeEventListener('visibilitychange',visibility);flightInput.clear();gl.domElement.removeEventListener('pointerdown',pointerDown);window.removeEventListener('pointerup',pointerUp);window.removeEventListener('pointercancel',pointerUp);gl.domElement.removeEventListener('pointermove',move);};
 },[camera,gl]);
 useFrame((_,dt)=>{const s=useStore.getState();let moving=false;
 if(s.mode==='ship'&&flightInput.keys().size)goal.current=null;
 if(goal.current){camera.position.lerp(goal.current,1-Math.exp(-3*dt));if(controls.current)controls.current.target.lerp(target.current,1-Math.exp(-3*dt));else camera.lookAt(target.current);moving=true;if(camera.position.distanceTo(goal.current)<0.01)goal.current=null;}
 else if(s.mode==='ship'){const v=new Vector3(...movement(flightInput.keys(),s.speed,dt)).applyQuaternion(camera.quaternion);camera.position.add(v);moving=v.lengthSq()>0;}
 tick.current+=dt;if(tick.current>0.1){s.telemetry(camera.position.toArray(),moving);tick.current=0;}
 });
 return mode==='map'?<OrbitControls ref={controls} makeDefault enableDamping dampingFactor={0.08} minDistance={0.3} maxDistance={50000} onStart={()=>{goal.current=null;}}/>:null;
}
