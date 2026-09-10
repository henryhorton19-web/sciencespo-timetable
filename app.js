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
        if(!sess.excludeDates || !sess.excludeDates.includes(key(d))) {
          out.push(new Date(d));
        }
      }
      d.setDate(d.getDate() + 1);
    }
  }
  if(sess.extraDates) {
    for(const extra of sess.extraDates) {
      out.push(parse(extra.date));
    }
  }
  return out.sort((a,b) => a - b);
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
    let isWeekly = (s.dow === dow);
    if(isWeekly && s.excludeDates && s.excludeDates.includes(k)) isWeekly = false;
    
    let on = false;
    if(isWeekly) {
      on = s.ranges.some(([a,b]) => k >= a && k <= b);
    }
    
    let extraObj = null;
    if(s.extraDates) {
      extraObj = s.extraDates.find(x => x.date === k);
      if(extraObj) on = true;
    }

    if(on) {
      let from = s.from, to = s.to, note = null, loc = s.loc, room = s.room;
      
      if(extraObj) {
        from = extraObj.from || from;
        to = extraObj.to || to;
        loc = extraObj.loc || loc;
        room = extraObj.room || room;
        note = extraObj.note || null;
      } else {
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
      }
      out.push({...s, from, to, loc, room, _overrideNote: note});
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
let taskAnchor = mondayOf(new Date());
let lastTickDay = key(new Date());

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
  
  const prefs = readState("spo.v1.prefs");
  const tasks = readState("spo.v1.tasks");
  const allDeads = getAllDeadlines().filter(x => x.t).sort((a,b) => a.t - b.t);
  const nextDead = allDeads.find(x => x.t > now && !tasks[x.a.id]);
  
  if(nextDead && !prefs[`dismiss_deadline_${nextDead.a.id}`]) {
    const timeStr = nextDead.a.provisional ? `<del>${fmtDate(nextDead.t)}</del> (unconfirmed)` : fmtDate(nextDead.t);
    host.innerHTML += `
      <div style="background:var(--paper-2); padding:12px 16px; border-radius:6px; display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
        <div>
          <div style="font-size:13px; font-weight:600; color:var(--alert); text-transform:uppercase; letter-spacing:0.04em; margin-bottom:4px;">Next Deadline</div>
          <div style="font-size:14.5px;"><b>${nextDead.course.title}</b>: <a href="#/academics/${nextDead.course.id}" style="color:inherit;">${nextDead.a.title}</a> (${timeStr})</div>
        </div>
        <button onclick="window.dismissDeadline('${nextDead.a.id}')" style="background:none; border:none; padding:8px; cursor:pointer; color:var(--ink-soft); font-size:20px; line-height:1;">&times;</button>
      </div>
    `;
  }

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
  if(h.startsWith("academics")) return { tab:"academics", path:h.split("/").slice(1) };
  if(h.startsWith("tasks"))     return { tab:"tasks",     path:h.split("/").slice(1) };
  return { tab:"week", path:h.split("/").slice(1) };
}

function switchTab(tabId) {
  for(const t of ["week","academics","tasks"]) {
    const on = t === tabId;
    const btn = document.getElementById("tab-" + t);
    btn.setAttribute("aria-selected", on);
    btn.className = on ? "solid" : "";
    document.getElementById("panel-" + t).style.display = on ? "block" : "none";
  }
}

