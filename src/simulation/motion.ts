import type {Vec3} from '../math/coordinates';
export function movement(keys:Set<string>,speed:number,dt:number):Vec3 {
 const v:Vec3=[Number(keys.has('KeyD'))-Number(keys.has('KeyA')),Number(keys.has('KeyE'))-Number(keys.has('KeyQ')),Number(keys.has('KeyS'))-Number(keys.has('KeyW'))];
 const length=Math.hypot(...v); return length?v.map(x=>x/length*speed*Math.min(dt,0.05)) as Vec3:[0,0,0];
}
