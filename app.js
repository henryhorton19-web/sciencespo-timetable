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

function occurrencesOf(scheduleId) {
  const sess = SESSIONS.find(s => s.id === scheduleId);
  if(!sess) return [];
  const out = [];
  for(const [a, b] of sess.ranges) {
    let d = parse(a);
    const end = parse(b);
    while(d <= end) {
      if(((d.getDay()+6)%7 + 1) === sess.dow) {
        out.push(new Date(d));
      }
      d.setDate(d.getDate() + 1);
    }
  }
  return out;
}

function seminarDate(course, n) {
  const occs = occurrencesOf(course.scheduleId);
  return occs[n-1] || null;
}

// Temporary debug validation (as requested)
function validateDates() {
  if (!window.COURSES) return;
  for (const c of window.COURSES) {
    const occs = occurrencesOf(c.scheduleId);
    if (occs.length !== 12 && !c.extraSessions) console.warn(`WARN: ${c.code} has ${occs.length} occurrences instead of 12!`);
    if (c.seminars) {
      for (const sem of c.seminars) {
        if (sem.assertDate) {
          const derived = occs[sem.n - 1];
          if (!derived) {
            console.warn(`WARN: ${c.code} seminar ${sem.n} missing derived date!`);
          } else if (key(derived) !== sem.assertDate) {
            console.warn(`WARN: ${c.code} seminar ${sem.n} mismatch! assertDate=${sem.assertDate}, derived=${key(derived)}`);
          }
        }
      }
    }
  }
}
validateDates();

function sessionsOn(date){
  const k = key(date), dow = (date.getDay()+6)%7 + 1;
  const out = [];
  for(const s of SESSIONS){
    if(s.dow !== dow) continue;
    const on = s.ranges.some(([a,b]) => k >= a && k <= b);
    if(on) {
      let from = s.from, to = s.to, note = null;
      if (window.COURSES) {
        for (const c of window.COURSES) {
          if (c.scheduleId === s.id && c.seminars) {
            const occs = occurrencesOf(s.id);
            const idx = occs.findIndex(d => key(d) === k);
            if (idx !== -1) {
              const sem = c.seminars.find(x => x.n === idx + 1);
              if (sem && sem.timeOverride) {
                from = sem.timeOverride.from;
                to = sem.timeOverride.to;
                note = "Time changed";
              }
            }
          }
        }
      }
      out.push({...s, from, to, _overrideNote: note});
    }
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
            ${s._overrideNote ? `<div class="flag">${s._overrideNote}</div>` : ""}
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

function readState(key) {
  try { return JSON.parse(localStorage.getItem(key) || "{}"); }
  catch(e) { return {}; }
}
function writeState(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); }
  catch(e) {}
}

function getAllSeminars() {
  const all = [];
  if(!window.COURSES) return all;
  for(const c of window.COURSES) {
    if(!c.seminars) continue;
    const occs = occurrencesOf(c.scheduleId);
    const sess = SESSIONS.find(s => s.id === c.scheduleId);
    if(!sess) continue;
    for(const sem of c.seminars) {
      const d = occs[sem.n - 1];
      if(!d) continue;
      let from = sess.from;
      let to = sess.to;
      if(sem.timeOverride) {
        from = sem.timeOverride.from;
        to = sem.timeOverride.to;
      }
      const startT = at(d, from);
      const endT = at(d, to);
      all.push({ course: c, sem, d, startT, endT, sess, from, to });
    }
  }
  return all.sort((a,b) => a.startT - b.startT);
}

function getAllDeadlines() {
  const all = [];
  if(!window.COURSES) return all;
  for(const c of window.COURSES) {
    if(!c.assessments) continue;
    for(const a of c.assessments) {
      let t = a.due ? new Date(a.due) : null;
      all.push({ course: c, a, t });
    }
  }
  return all;
}

function renderAcademicsRoute(path) {
  const panel = document.getElementById("panel-academics");
  if (!path.length || path[0] === "") {
    renderAcademicsLanding(panel);
  } else if (path[0] === "deadlines") {
    panel.innerHTML = `<div style="padding-top:20px;">Deadlines list placeholder</div>`;
  } else {
    renderAcademicsCourse(path[0], panel);
  }
}

