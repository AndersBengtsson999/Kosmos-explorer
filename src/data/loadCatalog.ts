import {useStore} from '../state';
import {sun,type Star} from './catalog';
let worker:Worker|undefined;
export function cancelCatalogLoad(){worker?.terminate();worker=undefined;}
export function loadCatalog(count:10000|100000){
 worker?.terminate();
 useStore.setState({catalogStatus:`Laddar ${count.toLocaleString('sv')} Gaia-stjärnor…`,catalogError:false});
 const current=new Worker(new URL('./catalog.worker.ts',import.meta.url),{type:'module'});worker=current;
 const fail=(message:string)=>{useStore.setState({catalogStatus:message,catalogError:true});current.terminate();};
 current.onerror=()=>fail('Katalogdata kunde inte laddas. Befintliga stjärnor behålls.');
 current.onmessage=(event:MessageEvent<{stars?:Star[];error?:string}>)=>{
  if(event.data.error){fail(event.data.error);return;}
  const stars=[sun,...event.data.stars!],state=useStore.getState();
  const selected=stars.some(star=>star.id===state.selected)?state.selected:'sun';
  const activeTarget=stars.some(star=>star.id===state.travel.id);
  useStore.setState({stars,selected,catalogStatus:`${stars.length-1} Gaia DR3-stjärnor`,catalogError:false,...(!activeTarget?{cancelRequest:state.cancelRequest+1}:{})});
  current.terminate();
 };
 current.postMessage({count});
}
