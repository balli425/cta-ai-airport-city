import { scheduleMarkup } from './schedule.js?v=20261023-6';
const $ = s => document.querySelector(s);
const modal = $('#modal'), toastEl = $('#toast');
let data, summaries, pageManifest, world, current = 'foundation', toastTimer;
let summaryView='guide', summaryPage=0, scheduleFilter='all';
const sizeSelector=document.querySelector('#text-size');
try { const saved=localStorage.getItem('cta-text-size'); if(['1','1.15','1.3'].includes(saved)) sizeSelector.value=saved; } catch {}
document.documentElement.style.setProperty('--ui-scale',sizeSelector.value);
sizeSelector.addEventListener('change',()=>{document.documentElement.style.setProperty('--ui-scale',sizeSelector.value);try{localStorage.setItem('cta-text-size',sizeSelector.value)}catch{}});
document.querySelector('#panel-toggle').addEventListener('click',()=>{const hidden=document.body.classList.toggle('panel-hidden');document.querySelector('#panel-toggle').setAttribute('aria-expanded',String(!hidden));});
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function toast(message) { toastEl.textContent=message;toastEl.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toastEl.classList.remove('show'),4200); }
function select(id, focus=false) {
  const c=data.courses.find(c=>c.id===id); if(!c)return;
  current=id;
  document.documentElement.style.setProperty('--accent',c.color);
  document.querySelectorAll('[data-course]').forEach(el=>{if(el.getAttribute('role')==='tab')el.setAttribute('aria-selected',String(el.dataset.course===id));});
  document.querySelectorAll('.island-label').forEach(el=>{el.classList.toggle('selected',el.dataset.island===id);el.setAttribute('aria-pressed',String(el.dataset.island===id));});
  const panel=$('#course-detail');
  panel.setAttribute('aria-labelledby','tab-'+id);
  panel.innerHTML=`<div class="detail-eyebrow">${c.english}</div><h3>${c.tagline}</h3><p class="detail-desc">${c.description}</p><ul class="topic-list">${c.topics.map(t=>`<li>${t}</li>`).join('')}</ul><div class="outcome"><span>在這棟建築，你會學到</span><p>${c.outcome}</p></div><div class="detail-actions"><button class="primary" data-modal="schedule" data-schedule-course="${c.id}">查看班次與地點 <span>↗</span></button><button class="secondary" data-modal="summary">上課摘要</button></div>`;
  if(focus) world?.focus(id);
}

function openSummary(id, focus=true) {
  select(id,focus);summaryView='guide';summaryPage=pageManifest[id].initialPage;showModal('summary');
}
function renderSummary() {
  const c=data.courses.find(c=>c.id===current), guide=summaries[current], source=pageManifest[current];
  const navigation=`<div class="summary-switch" aria-label="切換課程摘要">${data.courses.map(k=>`<button data-summary-course="${k.id}" aria-pressed="${k.id===current}">${k.name}</button>`).join('')}</div><div class="summary-mode-tabs" role="tablist" aria-label="摘要閱讀方式"><button role="tab" aria-selected="${summaryView==='guide'}" data-summary-view="guide">重點導讀</button><button role="tab" aria-selected="${summaryView==='pages'}" data-summary-view="pages">課堂摘要頁 · ${source.pages.length}頁</button></div>`;
  let content;
  if(summaryView==='guide') {
    content=`<p class="summary-lead">${guide.lead}</p><div class="summary-meta"><div><h3>適合誰來上課</h3><p>${guide.audience}</p></div><div><h3>你會帶走什麼</h3><p>${guide.takeaway}</p></div></div>${guide.sections.map(section=>`<section class="summary-section"><h3>${section.title}</h3><p>${section.body}</p><ul>${section.bullets.map(t=>`<li>${t}</li>`).join('')}</ul></section>`).join('')}<section class="summary-prep"><h3>課前準備</h3><ul>${guide.prepare.map(t=>`<li>${t}</li>`).join('')}</ul></section><div class="schedule-action"><button class="primary" data-summary-view="pages">閱讀課堂摘要頁 <span>↗</span></button><button class="secondary" data-modal="schedule" data-schedule-course="${c.id}">查看班次與地點</button></div>`;
  } else {
    summaryPage=Math.max(0,Math.min(source.pages.length-1,summaryPage));
    const page=source.pages[summaryPage];
    content=`<div class="page-toolbar"><span class="page-counter">${summaryPage+1} / ${source.pages.length} 頁</span><button data-page-step="-1" ${summaryPage===0?'disabled':''} aria-label="上一頁摘要">← 上一頁</button><button data-page-step="1" ${summaryPage===source.pages.length-1?'disabled':''} aria-label="下一頁摘要">下一頁 →</button><a href="./${page.src}" target="_blank" rel="noopener noreferrer">放大閱讀 ↗</a></div><div class="page-jumps" aria-label="摘要頁目錄">${source.pages.map((p,i)=>`<button data-summary-page="${i}" aria-current="${i===summaryPage}">${i+1} ${p.title}</button>`).join('')}</div><p class="summary-page-caption">${source.sourceLabel} · ${page.title}（原第${page.sourcePage}頁）</p><div class="summary-page"><img src="./${page.src}" alt="${c.name}：${page.title}，可點上方放大閱讀" width="${page.width}" height="${page.height}"></div><p class="source-note">課堂教材節錄；各班實作安排與課前準備請參閱開班通知。</p>`;
  }
  $('#modal-body').innerHTML=navigation+content;
}

