import type {Star} from './catalog';
import {distance,type Vec3} from '../math/coordinates';
export type SortOrder='distance'|'name'|'nearby';
export const PAGE_SIZE=50;
const normalize=(text:string)=>text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const names=new WeakMap<Star,string>();
export function searchStars(stars:Star[],query:string,order:SortOrder,origin:Vec3=[0,0,0]){
 const text=normalize(query);
 const matches=stars.filter(star=>{let name=names.get(star);if(name===undefined){name=normalize(`${star.name} ${star.id}`);names.set(star,name);}return name.includes(text);});
 if(order==='name')return matches.sort((a,b)=>a.name.localeCompare(b.name,'sv'));
 const from=order==='nearby'?origin:[0,0,0] as Vec3;
 return matches.map(star=>({star,d:distance(star.position,from)})).sort((a,b)=>a.d-b.d).map(item=>item.star);
}
