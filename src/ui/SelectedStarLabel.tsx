import {useStore} from '../state';
export function SelectedStarLabel(){
 const s=useStore();if(s.mode==='ship'||s.journey.active||!s.indicator.visible)return null;
 const star=s.stars.find(star=>star.id===s.selected);
 return <div className="map-star-label" style={{left:`${50+s.indicator.x*50}%`,top:`${50+s.indicator.y*50}%`}}>◇ {star?.name}</div>;
}
