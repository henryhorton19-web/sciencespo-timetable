/**
 * Manual pre-deploy check.
 * Run \`node validate.js\` to assert date consistency between schedule and courses.
 */
const fs = require('fs');
const scheduleJS = fs.readFileSync('data-schedule.js', 'utf8');
const coursesJS = fs.readFileSync('data-courses.js', 'utf8');

const script = `
  var window = {};
  ${scheduleJS}
  ${coursesJS}
  return window;
`;

const fn = new Function(script);
const mockWindow = fn();

const SESSIONS = mockWindow.SESSIONS;
const COURSES = mockWindow.COURSES;
const parse = s => { const [y,m,d]=s.split("-").map(Number); return new Date(y,m-1,d); };
const pad = n => String(n).padStart(2,"0");
const key = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;

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

let allGood = true;
for (const c of COURSES) {
  const occs = occurrencesOf(c.scheduleId);
  console.log(`Course ${c.code} derived ${occs.length} occurrences for ${c.scheduleId}`);
  if (occs.length !== 12 && !c.extraSessions) {
    console.warn(`WARN: ${c.code} has ${occs.length} occurrences instead of 12!`);
    allGood = false;
  }
  
  if (c.seminars) {
    for (const sem of c.seminars) {
      if (sem.assertDate) {
        const derived = occs[sem.n - 1];
        if (!derived) {
          console.warn(`WARN: ${c.code} seminar ${sem.n} missing derived date! assertDate=${sem.assertDate}`);
          allGood = false;
        } else if (key(derived) !== sem.assertDate) {
          console.warn(`WARN: ${c.code} seminar ${sem.n} mismatch! assertDate=${sem.assertDate}, derived=${key(derived)}`);
          allGood = false;
        }
      }
    }
  }
}
if (allGood) console.log("SUCCESS: All derived dates match assertDate and have 12 occurrences.");
