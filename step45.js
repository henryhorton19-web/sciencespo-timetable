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
  
  // Progress line
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
  
  // Overdue
  const overdue = taskOverdue(now);
  if(overdue.length > 0) {
    html += `<h3 class="section-head" style="color:var(--alert);">Overdue</h3>`;
    html += `<div style="margin-bottom:24px;">`;
    for(const item of overdue) {
      if(item.kind === "reading") {
        const rowHtml = renderReading(item.r, readingsState, true);
        // Replace label tag with one that includes overdue logic and out link
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
    // Readings
    if(groups.length > 0) {
      html += `<h3 class="section-head">Readings</h3>`;
      for(const g of groups) {
        html += `<div class="task-group" style="--rail:${window.LOC[g.course.building].colour}">`;
        html += `<div class="task-group-head">${g.course.code} · Session ${g.sem.n} · ${DAYS[(g.d.getDay()+6)%7]} ${g.from}</div>`;
        for(const r of g.readings) {
          const rowHtml = renderReading(r, readingsState, true);
          const outLink = `<div style="font-size:13.5px; margin-top:4px;"><a href="#/academics/${g.course.id}/s${g.sem.n}" onclick="event.stopPropagation()">Session ${g.sem.n}</a></div>`;
          html += rowHtml.replace('</div>\n    </label>', `${outLink}</div></label>`);
        }
        html += `</div>`;
      }
    }
    
    // Deadlines
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
  
  // Ongoing
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