function renderAcademicsCourse(courseId, panel) {
  if(!window.COURSES) return;
  const course = window.COURSES.find(c => c.id === courseId);
  if(!course) {
    panel.innerHTML = `<div class="empty">Course not found.</div>`;
    return;
  }
  
  const now = new Date();
  const occs = occurrencesOf(course.scheduleId);
  const tasks = readState("spo.v1.tasks");
  const sems = getAllSeminars().filter(x => x.course.id === course.id);
  const nextSem = sems.find(x => x.endT > now);
  
  let html = `<div style="padding-top:16px;">
    <a href="#/academics" style="display:inline-block; margin-bottom:16px; text-decoration:none; color:var(--ink-soft); font-size:14.5px;">&larr; Back to Academics</a>
    <h2 style="font-family:'Instrument Serif',serif; font-size:32px; font-weight:400; margin:0 0 8px; line-height:1.1;">${course.title}</h2>
    <div style="font-size:15px; color:var(--ink-soft); margin-bottom:16px;">${course.code} · ${course.instructor || ""}</div>
  `;
  
  // Shelf
  if(course.shelf && course.shelf.length > 0) {
    html += `<div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:24px;">`;
    for(const link of course.shelf) {
      html += `<a href="${link.url}" target="_blank" rel="noopener" style="display:inline-block; background:var(--paper-2); padding:6px 12px; border-radius:999px; text-decoration:none; color:var(--ink); font-size:13.5px;">${link.label}</a>`;
    }
    html += `</div>`;
  }
  
  // Assessments
  if(course.assessments && course.assessments.length > 0) {
    html += `<h3 style="font-family:'Instrument Serif',serif; font-size:22px; font-weight:400; margin:0 0 12px;">Assessments</h3>`;
    html += `<div style="display:grid; gap:8px; margin-bottom:32px;">`;
    for(const a of course.assessments) {
      const isDone = !!tasks[a.id];
      const dueStr = a.due ? fmtDate(new Date(a.due)) : "No date";
      html += `
        <div style="display:flex; gap:12px; align-items:center; background:var(--paper-2); padding:10px 14px; border-radius:6px;">
          <input type="checkbox" disabled ${isDone?"checked":""} style="width:18px;height:18px;">
          <div style="flex:1;">
            <div style="font-size:14.5px; font-weight:500;">${a.title}</div>
            <div style="font-size:13px; color:var(--ink-soft);">${a.weight !== null ? a.weight+"%" : "Unknown weight"} · Due: ${dueStr}</div>
          </div>
        </div>
      `;
    }
    html += `</div>`;
  }
  
  // Seminars
  if(course.seminars && course.seminars.length > 0) {
    html += `<h3 style="font-family:'Instrument Serif',serif; font-size:22px; font-weight:400; margin:0 0 12px;">Seminars</h3>`;
    html += `<div style="display:flex; flex-direction:column; gap:12px;">`;
    
    let nextN = nextSem ? nextSem.sem.n : -1;
    
    for(const semObj of sems) {
      const sem = semObj.sem;
      const isOpen = sem.n === nextN;
      html += `<details ${isOpen ? "open" : ""} style="background:var(--paper-2); border-radius:6px; padding:12px 16px;">
        <summary style="cursor:pointer; font-weight:500; font-size:15.5px; outline:none;">
          Session ${sem.n}: ${sem.title || "No title"}
          <div style="font-size:13.5px; font-weight:400; color:var(--ink-soft); margin-top:2px;">${fmtDate(semObj.d)}</div>
        </summary>
        <div style="padding-top:12px; margin-top:12px; border-top:1px dotted var(--hair); font-size:14.5px;">
      `;
      if(sem.part) html += `<div style="margin-bottom:8px; font-weight:600; color:var(--ink-soft); text-transform:uppercase; letter-spacing:0.05em; font-size:12px;">Part ${sem.part}</div>`;
      if(sem.note) html += `<div style="margin-bottom:12px; font-style:italic;">Note: ${sem.note}</div>`;
      if(sem.themes) {
        html += `<div style="margin-bottom:12px;"><b>Themes:</b> ${sem.themes.join(" · ")}</div>`;
      }
      
      // Readings placeholder for step 6
      if(sem.readings && sem.readings.length > 0) {
        html += `<div style="margin-bottom:12px;"><b>Readings:</b><ul>`;
        for(const r of sem.readings) {
          html += `<li>${r.author}. <i>${r.title}</i>. (${r.status})</li>`;
        }
        html += `</ul></div>`;
      }
      if(sem.briefings && sem.briefings.length > 0) {
        html += `<div style="margin-bottom:12px;"><b>Briefings:</b><ul>`;
        for(const b of sem.briefings) {
          html += `<li>${b.student}: ${b.topic}</li>`;
        }
        html += `</ul></div>`;
      }
      if(sem.strands && sem.strands.length > 0) {
        html += `<div style="margin-bottom:12px;"><b>Strands:</b><ul>`;
        for(const s of sem.strands) {
          html += `<li>${s.student}: ${s.topic}</li>`;
        }
        html += `</ul></div>`;
      }
      if(sem.links && sem.links.length > 0) {
        html += `<div style="margin-bottom:12px;"><b>Links:</b><ul>`;
        for(const l of sem.links) {
          html += `<li><a href="${l.url}" target="_blank" rel="noopener">${l.label}</a></li>`;
        }
        html += `</ul></div>`;
      }
      if(sem.media && sem.media.length > 0) {
        html += `<div style="margin-bottom:12px;"><b>Media:</b><ul>`;
        for(const m of sem.media) {
          html += `<li><a href="${m.url}" target="_blank" rel="noopener">${m.title}</a> (${m.type})</li>`;
        }
        html += `</ul></div>`;
      }
      
      html += `</div></details>`;
    }
    html += `</div>`;
  }
  
  html += `</div>`;
  panel.innerHTML = html;
}

