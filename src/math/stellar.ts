import properties from '../data/stellar-properties.json';
import dwarfRadii from '../data/dwarf-radii.json';
import type {Star} from '../data/catalog';
import {color} from './coordinates';
// IAU 2015 B3 nominal solar radius; Julian light-year in metres.
export const SOLAR_RADIUS_LY=6.957e8/9.4607304725808e15;
export function radiusInfo(star:Star){
 const measured=properties[star.id as keyof typeof properties];
 const classification=star.spectralClass?.replace(/\s/g,'').toUpperCase();
 const estimated=classification?dwarfRadii[classification as keyof typeof dwarfRadii]:undefined;
 const supplied=!!star.radiusSolar&&!!star.radiusSource;
 const solar=supplied?star.radiusSolar!:measured?.radiusSolar??estimated??1;
 const known=supplied||!!measured;
 const source=supplied?star.radiusSource!:measured?.source??(estimated?`Uppskattning för ${classification}: Pecaut & Mamajek, dvärgsekvens 2022.04.16`:'Illustrativ reservradie: tillräckligt radieunderlag saknas');
 return {ly:solar*SOLAR_RADIUS_LY,solar,known,source,estimated:!!estimated&&!known};
}
export function temperatureInfo(star:Star){return star.temperature??properties[star.id as keyof typeof properties]?.temperature??null;}
export function angularDiameter(radius:number,distance:number){return 2*Math.asin(Math.min(1,radius/Math.max(radius,distance)));}
export function arrivalDistance(radius:number,fov:number,aspect=1){const vertical=fov*Math.PI/180;const horizontal=2*Math.atan(Math.tan(vertical/2)*aspect);return radius/Math.sin(Math.min(vertical,horizontal)*.22);}
export function sphereBlend(angle:number){const x=Math.max(0,Math.min(1,(angle-.0004)/.002));return x*x*(3-2*x);}
export function stellarColor(star:Star){const t=temperatureInfo(star);return t?(t<3500?'#ffae80':t<5000?'#ffd1a0':t<6500?'#fff2dc':t<10000?'#e4edff':'#a8c5ff'):color(star.bpRp);}
