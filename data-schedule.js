window.LOC = {
  chaise:{name:"9 rue de la Chaise", colour:"var(--chaise)", address:"9 Rue de la Chaise, 75007 Paris, France"},
  sg27:{name:"27 rue Saint-Guillaume", colour:"var(--sg27)", address:"27 Rue Saint-Guillaume, 75007 Paris, France"},
  sg28:{name:"28 rue Saint-Guillaume", colour:"var(--sg28)", address:"28 Rue Saint-Guillaume, 75007 Paris, France"},
  sg30:{name:"30 rue Saint-Guillaume", colour:"var(--sg28)", address:"30 Rue Saint-Guillaume, 75007 Paris, France"},
  germain:{name:"199 bd Saint-Germain", colour:"var(--germain)", address:"199 Boulevard Saint-Germain, 75007 Paris, France"},
  sp28:{name:"28 rue des Saints-Pères", colour:"var(--germain)", address:"28 Rue des Saints-Pères, 75007 Paris, France"},
  aquin:{name:"1 place Saint-Thomas d'Aquin", colour:"var(--aquin)", address:"1 Place Saint-Thomas d'Aquin, 75007 Paris, France"},
  suchet:{name:"Stade Suchet gymnase, 25 av du Maréchal Franchet d'Esperey", colour:"var(--sport)", address:"Stade Suchet, 25 Avenue du Marechal Franchet d'Esperey, 75016 Paris, France"},
  breguet:{name:"Centre Sportif Bréguet", colour:"var(--sport)", address:"25-27 Rue Breguet, 75011 Paris, France"}
};

// dow: 1 = Monday. ranges: [firstDate, lastDate] inclusive, weekly on dow.
window.SESSIONS = [
  {id:"ethics-war", name:"Ethics of War and Peace", code:"AHUM 25A15", dow:1, from:"17:00", to:"19:00",
   loc:"sg28", room:"AMPHI28", ranges:[["2026-09-07","2026-10-19"],["2026-11-02","2026-11-30"]]},

  {id:"investigating-ai", name:"Investigating with AI", code:"DHUM 25A43", dow:2, from:"08:00", to:"10:00",
   loc:"sg27", room:"salle 15 (Suzanne Borrel)", ranges:[["2026-09-08","2026-10-20"],["2026-11-03","2026-12-01"]]},
  {id:"francais-tue", name:"Français A2", code:"LFRA 51D0", dow:2, from:"10:15", to:"12:15",
   loc:"aquin", room:"room C.S26",
   ranges:[["2026-09-07","2026-10-20"],["2026-11-03","2026-12-01"]]},

  {id:"wrestling-tue", name:"Wrestling · freestyle", code:"HSPO 5410", dow:2, from:"18:00", to:"20:00",
   loc:"suchet", room:"", ranges:[["2026-09-08","2026-12-15"]]},

  {id:"francais-wed", name:"Français A2", code:"LFRA 51D0", dow:3, from:"10:15", to:"12:15",
   loc:"sp28", room:"room H005",
   ranges:[["2026-09-07","2026-10-21"],["2026-11-04","2026-11-04"],["2026-11-18","2026-12-02"]],
   extraDates:[
     { date:"2026-12-09", from:"10:15", to:"12:15", loc:"sg30", room:"room E.104", note:"Séance de rattrapage" }
   ]},
  {id:"wrestling-wed", name:"Wrestling · Greco-Roman", code:"", dow:3, from:"19:00", to:"20:30",
   loc:"suchet", room:"", ranges:[["2026-09-09","2026-12-16"]]},

  {id:"econ", name:"Econ for Enlightened Citizens", code:"AECO 25A27", dow:4, from:"14:45", to:"16:45",
   loc:"chaise", room:"room 931", ranges:[["2026-09-10","2026-10-22"],["2026-11-05","2026-12-03"]],
   excludeDates: ["2026-09-17"],
   extraDates: [
     { date:"2026-09-22", from:"14:45", to:"16:45",
       loc:"sg28", room:"bâtiment L, salle C",
       note:"Lecture moved from Thursday 17 September" }
   ]},
  {id:"tech-war", name:"Technology, War…", code:"DSPO 25A22", dow:4, from:"19:15", to:"21:15",
   loc:"sg27", room:"salle 15", ranges:[["2026-09-10","2026-10-22"],["2026-11-05","2026-12-03"]]},

  {id:"digital-public", name:"Socio of Digital Public Spaces", code:"DSOC 25A42", dow:5, from:"08:00", to:"10:00",
   loc:"sg27", room:"salle 26", ranges:[["2026-09-11","2026-10-23"],["2026-11-02","2026-12-10"]]},
  {id:"wrestling-fri", name:"Wrestling · freestyle & Greco", code:"", dow:5, from:"18:30", to:"20:00",
   loc:"breguet", room:"", ranges:[["2026-09-11","2026-12-18"]]},

  {id:"wrestling-sat", name:"Wrestling · U15 to U23", code:"", dow:6, from:"13:30", to:"15:30",
   loc:"suchet", room:"", flag:"Clashes with mid-term exams on 17 and 24 Oct, 7 and 14 Nov", ranges:[["2026-09-12","2026-12-19"]]}
];

window.MARKERS = {
  "2026-10-17":"Mid-term exams", "2026-10-24":"Mid-term exams",
  "2026-11-07":"Mid-term exams", "2026-11-14":"Mid-term exams",
  "2026-12-09":"Last day of classes", "2026-12-11":"Final exams begin"
};

window.BREAK = {from:"2026-10-26", to:"2026-10-31", name:"Autumn break"};
