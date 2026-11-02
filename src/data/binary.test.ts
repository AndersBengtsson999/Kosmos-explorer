import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {decodeCatalog} from './binary';
import {searchStars} from './search';
import {distance} from '../math/coordinates';
const buffer=(count:number)=>{const raw=readFileSync(new URL(`../../public/catalog/gaia-${count}.bin`,import.meta.url));return raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength) as ArrayBuffer;};
describe('real Gaia catalogs',()=>{
 it.each([10000,100000])('decodes %s unique real sources with precise IDs',count=>{const stars=decodeCatalog(buffer(count));expect(stars).toHaveLength(count);expect(new Set(stars.map(s=>s.id)).size).toBe(count);expect(stars[0].id).toBe('Gaia DR3 5853498713190525696');expect(distance(stars[0].position)).toBeCloseTo(4.246,2);expect(stars.every(s=>s.parallax>5&&s.parallax/s.parallaxError!>20)).toBe(true);});
 it('supports normalized catalog-ID and accented-name search',()=>{const stars=decodeCatalog(buffer(10000));expect(searchStars(stars,'5853498713190525696','name')[0].name).toBe('Proxima Centauri');expect(searchStars(stars,'barnards stjarna','name')[0].name).toBe('Barnards stjärna');});
 it('finds the nearest star relative to an arbitrary current position',()=>{const stars=decodeCatalog(buffer(10000));expect(searchStars(stars,'','nearby',stars[730].position)[0].id).toBe(stars[730].id);});
 it('rejects truncation and duplicate identities',()=>{expect(()=>decodeCatalog(new ArrayBuffer(63))).toThrow();const raw=buffer(10000).slice(0,128);new Uint8Array(raw).copyWithin(64,0,64);expect(()=>decodeCatalog(raw)).toThrow();});
});
