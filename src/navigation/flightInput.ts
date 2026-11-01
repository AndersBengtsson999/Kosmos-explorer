/** Independent input sources prevent one finger/key release from cancelling another. */
export class FlightInput {
  private sources = new Map<string, string>();
  press(source: string, code: string) { this.sources.set(source, code); }
  release(source: string) { this.sources.delete(source); }
  clear() { this.sources.clear(); }
  keys() { return new Set(this.sources.values()); }
}
export const flightInput = new FlightInput();
export const flightCodes = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyQ', 'KeyE']);
