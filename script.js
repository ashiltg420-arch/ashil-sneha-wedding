const welcome=document.getElementById("welcome");
const invitation=document.getElementById("invitation");
document.getElementById("openInvite").addEventListener("click",()=>{
  welcome.style.display="none"; invitation.classList.remove("hidden");
  window.scrollTo(0,0); window.dispatchEvent(new Event("resize"));
  history.replaceState(null,"","#invitation");
});

function petals(){
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  const wrap=document.querySelector(".petals");
  setInterval(()=>{
    const p=document.createElement("i"); p.className="petal";
    p.style.left=Math.random()*100+"vw";
    p.style.setProperty("--drift",(Math.random()*180-90)+"px");
    p.style.animationDuration=(5+Math.random()*6)+"s";
    p.style.transform="rotate("+Math.random()*180+"deg)";
    wrap.appendChild(p); setTimeout(()=>p.remove(),12000);
  },700);
}
petals();

const target=new Date("2026-12-13T10:30:00+04:00").getTime();
function countdown(){
  const el=document.getElementById("countdown"), now=Date.now(), d=Math.max(0,target-now);
  const units=[["Days",86400000],["Hours",3600000],["Minutes",60000],["Seconds",1000]];
  el.innerHTML=units.map(([name,size])=>{
    const n=Math.floor(d/size); return `<div><b>${String(n).padStart(2,"0")}</b><span>${name}</span></div>`;
  }).join("");
}
countdown();setInterval(countdown,1000);

const form=document.getElementById("wishForm"), list=document.getElementById("wishList");
const KEY="ashil-sneha-wishes";
function render(){
  const wishes=JSON.parse(localStorage.getItem(KEY)||"[]");
  list.innerHTML=wishes.length?wishes.map(w=>`<article class="wish"><strong>${escapeHtml(w.name)}</strong><p>${escapeHtml(w.message)}</p></article>`).join(""):'<p class="empty">Be the first to leave a blessing. ♡</p>';
}
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
form.addEventListener("submit",e=>{
  e.preventDefault();
  const name=document.getElementById("wishName").value.trim(), message=document.getElementById("wishMessage").value.trim();
  if(!name||!message)return;
  const wishes=JSON.parse(localStorage.getItem(KEY)||"[]");
  wishes.unshift({name,message}); localStorage.setItem(KEY,JSON.stringify(wishes.slice(0,50)));
  form.reset(); render();
});
render();


const wishQuotes=document.querySelectorAll(".wish-quote");
if(wishQuotes.length>1){
  let quoteIndex=0;
  setInterval(()=>{
    wishQuotes[quoteIndex].classList.remove("active");
    quoteIndex=(quoteIndex+1)%wishQuotes.length;
    wishQuotes[quoteIndex].classList.add("active");
  },5000);
}


/* Tap a suggested wish to copy it into the message box */
wishQuotes.forEach(quote=>{
  quote.setAttribute("role","button");
  quote.setAttribute("tabindex","0");
  quote.title="Click to use this wish";
  const useQuote=()=>{
    const messageBox=document.getElementById("wishMessage");
    messageBox.value=quote.textContent.replace(/[“”]/g,"").trim();
    messageBox.focus();
    messageBox.dispatchEvent(new Event("input",{bubbles:true}));
  };
  quote.addEventListener("click",useQuote);
  quote.addEventListener("keydown",e=>{
    if(e.key==="Enter"||e.key===" "){e.preventDefault();useQuote();}
  });
});


/* Guest attendance and greeting window */
const attendanceForm=document.getElementById("attendanceForm");
const attendanceList=document.getElementById("attendanceList");
const attendanceStatusMessage=document.getElementById("attendanceStatusMessage");
const ATTENDANCE_KEY="ashil-sneha-attendance";
function getAttendance(){try{return JSON.parse(localStorage.getItem(ATTENDANCE_KEY)||"[]")}catch(e){return[]}}
function renderAttendance(){
  if(!attendanceList)return;
  const entries=getAttendance(), attending=entries.filter(x=>x.status==="Attending");
  const people=attending.reduce((sum,x)=>sum+Number(x.people||0),0);
  const wishes=JSON.parse(localStorage.getItem(KEY)||"[]");
  document.getElementById("confirmedGuestCount").textContent=attending.length;
  document.getElementById("attendingPeopleCount").textContent=people;
  document.getElementById("wishCount").textContent=wishes.length;
  document.getElementById("wishHeadingCount").textContent=wishes.length;
  attendanceList.innerHTML=entries.length?entries.map(x=>`<article class="attendance-entry"><div><strong>${escapeHtml(x.name)}</strong><span>${escapeHtml(x.status)} · ${Number(x.people)} ${Number(x.people)===1?"guest":"guests"}</span></div>${x.message?`<p>“${escapeHtml(x.message)}”</p>`:""}</article>`).join(""):'<p class="empty">Be the first guest to confirm. ♡</p>';
}
if(attendanceForm){
  attendanceForm.addEventListener("submit",e=>{
    e.preventDefault();
    const name=document.getElementById("attendanceName").value.trim(), status=document.getElementById("attendanceStatus").value;
    const people=Math.max(1,Math.min(20,Number(document.getElementById("attendancePeople").value||1)));
    const message=document.getElementById("attendanceMessage").value.trim();
    if(!name||!status)return;
    const entries=getAttendance();
    entries.unshift({name,status,people:status==="Not attending"?0:people,message});
    localStorage.setItem(ATTENDANCE_KEY,JSON.stringify(entries.slice(0,100)));
    attendanceForm.reset(); document.getElementById("attendancePeople").value=1;
    attendanceStatusMessage.textContent="Thank you! Your attendance has been recorded. ♡";
    renderAttendance(); setTimeout(()=>attendanceStatusMessage.textContent="",3500);
  });
}
renderAttendance();
const baseRender=render;
render=function(){baseRender();renderAttendance()};
