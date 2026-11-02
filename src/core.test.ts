import {describe,it,expect,beforeEach} from 'vitest';
import {position,distance,PC_TO_LY} from './math/coordinates';
import {catalog,parseCatalog} from './data/catalog';
import raw from './data/stars.json';
import {movement} from './simulation/motion';
import {useStore} from './state';
describe('ICRS conversion',()=>{
 it('maps the three cardinal axes into a right-handed render frame',()=>{expect(position(0,0,1000)[0]).toBeCloseTo(PC_TO_LY);expect(position(90,0,1000)[2]).toBeCloseTo(-PC_TO_LY);expect(position(0,90,1000)[1]).toBeCloseTo(PC_TO_LY);});
 it('preserves radial distance',()=>expect(distance(position(217,-62,768))).toBeCloseTo(1000/768*PC_TO_LY));
 it('places Proxima about 4.25 light years away',()=>expect(distance(catalog[1].position)).toBeCloseTo(4.246,2));
});
describe('catalog and import',()=>{
 it('contains 150 unique measured Gaia sources plus the origin',()=>{expect(catalog).toHaveLength(151);expect(new Set(catalog.map(s=>s.id)).size).toBe(151);expect(raw.every(s=>s.parallax>40&&s.epoch===2016&&s.parallax/s.parallaxError>20)).toBe(true);});
 it('rejects duplicate IDs and the reserved origin',()=>{expect(()=>parseCatalog([raw[0],raw[0]])).toThrow();expect(()=>parseCatalog([{...raw[0],id:'sun'}])).toThrow();});
 it.each([{ra:360},{dec:-91},{parallax:0},{epoch:NaN},{source:''},{mag:'8'},{parallaxError:-1}])('rejects malformed values %o',patch=>expect(()=>parseCatalog([{...raw[0],...patch}])).toThrow());
 it('recomputes positions instead of trusting supplied coordinates',()=>expect(parseCatalog([{...raw[0],position:[999,999,999]}])[0].position).toEqual(catalog[1].position));
 it('accepts explicitly unknown photometry',()=>expect(parseCatalog([{...raw[0],mag:null,bpRp:null}])[0].mag).toBeNull());
 it('rejects empty and oversized imports',()=>{expect(()=>parseCatalog([])).toThrow();expect(()=>parseCatalog(Array(100001).fill(raw[0]))).toThrow();});
});
describe('flight integration',()=>{
 it('normalizes diagonal movement',()=>expect(distance(movement(new Set(['KeyW','KeyD']),10,.02))).toBeCloseTo(.2));
 it('cancels opposing inputs',()=>expect(movement(new Set(['KeyW','KeyS']),10,.02)).toEqual([0,0,0]));
 it('clamps long frames to avoid jumps',()=>expect(distance(movement(new Set(['KeyW']),10,5))).toBeCloseTo(.5));
});
describe('navigation state',()=>{
 beforeEach(()=>useStore.setState({stars:catalog,selected:'sun',mode:'map',travel:{id:'sun',nonce:0}}));
 it('allows repeated trips to the same destination',()=>{useStore.getState().go(catalog[1].id);useStore.getState().go(catalog[1].id);expect(useStore.getState().travel.nonce).toBe(2);});
 it('resets selection and destination after replacing a catalog',()=>{useStore.getState().go(catalog[1].id);useStore.getState().importStars(parseCatalog([raw[2]]));expect(useStore.getState().selected).toBe('sun');expect(useStore.getState().stars).toHaveLength(2);});
});

import {FlightInput} from './navigation/flightInput';
import {searchStars,PAGE_SIZE} from './data/search';
describe('independent flight controls',()=>{
 it('releasing a pointer preserves a held keyboard key',()=>{const input=new FlightInput();input.press('keyboard:KeyW','KeyW');input.press('pointer:1','KeyW');input.release('pointer:1');expect(input.keys().has('KeyW')).toBe(true);});
 it('supports multiple fingers and clears on interruption',()=>{const input=new FlightInput();input.press('pointer:1','KeyW');input.press('pointer:2','KeyE');expect(input.keys().size).toBe(2);input.clear();expect(input.keys().size).toBe(0);});
});
describe('catalog browsing',()=>{
 it('makes every star reachable across pages',()=>{const results=searchStars(catalog,'','distance');const ids=[];for(let i=0;i<results.length;i+=PAGE_SIZE)ids.push(...results.slice(i,i+PAGE_SIZE).map(s=>s.id));expect(new Set(ids).size).toBe(151);});
 it('trims queries and searches names and IDs',()=>{expect(searchStars(catalog,' proxima ','name')[0].name).toBe('Proxima Centauri');expect(searchStars(catalog,raw[0].id,'name')).toHaveLength(1);});
 it('sorts by distance without mutating the original',()=>{const input=[catalog[2],catalog[0],catalog[1]];expect(searchStars(input,'','distance')[0].id).toBe('sun');expect(input[0].id).toBe(catalog[2].id);});
 it('restores the bundled catalog after import',()=>{useStore.getState().importStars(parseCatalog([raw[0]]));useStore.getState().resetCatalog();expect(useStore.getState().stars).toHaveLength(151);expect(useStore.getState().selected).toBe('sun');});
});
