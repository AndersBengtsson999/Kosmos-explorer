import {decodeCatalog} from './binary';
self.onmessage=async(event:MessageEvent<{count:number}>)=>{
 try{
  const response=await fetch(`/catalog/gaia-${event.data.count}.bin`);
  if(!response.ok)throw Error(`HTTP ${response.status}`);
  const stars=decodeCatalog(await response.arrayBuffer());
  if(stars.length!==event.data.count)throw Error('Katalogens antal stämmer inte');
  self.postMessage({stars});
 }catch(error){self.postMessage({error:`Katalogdata kunde inte laddas: ${(error as Error).message}. Befintliga stjärnor behålls.`});}
};
