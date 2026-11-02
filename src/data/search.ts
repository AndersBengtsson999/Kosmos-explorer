import type {Star} from './catalog';
import type {Vec3} from '../math/coordinates';
export type SortOrder='distance'|'name'|'nearby';
export const PAGE_SIZE=50;
const normalize=(text:string)=>text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const names=new WeakMap<Star,string>();
const catalogs=new WeakMap<Star[],Partial<Record<SortOrder,{origin:string;stars:Star[]}>>>();
const collator=new Intl.Collator('sv');
// Catalog arrays and their stars are immutable; replacement naturally invalidates this cache.
// Keep only the most recent nearby origin, so exploring does not grow memory indefinitely.
export function searchStars(stars:Star[],query:string,order:SortOrder,origin:Vec3=[0,0,0]){
 const from:Vec3=order==='nearby'?origin:[0,0,0],key=from.join(',');
 let cache=catalogs.get(stars);if(!cache){cache={};catalogs.set(stars,cache);}
 let sorted=cache[order];
 if(!sorted||sorted.origin!==key){
  const result=order==='name'?[...stars].sort((a,b)=>collator.compare(a.name,b.name)):
   stars.map(star=>({star,d:(star.position[0]-from[0])**2+(star.position[1]-from[1])**2+(star.position[2]-from[2])**2}))
    .sort((a,b)=>a.d-b.d).map(item=>item.star);
  sorted={origin:key,stars:result};cache[order]=sorted;
 }
 const text=normalize(query);
 // Return a fresh result: callers may sort or otherwise modify their search results.
 return sorted.stars.filter(star=>{if(!text)return true;let name=names.get(star);if(name===undefined){name=normalize(`${star.name} ${star.id}`);names.set(star,name);}return name.includes(text);});
}
