const { LOC, SESSIONS, MARKERS, BREAK } = window;

/* ---------- date helpers ---------- */
const pad = n => String(n).padStart(2,"0");
const key = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const parse = s => { const [y,m,d]=s.split("-").map(Number); return new Date(y,m-1,d); };
const at = (d,hhmm) => { const [h,m]=hhmm.split(":").map(Number); const x=new Date(d); x.setHours(h,m,0,0); return x; };
const addDays = (d,n) => { const x=new Date(d); x.setDate(x.getDate()+n); return x; };
const mondayOf = d => addDays(d, -((d.getDay()+6)%7));
const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const fmtDate = d => d.toLocaleDateString("en-GB",{day:"numeric",month:"long"});

function sessionsOn(date){
  const k = key(date), dow = (date.getDay()+6)%7 + 1;
  const out = [];
  for(const s of SESSIONS){
    if(s.dow !== dow) continue;
    const on = s.ranges.some(([a,b]) => k >= a && k <= b);
    if(on) out.push(s);
  }
  return out.sort((a,b) => a.from.localeCompare(b.from));
}
function upcoming(now, limit = 60){
  for(let i=0;i<limit;i++){
    const d = addDays(now,i);
    for(const s of sessionsOn(d)){
      const start = at(d,s.from), end = at(d,s.to);
      if(end > now) return {s, d, start, end, live: start <= now};
    }
  }
  return null;
}

/* ---------- render ---------- */
let anchor = mondayOf(new Date());

function renderHero(now){
  const dow = now.getDay();
  document.getElementById("heroDay").textContent =
    now.toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"});
  document.getElementById("clock").textContent =
    now.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"}) + " in Paris" +
    (dow===0 ? " · weekend" : "");

  const box = document.getElementById("nextBox");
  const u = upcoming(now);
  if(!u){ box.innerHTML = '<div class="lead">Nothing left on the timetable. Semester\'s done.</div>'; return; }
  const mins = Math.round((u.live ? u.end - now : u.start - now)/60000);
  const human = m => m < 60 ? `${m} min` : `${Math.floor(m/60)} h ${pad(m%60)}`;
  const sameDay = key(u.d) === key(now);
  const when = u.live
    ? `On now · ends in ${human(mins)}`
    : (sameDay ? `Starts in ${human(mins)}` : `${u.d.toLocaleDateString("en-GB",{weekday:"long"})} ${u.s.from}, in ${human(mins)}`);
  const locObj = LOC[u.s.loc];
  box.innerHTML = `
    <div class="lead">${when}</div>
    <div class="title">${u.s.name}</div>
    <div class="where">${u.s.from}–${u.s.to} · <a class="map-link" target="_blank" rel="noopener" style="text-decoration-color:${locObj.colour}" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locObj.address)}">${locObj.name}</a>${u.s.room ? " · " + u.s.room : ""}</div>
    ${u.s.flag ? `<div class="flag">${u.s.flag}</div>` : ""}`;
}

function renderWeek(now){
  const start = anchor, end = addDays(anchor,6);
  document.getElementById("weekLabel").textContent =
    `${fmtDate(start)} – ${fmtDate(end)}`;

  const host = document.getElementById("week");
  host.innerHTML = "";
  for(let i=0;i<7;i++){
    const d = addDays(anchor,i), k = key(d);
    const isToday = k === key(now);
    const day = document.createElement("section");
    day.className = "day" + (isToday ? " today" : "");
    let html = `<div class="day-head"><h2>${DAYS[i]}${isToday?'<span class="dot"></span>':''}</h2>
                <span class="date">${fmtDate(d)}</span></div>`;

    const list = sessionsOn(d);
    const isBreak = k >= BREAK.from && k <= BREAK.to;
    if(!list.length && !isBreak){
      html += `<div class="empty">Nothing scheduled.</div>`;
    }
    for(const s of list){
      const startT = at(d,s.from), endT = at(d,s.to);
      const done = endT < now, live = startT <= now && endT > now;
      html += `
        <div class="slot ${done?"done":""} ${live?"live":""}">
          <div class="time">${s.from}<small>${s.to}</small></div>
          <div class="rail" style="background:${LOC[s.loc].colour}"></div>
          <div>
            <h3>${s.name} ${live?'<span class="badge">now</span>':''}
              ${s.code ? `<span class="code">${s.code}</span>` : ""}</h3>
            <div class="addr"><a class="map-link" target="_blank" rel="noopener" style="text-decoration-color:${LOC[s.loc].colour}" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(LOC[s.loc].address)}">${LOC[s.loc].name}</a>${s.room ? ` · <span class="room">${s.room}</span>` : ""}</div>
            ${s.flag ? `<div class="flag">${s.flag}</div>` : ""}
          </div>
        </div>`;
    }
    if(isBreak) html += `<div class="exam">Autumn break, no classes. Wrestling continues.</div>`;
    if(MARKERS[k]) html += `<div class="exam">${MARKERS[k]}.</div>`;
    day.innerHTML = html;
    host.appendChild(day);
  }
}

