const KEY="lull.app.v1";
const pad=n=>String(n).padStart(2,"0");
const iso=d=>d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
const TODAY=iso(new Date());
const addDays=(base,n)=>{const d=new Date(base+"T00:00");d.setDate(d.getDate()+n);return iso(d)};
let sc=Date.now();const uid=()=>(sc++).toString(36);
function nextWeekend(){const d=new Date();let diff=(6-d.getDay()+7)%7||7;return addDays(TODAY,diff)}

function seed(){return{
  goals:[{id:uid(),t:"Talk to 3 ADHD users",done:false},{id:uid(),t:"Ship Today view",done:false},{id:uid(),t:"One evening fully off",done:true}],
  items:[
    {id:uid(),text:"Draft the r/ADHD launch post",task:true,done:false,due:TODAY,someday:false,evening:false,project:"App",ts:Date.now()-9e6},
    {id:uid(),text:"Reply to Krishni about the roadmap",task:true,done:false,due:addDays(TODAY,-1),someday:false,evening:false,project:"App",ts:Date.now()-8e6},
    {id:uid(),text:"Book the dentist",task:true,done:false,due:TODAY,someday:false,evening:false,project:"Home",ts:Date.now()-7e6},
    {id:uid(),text:"20 min evening yoga",task:true,done:false,due:TODAY,someday:false,evening:true,project:"Health",ts:Date.now()-6e6},
    {id:uid(),text:"Order the water filter",task:true,done:false,due:addDays(TODAY,1),someday:false,evening:false,project:"Home",ts:Date.now()-5e6},
    {id:uid(),text:"Prep Monday standup",task:true,done:false,due:addDays(TODAY,3),someday:false,evening:false,project:"App",ts:Date.now()-4.5e6},
    {id:uid(),text:"Think about the fig plant",task:false,done:false,due:null,someday:false,evening:false,project:"",ts:Date.now()-4e6},
    {id:uid(),text:"Call mom on Sunday",task:true,done:false,due:null,someday:false,evening:false,project:"",ts:Date.now()-3.5e6},
    {id:uid(),text:"Idea: calmer weekly review",task:false,done:false,due:null,someday:false,evening:false,project:"",ts:Date.now()-3e6},
    {id:uid(),text:"Learn watercolour",task:true,done:false,due:null,someday:true,evening:false,project:"",ts:Date.now()-2e6},
  ]}}
let db=load();function load(){try{const r=localStorage.getItem(KEY);if(r)return JSON.parse(r)}catch(e){}const s=seed();save(s);return s}
function save(x){localStorage.setItem(KEY,JSON.stringify(x||db))}
const items=()=>db.items;
let view="capture",briefDismissed=false,calMonth=new Date().getMonth(),calYear=new Date().getFullYear(),calSel=TODAY;

// action menu
let openMenu=null;
function menu(x,y,opts){closeMenu();const m=document.createElement("div");m.className="menu";
  opts.forEach(o=>{if(o==="-"){const s=document.createElement("div");s.className="msep";m.appendChild(s);return}
    const b=document.createElement("button");b.textContent=o.t;if(o.danger)b.style.color="var(--warn)";
    b.onclick=ev=>{ev.stopPropagation();closeMenu();o.f()};m.appendChild(b)});
  document.body.appendChild(m);const r=m.getBoundingClientRect();
  m.style.left=Math.max(8,Math.min(x,innerWidth-r.width-8))+"px";m.style.top=Math.min(y,innerHeight-r.height-8)+"px";
  openMenu=m;setTimeout(()=>document.addEventListener("click",closeMenu,{once:true}),0)}
function closeMenu(){if(openMenu){openMenu.remove();openMenu=null}}
function addQuick(due,evening){const t=prompt("New task");if(t&&t.trim()){
  items().unshift({id:uid(),text:t.trim(),task:true,done:false,due:due||null,someday:false,evening:!!evening,project:"",ts:Date.now()});save();renderAll()}}
