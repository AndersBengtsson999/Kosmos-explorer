import hostRaw from './planet-hosts.json';
import knownRaw from './known-stars.json';
import {normalizeName} from './identity';
import raw from './stars.json';
import {position,type Vec3} from '../math/coordinates';
export interface Star {spectralClass?:string;aliases?:string[];sourceUrl?:string;componentNote?:string;radiusSolar?:number|null;radiusSource?:string;temperature?:number|null;id:string;name:string;ra:number;dec:number;parallax:number;parallaxError:number|null;mag:number|null;bpRp:number|null;epoch:number;source:string;position:Vec3}
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
  if(s.radiusSolar!=null&&(typeof s.radiusSolar!=='number'||!Number.isFinite(s.radiusSolar)||s.radiusSolar<=0||typeof s.radiusSource!=='string'||!s.radiusSource.trim()))throw new Error('Radie kräver positivt värde och källa');
  if(s.aliases!==undefined&&(!Array.isArray(s.aliases)||s.aliases.length>200||!s.aliases.every(a=>typeof a==='string'&&a.trim()&&a.length<=160)))throw new Error('Alias måste vara en lista med högst 200 namn.');
  for(const key of ['sourceUrl','componentNote','spectralClass'])if(s[key]!==undefined&&typeof s[key]!=='string')throw new Error('Ogiltig källinformation');
  if(s.sourceUrl!==undefined&&!/^https?:\/\//i.test(s.sourceUrl as string))throw new Error('Källänk måste vara http eller https');
  ids.add(s.id);const star=s as unknown as Star;return {...star,position:position(star.ra,star.dec,star.parallax)};
 });
}
export const sun:Star={id:'sun',name:'Solen',aliases:['Sun','Sol'],ra:0,dec:0,parallax:0,parallaxError:null,mag:null,bpRp:null,epoch:2016,source:'Koordinatsystemets ursprung (approximation av solsystemets barycentrum)',position:[0,0,0]};
// Host astrometry supplies a fallback; existing named-star records keep their identity/data.
export const knownStars=[...new Map([...parseCatalog(hostRaw),...parseCatalog(knownRaw)].map(s=>[s.id,s])).values()];
const hostIdentityKeys=new Set(hostRaw.flatMap(s=>[s.id,...s.aliases]).map(normalizeName));
const identities=new Map<string,Star>();
for(const star of knownStars)for(const id of [star.id,...star.aliases??[]]){
 // Only source-verified catalog identifiers are merge keys, never position or fuzzy names.
 if(/^(HIP|HD|Gaia DR[23]|2MASS|TIC|EPIC)\s/i.test(id)||hostIdentityKeys.has(normalizeName(id)))identities.set(normalizeName(id),star);
}
export function mergeCatalog(input:Star[]):Star[]{
 const merged=new Map<string,Star>();
 for(const star of input){
  if(star.id==='sun')continue;
  const matches=new Set([star.id,...star.aliases??[]].map(id=>identities.get(normalizeName(id))).filter(Boolean));
  if(matches.size>1)throw new Error('Motstridiga katalogidentifierare för flera stjärnkomponenter.');
  const known=[...matches][0];
  const item=known?{...star,id:known.id,name:known.name,aliases:[...new Set([star.id,...known.aliases??[],...star.aliases??[]])],sourceUrl:known.sourceUrl,componentNote:known.componentNote}:star;
  // Prefer the canonical Gaia entry if a supplemental HIP row is also imported.
  const prior=merged.get(item.id);
  if(!prior||star.id===item.id)merged.set(item.id,item);
 }
 for(const star of knownStars)if(!merged.has(star.id))merged.set(star.id,star);
 return [sun,...merged.values()];
}
export const catalog=mergeCatalog(parseCatalog(raw));
