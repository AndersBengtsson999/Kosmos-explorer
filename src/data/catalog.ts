import raw from './stars.json';
import {position,type Vec3} from '../math/coordinates';
export interface Star {temperature?:number|null;id:string;name:string;ra:number;dec:number;parallax:number;parallaxError:number|null;mag:number|null;bpRp:number|null;epoch:number;source:string;position:Vec3}
export function parseCatalog(input:unknown):Star[]{
 if(!Array.isArray(input)||input.length===0||input.length>100000)throw new Error('Katalogen måste innehålla 1–100000 stjärnor.');
 const ids=new Set<string>();
 return input.map((v:unknown)=>{
  if(!v||typeof v!=='object')throw new Error('Ogiltig stjärna.');
  const s=v as Record<string,unknown>;
  if(typeof s.id!=='string'||!s.id.trim()||s.id==='sun'||ids.has(s.id)||typeof s.name!=='string'||!s.name.trim()||s.name.length>120||typeof s.source!=='string'||!s.source.trim())throw new Error('Varje stjärna behöver unikt id, namn och källa.');
  for(const key of ['ra','dec','parallax','epoch'])if(typeof s[key]!=='number'||!Number.isFinite(s[key]))throw new Error(`Ogiltigt värde: ${key}`);
  if((s.ra as number)<0||(s.ra as number)>=360||Math.abs(s.dec as number)>90||(s.parallax as number)<=0||(s.parallax as number)<0.1||(s.epoch as number)<1800||(s.epoch as number)>2200)throw new Error('Koordinater, parallax eller epok utanför tillåtet intervall.');
  for(const key of ['parallaxError','mag','bpRp'])if(s[key]!==null&&(typeof s[key]!=='number'||!Number.isFinite(s[key])))throw new Error(`Ange ett tal eller null för ${key}.`);
  if(s.parallaxError!==null&&(s.parallaxError as number)<0)throw new Error('Osäkerhet får inte vara negativ.');
  if(s.temperature!==undefined&&s.temperature!==null&&(typeof s.temperature!=='number'||!Number.isFinite(s.temperature)||s.temperature<=0))throw new Error('Ogiltig temperatur');
  ids.add(s.id);const star=s as unknown as Star;return {...star,position:position(star.ra,star.dec,star.parallax)};
 });
}
export const sun:Star={id:'sun',name:'Solen',ra:0,dec:0,parallax:0,parallaxError:null,mag:null,bpRp:null,epoch:2016,source:'Koordinatsystemets ursprung (approximation av solsystemets barycentrum)',position:[0,0,0]};
export const catalog=[sun,...parseCatalog(raw)];