function applyTarget(it,tg){it.someday=false;it.evening=false;it.task=true;
  if(tg==="Today"){it.due=TODAY}else if(tg==="This weekend"){it.due=nextWeekend()}else if(tg==="Next week"){it.due=addDays(TODAY,7)}else{it.someday=true;it.due=null}}

function fmtDue(due){if(!due)return null;if(due<TODAY)return{t:"Overdue",over:true};if(due===TODAY)return{t:"Today"};if(due===addDays(TODAY,1))return{t:"Tomorrow"};
  return{t:new Date(due+"T00:00").toLocaleDateString(undefined,{weekday:"short",day:"numeric"})}}

function taskRow(it,opts={}){
  const el=document.createElement("div");el.className="task"+(it.done?" done":"");
  const cb=document.createElement("button");cb.className="cb"+(it.done?" on":"");
  cb.onclick=()=>{it.done=!it.done;if(it.done)it.task=true;save();renderAll()};
  if(it.task)el.appendChild(cb);else{const sp=document.createElement("span");sp.style.cssText="width:22px;flex:0 0 auto;color:var(--ink-faint);text-align:center;margin-top:1px";sp.textContent="»";el.appendChild(sp)}
  const body=document.createElement("div");body.className="tbody";
  const tx=document.createElement("div");tx.className="ttext";tx.textContent=it.text;
  tx.onclick=()=>{if(it.task&&!it.done)openFocus(it);};
  body.appendChild(tx);
  const meta=document.createElement("div");meta.className="tmeta";
  const df=fmtDue(it.due);
  if(df&&!it.someday){const c=document.createElement("span");c.className="chip due"+(df.over?" over":"");c.textContent=df.t;c.onclick=()=>openSchedule(it);meta.appendChild(c)}
  if(it.someday){const c=document.createElement("span");c.className="chip eve";c.textContent="Someday";c.onclick=()=>openSchedule(it);meta.appendChild(c)}
  if(it.evening){const c=document.createElement("span");c.className="chip eve";c.textContent="This evening";meta.appendChild(c)}
  if(it.project){const c=document.createElement("span");c.className="chip proj";c.textContent=it.project;meta.appendChild(c)}
  if(!it.due&&!it.someday&&opts.showAdd!==false){const c=document.createElement("span");c.className="chip add";c.textContent="＋ Schedule";c.onclick=()=>openSchedule(it);meta.appendChild(c)}
  if(meta.children.length)body.appendChild(meta);
  el.appendChild(body);
  const act=document.createElement("span");act.className="tact";act.textContent="⋯";
  act.onclick=e=>{e.stopPropagation();const r=e.target.getBoundingClientRect();menu(r.right-170,r.bottom+4,[
    {t:"Edit",f:()=>{const t=prompt("Edit",it.text);if(t!==null&&t.trim()){it.text=t.trim();save();renderAll()}}},
    {t:it.task?"Make a note":"Make a task",f:()=>{it.task=!it.task;save();renderAll()}},
    {t:"Reschedule…",f:()=>openSchedule(it)},
    {t:it.evening?"Not this evening":"This evening",f:()=>{it.due=TODAY;it.task=true;it.someday=false;it.evening=!it.evening;save();renderAll()}},
    "-",{t:"Delete",danger:true,f:()=>{const i=items().indexOf(it);items().splice(i,1);save();renderAll()}}
  ])};
  el.appendChild(act);
  return el;
}