function tick(){
  const now = new Date();
  renderHero(now);
  renderWeek(now);
}

document.getElementById("prev").onclick = () => { anchor = addDays(anchor,-7); tick(); };
document.getElementById("next").onclick = () => { anchor = addDays(anchor,7); tick(); };
document.getElementById("today").onclick = () => { anchor = mondayOf(new Date()); tick(); };

function parseHash() {
  const h = window.location.hash.replace(/^#\/?/, "");
  if(h.startsWith("academics")) {
    return { tab: "academics", path: h.split("/").slice(1) };
  }
  return { tab: "week", path: h.split("/").slice(1) };
}

function switchTab(tabId) {
  const isAcademics = tabId === "academics";
  document.getElementById("tab-week").setAttribute("aria-selected", !isAcademics);
  document.getElementById("tab-week").className = isAcademics ? "" : "solid";
  document.getElementById("panel-week").style.display = isAcademics ? "none" : "block";

  document.getElementById("tab-academics").setAttribute("aria-selected", isAcademics);
  document.getElementById("tab-academics").className = isAcademics ? "solid" : "";
  document.getElementById("panel-academics").style.display = isAcademics ? "block" : "none";
}

function renderAcademicsRoute(path) {
  const panel = document.getElementById("panel-academics");
  panel.innerHTML = `<div style="padding-top:20px;">Academics placeholder</div>`;
}

function handleRoute() {
  const route = parseHash();
  switchTab(route.tab);
  if(route.tab === "week") {
    if(route.path[0]) {
      const d = parse(route.path[0]);
      if(!isNaN(d)) anchor = mondayOf(d);
    }
    tick();
  } else if(route.tab === "academics") {
    renderHero(new Date()); // Ensure hero still updates
    renderAcademicsRoute(route.path);
  }
}

window.addEventListener("hashchange", handleRoute);

document.getElementById("tab-week").addEventListener("click", () => {
  window.location.hash = "/week";
});
document.getElementById("tab-academics").addEventListener("click", () => {
  window.location.hash = "/academics";
});

const tablist = document.querySelector('[role="tablist"]');
const tabs = tablist.querySelectorAll('[role="tab"]');
tablist.addEventListener("keydown", (e) => {
  let idx = Array.from(tabs).findIndex(t => t === document.activeElement);
  if(idx === -1) return;
  if(e.key === "ArrowRight") {
    e.preventDefault();
    tabs[(idx+1) % tabs.length].focus();
  } else if(e.key === "ArrowLeft") {
    e.preventDefault();
    tabs[(idx-1+tabs.length) % tabs.length].focus();
  } else if(e.key === "Home") {
    e.preventDefault();
    tabs[0].focus();
  } else if(e.key === "End") {
    e.preventDefault();
    tabs[tabs.length-1].focus();
  }
});

handleRoute();
setInterval(() => {
  const route = parseHash();
  if (route.tab === "week") {
    tick();
  } else {
    renderHero(new Date());
    renderAcademicsRoute(route.path);
  }
}, 30000);