function renderAcademicsLanding(panel) {
  const now = new Date();
  const sems = getAllSeminars();
  const nextSem = sems.find(x => x.endT > now);
  const tasks = readState("spo.v1.tasks");
  const readingsState = readState("spo.v1.readings");

  let html = `<div style="display:flex; flex-direction:column; gap:32px; padding-top:16px;">`;

  // 1. Next Seminar
  html += `<div><h2 style="font-family:'Instrument Serif',serif;font-size:24px;margin:0 0 12px;font-weight:400;">Next class</h2>`;
  if(nextSem) {
    const isToday = key(nextSem.d) === key(now);
    const dateStr = isToday ? "Today" : fmtDate(nextSem.d);
    const locObj = LOC[nextSem.sess.loc];
    html += `
      <div style="background:var(--paper-2); border-radius:6px; padding:16px; border-left:4px solid ${locObj.colour}">
        <div style="font-size:13.5px; color:var(--ink-soft); margin-bottom:4px;">${dateStr}, ${nextSem.from}–${nextSem.to}</div>
        <h3 style="margin:0 0 4px; font-size:18px;"><a href="#/academics/${nextSem.course.id}" style="color:inherit;text-decoration:none;">${nextSem.course.title}</a></h3>
        <div style="font-weight:600; margin-bottom:4px;">Session ${nextSem.sem.n}: ${nextSem.sem.title || ""}</div>
        <div style="font-size:14.5px; margin-bottom:12px;">
          <a class="map-link" target="_blank" rel="noopener" style="text-decoration-color:${locObj.colour}" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locObj.address)}">${locObj.name}</a>${nextSem.sess.room ? " · " + nextSem.sess.room : ""}
        </div>
    `;
    const reqs = (nextSem.sem.readings || []).filter(r => r.status === "required");
    if(reqs.length > 0) {
      html += `<div style="font-size:14px; font-weight:600; margin-bottom:8px;">Required readings:</div>`;
      html += `<div style="display:flex; flex-direction:column; gap:8px;">`;
      for(const r of reqs) {
        const checked = readingsState[r.id] ? "checked" : "";
        html += `<label style="display:flex; gap:12px; align-items:flex-start; font-size:14px; cursor:pointer;">
          <input type="checkbox" disabled ${checked} style="margin-top:3px;width:18px;height:18px;">
          <div>${r.author}. <i>${r.title}</i>.</div>
        </label>`;
      }
      html += `</div>`;
    }
    html += `</div>`;
  } else {
    html += `<div class="empty">No upcoming classes.</div>`;
  }
  html += `</div>`;

  // 2. Deadlines
  html += `<div><h2 style="font-family:'Instrument Serif',serif;font-size:24px;margin:0 0 12px;font-weight:400;">
    Upcoming Deadlines <a href="#/academics/deadlines" style="font-size:14px; font-family:'Instrument Sans',sans-serif; text-decoration:none; margin-left:12px;">See all &rarr;</a>
  </h2>`;
  const allDeads = getAllDeadlines();
  // filter out past OR ticked deadlines for the top 4? The brief says "The next four assessments by due... Anything within 7 days is emphasised; anything overdue and unticked is emphasised more strongly."
  // Wait, overdue AND unticked implies past deadlines are included if unticked!
  const sortedDeads = allDeads
    .filter(x => x.t) // must have a date
    .sort((a,b) => a.t - b.t);
  
  // To find next 4, we might want the first 4 that are (future OR (past and unticked)).
  const relevantDeads = sortedDeads.filter(x => x.t > now || !tasks[x.a.id]).slice(0,4);
  if(relevantDeads.length) {
    html += `<div style="display:grid; gap:12px;">`;
    for(const d of relevantDeads) {
      const isDone = !!tasks[d.a.id];
      const days = (d.t - now) / (1000*60*60*24);
      let emClass = "";
      if(!isDone && days < 0) emClass = `color:var(--alert); font-weight:600;`;
      else if(!isDone && days < 7) emClass = `font-weight:600;`;
      const timeStr = d.a.provisional ? `<del>${fmtDate(d.t)}</del> (unconfirmed)` : fmtDate(d.t);
      html += `
        <div style="background:var(--paper-2); padding:12px; border-radius:6px; display:flex; gap:12px; align-items:flex-start; ${emClass}">
          <input type="checkbox" disabled ${isDone?"checked":""} style="margin-top:3px;width:18px;height:18px;">
          <div>
            <div style="font-size:13.5px; color:var(--ink-soft); margin-bottom:2px;">${d.course.code} · ${timeStr}</div>
            <div style="font-size:15px; margin-bottom:2px;">${d.a.title}</div>
            <div style="font-size:13.5px; color:var(--ink-soft);">${d.a.weight !== null ? d.a.weight+"%" : "Unknown weight"}</div>
          </div>
        </div>
      `;
    }
    html += `</div>`;
  } else {
    html += `<div class="empty">No upcoming deadlines.</div>`;
  }
  html += `</div>`;

  // 3. Courses
  html += `<div><h2 style="font-family:'Instrument Serif',serif;font-size:24px;margin:0 0 12px;font-weight:400;">Courses</h2>`;
  if(window.COURSES) {
    html += `<div style="display:grid; gap:12px;">`;
    for(const c of window.COURSES) {
      const locObj = LOC[c.building];
      const cSems = sems.filter(x => x.course.id === c.id);
      const cNext = cSems.find(x => x.endT > now);
      const cPastCount = cSems.filter(x => x.endT < now).length;
      
      let reqCount = 0;
      if(c.seminars) {
        for(const sem of c.seminars) {
          if(sem.readings) {
            for(const r of sem.readings) {
              if(r.status === "required" && !readingsState[r.id]) reqCount++;
            }
          }
        }
      }
      
      html += `
        <a href="#/academics/${c.id}" style="display:block; text-decoration:none; color:inherit; background:var(--paper-2); padding:16px; border-radius:6px; border-left:4px solid ${locObj?locObj.colour:'var(--hair)'}">
          <h3 style="margin:0 0 4px; font-size:17px;">${c.title}</h3>
          <div style="font-size:14.5px; color:var(--ink-soft); margin-bottom:12px;">${c.instructor || ""}</div>
          <div style="display:flex; justify-content:space-between; font-size:13.5px; color:var(--ink-soft);">
            <span>${cNext ? "Next: " + fmtDate(cNext.d) : "Finished"}</span>
            <span>${cPastCount}/12 done · ${reqCount} readings left</span>
          </div>
        </a>
      `;
    }
    html += `</div>`;
  }
  html += `</div>`;
  
  html += `</div>`;
  panel.innerHTML = html;
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
