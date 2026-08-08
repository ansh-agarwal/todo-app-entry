const editor=document.getElementById("editor"),feed=document.getElementById("feed"),keepBtn=document.getElementById("keep"),count=document.getElementById("count");
document.getElementById("date").textContent=new Date().toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"});
let n=0;
function clock(){const d=new Date();let h=d.getHours(),m=d.getMinutes();const a=h<12?"am":"pm";h=h%12||12;return h+":"+String(m).padStart(2,"0")+" "+a}

function makeBlock(type,text,indent){
  const blk=document.createElement("div");blk.className="blk";blk.dataset.type=type||"text";blk.dataset.indent=indent||0;
  blk.innerHTML='<span class="mk"></span><div class="btx" contenteditable="true" spellcheck="false"></div>';
  const btx=blk.querySelector(".btx");if(text)btx.textContent=text;
  applyIndent(blk);renderMarker(blk);
  btx.addEventListener("keydown",e=>onKey(e,blk,btx));
  btx.addEventListener("input",()=>{shortcut(blk,btx);updateKeep();updatePh()});
  btx.addEventListener("focus",()=>{[...editor.querySelectorAll(".blk")].forEach(x=>x.classList.remove("active"));blk.classList.add("active")});
  return blk;
}
function applyIndent(blk){blk.style.marginLeft=(parseInt(blk.dataset.indent||0)*22)+"px"}
function setIndent(blk,d){const v=Math.max(0,Math.min(6,parseInt(blk.dataset.indent||0)+d));blk.dataset.indent=v;applyIndent(blk)}
function renderMarker(blk){const mk=blk.querySelector(".mk");mk.className="mk";mk.innerHTML="";
  if(blk.dataset.type==="bullet"){mk.classList.add("bul");mk.textContent="•"}
  else if(blk.dataset.type==="task"){mk.classList.add("cb");mk.onclick=()=>blk.classList.toggle("done")}}
function setType(blk,type){blk.dataset.type=type;blk.classList.remove("done");renderMarker(blk);updatePh()}
function shortcut(blk,btx){
  if(blk.dataset.type!=="text")return;const t=btx.textContent;
  if(/^[-*]\s/.test(t)){btx.textContent=t.replace(/^[-*]\s/,"");setType(blk,"bullet");placeCaretEnd(btx)}
  else if(/^(\[\]|\[ \]|\(\))\s/.test(t)){btx.textContent=t.replace(/^(\[\]|\[ \]|\(\))\s/,"");setType(blk,"task");placeCaretEnd(btx)}}
function onKey(e,blk,btx){
  if(e.key==="Tab"){e.preventDefault();setIndent(blk,e.shiftKey?-1:1);return}
  if(e.key==="Enter"&&(e.metaKey||e.ctrlKey)){e.preventDefault();keep();return}
  if(e.key==="Enter"){e.preventDefault();
    if(blk.dataset.type!=="text"&&!btx.textContent.trim()){setType(blk,"text");updatePh();return}
    const nb=makeBlock(blk.dataset.type==="task"?"task":blk.dataset.type==="bullet"?"bullet":"text","",parseInt(blk.dataset.indent||0));
    blk.after(nb);placeCaret(nb.querySelector(".btx"));updatePh();return}
  if(e.key==="Backspace"&&!btx.textContent&&caretStart(btx)){
    if(blk.dataset.type!=="text"){e.preventDefault();setType(blk,"text");updatePh();return}
    const prev=blk.previousElementSibling;
    if(prev){e.preventDefault();const p=prev.querySelector(".btx");blk.remove();placeCaretEnd(p);updatePh();updateKeep()}}}
function caretStart(el){const s=getSelection();return s.rangeCount&&s.getRangeAt(0).collapsed&&s.anchorOffset===0}
function placeCaret(el){el.focus();const r=document.createRange();r.selectNodeContents(el);r.collapse(true);const s=getSelection();s.removeAllRanges();s.addRange(r)}
function placeCaretEnd(el){el.focus();const r=document.createRange();r.selectNodeContents(el);r.collapse(false);const s=getSelection();s.removeAllRanges();s.addRange(r)}
function updatePh(){const blks=[...editor.children];blks.forEach((b,i)=>{const btx=b.querySelector(".btx");
  let ph="";if(!btx.textContent){if(i===0&&b.dataset.type==="text")ph=blks.length===1?"Write anything…":"";
    else if(b.dataset.type==="bullet")ph="list item";else if(b.dataset.type==="task")ph="to-do";}
  btx.setAttribute("data-ph",ph)})}
function hasContent(){return [...editor.querySelectorAll(".btx")].some(b=>b.textContent.trim())}
function updateKeep(){keepBtn.classList.toggle("on",hasContent())}
function closestBlk(node){while(node&&node!==editor){if(node.classList&&node.classList.contains("blk"))return node;node=node.parentNode}return null}
function addBlockOfType(type){const sel=getSelection();let cur=sel.anchorNode?closestBlk(sel.anchorNode):null;
  if(cur&&!cur.querySelector(".btx").textContent.trim()){setType(cur,type);placeCaret(cur.querySelector(".btx"))}
  else{const nb=makeBlock(type,"");editor.appendChild(nb);placeCaret(nb.querySelector(".btx"))}updatePh()}
document.getElementById("bBul").onclick=()=>addBlockOfType("bullet");
document.getElementById("bTask").onclick=()=>addBlockOfType("task");
function keep(){
  if(!hasContent())return;
  const blocks=[...editor.children].map(b=>({type:b.dataset.type,text:b.querySelector(".btx").textContent,done:b.classList.contains("done"),indent:parseInt(b.dataset.indent||0)})).filter(b=>b.text.trim()||b.type!=="text");
  const em=document.getElementById("empty");if(em)em.remove();
  const card=document.createElement("div");card.className="card";
  const time=document.createElement("span");time.className="time";time.textContent=clock();card.appendChild(time);
  let firstText=true;
  blocks.forEach(b=>{const ln=document.createElement("div");ln.className="ln"+(b.done?" done":"");
    if(b.indent)ln.style.marginLeft=(b.indent*20)+"px";
    if(b.type==="text"&&firstText){ln.classList.add("title");firstText=false;ln.innerHTML='<div class="bd"></div>';ln.querySelector(".bd").textContent=b.text}
    else if(b.type==="bullet"){ln.innerHTML='<span class="mk bul">•</span><div class="bd"></div>';ln.querySelector(".bd").textContent=b.text}
    else if(b.type==="task"){ln.innerHTML='<span class="mk cb"></span><div class="bd"></div>';ln.querySelector(".bd").textContent=b.text;const cb=ln.querySelector(".cb");cb.onclick=()=>ln.classList.toggle("done")}
    else{ln.innerHTML='<div class="bd"></div>';ln.querySelector(".bd").textContent=b.text}
    card.appendChild(ln)});
  feed.appendChild(card);feed.scrollTop=feed.scrollHeight;
  n++;count.textContent=n+" kept today";
  editor.innerHTML="";const b=makeBlock("text","");editor.appendChild(b);updatePh();updateKeep();placeCaret(b.querySelector(".btx"));}
document.getElementById("keep").onclick=keep;
editor.appendChild(makeBlock("text",""));updatePh();updateKeep();editor.querySelector(".btx").focus();
