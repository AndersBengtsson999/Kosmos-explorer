import {flightInput} from '../navigation/flightInput';
const directions = [['Fram', 'KeyW'], ['Bak', 'KeyS'], ['Vänster', 'KeyA'], ['Höger', 'KeyD'], ['Upp', 'KeyE'], ['Ned', 'KeyQ']];
export function FlightControls() {
  return <div className="touch-controls" aria-label="Flygriktning">
    {directions.map(([label, code]) => <button key={code}
      onPointerDown={event => {
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        flightInput.press(`pointer:${event.pointerId}`, code);
      }}
      onPointerUp={event => flightInput.release(`pointer:${event.pointerId}`)}
      onPointerCancel={event => flightInput.release(`pointer:${event.pointerId}`)}
      onLostPointerCapture={event => flightInput.release(`pointer:${event.pointerId}`)}
    >{label}</button>)}
  </div>;
}
