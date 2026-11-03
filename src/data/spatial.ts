import type {Star} from './catalog';
import type {Vec3} from '../math/coordinates';
import {radiusInfo,angularDiameter,sphereBlend} from '../math/stellar';
const cache=new WeakMap<Star[],SpatialCatalog>();
export class SpatialCatalog{
 private cells=new Map<string,number[]>();private large:number[]=[];
 constructor(readonly stars:Star[]){stars.forEach((s,i)=>{if(radiusInfo(s).ly>.0001){this.large.push(i);return;}const key=s.position.map(Math.floor).join(',');const cell=this.cells.get(key)??[];cell.push(i);this.cells.set(key,cell);});}
 candidates(p:Vec3){const [x,y,z]=p.map(Math.floor),found=[...this.large];for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)for(let c=-1;c<=1;c++){const cell=this.cells.get(`${x+a},${y+b},${z+c}`);if(cell)found.push(...cell);}return found;}
 close(p:Vec3){return this.candidates(p).map(index=>{const s=this.stars[index],r=radiusInfo(s).ly,d=Math.hypot(s.position[0]-p[0],s.position[1]-p[1],s.position[2]-p[2]);return {index,d,blend:sphereBlend(angularDiameter(r,d))};}).filter(s=>s.blend>0).sort((a,b)=>a.d-b.d).slice(0,8);}
 outside(p:Vec3,fallback:Vec3):Vec3{let result:Vec3=[...p];for(const i of this.candidates(p)){const s=this.stars[i],r=radiusInfo(s).ly*1.05,delta=result.map((v,k)=>v-s.position[k]) as Vec3;let d=Math.hypot(...delta);if(d<r){if(d===0){delta.splice(0,3,...fallback);d=Math.hypot(...delta)||1;}result=s.position.map((v,k)=>v+delta[k]*r/d) as Vec3;}}return result;}
}
export function spatialCatalog(stars:Star[]){let index=cache.get(stars);if(!index){index=new SpatialCatalog(stars);cache.set(stars,index);}return index;}
