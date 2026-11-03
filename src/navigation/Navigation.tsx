import {spatialCatalog} from '../data/spatial';
import {arrivalDistance,radiusInfo} from '../math/stellar';
import {useEffect, useRef,useMemo} from 'react';
import {useFrame, useThree} from '@react-three/fiber';
import {Euler, PerspectiveCamera, Vector3} from 'three';
import {OrbitControls} from 'three-stdlib';
import {useStore} from '../state';
import {movement} from '../simulation/motion';
import {flightInput, flightCodes} from './flightInput';
import {CameraAim} from './CameraAim';
import {destinationIndicator} from './guidance';
import {cameraDiagnostics} from './diagnostics';
import {ARRIVAL_DISTANCE, CameraJourney} from './CameraJourney';

export function Navigation() {
  const {camera: sceneCamera, gl} = useThree();
  const camera = sceneCamera as PerspectiveCamera;
  const stars=useStore(s=>s.stars),spatial=useMemo(()=>spatialCatalog(stars),[stars]);
  const controls = useRef<OrbitControls | null>(null);
  const journey = useRef(new CameraJourney());
  const aim=useRef(new CameraAim());
  const seenAim=useRef(0),seenStop=useRef(0);
  const lastPosition=useRef(camera.position.clone());
  const seenTravel = useRef(0);
  const seenCancel = useRef(0);
  const previousMode = useRef(useStore.getState().mode);
  const tick = useRef(0);
  const focusDistance=useRef(ARRIVAL_DISTANCE);
  const skipDelta=useRef(false);

  // Hand off a pose without retaining old orbit inertia or changing its viewing direction.
  function syncOrbit(target?: Vector3) {
    const orbit = controls.current;
    if (!orbit) return;
    const position = camera.position.clone();
    const rotation = camera.quaternion.clone();
    orbit.enableDamping = false;
    orbit.update(); // drain accumulated deltas while preserving the saved pose below
    camera.position.copy(position);
    camera.quaternion.copy(rotation);
    camera.up.set(0, 1, 0).applyQuaternion(rotation);
    orbit.target.copy(target ?? camera.getWorldDirection(new Vector3())
      .multiplyScalar(focusDistance.current).add(position));
    orbit.update();
    camera.position.copy(position);
    camera.quaternion.copy(rotation);
    orbit.enableDamping = true;
  }

  function cancel() {
    if (!journey.current.active) return;
    focusDistance.current=Math.max(1e-10,camera.position.distanceTo(journey.current.target));
    journey.current.cancel();
    aim.current.cancel();
    syncOrbit();
    useStore.getState().setJourney(false, journey.current.progress);
    if (controls.current) controls.current.enabled = useStore.getState().mode === 'map';
  }

  useEffect(() => {
    const orbit = new OrbitControls(camera, gl.domElement);
    orbit.enableDamping = true;
    orbit.dampingFactor = 0.08;
    orbit.minDistance = 1e-10;
    orbit.maxDistance = 100000;
    controls.current = orbit;
    syncOrbit();
    let pointer: number | null = null;
    let lastX = 0, lastY = 0;
    const down = (event: KeyboardEvent) => {
      if (event.code === 'Space' && !(event.target instanceof Element && event.target.closest('input,select,textarea,button'))) { event.preventDefault();useStore.getState().stop();return; }
      if (event.code === 'Escape') { cancel(); return; }
      if (useStore.getState().mode !== 'ship' || !flightCodes.has(event.code)) return;
      if (event.target instanceof Element && event.target.closest('input,select,textarea,[contenteditable="true"]')) return;
      cancel();
      flightInput.press(`keyboard:${event.code}`, event.code);
      event.preventDefault();
    };
    const up = (event: KeyboardEvent) => flightInput.release(`keyboard:${event.code}`);
    const clear = () => { flightInput.clear(); pointer = null; };
    const visibility = () => { if (document.hidden) { skipDelta.current=true;clear();const state=useStore.getState();if(journey.current.active)useStore.setState({journey:{...state.journey,paused:true}}); } };
    const pointerDown = (event: PointerEvent) => {
      if ((!journey.current.active && useStore.getState().mode !== 'ship') || pointer !== null) return;
      aim.current.cancel();
      pointer = event.pointerId;
      lastX = event.clientX; lastY = event.clientY;
      gl.domElement.setPointerCapture(event.pointerId);
    };
    const pointerUp = (event: PointerEvent) => { if (event.pointerId === pointer) pointer = null; };
    const move = (event: PointerEvent) => {
      if (pointer !== event.pointerId || (!journey.current.active && useStore.getState().mode !== 'ship')) return;
      const rotation = new Euler().setFromQuaternion(camera.quaternion, 'YXZ');
      rotation.y -= (event.clientX - lastX) * 0.003;
      rotation.x = Math.max(-Math.PI / 2 + 1e-6, Math.min(Math.PI / 2 - 1e-6,
        rotation.x - (event.clientY - lastY) * 0.003));
      camera.quaternion.setFromEuler(rotation);
      lastX = event.clientX; lastY = event.clientY;
    };
    const wheel = () => {};
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', clear);
    document.addEventListener('visibilitychange', visibility);
    // Capture phase releases the travel owner before OrbitControls handles the gesture.
    gl.domElement.addEventListener('pointerdown', pointerDown, true);
    gl.domElement.addEventListener('wheel', wheel, true);
    gl.domElement.addEventListener('pointermove', move);
    gl.domElement.addEventListener('lostpointercapture', pointerUp);
    window.addEventListener('pointerup', pointerUp);
    window.addEventListener('pointercancel', pointerUp);
    return () => {
      orbit.dispose(); controls.current = null; clear();
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', clear);
      document.removeEventListener('visibilitychange', visibility);
      gl.domElement.removeEventListener('pointerdown', pointerDown, true);
      gl.domElement.removeEventListener('wheel', wheel, true);
      gl.domElement.removeEventListener('pointermove', move);
      gl.domElement.removeEventListener('lostpointercapture', pointerUp);
      window.removeEventListener('pointerup', pointerUp);
      window.removeEventListener('pointercancel', pointerUp);
    };
  }, [camera, gl]);

  // Only this frame loop updates the camera: journey OR manual flight OR orbit.
  useFrame((_, delta) => {
    const state = useStore.getState();
    const orbit = controls.current;
    if (!orbit) return;
    if (state.mode !== previousMode.current) {
      if (!journey.current.active && !aim.current.active) syncOrbit();
      previousMode.current = state.mode;
    }
    if (state.travel.nonce !== seenTravel.current) {
      seenTravel.current = state.travel.nonce;
      const star = state.stars.find(item => item.id === state.travel.id);
      if (star) {
        flightInput.clear();
        orbit.enabled = false;
        journey.current.start(camera, new Vector3(...star.position),state.duration,arrivalDistance(radiusInfo(star).ly,camera.fov,camera.aspect));
        focusDistance.current=arrivalDistance(radiusInfo(star).ly,camera.fov,camera.aspect);
        aim.current.start(camera,journey.current.target);
        state.setJourney(true, 0,journey.current.remaining(camera));
      }
    }
    if (state.cancelRequest !== seenCancel.current) {
      seenCancel.current = state.cancelRequest;
      cancel();
    }
    if (state.mode === 'ship' && flightInput.keys().size) cancel();
    if(state.aimRequest!==seenAim.current){
      seenAim.current=state.aimRequest;
      const target=journey.current.active?journey.current.target:new Vector3(...state.stars.find(star=>star.id===state.selected)!.position);
      aim.current.start(camera,target);orbit.enabled=false;
    }
    if(state.stopRequest!==seenStop.current){seenStop.current=state.stopRequest;flightInput.clear();syncOrbit();}
    journey.current.paused=state.journey.paused;
    const dt=document.hidden||skipDelta.current?0:delta;
    skipDelta.current=false;
    let moving = false;
    orbit.enabled = !journey.current.active && !aim.current.active && state.mode === 'map';
    if (journey.current.active) {
      moving = journey.current.step(camera,dt);
      if (!journey.current.active) {
        syncOrbit();
        orbit.enabled = state.mode === 'map';
        state.setJourney(false, 1,0,true);
      }
    } else if (state.mode === 'ship') {
      const displacement = new Vector3(...movement(flightInput.keys(), state.speed, delta))
        .applyQuaternion(camera.quaternion);
      camera.position.add(displacement);
      moving = displacement.lengthSq() > 0;
    } else if (!aim.current.active) {
      orbit.update();
    }
    const wasAiming=aim.current.active;
    aim.current.step(camera,dt);
    if(wasAiming&&!aim.current.active&&!journey.current.active)syncOrbit();
    // Keep each rendered camera pose outside nearby stellar surfaces.
    camera.position.fromArray(spatial.outside(camera.position.toArray(),camera.getWorldDirection(new Vector3()).negate().toArray()));
    const velocity=camera.position.clone().sub(lastPosition.current).divideScalar(delta||1);
    if(state.mode==='map'&&!journey.current.active)velocity.set(0,0,0);
    lastPosition.current.copy(camera.position);
    camera.updateMatrixWorld();
    cameraDiagnostics.position = camera.position.toArray();
    cameraDiagnostics.quaternion = camera.quaternion.toArray();
    cameraDiagnostics.owner = journey.current.active ? 'journey' : state.mode;
    tick.current += delta;
    if (tick.current > 0.1) {
      const target=state.stars.find(star=>star.id===(journey.current.active?state.travel.id:state.selected))!;
      state.telemetry(camera.position.toArray(),moving,camera.getWorldDirection(new Vector3()).toArray(),velocity.toArray(),destinationIndicator(camera,target.position));
      if (journey.current.active) state.setJourney(true, journey.current.progress,journey.current.remaining(camera));
      tick.current = 0;
    }
  });
  return null;
}