function showModal(type) {
  if(type==='detail')type='summary';
  modal.dataset.kind=type;
  const c=data.courses.find(c=>c.id===current), body=$('#modal-body');
  $('#modal-eyebrow').textContent={courses:'THREE WAYS TO BEGIN',schedule:'COURSES & REGISTRATION',about:'ABOUT CTARCH',summary:c.english+' / CLASS NOTES',detail:c.english,history:'LEARNING RECORDS',help:'HOW TO EXPLORE'}[type]||'';
  $('#modal-title').textContent={courses:'選一棟建築，開始你的課程。',schedule:'下一堂，一起動手做。',about:'把專業，帶進 AI 的可能。',summary:c.name+' · 上課摘要',detail:c.name+' · 課程介紹',history:'一路動手做，一起累積。',help:'用自己的步調，探索空港城。'}[type]||'';
  if(type==='courses'){
    body.innerHTML=`<div class="course-grid">${data.courses.map(c=>`<article class="course-card" style="--card-color:${c.color}"><span class="big-num">${c.number}</span><h3>${c.name}</h3><p>${c.description}</p><button data-select="${c.id}">閱讀上課摘要 ↗</button></article>`).join('')}</div><div class="course-outcomes"><article><h3>一張圖，打開設計方向</h3><p>帶手繪或模型截圖，練習描述與修改，把想像變成可以討論的畫面。</p></article><article><h3>一個空間，說成一段故事</h3><p>用分鏡、運鏡、配樂與剪接，讓設計的情境與節奏被看見。</p></article><article><h3>一件工作，做成自己的工具</h3><p>帶真實題目來，練習整理依據、交代需求和逐項驗收。</p></article></div><p class="source-note">三大課程可依需求選擇；每次開班的範圍、時數與自備設備，以該班招生說明為準。</p>`;
  }else if(type==='summary'){
    renderSummary();
  }else if(type==='schedule'){
    body.innerHTML=scheduleMarkup(data,scheduleFilter);
  }else if(type==='history'){
    body.innerHTML=`<div class="dialog-copy"><p>從設計圖像、空間影片，到日常工具，課程隨著真實工作題目持續前進。</p></div><div class="stats-grid">${data.statistics.map(s=>`<article class="stat-card"><b>${s.value}<small>${s.unit}</small></b><h3>${s.label}</h3><p>${s.basis}</p></article>`).join('')}</div>${data.history.map(h=>`<article class="history-item"><span class="badge">${h.date} · ${h.value}</span><h3>${h.name}</h3><p>${h.note}</p></article>`).join('')}<details class="dialog-copy"><summary>統計口徑說明</summary><p>課程與演講以人次累計，同一人參加不同課程會分別計入。報名人數與實際出席人數分別計算。</p></details><div class="schedule-action"><button class="primary" data-modal="courses">找到適合你的課程 <span>↗</span></button></div>`;
  }else if(type==='about'){
    body.innerHTML=`<img class="about-cover" src="./assets/cta-core-value.jpg" alt="築匠AI：為建築師打造的專業助推器，將人工智慧從概念轉化為建築實務的產能"><div class="about-brand"><img src="./assets/cta-logo-original.jpg" alt="CTArch LOGO"><div><h3>築匠建築師事務所</h3><p class="dialog-copy">建築 × AI × 實務協作</p></div></div><div class="dialog-copy"><p>從建築與設計工作的真實題目出發，把 AI 帶進圖像、空間敘事與日常工作流程。</p><p>我們希望課堂留下的，不只是工具名稱，而是能拿來做事的方法：整理依據、說清楚需求、親手練習、逐項驗收。</p><h3>三棟建築，三種實作方式</h3><p>AI 基礎班探索圖片、文書與小工具；AI 動畫班串起概念圖、分鏡與影片；AI 代理人班把規則、資料與驗收連成可重複使用的工作流。</p></div><p class="source-note">築匠 AI 空港城 · 建築 × AI × 實務協作</p>`;
  }else if(type==='help'){
    body.innerHTML='<div class="dialog-copy"><h3>看見全貌</h3><p>一般導覽以左鍵拖曳平移、中鍵拖曳旋轉、滾輪縮放；觸控可用手勢操作。「全景」會回到整座城市的總覽。</p><h3>像遊戲一樣自由漫遊</h3><p>點「自由漫遊」進入城市。W/S 前後、A/D 左右，按住滑鼠左鍵拖曳轉向；Q/E 降低或升高，Shift 加速。按 Esc 或「全景」返回總覽。輸入欄與課程視窗不會接收移動按鍵。</p><h3>走進一棟建築</h3><p>點選城市內的課程建築、標籤或課程清單，直接閱讀上課摘要；可切換重點導讀和教材頁面。使用鍵盤時，可按 Tab 移至課程清單，再用左右或上下方向鍵切換。</p><h3>換一種氛圍</h3><p>切換日間與夜間，或暫停場景動畫。減少動態效果的系統偏好會自動套用。</p><h3>準備上課</h3><p>「課程與報名」會列出已有的班次資訊，並提供開放班次的報名入口。</p></div>';
  }
  if(!modal.open) modal.showModal();
  modal.scrollTop=0;
}
document.addEventListener('click',async e=>{
  const b=e.target.closest('button,a');if(!b)return;
  if(b.dataset.course){openSummary(b.dataset.course,true);return}
  if(b.dataset.island){openSummary(b.dataset.island,true);return}
  if(b.dataset.select){openSummary(b.dataset.select,true);return}
  if(b.dataset.summaryCourse){openSummary(b.dataset.summaryCourse,true);return}
  if(b.dataset.summaryView){summaryView=b.dataset.summaryView;renderSummary();return}
  if(b.dataset.summaryPage!==undefined){summaryPage=Number(b.dataset.summaryPage);renderSummary();return}
  if(b.dataset.pageStep){summaryPage+=Number(b.dataset.pageStep);renderSummary();return}
  if(b.dataset.scheduleFilter){scheduleFilter=b.dataset.scheduleFilter;showModal('schedule');return}
  if(b.dataset.modal){e.preventDefault();if(b.dataset.modal==='schedule')scheduleFilter=b.dataset.scheduleCourse||'all';showModal(b.dataset.modal);return}
  if(b.classList.contains('close'))modal.close();
  if(b.id==='copy-link'){try{await navigator.clipboard.writeText(data.enrollment.formUrl);toast('已複製報名連結。');}catch{toast('可使用「課程報名表」開啟連結。');}}
  if(b.dataset.view==='explore'){world?.reset();$('#roam').setAttribute('aria-pressed','false');window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
});
$('#course-tabs').addEventListener('keydown',e=>{
  if(!['ArrowRight','ArrowDown','ArrowLeft','ArrowUp','Home','End'].includes(e.key))return;
  e.preventDefault();const list=data.courses;let n=list.findIndex(c=>c.id===current);
  n=e.key==='Home'?0:e.key==='End'?2:(n+(['ArrowRight','ArrowDown'].includes(e.key)?1:2))%3;
  select(list[n].id,true);$('#tab-'+list[n].id).focus();
});
modal.addEventListener('click',e=>{if(e.target===modal){const r=modal.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)modal.close();}});
$('#sound').addEventListener('click',()=>showModal('help'));
$('#reset').addEventListener('click',()=>{world?.reset();$('#roam').setAttribute('aria-pressed','false');});
$('#roam').addEventListener('click',()=>{const active=$('#roam').getAttribute('aria-pressed')!=='true';$('#roam').setAttribute('aria-pressed',String(active));world?.setRoaming(active);if(active)toast('WASD 移動・拖曳滑鼠轉向・Q/E 升降・Shift 加速・Esc 回全景');else world?.reset();});
let night=false,paused=matchMedia('(prefers-reduced-motion: reduce)').matches;
function motionLabel(){const b=$('#motion');b.setAttribute('aria-pressed',String(paused));b.innerHTML=paused?'▷ <span>播放</span>':'Ⅱ <span>暫停</span>';}
motionLabel();
$('#daynight').addEventListener('click',()=>{night=!night;document.body.classList.toggle('night',night);$('#daynight').setAttribute('aria-pressed',String(night));$('#daynight').innerHTML=night?'☾ <span>夜間</span>':'☼ <span>日間</span>';world?.setNight(night);});
$('#motion').addEventListener('click',()=>{paused=!paused;motionLabel();world?.setPaused(paused);});
try{
  const resources=await Promise.all(['./courses.json?v=20261023-6','./summaries.json','./summary-pages.json'].map(async url=>{const response=await fetch(url);if(!response.ok)throw Error('課程資料載入失敗');return response.json()}));
  [data,summaries,pageManifest]=resources;select('foundation');
  const {createWorld}=await import('./world.js?v=20261023-6');
  world=createWorld($('#scene'),$('#labels'),data.courses,id=>openSummary(id,false));
  world.setPaused(paused);$('#loading').hidden=true;
}catch(error){
  console.error('空港城初始化失敗',error);$('#loading').hidden=true;$('#scene-error').hidden=false;
}
