const doc=document.getElementById("doc");
document.getElementById("date").textContent=new Date().toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"});
function makeBlock(type,text,indent,title){
  const blk=document.createElement("div");blk.className="blk"+(title?" tt":"");blk.dataset.type=type||"text";blk.dataset.indent=indent||0;
  blk.innerHTML='<span class="mk"></span><div class="btx" contenteditable="true" spellcheck="false"></div>';
  const btx=blk.querySelector(".btx");if(text)btx.textContent=text;
  applyIndent(blk);renderMarker(blk);
  btx.addEventListener("keydown",e=>onKey(e,blk,btx));
  btx.addEventListener("input",()=>{shortcut(blk,btx);updatePh()});
  return blk;
}
function applyIndent(blk){blk.style.marginLeft=(parseInt(blk.dataset.indent||0)*22)+"px"}
function setIndent(blk,d){const v=Math.max(0,Math.min(6,parseInt(blk.dataset.indent||0)+d));blk.dataset.indent=v;applyIndent(blk)}
function renderMarker(blk){const mk=blk.querySelector(".mk");mk.className="mk";mk.innerHTML="";
  if(blk.dataset.type==="bullet"){mk.classList.add("bul");mk.textContent="•"}
  else if(blk.dataset.type==="task"){mk.classList.add("cb");mk.onclick=()=>blk.classList.toggle("done")}}
function setType(blk,type){blk.dataset.type=type;blk.classList.remove("done");if(type!=="text")blk.classList.remove("tt");renderMarker(blk);updatePh()}
function shortcut(blk,btx){
  if(blk.dataset.type!=="text")return;const t=btx.textContent;
  if(/^[-*]\s/.test(t)){btx.textContent=t.replace(/^[-*]\s/,"");setType(blk,"bullet");placeCaretEnd(btx)}
  else if(/^(\[\]|\[ \]|\(\))\s/.test(t)){btx.textContent=t.replace(/^(\[\]|\[ \]|\(\))\s/,"");setType(blk,"task");placeCaretEnd(btx)}}
function onKey(e,blk,btx){
  if(e.key==="Tab"){e.preventDefault();setIndent(blk,e.shiftKey?-1:1);return}
  if(e.key==="Enter"){e.preventDefault();
    if(blk.dataset.type!=="text"&&!btx.textContent.trim()){setType(blk,"text");updatePh();return}
    const nb=makeBlock(blk.dataset.type==="task"?"task":blk.dataset.type==="bullet"?"bullet":"text","",parseInt(blk.dataset.indent||0),false);
    blk.after(nb);placeCaret(nb.querySelector(".btx"));updatePh();return}
  if(e.key==="Backspace"&&!btx.textContent&&caretStart(btx)){
    if(blk.dataset.type!=="text"){e.preventDefault();setType(blk,"text");updatePh();return}
    const prev=blk.previousElementSibling;
    if(prev&&prev.classList.contains("divider")){e.preventDefault();const before=prev.previousElementSibling;blk.remove();prev.remove();if(before&&before.querySelector)placeCaretEnd(before.querySelector(".btx"));updatePh();return}
    if(prev&&prev.classList.contains("blk")){e.preventDefault();const p=prev.querySelector(".btx");blk.remove();placeCaretEnd(p);updatePh();return}}}
function caretStart(el){const s=getSelection();return s.rangeCount&&s.getRangeAt(0).collapsed&&s.anchorOffset===0}
function placeCaret(el){el.focus();const r=document.createRange();r.selectNodeContents(el);r.collapse(true);const s=getSelection();s.removeAllRanges();s.addRange(r)}
function placeCaretEnd(el){el.focus();const r=document.createRange();r.selectNodeContents(el);r.collapse(false);const s=getSelection();s.removeAllRanges();s.addRange(r)}
function updatePh(){const blks=[...doc.querySelectorAll(".blk")];blks.forEach(b=>{const btx=b.querySelector(".btx");let ph="";
  if(!btx.textContent){if(b.classList.contains("tt"))ph=(blks.length===1?"Start a note…":"Title");else if(b.dataset.type==="bullet")ph="list";else if(b.dataset.type==="task")ph="to-do";}
  btx.setAttribute("data-ph",ph)})}
function closestBlk(node){while(node&&node!==doc){if(node.classList&&node.classList.contains("blk"))return node;node=node.parentNode}return null}
function addType(type){const sel=getSelection();let cur=sel.anchorNode?closestBlk(sel.anchorNode):null;if(!cur)cur=doc.querySelector(".blk:last-child");
  if(cur){if(!cur.querySelector(".btx").textContent.trim()){setType(cur,type);placeCaret(cur.querySelector(".btx"))}
    else{const nb=makeBlock(type,"",parseInt(cur.dataset.indent||0),false);cur.after(nb);placeCaret(nb.querySelector(".btx"))}}updatePh()}
document.getElementById("bBul").onclick=()=>addType("bullet");
document.getElementById("bTask").onclick=()=>addType("task");
document.getElementById("bNew").onclick=()=>{const div=document.createElement("div");div.className="divider";doc.appendChild(div);
  const b=makeBlock("text","",0,true);doc.appendChild(b);placeCaret(b.querySelector(".btx"));updatePh();doc.scrollTop=doc.scrollHeight};
doc.addEventListener("mousedown",e=>{if(e.target===doc){const last=doc.querySelector(".blk:last-child");if(last){e.preventDefault();placeCaretEnd(last.querySelector(".btx"))}}});
doc.appendChild(makeBlock("text","",0,true));updatePh();doc.querySelector(".btx").focus();
