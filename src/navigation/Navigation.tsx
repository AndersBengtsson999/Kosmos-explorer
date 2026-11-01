import {useEffect,useRef} from 'react';
import {useFrame,useThree} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import {Vector3,Euler} from 'three';
import type {OrbitControls as OrbitImpl} from 'three-stdlib';
import {useStore} from '../state';
import {movement} from '../simulation/motion';
export function Navigation(){
 const {camera,gl}=useThree(),mode=useStore(s=>s.mode),travel=useStore(s=>s.travel);
 const controls=useRef<OrbitImpl>(null),keys=useRef(new Set<string>()),goal=useRef<Vector3|null>(null),target=useRef(new Vector3()),tick=useRef(0);
 useEffect(()=>{const star=useStore.getState().stars.find(s=>s.id===travel.id);if(star){target.current.fromArray(star.position);goal.current=target.current.clone().add(new Vector3(3,2,5));}},[travel]);
 useEffect(()=>{keys.current.clear();goal.current=null;if(mode==='map'&&controls.current){const dir=new Vector3();camera.getWorldDirection(dir);controls.current.target.copy(camera.position).addScaledVector(dir,5);}},[mode,camera]);
 useEffect(()=>{
 const down=(e:KeyboardEvent)=>{if((e.target as HTMLElement).closest('input,button,select,textarea'))return;keys.current.add(e.code);if(['KeyW','KeyA','KeyS','KeyD','KeyQ','KeyE'].includes(e.code)){goal.current=null;e.preventDefault();}};
 const up=(e:KeyboardEvent)=>keys.current.delete(e.code),clear=()=>keys.current.clear();
 let dragging=false;
 const pointerDown=(e:PointerEvent)=>{if(useStore.getState().mode==='ship'){dragging=true;gl.domElement.setPointerCapture(e.pointerId);goal.current=null;}};
 const pointerUp=()=>{dragging=false;};
 const move=(e:PointerEvent)=>{if(!dragging||useStore.getState().mode!=='ship')return;const r=new Euler().setFromQuaternion(camera.quaternion,'YXZ');r.y-=e.movementX*0.003;r.x=Math.max(-1.5,Math.min(1.5,r.x-e.movementY*0.003));camera.quaternion.setFromEuler(r);};
 window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',clear);gl.domElement.addEventListener('pointerdown',pointerDown);window.addEventListener('pointerup',pointerUp);window.addEventListener('pointercancel',pointerUp);gl.domElement.addEventListener('pointermove',move);
 return()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',clear);gl.domElement.removeEventListener('pointerdown',pointerDown);window.removeEventListener('pointerup',pointerUp);window.removeEventListener('pointercancel',pointerUp);gl.domElement.removeEventListener('pointermove',move);};
 },[camera,gl]);
 useFrame((_,dt)=>{const s=useStore.getState();let moving=false;
 if(goal.current){camera.position.lerp(goal.current,1-Math.exp(-3*dt));if(controls.current)controls.current.target.lerp(target.current,1-Math.exp(-3*dt));else camera.lookAt(target.current);moving=true;if(camera.position.distanceTo(goal.current)<0.01)goal.current=null;}
 else if(s.mode==='ship'){const v=new Vector3(...movement(keys.current,s.speed,dt)).applyQuaternion(camera.quaternion);camera.position.add(v);moving=v.lengthSq()>0;}
 tick.current+=dt;if(tick.current>0.1){s.telemetry(camera.position.toArray(),moving);tick.current=0;}
 });
 return mode==='map'?<OrbitControls ref={controls} makeDefault enableDamping dampingFactor={0.08} minDistance={0.3} maxDistance={50000} onStart={()=>{goal.current=null;}}/>:null;
}