/* CAPTURE */
document.getElementById("capDate").textContent=new Date().toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"})+"  ·  app v13";
function renderCapture(){
  const box=document.getElementById("capList");box.innerHTML="";
  const inbox=items().filter(i=>!i.done&&!i.someday&&!i.due).sort((a,b)=>b.ts-a.ts);
  const btn=document.createElement("div");btn.style.cssText="display:flex;justify-content:flex-end;padding:6px 0 2px";
  const eve=document.createElement("button");eve.textContent="🌙 Evening review ("+inbox.length+")";
  eve.style.cssText="border:1px solid var(--rule);background:none;color:var(--ink-soft);font-weight:600;font-size:12.5px;padding:6px 12px;border-radius:20px;cursor:pointer;font-family:var(--sans)";
  eve.onclick=eveningReview;btn.appendChild(eve);box.appendChild(btn);
  if(!inbox.length){const e=document.createElement("div");e.className="empty";e.innerHTML='<span class="b">✨</span>Inbox clear. Capture anything below.';box.appendChild(e);return}
  const l=document.createElement("div");l.className="sec-label";l.textContent="Inbox · unscheduled";box.appendChild(l);
  inbox.forEach(it=>box.appendChild(taskRow(it)));
}
const capInput=document.getElementById("capInput");
function parseCap(raw){let v=raw,task=false,due=null,someday=false,evening=false;
  if(/^(\[\]|\[ \]|\(\))\s*/.test(v)){task=true;v=v.replace(/^(\[\]|\[ \]|\(\))\s*/,"")}
  const low=v.toLowerCase();
  if(/\bsomeday\b/.test(low)){someday=true;task=true;v=v.replace(/\bsomeday\b/ig,"")}
  if(/\btonight\b|\bthis evening\b/.test(low)){due=TODAY;task=true;evening=true;v=v.replace(/\btonight\b|\bthis evening\b/ig,"")}
  else if(/\btoday\b/.test(low)){due=TODAY;task=true;v=v.replace(/\btoday\b/ig,"")}
  else if(/\btomorrow\b/.test(low)){due=addDays(TODAY,1);task=true;v=v.replace(/\btomorrow\b/ig,"")}
  else{const days={sunday:0,monday:1,tuesday:2,wednesday:3,thursday:4,friday:5,saturday:6};
    for(const d in days){if(new RegExp("\\b"+d+"\\b").test(low)){const now=new Date();let diff=(days[d]-now.getDay()+7)%7||7;due=addDays(TODAY,diff);task=true;v=v.replace(new RegExp("\\b"+d+"\\b","ig"),"");break}}}
  v=v.replace(/\s{2,}/g," ").replace(/^[,\s]+|[,\s]+$/g,"").trim();
  return {text:v||raw,task,due,someday,evening}}
capInput.addEventListener("keydown",e=>{if(e.key==="Enter"){const raw=capInput.value.trim();if(!raw)return;const p=parseCap(raw);
  items().unshift({id:uid(),text:p.text,task:p.task,done:false,due:p.due,someday:p.someday,evening:p.evening,project:"",ts:Date.now()});
  save();capInput.value="";renderAll()}});

