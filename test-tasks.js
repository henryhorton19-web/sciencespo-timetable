const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const scheduleJS = fs.readFileSync('data-schedule.js', 'utf8');
const coursesJS = fs.readFileSync('data-courses.js', 'utf8');
const appJS = fs.readFileSync('app.js', 'utf8');

const dom = new JSDOM(`<!DOCTYPE html><html><body>
  <div id="taskWeekLabel"></div>
  <div id="taskContent"></div>
</body></html>`, { url: "http://localhost/#/tasks/2026-10-12" });
const window = dom.window;
const document = window.document;

global.window = window;
global.document = document;
global.localStorage = { getItem: () => "{}", setItem: () => {} };
global.navigator = {};
global.LOC = { chaise: {colour: "red"}, sg27: {colour: "blue"}, sg28: {colour: "green"}, aquin: {colour:"yellow"}, germain: {colour: "purple"} };

const script = `
  ${scheduleJS}
  ${coursesJS}
  window.COURSES = COURSES;
  window.SESSIONS = SESSIONS;
  window.LOC = LOC;
  ${appJS.replace(/window\.addEventListener.*/g, '').replace(/document\.getElementById.*/g, '').replace(/handleRoute\(\);/g, '').replace(/setInterval.*/g, '')}
  taskAnchor = parse("2026-10-12");
  renderTasks();
`;

try {
  window.eval(script);
  console.log("Oct 12 text:", document.getElementById('taskContent').textContent);
} catch(e) {
  console.log("Error:", e);
}
