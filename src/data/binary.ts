import {position} from '../math/coordinates';
import type {Star} from './catalog';
const names:Record<string,string>={'5853498713190525696':'Proxima Centauri','4472832130942575872':'Barnards stjärna'};
export function decodeCatalog(buffer:ArrayBuffer):Star[]{
 if(buffer.byteLength===0||buffer.byteLength%64||buffer.byteLength>6400000)throw Error('Ogiltig binär Gaia-katalog');
 const view=new DataView(buffer),stars:Star[]=[],seen=new Set<string>();
 for(let offset=0;offset<buffer.byteLength;offset+=64){
  const sourceId=view.getBigUint64(offset,true).toString(),id=`Gaia DR3 ${sourceId}`;
  const values=Array.from({length:7},(_,i)=>view.getFloat64(offset+8+i*8,true));
  const [ra,dec,parallax,error,mag,bpRp,temperature]=values;
  if(seen.has(id)||!Number.isFinite(ra)||ra<0||ra>=360||!Number.isFinite(dec)||Math.abs(dec)>90||!Number.isFinite(parallax)||parallax<=0||!Number.isFinite(error)||error<0)throw Error('Ogiltiga astrometriska data');
  seen.add(id);
  stars.push({id,name:names[sourceId]??id,ra,dec,parallax,parallaxError:error,mag:Number.isFinite(mag)?mag:null,bpRp:Number.isFinite(bpRp)?bpRp:null,temperature:Number.isFinite(temperature)?temperature:null,epoch:2016,source:'Gaia DR3',position:position(ra,dec,parallax)});
 }
 return stars;
}
