const welcome=document.getElementById("welcome");
const invitation=document.getElementById("invitation");
let autoScrollTimer=null;
let autoScrollActive=false;

function startAutoScroll(){
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  if(autoScrollTimer)clearInterval(autoScrollTimer);
  autoScrollActive=true;
  document.documentElement.classList.add("auto-scroll-active");
  const speed=1.2;
  autoScrollTimer=setInterval(()=>{
    if(!autoScrollActive)return;
    const max=document.documentElement.scrollHeight-window.innerHeight;
    if(window.scrollY>=max-4){
      clearInterval(autoScrollTimer);autoScrollTimer=null;autoScrollActive=false;
      document.documentElement.classList.remove("auto-scroll-active");return;
    }
    window.scrollBy(0,speed);
  },16);
}
function pauseAutoScroll(){autoScrollActive=false;if(autoScrollTimer){clearInterval(autoScrollTimer);autoScrollTimer=null;}document.documentElement.classList.remove("auto-scroll-active")}
document.getElementById("openInvite").addEventListener("click",()=>{welcome.style.display="none";invitation.classList.remove("hidden");window.scrollTo({top:0,behavior:"auto"});window.dispatchEvent(new Event("resize"));history.replaceState(null,"","#invitation");setTimeout(startAutoScroll,900)});
["wheel","touchstart","pointerdown","keydown"].forEach(evt=>window.addEventListener(evt,()=>{if(autoScrollActive)pauseAutoScroll()},{passive:true}));

function petals(){if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;const wrap=document.querySelector(".petals");if(!wrap)return;setInterval(()=>{const p=document.createElement("i");p.className="petal";p.style.left=Math.random()*100+"vw";p.style.setProperty("--drift",(Math.random()*180-90)+"px");p.style.animationDuration=(5+Math.random()*6)+"s";p.style.transform="rotate("+Math.random()*180+"deg)";wrap.appendChild(p);setTimeout(()=>p.remove(),12000)},700)}
petals();

const target=new Date("2026-12-13T10:30:00+04:00").getTime();
function countdown(){const el=document.getElementById("countdown"),now=Date.now(),d=Math.max(0,target-now),units=[["Days",86400000],["Hours",3600000],["Minutes",60000],["Seconds",1000]];if(el)el.innerHTML=units.map(([name,size])=>{const n=Math.floor(d/size);return `<div><b>${String(n).padStart(2,"0")}</b><span>${name}</span></div>`}).join("")}
countdown();setInterval(countdown,1000);

const form=document.getElementById("wishForm"),list=document.getElementById("wishList"),KEY="ashil-sneha-wishes";
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function render(){if(!list)return;let wishes=[];try{wishes=JSON.parse(localStorage.getItem(KEY)||"[]")}catch(e){}list.innerHTML=wishes.length?wishes.map(w=>`<article class="wish"><strong>${escapeHtml(w.name)}</strong><p>${escapeHtml(w.message)}</p></article>`).join(""):"<p class="empty">Be the first to leave a blessing. ♡</p>";const count=document.getElementById("wishHeadingCount");if(count)count.textContent=wishes.length}
if(form)form.addEventListener("submit",e=>{e.preventDefault();const name=document.getElementById("wishName").value.trim(),message=document.getElementById("wishMessage").value.trim();if(!name||!message)return;let wishes=[];try{wishes=JSON.parse(localStorage.getItem(KEY)||"[]")}catch(e){}wishes.unshift({name,message});localStorage.setItem(KEY,JSON.stringify(wishes.slice(0,50)));form.reset();render()});render();

const wishQuotes=document.querySelectorAll(".wish-quote");
if(wishQuotes.length>1){let quoteIndex=0;setInterval(()=>{wishQuotes[quoteIndex].classList.remove("active");quoteIndex=(quoteIndex+1)%wishQuotes.length;wishQuotes[quoteIndex].classList.add("active")},5000)}
wishQuotes.forEach(quote=>{quote.setAttribute("role","button");quote.setAttribute("tabindex","0");quote.title="Click to use this wish";const useQuote=()=>{const messageBox=document.getElementById("wishMessage");if(!messageBox)return;messageBox.value=quote.textContent.replace(/[“”]/g,"").trim();messageBox.focus();messageBox.dispatchEvent(new Event("input",{bubbles:true}))};quote.addEventListener("click",useQuote);quote.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();useQuote()}})});

const attendanceForm=document.getElementById("attendanceForm"),attendanceList=document.getElementById("attendanceList"),attendanceStatusMessage=document.getElementById("attendanceStatusMessage"),ATTENDANCE_KEY="ashil-sneha-attendance";
function getAttendance(){try{return JSON.parse(localStorage.getItem(ATTENDANCE_KEY)||"[]")}catch(e){return[]}}
function renderAttendance(){if(!attendanceList)return;const entries=getAttendance();attendanceList.innerHTML=entries.length?entries.map(x=>`<article class="attendance-entry"><div><strong>${escapeHtml(x.name)}</strong><span>${escapeHtml(x.status)} · ${Number(x.people)} ${Number(x.people)===1?"guest":"guests"}</span></div></article>`).join(""):"<p class="empty">Be the first guest to confirm. ♡</p>"}
if(attendanceForm)attendanceForm.addEventListener("submit",e=>{e.preventDefault();const name=document.getElementById("attendanceName").value.trim(),status=document.getElementById("attendanceStatus").value,people=Math.max(1,Math.min(20,Number(document.getElementById("attendancePeople").value||1)));if(!name||!status)return;const entries=getAttendance();entries.unshift({name,status,people:status==="Not attending"?0:people});localStorage.setItem(ATTENDANCE_KEY,JSON.stringify(entries.slice(0,100)));attendanceForm.reset();document.getElementById("attendancePeople").value=1;attendanceStatusMessage.textContent="Thank you! Your attendance has been recorded. ♡";renderAttendance();setTimeout(()=>attendanceStatusMessage.textContent="",3500)});
renderAttendance();