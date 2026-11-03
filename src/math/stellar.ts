import type {Star} from '../data/catalog';
import {color} from './coordinates';
// IAU 2015 B3 nominal solar radius; Julian light-year in metres.
export const SOLAR_RADIUS_LY=6.957e8/9.4607304725808e15;
export function radiusInfo(star:Star){const known=star.id==='sun'||(!!star.radiusSolar&&!!star.radiusSource);return {ly:(known?star.radiusSolar??1:1)*SOLAR_RADIUS_LY,known};}
export function angularDiameter(radius:number,distance:number){return 2*Math.asin(Math.min(1,radius/Math.max(radius,distance)));}
export function arrivalDistance(radius:number,fov:number,aspect=1){const vertical=fov*Math.PI/180;const horizontal=2*Math.atan(Math.tan(vertical/2)*aspect);return radius/Math.sin(Math.min(vertical,horizontal)*.22);}
export function sphereBlend(angle:number){const x=Math.max(0,Math.min(1,(angle-.0004)/.002));return x*x*(3-2*x);}
export function stellarColor(star:Star){const t=star.temperature;return t?(t<3500?'#ffae80':t<5000?'#ffd1a0':t<6500?'#fff2dc':t<10000?'#e4edff':'#a8c5ff'):color(star.bpRp);}
export function formatLy(value:number){return value!==0&&value<.001?value.toExponential(2):value.toFixed(2);}
