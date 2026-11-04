import {normalizeName} from '../data/identity';
import extrasolar from './extrasolar.json';
import solar from './solar.json';
export interface Planet {id:string;name:string;radiusKm:number|null;massKg:number|null;a:number;e:number;i:number;node:number;peri:number;mean:number;period:number;epoch:number|null;source:string;aliases?:string[];radiusDerived?:boolean;massMinimum?:boolean;observedInclination?:number|null;eccentricityUnknown?:boolean;texture?:string;illustrativeOrbit?:boolean}
export interface PlanetSystem {hostId:string;defaultPlanetId?:string;name:string;starName:string;starRadiusKm:number;starRadiusSource?:string;illustrativeOrbit?:boolean;planets:Planet[]}
export const systems:PlanetSystem[]=[{hostId:'sun',defaultPlanetId:'399',name:'Solsystemet',starName:'Solen',starRadiusKm:695700,planets:solar.map(p=>({...p,texture:`/planets/${p.id}.jpg`}))},...extrasolar];
export const systemFor=(hostId:string)=>systems.find(s=>s.hostId===hostId);
export const AU_KM=149597870.7;
export function visualRadius(p:Planet,enlarged:boolean){return enlarged?Math.max((p.radiusKm??6371)/AU_KM,Math.min(.025,p.a*.03)):(p.radiusKm??6371)/AU_KM;}
export const number=(value:number|null, digits=2)=>value===null?'Okänt':value.toLocaleString('sv-SE',{maximumFractionDigits:digits,notation:'standard'});

export function matchingPlanets(hostId:string,query:string){const q=normalizeName(query);return q?systemFor(hostId)?.planets.filter(p=>[p.name,...p.aliases??[]].some(n=>normalizeName(n).includes(q)))??[]:[];}
export const planetSearchTerms=(hostId:string)=>systemFor(hostId)?.planets.flatMap(p=>[p.name,...p.aliases??[]])??[];
