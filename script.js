const welcome=document.getElementById("welcome");
const invitation=document.getElementById("invitation");
const weddingMusic=document.getElementById("weddingMusic");
const musicToggle=document.getElementById("musicToggle");

function startWeddingMusic(){if(!weddingMusic)return;weddingMusic.volume=0.32;weddingMusic.play().catch(()=>{});}
function updateMusicToggle(){if(!musicToggle||!weddingMusic)return;const on=!weddingMusic.paused;musicToggle.setAttribute("aria-pressed",String(on));musicToggle.setAttribute("aria-label",on?"Turn wedding music off":"Turn wedding music on");musicToggle.innerHTML=on?"♫ <span>Music On</span>":"♫ <span>Music Off</span>";}
if(musicToggle&&weddingMusic){musicToggle.addEventListener("click",()=>{if(weddingMusic.paused)weddingMusic.play().catch(()=>{});else weddingMusic.pause();setTimeout(updateMusicToggle,50);});weddingMusic.addEventListener("play",updateMusicToggle);weddingMusic.addEventListener("pause",updateMusicToggle);}

// Stop wedding music when the phone/browser is minimized or the tab goes into the background.
let resumeMusicAfterBackground=false;
function handleVisibilityChange(){
  if(!weddingMusic)return;
  if(document.hidden){
    resumeMusicAfterBackground=!weddingMusic.paused;
    if(resumeMusicAfterBackground)weddingMusic.pause();
  }else if(resumeMusicAfterBackground){
    resumeMusicAfterBackground=false;
    weddingMusic.play().catch(()=>{});
  }
}
document.addEventListener("visibilitychange",handleVisibilityChange);
window.addEventListener("pagehide",()=>{if(weddingMusic&&!weddingMusic.paused)weddingMusic.pause();});

let autoScrollTimer=null;
let autoScrollActive=false;
function startAutoScroll(){
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  if(autoScrollTimer)clearInterval(autoScrollTimer);
  autoScrollActive=true;
  document.documentElement.classList.add("auto-scroll-active");
  const speed=1.15;
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
function pauseAutoScroll(){
  autoScrollActive=false;
  if(autoScrollTimer){clearInterval(autoScrollTimer);autoScrollTimer=null;}
  document.documentElement.classList.remove("auto-scroll-active");
}
document.getElementById("openInvite").addEventListener("click",()=>{
  welcome.style.display="none";
  invitation.classList.remove("hidden");
  window.scrollTo({top:0,behavior:"auto"});
  window.dispatchEvent(new Event("resize"));
  history.replaceState(null,"","#invitation");
  startWeddingMusic();
  updateMusicToggle();
  setTimeout(startAutoScroll,900);
});
["wheel","touchstart","pointerdown","keydown"].forEach(evt=>{
  window.addEventListener(evt,()=>{if(autoScrollActive)pauseAutoScroll();},{passive:true});
});

function petals(){
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  const wrap=document.querySelector(".petals");
  setInterval(()=>{
    const p=document.createElement("i");p.className="petal";
    p.style.left=Math.random()*100+"vw";
    p.style.setProperty("--drift",(Math.random()*180-90)+"px");
    p.style.animationDuration=(5+Math.random()*6)+"s";
    p.style.transform="rotate("+Math.random()*180+"deg)";
    wrap.appendChild(p);setTimeout(()=>p.remove(),12000);
  },700);
}
petals();

const target=new Date("2026-12-13T10:30:00+04:00").getTime();
function countdown(){
  const el=document.getElementById("countdown"),now=Date.now(),d=Math.max(0,target-now);
  const units=[["Days",86400000],["Hours",3600000],["Minutes",60000],["Seconds",1000]];
  el.innerHTML=units.map(([name,size])=>{const n=Math.floor(d/size);return `<div><b>${String(n).padStart(2,"0")}</b><span>${name}</span></div>`;}).join("");
}
countdown();setInterval(countdown,1000);

// Shared global wedding guestbook powered by Supabase.
// Only the publishable key is used in the browser. Attendee names are never publicly selected.
const SUPABASE_URL="https://qaepwjdbndctcbqaijom.supabase.co";
const SUPABASE_KEY="sb_publishable_Uwmlfi5mfsSKyhDxrcrekg_q9ER-d8V";
const API_HEADERS={apikey:SUPABASE_KEY,Authorization:`Bearer ${SUPABASE_KEY}`,"Content-Type":"application/json"};
const form=document.getElementById("wishForm"),list=document.getElementById("wishList");
const attendanceForm=document.getElementById("attendanceForm");
const attendanceStatusMessage=document.getElementById("attendanceStatusMessage");
const wishCountEl=document.getElementById("wishHeadingCount");
const attendanceCountEl=document.getElementById("attendancePublicCount");

function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}