/* TODAY */
function renderToday(){
  document.getElementById("todayEyebrow").textContent=new Date().toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"});
  const scroll=document.getElementById("todayScroll");scroll.innerHTML="";
  const todays=items().filter(i=>!i.someday&&i.task&&i.due&&i.due<=TODAY);
  const openN=todays.filter(i=>!i.done).length,doneN=todays.filter(i=>i.done).length;
  document.getElementById("todayCount").textContent=openN?openN+" to do":doneN?"all done ✓":"nothing yet";
  // briefing
  if(!briefDismissed){
    const inbox=items().filter(i=>!i.done&&!i.someday&&!i.due).length;
    const b=document.createElement("div");b.className="brief";
    b.innerHTML=`<span class="x" id="briefX">✕</span><h3>Good ${new Date().getHours()<12?"morning":new Date().getHours()<17?"afternoon":"evening"} — here's today</h3>
      <p>${openN} task${openN===1?"":"s"} planned${todays.some(i=>fmtDue(i.due)?.over)?", a couple overdue":""}. ${inbox} still in your inbox — want to pull some into today?</p>
      <div class="row"><button class="go" id="briefGo">Plan my day</button><button class="skip" id="briefSkip">Looks good</button></div>`;
    scroll.appendChild(b);
    b.querySelector("#briefX").onclick=b.querySelector("#briefSkip").onclick=()=>{briefDismissed=true;renderToday()};
    b.querySelector("#briefGo").onclick=eveningReview;
  }
  const now=todays.filter(i=>!i.evening);const eve=todays.filter(i=>i.evening);
  if(!todays.length){const e=document.createElement("div");e.className="empty";e.innerHTML='<span class="b">🍃</span>Nothing planned for today. That\'s allowed.';scroll.appendChild(e)}
  if(now.length){now.sort((a,b)=>(a.done-b.done)||((a.due<b.due)?-1:1));now.forEach(it=>scroll.appendChild(taskRow(it,{showAdd:false})))}
  if(eve.length){const l=document.createElement("div");l.className="sec-label";l.innerHTML='🌙 This evening';scroll.appendChild(l);eve.forEach(it=>scroll.appendChild(taskRow(it,{showAdd:false})))}
  const add=document.createElement("button");add.className="addrow";add.textContent="＋ Add a task for today";add.onclick=()=>addQuick(TODAY,false);scroll.appendChild(add);
}

/* PLAN */
function renderPlan(){
  const scroll=document.getElementById("planScroll");scroll.innerHTML="";
  const g=document.createElement("div");g.className="goals";g.innerHTML='<h3>◆ Goals this week</h3>';
  db.goals.forEach(go=>{const d=document.createElement("div");d.className="goal"+(go.done?" done":"");d.innerHTML='<span class="gk"></span><span class="gt"></span>';
    d.querySelector(".gt").textContent=go.t;d.onclick=()=>{go.done=!go.done;save();renderPlan()};g.appendChild(d)});
  const addg=document.createElement("div");addg.className="goal";addg.style.color="var(--evening)";addg.innerHTML='<span class="gk" style="border-style:dashed"></span><span class="gt" style="font-size:13px">Add a goal…</span>';
  addg.onclick=()=>{const t=prompt("Weekly goal");if(t){db.goals.push({id:uid(),t,done:false});save();renderPlan()}};g.appendChild(addg);
  scroll.appendChild(g);
  for(let k=0;k<7;k++){const day=addDays(TODAY,k);const d=new Date(day+"T00:00");
    const dd=document.createElement("div");dd.className="day";
    const label=k===0?"Today":k===1?"Tomorrow":d.toLocaleDateString(undefined,{weekday:"long"});
    dd.innerHTML=`<div class="dh">${label} <span class="dd">${d.toLocaleDateString(undefined,{month:"short",day:"numeric"})}</span>${k===0?'<span class="today">now</span>':''}</div>`;
    const dayItems=items().filter(i=>!i.someday&&i.task&&i.due===day);
    if(!dayItems.length){const e=document.createElement("div");e.style.cssText="font-size:13px;color:var(--ink-faint);padding:4px 2px 8px";e.textContent="—";dd.appendChild(e)}
    else dayItems.forEach(it=>dd.appendChild(taskRow(it,{showAdd:false})));
    const a=document.createElement("button");a.className="addrow";a.style.margin="2px 2px 8px";a.textContent="＋ Add";a.onclick=()=>addQuick(day,false);dd.appendChild(a);
    scroll.appendChild(dd)}
}

