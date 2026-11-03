import {radiusInfo} from '../math/stellar';
import {formatDistance,journeyPercent,journeyStatus} from '../math/distanceFormat';
import {useStore} from '../state';
import {distance} from '../math/coordinates';
export function JourneyPanel(){
 const s=useStore(),destination=s.stars.find(star=>star.id===s.travel.id);
 if(!destination||(!s.journey.active&&!s.journey.arrived))return null;
 const arrived=s.journey.arrived,percent=journeyPercent(s.journey.progress,arrived);
 return <section className={(arrived?'arrival-notice':'travel-status')+' panel journey-panel'} aria-label={arrived?'Avslutad resa':'Pågående resa'}>
  <h2>{arrived?'Framme vid':'Resa till'} {destination.name}</h2>
  <div className="journey-summary"><span role="status">{arrived?'Framme':journeyStatus(s.journey.progress,s.journey.paused)}</span><span aria-label="Genomförd resa">{percent} % av restiden</span></div>
  <progress aria-label="Resans förlopp" max="100" value={percent}/>
  <dl className="journey-distances"><div><dt>Kvar till ankomstpunkten</dt><dd>{formatDistance(arrived?0:s.journey.remaining)}</dd></div><div><dt>Till stjärnans centrum</dt><dd>{formatDistance(distance(destination.position,s.position))}</dd></div></dl>
  <p className="journey-help">Ankomstpunkten ligger utanför stjärnans yta. Centrum ligger längre in.</p>
  {!radiusInfo(destination).known&&<small>Illustrativ radie: 1 solradie · verklig radie saknas.</small>}
  <div className="journey-actions">{!arrived&&<><button onClick={s.togglePause}>{s.journey.paused?'Återuppta':'Pausa'}</button><button onClick={s.cancelTravel}>Avbryt resa</button></>}<button onClick={s.aim}>Rikta mot destination</button>{arrived&&<button aria-label="Stäng ankomstmeddelande" onClick={()=>useStore.setState({journey:{...s.journey,arrived:false}})}>Stäng</button>}</div>
 </section>;
}