async function loadWeddingStats(){
  try{
    const response=await fetch(`${SUPABASE_URL}/rest/v1/wedding_stats?select=wish_count,attending_guests&id=eq.true`,{headers:API_HEADERS,cache:"no-store"});
    if(!response.ok)throw new Error("Stats request failed");
    const rows=await response.json();
    const stats=rows[0]||{wish_count:0,attending_guests:0};
    if(wishCountEl)wishCountEl.textContent=Number(stats.wish_count||0);
    if(attendanceCountEl)attendanceCountEl.textContent=Number(stats.attending_guests||0);
  }catch(error){console.warn("Could not load public wedding stats.",error);}
}

async function loadPublicWishes(){
  if(!list)return;
  try{
    const response=await fetch(`${SUPABASE_URL}/rest/v1/guest_wishes?select=name,message,created_at&order=created_at.desc&limit=100`,{headers:API_HEADERS,cache:"no-store"});
    if(!response.ok)throw new Error("Wishes request failed");
    const wishes=await response.json();
    list.innerHTML=wishes.length?wishes.map(w=>`<article class="wish"><strong>${escapeHtml(w.name)}</strong><p>${escapeHtml(w.message)}</p></article>`).join(""):'<p class="empty">Be the first to leave a blessing. ♡</p>';
    if(wishCountEl)wishCountEl.textContent=wishes.length;
  }catch(error){
    list.innerHTML='<p class="empty">Guest wishes will appear here. ♡</p>';
    console.warn("Could not load public wishes.",error);
  }
}

if(form)form.addEventListener("submit",async e=>{
  e.preventDefault();
  const name=document.getElementById("wishName").value.trim();
  const message=document.getElementById("wishMessage").value.trim();
  if(!name||!message)return;
  const button=form.querySelector("button[type=submit]");
  if(button)button.disabled=true;
  try{
    const response=await fetch(`${SUPABASE_URL}/rest/v1/guest_wishes`,{
      method:"POST",headers:{...API_HEADERS,Prefer:"return=minimal"},
      body:JSON.stringify({name,message})
    });
    if(!response.ok)throw new Error("Wish submission failed");
    form.reset();
    await Promise.all([loadPublicWishes(),loadWeddingStats()]);
  }catch(error){
    alert("Sorry, your wish could not be submitted. Please try again.");
    console.warn(error);
  }finally{
    if(button)button.disabled=false;
  }
});

if(attendanceForm){
  attendanceForm.addEventListener("submit",async e=>{
    e.preventDefault();
    const name=document.getElementById("attendanceName").value.trim();
    const status=document.getElementById("attendanceStatus").value;
    const people=Math.max(1,Math.min(20,Number(document.getElementById("attendancePeople").value||1)));
    if(!name||!status)return;
    const button=attendanceForm.querySelector("button[type=submit]");
    if(button)button.disabled=true;
    try{
      const response=await fetch(`${SUPABASE_URL}/rest/v1/guest_attendance`,{
        method:"POST",headers:{...API_HEADERS,Prefer:"return=minimal"},
        body:JSON.stringify({name,status,people})
      });
      if(!response.ok)throw new Error("Attendance submission failed");
      attendanceForm.reset();
      document.getElementById("attendancePeople").value=1;
      attendanceStatusMessage.textContent="Thank you! Your attendance has been recorded. ♡";
      await loadWeddingStats();
      setTimeout(()=>attendanceStatusMessage.textContent="",3500);
    }catch(error){
      attendanceStatusMessage.textContent="Sorry, your attendance could not be recorded. Please try again.";
      console.warn(error);
    }finally{
      if(button)button.disabled=false;
    }
  });
}

loadWeddingStats();
loadPublicWishes();
setInterval(loadWeddingStats,5000);
setInterval(loadPublicWishes,10000);

const wishQuotes=document.querySelectorAll(".wish-quote");
if(wishQuotes.length>1){
  let quoteIndex=0;
  setInterval(()=>{
    wishQuotes[quoteIndex].classList.remove("active");
    quoteIndex=(quoteIndex+1)%wishQuotes.length;
    wishQuotes[quoteIndex].classList.add("active");
  },5000);
}
wishQuotes.forEach(quote=>{
  quote.setAttribute("role","button");
  quote.setAttribute("tabindex","0");
  quote.title="Click to use this wish";
  const useQuote=()=>{
    const messageBox=document.getElementById("wishMessage");
    if(!messageBox)return;
    messageBox.value=quote.textContent.replace(/[“”]/g,"").trim();
    messageBox.focus();
    messageBox.dispatchEvent(new Event("input",{bubbles:true}));
  };
  quote.addEventListener("click",useQuote);
  quote.addEventListener("keydown",e=>{
    if(e.key==="Enter"||e.key===" "){e.preventDefault();useQuote();}
  });
});