/* CALENDAR */
function renderCalendar(){
  const m=document.getElementById("calMount");m.innerHTML="";
  const head=document.createElement("div");head.className="calhead";
  const mName=new Date(calYear,calMonth,1).toLocaleDateString(undefined,{month:"long",year:"numeric"});
  head.innerHTML=`<h3>${mName}</h3><span class="sp"></span><button id="pm">‹</button><button id="nm">›</button>`;
  m.appendChild(head);
  head.querySelector("#pm").onclick=()=>{calMonth--;if(calMonth<0){calMonth=11;calYear--}renderCalendar()};
  head.querySelector("#nm").onclick=()=>{calMonth++;if(calMonth>11){calMonth=0;calYear++}renderCalendar()};
  const grid=document.createElement("div");grid.className="grid7";
  ["S","M","T","W","T","F","S"].forEach(d=>{const h=document.createElement("div");h.className="dow";h.textContent=d;grid.appendChild(h)});
  const first=new Date(calYear,calMonth,1);const start=first.getDay();const dim=new Date(calYear,calMonth+1,0).getDate();
  const counts={};items().forEach(i=>{if(i.task&&i.due&&!i.someday)counts[i.due]=(counts[i.due]||0)+1});
  for(let i=0;i<start;i++){const c=document.createElement("div");c.className="cell other";grid.appendChild(c)}
  for(let d=1;d<=dim;d++){const day=calYear+"-"+pad(calMonth+1)+"-"+pad(d);const c=document.createElement("div");
    c.className="cell"+(day===TODAY?" today":"")+(day===calSel?" sel":"");c.innerHTML=d+(counts[day]?'<span class="dot"></span>':'');
    c.onclick=()=>{calSel=day;renderCalendar()};grid.appendChild(c)}
  m.appendChild(grid);
  const dayBox=document.createElement("div");dayBox.className="calday";
  dayBox.innerHTML=`<h4>${new Date(calSel+"T00:00").toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"})}</h4>`;
  const dayItems=items().filter(i=>i.task&&i.due===calSel&&!i.someday);
  if(!dayItems.length){const e=document.createElement("div");e.style.cssText="font-size:14px;color:var(--ink-faint);padding:8px 2px";e.textContent="No tasks this day.";dayBox.appendChild(e)}
  else dayItems.forEach(it=>dayBox.appendChild(taskRow(it,{showAdd:false})));
  const a=document.createElement("button");a.className="addrow";a.textContent="＋ Add to this day";a.onclick=()=>addQuick(calSel,false);dayBox.appendChild(a);
  m.appendChild(dayBox);
}

/* SCHEDULE sheet */
function openSchedule(it){
  const sh=document.getElementById("sheet");document.getElementById("sheetTitle").textContent="Schedule";
  document.getElementById("sheetText").textContent='"'+it.text+'"';
  const body=document.getElementById("sheetBody");body.innerHTML="";
  const opts=[["◎","Today",()=>{it.due=TODAY;it.task=true;it.someday=false;it.evening=false}],
    ["→","Tomorrow",()=>{it.due=addDays(TODAY,1);it.task=true;it.someday=false}],
    ["▦","This weekend",()=>{it.due=nextWeekend();it.task=true;it.someday=false}],
    ["📅","Next week",()=>{it.due=addDays(TODAY,7);it.task=true;it.someday=false}],
    ["🌙","Someday",()=>{it.someday=true;it.due=null;it.task=true}],
    ["✕","Clear date",()=>{it.due=null;it.someday=false;it.evening=false}]];
  opts.forEach(([ic,t,fn])=>{const o=document.createElement("div");o.className="opt";o.innerHTML=`<span class="ic">${ic}</span>${t}`;
    o.onclick=()=>{fn();save();closeSheet();renderAll()};body.appendChild(o)});
  const drow=document.createElement("div");drow.className="opt";
  drow.innerHTML='<span class="ic">▤</span>Pick a date <input type="date" class="datein">';
  const di=drow.querySelector("input");di.min=TODAY;di.value=it.due||TODAY;di.onclick=e=>e.stopPropagation();
  di.onchange=()=>{it.due=di.value;it.task=true;it.someday=false;save();closeSheet();renderAll()};
  body.appendChild(drow);
  sh.classList.add("on");
}
function eveningReview(){
  const sh=document.getElementById("sheet");document.getElementById("sheetTitle").textContent="Evening review";
  const inbox=items().filter(i=>!i.done&&!i.someday&&!i.due);
  document.getElementById("sheetText").textContent=inbox.length?"Here's where I'd put these — tap a chip to change, then Confirm all.":"Nothing to sort — inbox is clear.";
  const body=document.getElementById("sheetBody");body.innerHTML="";
  const CYCLE=["Today","This weekend","Next week","Someday"];const chosen={};
  inbox.forEach(it=>{const t=it.text.toLowerCase();
    const sug=/plant|idea|watch|read|learn|someday|trip/.test(t)?"Someday":(/mom|call|sunday|weekend/.test(t)?"This weekend":"Today");
    chosen[it.id]=sug;
    const r=document.createElement("div");r.className="confirmrow";
    r.innerHTML='<span class="t"></span><span class="sug">→ '+sug+'</span>';
    r.querySelector(".t").textContent=it.text;
    const chip=r.querySelector(".sug");chip.title="tap to change";
    chip.onclick=()=>{const i=(CYCLE.indexOf(chosen[it.id])+1)%CYCLE.length;chosen[it.id]=CYCLE[i];chip.textContent="→ "+CYCLE[i]};
    body.appendChild(r)});
  if(inbox.length){const all=document.createElement("div");all.style.cssText="padding-top:14px";
    all.innerHTML='<button style="width:100%;border:none;background:var(--accent);color:#fff;font-weight:650;font-size:15px;padding:13px;border-radius:12px;cursor:pointer;font-family:var(--sans)">Confirm all</button>';
    all.querySelector("button").onclick=()=>{inbox.forEach(it=>applyTarget(it,chosen[it.id]));save();closeSheet();view="today";applyView();renderAll()};
    body.appendChild(all)}
  sh.classList.add("on");
}
function closeSheet(){document.getElementById("sheet").classList.remove("on")}
document.getElementById("sheet").addEventListener("click",e=>{if(e.target.id==="sheet")closeSheet()});

