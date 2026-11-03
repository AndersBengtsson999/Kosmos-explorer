import {formatDistance} from '../math/distanceFormat';
import {useMemo} from 'react';
import {useStore} from '../state';
import {distance} from '../math/coordinates';
import {skyDirection,starAhead} from '../navigation/guidance';
const heading=(v:ReturnType<typeof skyDirection>)=>v?`RA ${v.ra.toFixed(0)}° · Dec ${v.dec.toFixed(0)}°`:'Stilla';
export function NavigationHUD(){
 const visible=useStore(s=>s.mode==='ship'||s.journey.active);
 return visible?<ActiveNavigationHUD/>:null;
}
function ActiveNavigationHUD(){
 const s=useStore();
 const destination=s.stars.find(star=>star.id===(s.journey.active?s.travel.id:s.selected))!;
 const ahead=useMemo(()=>starAhead(s.stars,s.position,s.forward),[s.stars,s.position,s.forward]);
 const speed=distance(s.velocity),indicator=s.indicator;
 return <div className="navigation-hud">
  <div className="reticle" aria-label="Sikte"><i/><i/></div>
  <div className="heading-readout"><span>BLICK {heading(skyDirection(s.forward))}</span><span>FÄRD {speed<.0001?'Stilla':heading(skyDirection(s.velocity))} · {speed.toFixed(2)} ljusår/s</span><small>{ahead?`Framför dig: ${ahead.name} · ${formatDistance(ahead.distance)}`:'Ingen katalogstjärna inom 12° från siktet'}</small></div>
  <div className={'destination-marker '+(indicator.visible?'in-view':'off-screen')} style={{left:indicator.visible?`${50+indicator.x*50}%`:`clamp(75px, ${50+indicator.x*50}%, calc(100% - 75px))`,top:`${50+indicator.y*50}%`}}>
   <span className="destination-symbol" style={indicator.visible?undefined:{transform:`rotate(${indicator.angle}deg)`}}>{indicator.visible?'◇':'➜'}</span>
   <span>{destination.name}<small>{formatDistance(distance(destination.position,s.position))}{indicator.behind?' · bakom dig':''}</small></span>
  </div>
 </div>;
}
