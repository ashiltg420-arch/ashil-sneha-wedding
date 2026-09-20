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
