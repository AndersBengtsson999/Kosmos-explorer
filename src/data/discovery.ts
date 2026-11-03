import type {Star} from './catalog';
import enrichment from './enrichment.json';
import {searchStars} from './search';
import type {Vec3} from '../math/coordinates';
export const categories={nearest:'Närmaste stjärnorna',brightest:'Ljusstarkaste stjärnorna',planets:'Kända exoplaneter',largest:'Största stjärnorna',hottest:'Varmaste stjärnorna',nearby:'Utforska i närheten'};
export type Category=keyof typeof categories;
export const planetsFor=(star:Star)=>enrichment[star.id as keyof typeof enrichment]?.planets??[];
const cache=new WeakMap<Star[],Partial<Record<Category,Star[]>>>();
export function discover(stars:Star[],category:Category,origin:Vec3){
 if(category==='nearby'||category==='nearest')return searchStars(stars,'',category==='nearby'?'nearby':'distance',origin).filter(s=>s.id!=='sun');
 let entry=cache.get(stars);if(!entry){entry={};cache.set(stars,entry);}if(entry[category])return entry[category]!;
 const result=stars.filter(s=>s.id!=='sun').filter(s=>category==='planets'?planetsFor(s).length>0:category==='largest'?!!s.radiusSolar&&!!s.radiusSource:category==='hottest'?!!s.temperature:s.mag!==null);
 result.sort((a,b)=>category==='brightest'?a.mag!-b.mag!:category==='largest'?b.radiusSolar!-a.radiusSolar!:category==='hottest'?b.temperature!-a.temperature!:a.name.localeCompare(b.name));entry[category]=result;return result;
}
export function fact(star:Star,category:Category){return category==='planets'?`${planetsFor(star).length} bekräftade planeter · NASA`:category==='largest'?`${star.radiusSolar} solradier · ${star.radiusSource}`:category==='hottest'?`${Math.round(star.temperature!)} K · Gaia-modell`:category==='brightest'?`G-magnitud ${star.mag?.toFixed(2)} · lägre är ljusare`:'Verklig 3D-position · Gaia DR3';}
