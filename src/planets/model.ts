import solar from './solar.json';
export interface Planet {id:string;name:string;radiusKm:number|null;massKg:number|null;a:number;e:number;i:number;node:number;peri:number;mean:number;period:number;epoch:number;source:string;texture?:string;illustrativeOrbit?:boolean}
export interface PlanetSystem {hostId:string;name:string;starName:string;starRadiusKm:number;planets:Planet[]}
export const systems:PlanetSystem[]=[{hostId:'sun',name:'Solsystemet',starName:'Solen',starRadiusKm:695700,planets:solar.map(p=>({...p,texture:`/planets/${p.id}.jpg`}))}];
export const systemFor=(hostId:string)=>systems.find(s=>s.hostId===hostId);
export const AU_KM=149597870.7;
export function visualRadius(p:Planet,enlarged:boolean){return enlarged?Math.max((p.radiusKm??6371)/AU_KM,.025):(p.radiusKm??6371)/AU_KM;}
export const number=(value:number|null, digits=2)=>value===null?'Okänt':value.toLocaleString('sv-SE',{maximumFractionDigits:digits,notation:'standard'});
