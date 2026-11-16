// 網站使用人次與使用狀況（kvdb.io，與築匠其他網頁同一個儲存區，以 airport_ 前綴區分）。
// 同一個瀏覽工作階段只記一次；本機預覽（localhost）只讀不寫，避免測試灌數字。
export const COUNTER_API='https://kvdb.io/UpdkEy78HzmGeeQsNQHcU2/airport_';
export const taipeiDate=(d=new Date())=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).format(d);
const local=/^(localhost|127\.|\[::1\])/.test(location.hostname);
function firstTime(key){try{if(sessionStorage.getItem(key))return false;sessionStorage.setItem(key,'1');}catch{}return true;}
const read=key=>fetch(COUNTER_API+key).then(r=>r.ok?r.text():'0').then(v=>parseInt(v)||0);
const add=key=>fetch(COUNTER_API+key,{method:'PATCH',body:'+1'}).then(r=>r.ok?r.text():'0').then(v=>parseInt(v)||0);

export function recordVisit(){
  const day=taipeiDate(),month=day.slice(0,7),year=day.slice(0,4);
  const write=!local&&firstTime('airport_visit_recorded');
  return Promise.all(['dy_'+day,'mo_'+month,'yr_'+year,'total'].map(k=>(write?add(k):read(k)).catch(()=>null)));
}
export function recordUse(kind){
  if(local||!/^[a-z0-9_-]+$/.test(kind)||!firstTime('airport_use_'+kind))return;
  const month=taipeiDate().slice(0,7);
  add('use_'+kind+'_total').catch(()=>{});add('use_'+kind+'_mo_'+month).catch(()=>{});
}