function readState(key) {
  try { return JSON.parse(localStorage.getItem(key) || "{}"); }
  catch(e) { return {}; }
}
function writeState(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); }
  catch(e) {}
}
function toggleState(namespace, id) {
  const state = readState(namespace);
  if(state[id]) delete state[id];
  else state[id] = true;
  writeState(namespace, state);
  handleRoute();
}
window.toggleTask = id => toggleState("spo.v1.tasks", id);
window.toggleReading = id => toggleState("spo.v1.readings", id);
window.loadSyncData = () => {
  try {
    const data = JSON.parse(document.getElementById("syncData").value);
    if(data["spo.v1.readings"]) writeState("spo.v1.readings", data["spo.v1.readings"]);
    if(data["spo.v1.tasks"]) writeState("spo.v1.tasks", data["spo.v1.tasks"]);
    if(data["spo.v1.briefing"]) writeState("spo.v1.briefing", data["spo.v1.briefing"]);
    if(data["spo.v1.prefs"]) writeState("spo.v1.prefs", data["spo.v1.prefs"]);
    alert("Data loaded successfully.");
    handleRoute();
  } catch(e) {
    alert("Failed to parse data. Make sure it's valid JSON.");
  }
}
window.dismissDeadline = id => {
  const prefs = readState("spo.v1.prefs");
  prefs[`dismiss_deadline_${id}`] = true;
  writeState("spo.v1.prefs", prefs);
  handleRoute();
};
function formatICSDate(date) {
  const pad = n => String(n).padStart(2,"0");
  return date.getFullYear() + pad(date.getMonth() + 1) + pad(date.getDate()) + 'T' + pad(date.getHours()) + pad(date.getMinutes()) + pad(date.getSeconds());
}
window.exportICS = () => {
  const utcNow = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  let ics = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Sciences Po Timetable//EN",
    "BEGIN:VTIMEZONE", "TZID:Europe/Paris", "X-LIC-LOCATION:Europe/Paris",
    "BEGIN:DAYLIGHT", "TZOFFSETFROM:+0100", "TZOFFSETTO:+0200", "TZNAME:CEST",
    "DTSTART:19700329T020000", "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU", "END:DAYLIGHT",
    "BEGIN:STANDARD", "TZOFFSETFROM:+0200", "TZOFFSETTO:+0100", "TZNAME:CET",
    "DTSTART:19701025T030000", "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU", "END:STANDARD", "END:VTIMEZONE"
  ];
  for(const x of getAllSeminars()) {
    const locObj = window.LOC[x.sess.loc];
    ics.push("BEGIN:VEVENT", `UID:sem-${x.course.id}-${x.sem.n}@timetable.local`, `DTSTAMP:${utcNow}`,
      `DTSTART;TZID=Europe/Paris:${formatICSDate(x.startT)}`, `DTEND;TZID=Europe/Paris:${formatICSDate(x.endT)}`,
      `SUMMARY:${x.course.title} (Session ${x.sem.n})`, `DESCRIPTION:${x.sem.title || ""}`);
    if(locObj) ics.push(`LOCATION:${locObj.name} ${x.sess.room || ""}`);
    ics.push("END:VEVENT");
  }
  for(const d of getAllDeadlines().filter(x => x.t)) {
    ics.push("BEGIN:VEVENT", `UID:dead-${d.a.id}@timetable.local`, `DTSTAMP:${utcNow}`,
      `DTSTART;TZID=Europe/Paris:${formatICSDate(d.t)}`, `DTEND;TZID=Europe/Paris:${formatICSDate(d.t)}`,
      `SUMMARY:Deadline: ${d.course.code} - ${d.a.title}`, "END:VEVENT");
  }
  ics.push("END:VCALENDAR");
  const blob = new Blob([ics.join("\r\n")], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "sciences-po-timetable.ics";
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

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

function renderReading(r, readingsState, inGroup = false) {
  let citeParts = [];
  if(r.author) citeParts.push(`<span style="font-weight:500;">${r.author}</span>`);
  
  let titleHtml = "";
  if (r.container) {
    titleHtml = `"${r.title}"`;
  } else {
    titleHtml = `<i>${r.title}</i>`;
  }
  if (titleHtml) citeParts.push(titleHtml);
  
  if (r.container) citeParts.push(`<i>${r.container}</i>`);
  
  let volIssue = "";
  if(r.volume) volIssue += r.volume;
  if(r.issue) volIssue += `(${r.issue})`;
  if(volIssue) citeParts.push(volIssue);
  
  if(r.publisher) citeParts.push(r.publisher);
  if(r.year) citeParts.push(r.year);
  if(r.pages) citeParts.push(`pp. ${r.pages.replace('-', '–')}`);
  
  let cite = citeParts.join(", ") + ".";
  
  if (!inGroup && r.status === "recommended") {
    cite += ` <span class="reading-recommended-label">(recommended)</span>`;
  }
  
  let locHtml = "";
  if(r.locator) {
    if(r.locator.type === "url") locHtml = `<a class="map-link" href="${r.locator.value}" target="_blank" rel="noopener" onclick="event.stopPropagation()">Source</a>`;
    else if(r.locator.type === "doi") locHtml = `<a class="map-link" href="https://doi.org/${r.locator.value}" target="_blank" rel="noopener" onclick="event.stopPropagation()">DOI: ${r.locator.value}</a>`;
    else if(r.locator.type === "online") locHtml = `<span>Library e-resource</span>`;
    else if(r.locator.type === "shelfmark") locHtml = `<span style="user-select:text; cursor:text;" onclick="event.stopPropagation()">Library shelfmark ${r.locator.value}</span> <!-- TODO: Catalogue search routing -->`;
    if(locHtml) {
      locHtml = `<div style="font-size:13.5px; margin-top:4px; color:var(--ink-soft);">${locHtml}</div>`;
    }
  }

  const checked = readingsState && readingsState[r.id] ? "checked" : "";
  return `
    <label class="reading-item">
      <input type="checkbox" class="reading-checkbox" onchange="window.toggleReading('${r.id}')" ${checked}>
      <div class="reading-body">
        <div class="reading-cite">
          ${cite}
        </div>
        ${locHtml}
      </div>
    </label>
  `;
}

function renderAcademicsRoute(path) {
  const panel = document.getElementById("panel-academics");
  if (!path.length || path[0] === "") {
    renderAcademicsLanding(panel);
  } else if (path[0] === "deadlines") {
    renderDeadlinesRoute(panel);
  } else {
    renderAcademicsCourse(path[0], panel);
  }
}

function renderDeadlinesRoute(panel) {
  const allDeads = getAllDeadlines().sort((a,b) => {
    if(!a.t && !b.t) return 0;
    if(!a.t) return 1;
    if(!b.t) return -1;
    return a.t - b.t;
  });
  const tasks = readState("spo.v1.tasks");
  
  let html = `<div style="padding-top:16px;">
    <a href="#/academics" style="display:inline-block; margin-bottom:16px; text-decoration:none; color:var(--ink-soft); font-size:14.5px;">&larr; Back to Academics</a>
    <h2 style="font-family:'Instrument Serif',serif; font-size:32px; font-weight:400; margin:0 0 24px; line-height:1.1;">All Deadlines</h2>
  `;
  
  let currentMonth = "";
  for(const d of allDeads) {
    const month = d.t ? d.t.toLocaleDateString("en-GB", { month:"long", year:"numeric" }) : "Unscheduled";
    if(month !== currentMonth) {
      html += `<h3 style="font-size:18px; margin:24px 0 12px; border-bottom:1px solid var(--hair); padding-bottom:8px;">${month}</h3>`;
      currentMonth = month;
    }
    const isDone = !!tasks[d.a.id];
    let timeStr = "No date";
    if(d.t) {
      timeStr = fmtDate(d.t);
      if(d.a.provisional) timeStr = `<del>${timeStr}</del> <span class="course-unconfirmed">(Unconfirmed)</span>`;
    }
    html += `
      <div style="background:var(--paper-2); padding:12px; border-radius:6px; display:flex; gap:12px; align-items:flex-start; margin-bottom:8px;">
        <input type="checkbox" onchange="window.toggleTask('${d.a.id}')" ${isDone?"checked":""} style="margin-top:3px;width:18px;height:18px;cursor:pointer;">
        <div>
          <div style="font-size:13.5px; color:var(--ink-soft); margin-bottom:2px;">${d.course.code} · ${timeStr}</div>
          <div style="font-size:15px; margin-bottom:2px;">${d.a.title}</div>
          <div style="font-size:13.5px; color:var(--ink-soft);">${d.a.weight !== null ? d.a.weight+"%" : "Unknown weight"}</div>
        </div>
      </div>
    `;
  }
  html += `</div>`;
  panel.innerHTML = html;
}

function renderAcademicsCourse(courseId, panel) {
  if(!window.COURSES) return;
  const course = window.COURSES.find(c => c.id === courseId);
  if(!course) {
    panel.innerHTML = `<div class="empty">Course not found.</div>`;
    return;
  }
  
  const now = new Date();
  const y = window.scrollY;
  const occs = occurrencesOf(course.scheduleId);
  const tasks = readState("spo.v1.tasks");
  const readingsState = readState("spo.v1.readings");
  const sems = getAllSeminars().filter(x => x.course.id === course.id);
  const nextSem = sems.find(x => x.endT > now);
  
  let html = `<div style="padding-top:16px;">
    <a href="#/academics" class="academics-back">&larr; Back to Academics</a>
    <h2 class="course-title">${course.title}</h2>
    ${course.registrarTitle ? `<div style="font-size:14px; color:var(--ink-soft); margin-bottom:4px; font-style:italic;">Registrar: ${course.registrarTitle}</div>` : ""}
    <div class="course-meta">
      ${course.code} 
      ${course.instructor ? `· ${course.instructor}` : ""} 
      ${course.instructorEmail ? `· <a href="mailto:${course.instructorEmail}">${course.instructorEmail}</a>` : ""}
      ${course.provisional ? `<span class="course-unconfirmed">· Unconfirmed</span>` : ""}
    </div>
  `;
  
  // Meeting pattern (from schedule)
  const sched = window.SESSIONS.find(s => s.id === course.scheduleId);
  if(sched) {
    const loc = window.LOC[sched.loc];
    html += `
      <div style="font-size:14.5px; margin-bottom:16px;">
        <strong>Meeting:</strong> ${DAYS[sched.dow]} ${sched.from}–${sched.to} · 
        ${sched.room || ""} ${loc ? `· <a class="map-link" href="${loc.maps}" target="_blank" rel="noopener">${loc.name}</a>` : ""}
      </div>
    `;
  }
  if(course.syllabusUrl) html += `<div style="font-size:14.5px; margin-bottom:16px;"><strong>Syllabus:</strong> <a href="${course.syllabusUrl}" target="_blank" rel="noopener">Link</a></div>`;
  if(course.lastUpdated) {
    const d = new Date(course.lastUpdated);
    html += `<div style="font-size:13.5px; color:var(--ink-soft); margin-bottom:16px;">Last updated: ${fmtDate(d)} ${d.getFullYear()}</div>`;
  }

  // Course notes
  // Course notes
  if(course.note) html += `<div class="course-note"><strong>Note:</strong> ${course.note}</div>`;
  
  // Course rules
  let rulesHtml = "";
  if(course.aiPolicyNote) rulesHtml += `<div style="margin-bottom:8px;"><strong>AI Policy:</strong> ${course.aiPolicyNote}</div>`;
  if(course.citationStyleNote) rulesHtml += `<div style="margin-bottom:8px;"><strong>Citation Style:</strong> ${course.citationStyleNote}</div>`;
  if(course.submissionNote) rulesHtml += `<div style="margin-bottom:8px;"><strong>Submission:</strong> ${course.submissionNote}</div>`;
  if(course.materialsNote) rulesHtml += `<div style="margin-bottom:8px;"><strong>Materials:</strong> ${course.materialsNote}</div>`;
  if(course.studyNote) rulesHtml += `<div style="margin-bottom:8px;"><strong>Study Note:</strong> ${course.studyNote}</div>`;
  if(course.examNote) rulesHtml += `<div style="margin-bottom:8px;"><strong>Exam Note:</strong> ${course.examNote}</div>`;
  if(course.missedAssessmentNote) rulesHtml += `<div style="margin-bottom:8px;"><strong>Missed Assessment:</strong> ${course.missedAssessmentNote}</div>`;
  if(course.attendanceNote) rulesHtml += `<div style="margin-bottom:8px;"><strong>Attendance:</strong> ${course.attendanceNote}</div>`;
  if(course.regradeNote) rulesHtml += `<div style="margin-bottom:8px;"><strong>Regrades:</strong> ${course.regradeNote}</div>`;
  
  if(rulesHtml) {
    html += `
      <details class="accordion-details" style="margin-bottom:16px;">
        <summary class="accordion-summary" style="font-weight:600; font-size:14.5px;">Course rules &amp; policies</summary>
        <div class="accordion-content" style="font-size:14.5px;">
          ${rulesHtml}
        </div>
      </details>
    `;
  }
  
  // Shelf
  if(course.shelf && course.shelf.length > 0) {
    html += `<h3 class="section-head">Course Reading</h3>`;
    const req = course.shelf.filter(r => r.status === "required");
    const rec = course.shelf.filter(r => r.status !== "required");
    
    for(const r of req) {
      html += renderReading(r, readingsState, true);
    }
    
    if(rec.length > 0) {
      if(rec.length > 3) {
        html += `<details class="accordion-details"><summary class="accordion-summary" style="font-weight:600; font-size:14.5px;">Recommended (${rec.length})</summary><div class="accordion-content">`;
      } else {
        html += `<h4 class="sub-head" style="margin-top:16px;">Recommended</h4>`;
      }
      for(const r of rec) {
        html += renderReading(r, readingsState, true);
      }
      if(rec.length > 3) html += `</div></details>`;
    }
    html += `<div style="margin-bottom:24px;"></div>`;
  }
  
  // Assessments
  if(course.assessments && course.assessments.length > 0) {
    html += `<h3 class="section-head">Assessments</h3>`;
    html += `<div style="display:grid; gap:8px; margin-bottom:32px;">`;
    for(const a of course.assessments) {
      const isDone = !!tasks[a.id];
      // Include time in fmtDate by custom formatting if due exists
      let dueStr = "No date";
      if(a.due) {
        const d = new Date(a.due);
        dueStr = fmtDate(d) + " at " + d.toLocaleTimeString("en-GB", {hour:'2-digit', minute:'2-digit'});
      }
      if(a.provisional) dueStr = `<del>${dueStr}</del> <span class="course-unconfirmed">(Unconfirmed)</span>`;
      
      html += `
        <div style="display:flex; gap:12px; align-items:flex-start; background:var(--paper-2); padding:10px 14px; border-radius:6px;">
          <input type="checkbox" onchange="window.toggleTask('${a.id}')" ${isDone?"checked":""} style="width:18px;height:18px;cursor:pointer;margin-top:3px;">
          <div>
            <div style="font-size:15px; font-weight:500; margin-bottom:2px;">${a.title}</div>
            <div style="font-size:13.5px; color:var(--ink-soft); margin-bottom:4px;">
              ${a.weight !== null ? a.weight+"%" : "Unknown weight"} · ${dueStr}
              ${a.channel ? ` · ${a.channel}` : ""}
              ${a.group ? ` · <strong>Group work</strong>` : ""}
            </div>
            ${a.note ? `<div style="font-size:13.5px; margin-bottom:4px;">${a.note}</div>` : ""}
            ${a.dueNote ? `<div style="font-size:13.5px; color:var(--ink-soft); font-style:italic;">${a.dueNote}</div>` : ""}
            ${a.warn ? `<div style="font-size:13.5px; color:var(--alert); font-weight:600; margin-top:4px;">⚠️ ${a.warn}</div>` : ""}
          </div>
        </div>
      `;
    }
    html += `</div>`;
  }
  
  // Seminars
  if(course.seminars && course.seminars.length > 0) {
    html += `<h3 class="section-head">Seminars</h3>`;
    html += `<div style="display:flex; flex-direction:column; gap:12px;">`;
    
    let nextN = nextSem ? nextSem.sem.n : -1;
    
    for(const semObj of sems) {
      const sem = semObj.sem;
      const isOpen = sem.n === nextN;
      const sessionWord = course.code.startsWith("AECO") ? "Lecture" : "Session";
      const semTitle = sem.title ? sem.title : `${sessionWord} ${sem.n}`;
      
      html += `<details ${isOpen ? "open" : ""} class="accordion-details">
        <summary class="accordion-summary">
          <div class="sem-title-box">
            <h4 class="sem-title">
              ${sem.provisional ? `<span class="course-unconfirmed">(Unconfirmed)</span> ` : ""}
              ${semTitle}
            </h4>
          </div>
          <div class="sem-date">${fmtDate(semObj.d)}</div>
        </summary>
        <div class="accordion-content">
      `;
      
      if(sem.deadlineHere) {
        const a = course.assessments.find(a => a.id === sem.deadlineHere);
        if(a) html += `<div class="deadline-inline">Due today: ${a.title}</div>`;
      }
      if(sem.deadlineSoon) {
        const a = course.assessments.find(a => a.id === sem.deadlineSoon);
        if(a) html += `<div class="deadline-inline">Due soon: ${a.title}</div>`;
      }
      
      if(sem.part) html += `<div style="margin-bottom:8px; font-weight:600; color:var(--ink-soft); text-transform:uppercase; letter-spacing:0.05em; font-size:12px;">Part ${sem.part}</div>`;
      if(sem.note) html += `<div style="margin-bottom:12px; font-style:italic; font-size:14.5px;">Note: ${sem.note}</div>`;
      if(sem.themes) html += `<div style="margin-bottom:12px; font-size:14.5px;"><strong>Themes:</strong> ${sem.themes.join(" · ")}</div>`;
      
      // Readings
      if(sem.readings && sem.readings.length > 0) {
        html += `<div style="margin-bottom:16px;"><h4 class="sub-head">Readings</h4>`;
        for(const r of sem.readings) {
          html += renderReading(r, readingsState);
        }
        html += `</div>`;
      }
      
      if(sem.briefings && sem.briefings.length > 0) {
        html += `<div style="margin-bottom:16px;"><h4 class="sub-head">Briefings</h4>`;
        for(const b of sem.briefings) {
          html += `<div class="briefing-item"><strong>${b.no}.</strong> ${b.question}`;
          if(b.assigned) {
            html += ` <span style="display:inline-block; font-size:11px; font-weight:600; text-transform:uppercase; background:var(--accent); color:#fff; padding:1px 6px; border-radius:4px; margin-left:6px; vertical-align:middle;">Your Briefing</span>`;
          }
          if(!b.readings || b.readings.length === 0) {
            html += `<span class="briefing-note">(reading list not yet entered)</span>`;
          }
          html += `</div>`;
        }
        html += `</div>`;
      }
      
      if(sem.strands && Object.keys(sem.strands).length > 0) {
        html += `<div style="margin-bottom:16px;">`;
        const order = ["news", "tech", "society", "demo", "actors", "admin"];
        for(const key of order) {
          const items = sem.strands[key];
          if(items && items.length > 0) {
            html += `<div class="strand-group"><div class="strand-label">${key}</div><ul class="strand-list">`;
            for(const item of items) {
              if(item === "tbd") {
                html += `<li class="strand-tbd">tbd</li>`;
              } else {
                html += `<li>${item}</li>`;
              }
            }
            html += `</ul></div>`;
          }
        }
        html += `</div>`;
      }
      
      if(sem.links && sem.links.length > 0) {
        html += `<div style="margin-bottom:12px; font-size:14.5px;"><strong>Links:</strong><ul>`;
        for(const l of sem.links) {
          html += `<li><a href="${l.url}" target="_blank" rel="noopener">${l.label}</a></li>`;
        }
        html += `</ul></div>`;
      }
      
      if(sem.media && sem.media.length > 0) {
        html += `<div style="margin-bottom:16px;"><h4 class="sub-head" style="margin-bottom:4px;">Media</h4>`;
        for(const m of sem.media) {
          html += `<div class="media-item"><span class="media-type">${m.type}:</span>${m.title}</div>`;
        }
        html += `</div>`;
      }
      
      html += `</div></details>`;
    }
    html += `</div>`;
  }
  
  // Footer blocks (todo, unscheduled, extraSessions)
  let footerHtml = "";
  if(course.todo) footerHtml += `<div class="course-note"><strong>TODO:</strong> ${course.todo}</div>`;
  if(course.unscheduled && course.unscheduled.length > 0) {
    footerHtml += `<div class="course-note"><strong>Unscheduled:</strong><ul style="margin:4px 0 0; padding-left:20px;">`;
    for(const u of course.unscheduled) footerHtml += `<li>${u}</li>`;
    footerHtml += `</ul></div>`;
  }
  if(course.extraSessions && course.extraSessions.length > 0) {
    footerHtml += `<div class="course-note"><strong>Extra Sessions:</strong><ul style="margin:4px 0 0; padding-left:20px;">`;
    for(const ex of course.extraSessions) {
      footerHtml += `<li>${ex.date} ${ex.from}-${ex.to} (${ex.room}): ${ex.label} ${ex.provisional ? '<span class="course-unconfirmed">(Unconfirmed)</span>' : ''} - <em>${ex.note || ""}</em></li>`;
    }
    footerHtml += `</ul></div>`;
  }
  if(footerHtml) {
    html += `<h3 class="section-head" style="margin-top:32px;">Not yet placed</h3>${footerHtml}`;
  }
  
  html += `</div>`;
  panel.innerHTML = html;
  window.scrollTo(0, y);
}

function renderAcademicsLanding(panel) {
  const now = new Date();
  const sems = getAllSeminars();
  const nextSem = sems.find(x => x.endT > now);
  const tasks = readState("spo.v1.tasks");
  const readingsState = readState("spo.v1.readings");

  let html = `<div style="display:flex; flex-direction:column; gap:32px; padding-top:16px;">`;

  html += `<div>
    <input type="search" id="academicsSearch" placeholder="Search courses, readings, seminars..." style="width:100%; padding:10px 14px; font-size:16px; font-family:inherit; border:1px solid var(--hair); border-radius:6px; background:var(--paper-2); color:inherit;" oninput="window.handleSearch()">
    <div id="searchResults" style="display:none; margin-top:16px;"></div>
  </div>`;

  html += `<div id="academicsContent" style="display:flex; flex-direction:column; gap:32px;">`;

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
          <input type="checkbox" onchange="window.toggleReading('${r.id}')" ${checked} style="margin-top:3px;width:18px;height:18px;">
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
  const sortedDeads = allDeads.sort((a,b) => {
    if(!a.t && !b.t) return 0;
    if(!a.t) return 1;
    if(!b.t) return -1;
    return a.t - b.t;
  });
  
  // To find next 4, we might want the first 4 that are (future OR (past and unticked)).
  const relevantDeads = sortedDeads.filter(x => x.t > now || !tasks[x.a.id]).slice(0,4);
  if(relevantDeads.length) {
    html += `<div style="display:grid; gap:12px;">`;
    for(const d of relevantDeads) {
      const isDone = !!tasks[d.a.id];
      const days = d.t ? (d.t - now) / (1000*60*60*24) : Infinity;
      let emClass = "";
      if(!isDone && days < 0) emClass = `color:var(--alert); font-weight:600;`;
      else if(!isDone && days < 7) emClass = `font-weight:600;`;
      
      let timeStr = "No date";
      if(d.t) {
        timeStr = fmtDate(d.t);
        if(d.a.provisional) timeStr = `<del>${timeStr}</del> <span class="course-unconfirmed">(Unconfirmed)</span>`;
      }
      html += `
        <div style="background:var(--paper-2); padding:12px; border-radius:6px; display:flex; gap:12px; align-items:flex-start; ${emClass}">
          <input type="checkbox" onchange="window.toggleTask('${d.a.id}')" ${isDone?"checked":""} style="margin-top:3px;width:18px;height:18px;cursor:pointer;">
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
          <h3 style="margin:0 0 4px; font-size:17px;">${c.title} ${c.provisional ? `<span style="font-family:'Instrument Sans',sans-serif;font-size:11px;background:var(--alert);color:#fff;padding:2px 6px;border-radius:4px;vertical-align:middle;margin-left:6px;font-weight:600;">UNCONFIRMED</span>` : ""}</h3>
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
  
  // 4. Data Sync
  const allState = {
    "spo.v1.readings": readingsState,
    "spo.v1.tasks": tasks,
    "spo.v1.briefing": readState("spo.v1.briefing"),
    "spo.v1.prefs": readState("spo.v1.prefs")
  };
  
  html += `<div style="margin-top:40px; border-top:2px solid var(--plaque); padding-top:20px;">
    <h3 style="font-family:'Instrument Serif',serif; font-size:22px; font-weight:400; margin:0 0 12px;">Data Sync</h3>
    <p style="font-size:14px; color:var(--ink-soft); margin-bottom:12px;">Your progress is stored locally on this device. You can copy this JSON to move it to another device.</p>
    <textarea id="syncData" style="width:100%; height:80px; font-family:monospace; font-size:12px; padding:8px; margin-bottom:8px; border:1px solid var(--hair); border-radius:4px;">${JSON.stringify(allState)}</textarea>
    <div style="display:flex; gap:8px;">
      <button onclick="window.loadSyncData()" class="solid">Load Data</button>
      <button onclick="window.exportICS()">Export to Calendar (ICS)</button>
    </div>
  </div>`;
  
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
  } else if(route.tab === "tasks") {
    renderHero(new Date());
    if(route.path[0]) {
      const d = parse(route.path[0]);
      if(!isNaN(d)) taskAnchor = mondayOf(d);
    }
    renderTasks();
  }
}

window.addEventListener("hashchange", handleRoute);

document.getElementById("tab-week").addEventListener("click", () => {
  window.location.hash = "/week";
});
document.getElementById("tab-academics").addEventListener("click", () => {
  window.location.hash = "/academics";
});
document.getElementById("tab-tasks").addEventListener("click", () => {
  window.location.hash = "/tasks";
});
document.getElementById("taskPrev").onclick  = () => { taskAnchor = addDays(taskAnchor,-7); renderTasks(); };
document.getElementById("taskNext").onclick  = () => { taskAnchor = addDays(taskAnchor, 7); renderTasks(); };
document.getElementById("taskToday").onclick = () => { taskAnchor = mondayOf(new Date()); renderTasks(); };

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

function taskReadingGroups(from, to) {
  const a = key(from), b = key(to), out = [];
  for(const x of getAllSeminars()) {
    const k = key(x.d);
    if(k < a || k > b) continue;
    if(!x.sem.readings) continue;
    const reqs = x.sem.readings.filter(r => r.status === "required");
    if(!reqs.length) continue;
    out.push({ course:x.course, sem:x.sem, d:x.d, from:x.from, readings:reqs });
  }
  return out;
}

function taskDeadlines(from, to) {
  const a = key(from), b = key(to);
  return getAllDeadlines()
    .filter(x => x.t && key(x.t) >= a && key(x.t) <= b)
    .sort((x,y) => x.t - y.t);
}

function taskOverdue(now) {
  const rs = readState("spo.v1.readings"), ts = readState("spo.v1.tasks"), out = [];
  for(const x of getAllSeminars()) {
    if(x.endT >= now || !x.sem.readings) continue;
    for(const r of x.sem.readings) {
      if(r.status !== "required" || rs[r.id]) continue;
      out.push({ kind:"reading", course:x.course, sem:x.sem, d:x.d, r });
    }
  }
  for(const x of getAllDeadlines()) {
    if(!x.t || x.t >= now || ts[x.a.id]) continue;
    out.push({ kind:"deadline", course:x.course, a:x.a, d:x.t });
  }
  return out.sort((p,q) => p.d - q.d);
}

function taskOngoing() {
  const rs = readState("spo.v1.readings"), out = [];
  if(!window.COURSES) return out;
  for(const c of window.COURSES) {
    if(!c.shelf) continue;
    for(const r of c.shelf) {
      if(r.status !== "required" || rs[r.id]) continue;
      out.push({ course:c, r });
    }
  }
  return out;
}

function renderTasks() {
  const now = new Date();
  const mon = taskAnchor, sun = addDays(taskAnchor, 6);
  const readingsState = readState("spo.v1.readings");
  const tasksState = readState("spo.v1.tasks");
  const y = window.scrollY;
  
  let html = `<div style="padding-top:16px;">`;
  
  const groups = taskReadingGroups(mon, sun);
  const deads = taskDeadlines(mon, sun);
  
  let doneCount = 0;
  let totalCount = 0;
  for(const g of groups) {
    for(const r of g.readings) {
      totalCount++;
      if(readingsState[r.id]) doneCount++;
    }
  }
  for(const d of deads) {
    totalCount++;
    if(tasksState[d.a.id]) doneCount++;
  }
  
  html += `<div class="task-progress">${doneCount} of ${totalCount} done</div>`;
  
  const overdue = taskOverdue(now);
  if(overdue.length > 0) {
    html += `<h3 class="section-head" style="color:var(--alert);">Overdue</h3>`;
    html += `<div style="margin-bottom:24px;">`;
    for(const item of overdue) {
      if(item.kind === "reading") {
        const rowHtml = renderReading(item.r, readingsState, true);
        const outLink = `<a href="#/academics/${item.course.id}/s${item.sem.n}" onclick="event.stopPropagation()">Session ${item.sem.n}</a>`;
        const overdueText = `<div class="task-overdue" style="font-size:13.5px; margin-top:4px; font-weight:600;">Was due ${fmtDate(item.d)} · ${outLink}</div>`;
        html += rowHtml.replace('</div>\n    </label>', `${overdueText}</div></label>`);
      } else {
        const isDone = !!tasksState[item.a.id];
        let dStr = `<del>${fmtDate(item.d)}</del> (Unconfirmed)`;
        if(!item.a.provisional) dStr = fmtDate(item.d);
        const outLink = `<a href="#/academics/${item.course.id}" onclick="event.stopPropagation()">Course</a>`;
        html += `<div class="task-row ${isDone?"done":""}">
          <input type="checkbox" onchange="window.toggleTask('${item.a.id}')" ${isDone?"checked":""} style="margin-top:3px;width:18px;height:18px;cursor:pointer;">
          <div>
            <div style="font-size:15px; margin-bottom:2px;">${item.course.code} · ${item.a.title}</div>
            <div style="font-size:13.5px; color:var(--ink-soft); margin-bottom:4px;">${item.a.weight !== null ? item.a.weight+"%" : "Unknown weight"} · ${item.a.channel || ""}</div>
            <div class="task-overdue" style="font-size:13.5px; font-weight:600;">Was due ${fmtDate(item.d)} · ${outLink}</div>
          </div>
        </div>`;
      }
    }
    html += `</div>`;
  }
  
  if (groups.length === 0 && deads.length === 0) {
    if(key(mon) === "2026-10-26") {
      html += `<div class="task-empty">Autumn break — no classes and nothing due.</div>`;
    } else {
      html += `<div class="task-empty">Nothing due this week.</div>`;
    }
  } else {
    if(groups.length > 0) {
      html += `<h3 class="section-head">Readings</h3>`;
      for(const g of groups) {
        html += `<div class="task-group" style="--rail:${LOC[g.course.building].colour}">`;
        html += `<div class="task-group-head">${g.course.code} · Session ${g.sem.n} · ${DAYS[(g.d.getDay()+6)%7]} ${g.from}</div>`;
        for(const r of g.readings) {
          const rowHtml = renderReading(r, readingsState, true);
          const outLink = `<div style="font-size:13.5px; margin-top:4px;"><a href="#/academics/${g.course.id}/s${g.sem.n}" onclick="event.stopPropagation()">Session ${g.sem.n}</a></div>`;
          html += rowHtml.replace('</div>\n    </label>', `${outLink}</div></label>`);
        }
        html += `</div>`;
      }
    }
    
    if(deads.length > 0) {
      html += `<h3 class="section-head">Deadlines</h3>`;
      html += `<div style="margin-bottom:24px;">`;
      for(const x of deads) {
        const isDone = !!tasksState[x.a.id];
        let dateHtml = x.t.toLocaleTimeString("en-GB", {hour:'2-digit', minute:'2-digit'});
        if(x.a.provisional) dateHtml = `<del>${dateHtml}</del> (Unconfirmed)`;
        const outLink = `<div style="font-size:13.5px; margin-top:4px;"><a href="#/academics/${x.course.id}" onclick="event.stopPropagation()">Course</a></div>`;
        html += `<div class="task-row ${isDone?"done":""}">
          <input type="checkbox" onchange="window.toggleTask('${x.a.id}')" ${isDone?"checked":""} style="margin-top:3px;width:18px;height:18px;cursor:pointer;">
          <div>
            <div style="font-size:15px; margin-bottom:2px;">${x.course.code} · ${x.a.title}</div>
            <div style="font-size:13.5px; color:var(--ink-soft); margin-bottom:4px;">${x.a.weight !== null ? x.a.weight+"%" : "Unknown weight"} · ${dateHtml} · ${x.a.channel || ""}</div>
            ${outLink}
          </div>
        </div>`;
      }
      html += `</div>`;
    }
  }
  
  const ongoing = taskOngoing();
  if(ongoing.length > 0) {
    html += `<details class="accordion-details task-ongoing">
      <summary class="accordion-summary" style="font-weight:600; font-size:15px;">Ongoing, no deadline (${ongoing.length})</summary>
      <div class="accordion-content">
        <div style="font-size:14.5px; margin-bottom:12px; color:var(--ink-soft);">These have no session date, so they appear in no week.</div>`;
    for(const item of ongoing) {
      const rowHtml = renderReading(item.r, readingsState, true);
      const outLink = `<div style="font-size:13.5px; margin-top:4px;"><a href="#/academics/${item.course.id}" onclick="event.stopPropagation()">Course</a></div>`;
      html += rowHtml.replace('</div>\n    </label>', `${outLink}</div></label>`);
    }
    html += `</div></details>`;
  }
  
  html += `</div>`;
  document.getElementById("taskWeekLabel").textContent = `${fmtDate(mon)} – ${fmtDate(sun)}`;
  document.getElementById("taskContent").innerHTML = html;
  window.scrollTo(0, y);
}

handleRoute();
setInterval(() => {
  const route = parseHash();
  renderHero(new Date());
  if(route.tab === "week") renderWeek(new Date());
  if(route.tab === "tasks" && key(new Date()) !== lastTickDay) {
    lastTickDay = key(new Date());
    renderTasks();
  }
}, 30000);

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

window.handleSearch = () => {
  const q = document.getElementById("academicsSearch").value.trim();
  const res = document.getElementById("searchResults");
  const con = document.getElementById("academicsContent");
  if(!q) {
    res.style.display = "none";
    con.style.display = "flex";
    return;
  }
  res.style.display = "block";
  con.style.display = "none";
  
  if(!window.academicsFuse && window.Fuse) {
    const docs = [];
    if(window.COURSES) {
      for(const c of window.COURSES) {
        docs.push({ type: "Course", title: c.title, code: c.code, id: c.id });
        if(c.seminars) {
          for(const s of c.seminars) {
            docs.push({ type: "Seminar", title: s.title, note: s.note, courseId: c.id, cTitle: c.title });
            if(s.readings) {
              for(const r of s.readings) {
                docs.push({ type: "Reading", title: r.title, author: r.author, courseId: c.id, cTitle: c.title });
              }
            }
          }
        }
      }
    }
    window.academicsFuse = new window.Fuse(docs, { keys: ["title", "code", "author", "note"], threshold: 0.3 });
  }
  
  if(!window.academicsFuse) return;
  const results = window.academicsFuse.search(q);
  if(results.length === 0) {
    res.innerHTML = `<div class="empty">No results found.</div>`;
    return;
  }
  
  let h = `<div style="display:grid; gap:12px;">`;
  for(const item of results.slice(0,20)) {
    const d = item.item;
    h += `<a href="#/academics/${d.id || d.courseId}" onclick="setTimeout(() => { document.getElementById('academicsSearch').value=''; window.handleSearch(); }, 100)" style="display:block; text-decoration:none; color:inherit; background:var(--paper-2); padding:12px; border-radius:6px;">
      <div style="font-size:12px; font-weight:600; color:var(--ink-soft); text-transform:uppercase; letter-spacing:0.05em; margin-bottom:4px;">${d.type} ${d.cTitle ? "· " + d.cTitle : ""}</div>
      <div style="font-size:15px; font-weight:500;">${d.title || d.code}</div>
      ${d.author ? `<div style="font-size:13.5px; color:var(--ink-soft); margin-top:2px;">${d.author}</div>` : ""}
    </a>`;
  }
  h += `</div>`;
  res.innerHTML = h;
};
