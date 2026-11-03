// IAU astronomical unit (exact); Julian light-year (365.25 days at c).
export const LY_KM=9460730472580.8;
export const AU_KM=149597870.7;
export const AU_LY=AU_KM/LY_KM;
// Choose units before rounding: >= 1 ly, >= 0.1 AU, otherwise km.
const decimals=new Intl.NumberFormat('sv-SE',{minimumFractionDigits:2,maximumFractionDigits:2,notation:'standard'});
const whole=new Intl.NumberFormat('sv-SE',{maximumFractionDigits:0,notation:'standard'});
export function formatDistance(ly:number):string{
 if(!Number.isFinite(ly)||ly<0)return '—';
 if(ly>=1)return `${decimals.format(ly)} ljusår`;
 if(ly>=.1*AU_LY)return `${decimals.format(ly/AU_LY)} AU`;
 const km=ly*LY_KM;
 return km>0&&km<1?'< 1 km':`${whole.format(km)} km`;
}
export function journeyPercent(progress:number,arrived=false){return arrived?100:Math.min(99,Math.max(0,Math.floor((Number.isFinite(progress)?progress:0)*100)));}
export function journeyStatus(progress:number,paused:boolean){return paused?'Pausad':progress>=.9?'Ankommer':'Pågår';}