/* FOCUS mode */
let focusItem=null,tmr=null,remain=1500;
function openFocus(it){focusItem=it;remain=1500;document.getElementById("focusText").textContent=it.text;
  document.getElementById("focusTimer").textContent="25:00";document.getElementById("focusStart").textContent="Start";
  document.getElementById("focus").classList.add("on");stopTimer()}
function stopTimer(){if(tmr){clearInterval(tmr);tmr=null}}
document.getElementById("focusStart").onclick=function(){
  if(tmr){stopTimer();this.textContent="Resume";return}
  this.textContent="Pause";
  tmr=setInterval(()=>{remain--;if(remain<=0){remain=0;stopTimer();document.getElementById("focusStart").textContent="Done"}
    document.getElementById("focusTimer").textContent=pad(Math.floor(remain/60))+":"+pad(remain%60)},1000)};
document.getElementById("focusDone").onclick=()=>{if(focusItem){focusItem.done=true;focusItem.task=true;save()}closeFocus();renderAll()};
document.getElementById("focusClose").onclick=closeFocus;
function closeFocus(){stopTimer();document.getElementById("focus").classList.remove("on")}

/* nav */
function applyView(){document.querySelectorAll(".view").forEach(s=>s.classList.toggle("on",s.id==="v-"+view));
  document.querySelectorAll("#tabbar button,#rail .ri").forEach(b=>b.classList.toggle("on",b.dataset.v===view));
  document.querySelector("#v-capture").style.display=(view==="capture")?"flex":"none";
  document.querySelector(".capbar").style.display=(view==="capture")?"flex":"none";}
function setView(v){view=v;applyView();renderAll()}
document.getElementById("tabbar").addEventListener("click",e=>{const b=e.target.closest("button");if(b)setView(b.dataset.v)});
document.getElementById("rail").addEventListener("click",e=>{const b=e.target.closest(".ri");if(b)setView(b.dataset.v)});

function renderAll(){renderCapture();renderToday();renderPlan();renderCalendar()}
applyView();renderAll();
