/* data-courses.js
 * Academic content for the Sciences Po autumn 2026 timetable.
 * Companion to data-schedule.js. Assigns to window.COURSES.
 *
 * DATE POLICY: seminars carry an `n` (occurrence index, 1-based) and NOT a
 * date. app.js derives the real date as the nth occurrence of the linked
 * SESSIONS entry (`scheduleId`). Where a syllabus printed a date, it is kept
 * in `assertDate` purely so app.js can warn on mismatch. Never render
 * assertDate; render the derived date.
 *
 * STATUS FLAGS: `provisional: true` on a seminar, assessment or course field
 * means the source was incomplete, contradictory or a guess. It MUST render
 * visibly (see BRIEF.md section 7). Do not silently drop it.
 */

window.COURSES = [

/* ============================================================= 1 ========= */
{
  id: "DSPO25A22",
  code: "DSPO 25A22",
  title: "Technology, War and Politics",
  instructor: "Jean-Christophe Noël",
  scheduleId: "tech-war",          // Thu 19:15, 27 rue Saint-Guillaume salle 15
  building: "sg27",
  lastUpdated: "2026-09-10",
  aiPolicy: null,
  citationStyle: null,

  // Course-level shelf: not tied to any one seminar.
  shelf: [
    { id:"dspo-b1", status:"required", author:"William H. McNeill",
      title:"The Pursuit of Power: Technology, Armed Force, and Society since AD 1000",
      publisher:"Oxford, Blackwell", year:1983,
      locator:{ type:"shelfmark", value:"8°097.798" } },
    { id:"dspo-b2", status:"required", author:"Alex Roland",
      title:"War and Technology: A Very Short Introduction",
      publisher:"Oxford University Press", year:2016,
      locator:{ type:"online", value:"Library e-resource" } },
    { id:"dspo-b3", status:"recommended", author:"Martin Van Creveld",
      title:"Technology and War: From 2000 BC to the Present",
      publisher:"New York, Free Press", year:1989,
      locator:{ type:"shelfmark", value:"8°125.972" } }
  ],

  assessments: [
    { id:"dspo-a1", type:"oral", title:"Briefing (oral presentation)",
      weight:35, due:"2026-10-22T19:15",
      note:"Briefing 12: Drones and ethics: towards a new law of war?",
      channel:"In class" },
    { id:"dspo-a2", type:"participation",
      title:"Oral participation and session 8 dissertation",
      weight:25, due:"2026-11-05T19:15", channel:"In class",
      note:"Dissertation written in the session 8 test" },
    { id:"dspo-a3", type:"draft", title:"Paper proposal: puzzle, answer, key points",
      weight:0, due:"2026-10-01T23:59", channel:"Email",
      note:"Not graded, but late submission downgrades the final paper" },
    { id:"dspo-a4", type:"paper", title:"Final paper, approx. 15,000 signs",
      weight:40, due:"2026-11-19T19:15", channel:"Email",
      note:"Signs excluding footnotes and bibliography. Late submission downgrades." }
  ],

  seminars: [
    { n:1, assertDate:"2026-09-10", title:"Presentation and Introduction",
      themes:["What is war?","Clausewitz: war and politics","Technology and war"],
      readings:[], briefings:[] },

    { n:2, assertDate:"2026-09-17",
      title:"Technologies and Asymmetric Warfare: the COIN Experience",
      themes:["Comments on military news","What is asymmetric warfare?","What is COIN?",
              "Callwell and Small Wars","Petraeus and FM 3-24"],
      readings:[
        { id:"dspo-s2-r1", status:"required", author:"Richard Rubright",
          title:"Technology and Counterinsurgency Strategy",
          container:"Role and Limitations of Technology in U.S. Counterinsurgency Warfare",
          publisher:"Lincoln, Potomac Books", year:2015, pages:"133-172" }
      ],
      briefings:[
        { no:1, question:"Did technology conquer Western modern empires?", readings:[] },
        { no:2, question:"Why can Western armed forces not defeat insurgencies despite their advanced technologies?", readings:[] }
      ],
      media:[
        { type:"video", title:"Battle of Rorke's Drift (YouTube)" },
        { type:"video", title:"Book TV: John Nagl, The US Army/Marine Corps Counterinsurgency Field Manual" }
      ] },

    { n:3, assertDate:"2026-09-24",
      title:"World War One: Does Technology Influence the Outbreak and End of Wars?",
      themes:["Comments on military news","The emergence of total war",
              "Technology and military stalemate","Technology and the end of the stalemate",
              "Are we in a pre-WW1 situation?"],
      readings:[
        { id:"dspo-s3-r1", status:"required", author:"Keir A. Lieber",
          title:"Grasping the Technological Peace: The Offense-Defense Balance and International Security",
          container:"International Security", volume:"25", issue:"1", year:2000, pages:"71-104",
          locator:{ type:"url", value:"https://web.stanford.edu/class/polisci211z/2.3/Lieber%20IS%202000.pdf" } }
      ],
      briefings:[
        { no:3, question:"What is the impact of technology on the outbreak of war? Arms races and destabilisation of the international system", readings:[] },
        { no:4, question:"The offense-defense balance", readings:[] }
      ],
      media:[
        { type:"video", title:"Ryan Szimanski, A Fleet Second to None (YouTube)" },
        { type:"video", title:"Origins: Rap-WW1 Uncut, BBC" }
      ] },

    { n:4, assertDate:"2026-10-01",
      title:"Air Power: The Evolution of a Technology since 1914",
      themes:["Comments on military news","Integrating a technology into an old military system",
              "Is there only one way to use it?","Quality versus quantity in Western air forces"],
      readings:[
        { id:"dspo-s4-r1", status:"required", author:"Eliot A. Cohen",
          title:"The Mystique of U.S. Air Power",
          container:"Foreign Affairs", year:1994, issue:"January/February" },
        { id:"dspo-s4-r2", status:"recommended", author:"Martin van Creveld",
          title:"The Age of Airpower", publisher:"New York, PublicAffairs", year:2011,
          locator:{ type:"shelfmark", value:"8°308.017" } }
      ],
      briefings:[
        { no:5, question:"Why did some services promote strategic bombing during the interwar period and others not?", readings:[] },
        { no:6, question:"Does air power work?", readings:[] }
      ],
      media:[{ type:"video", title:"The Allied bombing of German cities in WW2 was unjustifiable (YouTube)" }],
      deadlineHere:"dspo-a3" },

    { n:5, assertDate:"2026-10-08",
      title:"How have Nuclear Bombs Redefined International Security?",
      themes:["A military or a political weapon?","The evolution of doctrine","The French case"],
      readings:[
        { id:"dspo-s5-r1", status:"required", author:"Bruno Tertrais",
          title:"In Defense of Deterrence: The Relevance, Morality and Cost-Effectiveness of Nuclear Weapons",
          container:"Proliferation Papers", issue:"39", year:2011,
          locator:{ type:"url", value:"https://inis.iaea.org/collection/NCLCollectionStore/_Public/48/009/48009684.pdf" } }
      ],
      briefings:[
        { no:7, question:"Has the nuclear bomb killed the world war?", readings:[] },
        { no:8, question:"Will the new challenges of the Third Nuclear Age be overcome?", readings:[] }
      ],
      media:[
        { type:"film", title:"Stanley Kubrick, Dr Strangelove, 1964" },
        { type:"site", title:"cubanmissilecrisis.org" },
        { type:"video", title:"History Channel: The Cuban Missile Crisis Declassified" }
      ] },

    { n:6, assertDate:"2026-10-15",
      title:"Technology on the Battlefield since the End of the Cold War",
      themes:["Comments on military news",
              "RMA, EBO, Shock and Awe, COIN, A2AD, Air Sea Battle, US Pivot, Third Offset, MDO",
              "The diffusion of the RMA: China and Russia"],
      readings:[
        { id:"dspo-s6-r1", status:"required", author:"Eliot Cohen",
          title:"A Revolution in Warfare", container:"Foreign Affairs",
          volume:"75", issue:"2", year:1996,
          locator:{ type:"url", value:"http://www.comw.org/rma/fulltext/9603cohen.pdf" } },
        { id:"dspo-s6-r2", status:"required", author:"Sam J. Tangredi",
          title:"Antiaccess Warfare as Strategy: From Campaign Analyses to Assessment of Extrinsic Events",
          container:"Naval War College Review", volume:"71", issue:"1" }
      ],
      briefings:[
        { no:9, question:"Did a Revolution in Military Affairs really happen in the 1990s?", readings:[] },
        { no:10, question:"A2AD: will China prevail?", readings:[] }
      ],
      media:[{ type:"video", title:"US Naval War College's Tangredi on deterring China, A2AD, aircraft carriers" }] },

    { n:7, assertDate:"2026-10-22",
      title:"Will the Rise of Drones Redefine Conventional Warfare and Military Ethics?",
      themes:["Comments on military news","Are drones better than aircraft?",
              "Tactical, operational and strategic effects","Political consequences","The future of drones"],
      readings:[
        { id:"dspo-s7-r1", status:"required", author:"Jean-Baptiste Jeangène Vilmer",
          title:"An Ideology of the Drone", container:"Books and Ideas", year:2014,
          locator:{ type:"url", value:"https://booksandideas.net/An-Ideology-of-the-Drone.html" } },
        { id:"dspo-s7-r2", status:"required",
          author:"Antonio Calcara, Andrea Gilli, Mauro Gilli, Raffaele Marchetti, Ivan Zaccagnini",
          title:"Why Drones Have Not Revolutionized War",
          container:"International Security", volume:"46", issue:"4", year:2022, pages:"130-171" },
        { id:"dspo-s7-r3", status:"recommended", author:"Grégoire Chamayou",
          title:"Drone Theory", publisher:"London, Penguin Books", year:2015,
          locator:{ type:"shelfmark", value:"Cadist-355-CHA-2015" } }
      ],
      briefings:[
        { no:11, question:"Are drones a game changer?", readings:[] },
        { no:12, question:"Drones and ethics: towards a new law of war?", readings:[], assigned:true }
      ],
      media:[
        { type:"film", title:"Gavin Hood, Eye in the Sky, 2015" },
        { type:"song", title:"Alan Parsons Project, Eye in the Sky, 1982" }
      ],
      deadlineHere:"dspo-a1" },

    { n:8, assertDate:"2026-11-05",
      title:"Test, and Technology, Coercion and International Conflict",
      themes:["Test","Discussion"],
      readings:[
        { id:"dspo-s8-r1", status:"required", author:"Robert A. Pape",
          title:"Coercion and Military Strategy: Why Denial Works and Punishment Doesn't",
          container:"Journal of Strategic Studies", volume:"15", issue:"4", year:1992, pages:"423-475" }
      ],
      briefings:[{ no:13, question:"Does coercion really work?", readings:[] }],
      media:[{ type:"video", title:"Coercion: The Power to Hurt in International Politics (YouTube)" }],
      deadlineHere:"dspo-a2" },

    { n:9, assertDate:"2026-11-12",
      title:"Cyber: Is the Digital World the New Realm of War?",
      themes:["Comments on military news","Stuxnet","The 2014 North Korean operation against Sony",
              "Hybrid warfare","War in Ukraine"],
      readings:[
        { id:"dspo-s9-r1", status:"required", author:"Thomas Rid",
          title:"Cyber War Will Not Take Place",
          container:"Journal of Strategic Studies", volume:"35", issue:"1", year:2012 }
      ],
      briefings:[
        { no:14, question:"Will cyber war happen?", readings:[] },
        { no:15, question:"Could cyber shape a nation's mind?", readings:[] }
      ],
      media:[{ type:"video", title:"Zero Days (documentary)" }] },

    { n:10, assertDate:"2026-11-19",
      title:"Artificial Intelligence: The Future of Technology, War and Politics?",
      themes:["Comments on military news","Where does it come from?","Actual military applications",
              "A new space race? China and the USA"],
      readings:[
        { id:"dspo-s10-r1", status:"required", author:"Michael C. Horowitz, Paul Scharre",
          title:"Artificial Intelligence: What Every Policymaker Needs to Know",
          publisher:"Center for a New American Security", year:2018,
          locator:{ type:"url", value:"https://s3.amazonaws.com/files.cnas.org/documents/CNAS_AI_FINAL-v2.pdf" } }
      ],
      briefings:[
        { no:16, question:"Will artificial intelligence help the rise of autonomous weapons?", readings:[] },
        { no:17, question:"Could artificial intelligence change war?", readings:[] }
      ],
      media:[
        { type:"video", title:"The Third Offset Strategy (YouTube)" },
        { type:"book", title:"Daniel H. Wilson, Robopocalypse, 2012; Robogenesis, 2014" }
      ],
      deadlineHere:"dspo-a4" },

    { n:11, assertDate:"2026-11-26", title:"The Future of War",
      themes:["Comments on military news","Star war or just space war?","Future technologies"],
      readings:[
        { id:"dspo-s11-r1", status:"required", author:"Kori Schake",
          title:"Why We Get It Wrong: Reflections on Predicting the Future of War",
          container:"War on the Rocks", year:2018,
          locator:{ type:"url", value:"https://warontherocks.com/2018/08/why-we-get-it-wrong-reflections-on-predicting-the-future-of-war/" } }
      ],
      briefings:[
        { no:18, question:"Will there be a war in space?", readings:[] },
        { no:19, question:"Towards transhumanism?", readings:[] }
      ],
      media:[
        { type:"video", title:"Black Mirror, series 3, Men Against Fire" },
        { type:"site", title:"CNAS Super Soldier Project" }
      ] },

    { n:12, assertDate:"2026-12-03", title:"Wrap-Up Session",
      themes:["Comments on military news","Paper correction","Discussion"],
      readings:[], briefings:[] }
  ],

  todo:"Optional reading lists for briefings 1-19 not yet entered (approx. 150 items). See BRIEF.md section 12."
},

/* ============================================================= 2 ========= */
{
  id: "DSOC25A42",
  code: "DSOC 25A42",
  title: "Sociology of Digital Public Spaces",
  instructor: "Sylvain Parasie",
  instructorEmail: "sylvain.parasie@sciencespo.fr",
  scheduleId: "digital-public",     // Fri 08:00, 27 rue Saint-Guillaume salle 26
  building: "sg27",
  lastUpdated: "2026-09-10",
  note:"Syllabus labels sessions 1, 9, 10, 11 and 12 as Monday. All twelve printed dates are Fridays and match the timetable. Dates trusted, weekday labels discarded.",

  shelf: [
    { id:"dsoc-b1", status:"recommended", author:"Yochai Benkler, Robert Faris, Hal Roberts",
      title:"Network Propaganda: Manipulation, Disinformation, and Radicalization in American Politics",
      publisher:"Oxford University Press", year:2018 },
    { id:"dsoc-b2", status:"recommended", author:"Dominique Cardon",
      title:"Culture numérique", publisher:"Presses de Sciences Po", year:2019 },
    { id:"dsoc-b3", status:"recommended", author:"Sylvain Parasie",
      title:"Computing the News: Data Journalism and the Search for Objectivity",
      publisher:"Columbia University Press", year:2022 }
  ],

  assessments: [
    { id:"dsoc-a1", type:"draft", title:"Group one-page draft: object, question, methods, bibliography",
      weight:0, due:"2026-09-29T23:59", channel:"Email", group:true },
    { id:"dsoc-a2", type:"draft", title:"Final note of intent (2 pages)",
      weight:10, due:"2026-10-06T23:59", channel:"Email", group:true },
    { id:"dsoc-a3", type:"admin", title:"Confirm article choice for critical analysis paper",
      weight:0, due:"2026-10-16T23:59", channel:"Email" },
    { id:"dsoc-a4", type:"material", title:"Empirical material and analysis outline",
      weight:10, due:"2026-11-09T23:59", channel:"Email", group:true },
    { id:"dsoc-a5", type:"paper", title:"Critical analysis paper, max 3 pages / approx. 1,000 words",
      weight:30, due:"2026-11-27T23:59", channel:"Email",
      note:"Summarise the publication, state its contribution to the group research, discuss its limits and how you would overcome them" },
    { id:"dsoc-a6", type:"oral", title:"Group oral presentation, 10 minutes with slides",
      weight:10, due:"2026-12-04T08:00", channel:"In class", group:true },
    { id:"dsoc-a7", type:"paper", title:"Final group research report",
      weight:40, due:"2026-12-18T23:59", channel:"Email", group:true,
      warn:"Falls inside the final examination window, 11-19 December" },
    { id:"dsoc-a8", type:"participation", title:"Class participation",
      weight:0, due:null, note:"Worth one bonus point" }
  ],

  seminars: [
    { n:1, assertDate:"2026-09-11",
      title:"Introduction: What are Digital Public Spaces, and Why Does a Sociological Perspective Matter?",
      readings:[] },
    { n:2, assertDate:"2026-09-18", title:"Inequalities in the Digital Public Space",
      readings:[{ id:"dsoc-s2-r1", status:"required", author:"Francesca Tripodi",
        title:"Ms. Categorized: Gender, Notability, and Inequality on Wikipedia",
        container:"New Media & Society", year:2023 }] },
    { n:3, assertDate:"2026-09-25", title:"Digital Collective Action",
      readings:[{ id:"dsoc-s3-r1", status:"required", author:"Jen Schradie",
        title:"The Revolution That Wasn't: How Digital Activism Favors Conservatives",
        publisher:"Harvard University Press", year:2019, pages:"chapter 2" }],
      deadlineSoon:"dsoc-a1" },
    { n:4, assertDate:"2026-10-02", title:"Group Investigative Projects (1/2)",
      readings:[], note:"No required reading", deadlineSoon:"dsoc-a2" },
    { n:5, assertDate:"2026-10-09", title:"Abundance",
      readings:[{ id:"dsoc-s5-r1", status:"required", author:"Pablo Boczkowski",
        title:"Abundance: On the Experience of Living in a World of Information Plenty",
        publisher:"Oxford University Press", year:2021, pages:"chapter 4" }] },
    { n:6, assertDate:"2026-10-16", title:"Misinformation",
      timeOverride:{ from:"10:15", to:"12:15" },
      note:"This session only: 10:15-12:15, not the usual 08:00-10:00",
      readings:[{ id:"dsoc-s6-r1", status:"required", author:"Alice E. Marwick, William C. Partin",
        title:"Constructing Alternative Facts: Populist Expertise and the QAnon Conspiracy",
        container:"New Media & Society", year:2024 }],
      deadlineHere:"dsoc-a3" },
    { n:7, assertDate:"2026-10-23", title:"Polarization",
      readings:[{ id:"dsoc-s7-r1", status:"required", author:"Christopher Bail",
        title:"How the Prism Drives Extremism",
        container:"Breaking the Social Media Prism: How to Make Our Platforms Less Polarizing",
        publisher:"Princeton University Press", year:2021, pages:"excerpt" }] },
    { n:8, assertDate:"2026-11-06", title:"Who Sets the Agenda?",
      readings:[{ id:"dsoc-s8-r1", status:"required",
        author:"Sylvain Parasie, Anaïs Machut, Béatrice Mazoyer",
        title:"The Legacy Media as a Moral Compass: A Computational Study of the Politicization of a Migrant Crime on Twitter in France",
        container:"The International Journal of Press/Politics", year:2025 }],
      deadlineSoon:"dsoc-a4" },
    { n:9, assertDate:"2026-11-13", title:"Group Investigative Projects (2/2)",
      readings:[], note:"No required reading" },
    { n:10, assertDate:"2026-11-20", title:"Computing the News",
      readings:[{ id:"dsoc-s10-r1", status:"required", author:"Felix M. Simon",
        title:"Rationalisation of the News: How AI Reshapes and Retools the Gatekeeping Processes of News Organisations in the United Kingdom, United States and Germany",
        container:"New Media & Society", year:2025 }] },
    { n:11, assertDate:"2026-11-27", title:"Politics of Platforms",
      readings:[{ id:"dsoc-s11-r1", status:"required",
        author:"Antonia Stockinger, Svenja Schäfer, Sophie Lecheler",
        title:"Navigating the Gray Areas of Content Moderation: Professional Moderators' Perspectives on Uncivil User Comments and the Role of (AI-Based) Technological Tools",
        container:"New Media & Society", year:2025 }],
      deadlineHere:"dsoc-a5" },
    { n:12, assertDate:"2026-12-04", title:"Group Research Presentation",
      readings:[], deadlineHere:"dsoc-a6" }
  ]
},

/* ============================================================= 3 ========= */
{
  id: "DHUM25A43",
  code: "DHUM 25A43",
  title: "Investigating with AI",
  instructor: "Alexis Mathieu Perrier",
  scheduleId: "investigating-ai",   // Tue 08:00, 27 rue Saint-Guillaume salle 15
  building: "sg27",
  lastUpdated: "2026-09-10",
  shape: "strands",                 // renders strands, not a reading list
  syllabusUrl: "https://syllabus.sciencespo.fr/fr/?cours/202610/296781",
  shelf: [],
  assessments: [
    { id:"dhum-a1", type:"oral", title:"Group project presentations",
      weight:null, due:"2026-12-01T08:00", channel:"In class", provisional:true },
    { id:"dhum-a2", type:"unknown", title:"Grading breakdown not published",
      weight:null, due:null, provisional:true,
      note:"Ask Perrier for weights and any interim project milestones" }
  ],
  note:"Session titles appear shifted one week against their own Tech strands (see days 4-7). Sessions 8-11 are untitled and their Demo and Actors strands are marked tbd. A work-in-progress list (model evaluation with RAGAS and LLM-as-judge, enriching data with LLMs) is unscheduled.",

  seminars: [
    { n:1, assertDate:"2026-09-08", title:"Welcome, Intro, Course Scope, Logistics",
      strands:{
        tech:["LLMs broken down: models, language models, large",
              "3M models on Hugging Face; Kimi3 and Poolside Laguna"],
        demo:["Brainstorming: ai-opinion-retro.onrender.com"],
        admin:["Presentations, logistics, WhatsApp channel"] },
      links:[
        { label:"1. Intro and Welcome", url:"https://docs.google.com/presentation/d/18ppneM62Iy1dokHVw3zKnoi9mq_cMoAw35kjox2-bjc/edit" },
        { label:"2. LLMs", url:"https://docs.google.com/presentation/d/1Hyte8y6Z2j-8STfJuRvxBiY3ONy7AVnvAQR7mEyoDJA/edit" }
      ] },
    { n:2, assertDate:"2026-09-15", title:"Data, Working with AI",
      strands:{
        news:["News"],
        tech:["Data and scraping","Enriching with LLMs","JSON","Prompting and the context window"],
        society:["Cognitive biases when working with AI","Centaurs and cyborgs","The jagged frontier"],
        demo:["ChatGPT and Claude apps in depth; system prompts"],
        actors:["OpenRouter and inference providers"],
        admin:["Class representative election","Group projects"] } },
    { n:3, assertDate:"2026-09-22", title:"LLMs to Agents; AI and Jobs",
      strands:{
        news:["News"],
        tech:["The web as API","API keys and caps","GitHub workflow","Hosting",
              "Main APIs: Wikipedia, NYT, DuckDuckGo"],
        society:["AI and jobs","WEF 2025 report on jobs"],
        demo:["Scraping EU Parliament debates; building a dataset"],
        actors:["OpenAI and Anthropic"],
        admin:["Group projects"] } },
    { n:4, assertDate:"2026-09-29", title:"From NLP to LLMs; Regulating AI",
      titleSuspect:true,
      strands:{
        news:["AIFray (aifray.com)"],
        tech:["LLMs to agents to multi-agents","Harnesses"],
        society:["AI Act and regulation","Sovereignty","Open source versus closed source"],
        demo:["RAG on the AI Act"],
        actors:["Lovable","ChatGPT Work","GitHub"],
        admin:["Group projects"] } },
    { n:5, assertDate:"2026-10-06", title:"Benchmarks and Reasoning Emergence; Science",
      titleSuspect:true,
      strands:{
        news:["News"],
        tech:["From NLP to LLMs","NER and POS","Embeddings and tokens"],
        society:["AI and science"],
        demo:["Building apps with AI"],
        actors:["Chinese labs and models"],
        admin:["Group projects"] } },
    { n:6, assertDate:"2026-10-13", title:"Deep Learning and Transformers; Education",
      titleSuspect:true,
      strands:{
        news:["News"],
        tech:["LLM benchmarks","From simple predictors to reasoning models"],
        society:["Data visualisation"],
        admin:["Group projects"] } },
    { n:7, assertDate:"2026-10-20", title:"API", titleSuspect:true,
      strands:{
        news:["News"],
        tech:["ML models, neural networks and the transformer","Mixture of Experts","AI history"],
        society:["Education and the loss of skills"],
        demo:["tbd"],
        admin:["Group projects"] } },
    { n:8, assertDate:"2026-11-03", title:null, provisional:true,
      strands:{ news:["News"], tech:["Guardrails and abliteration"], society:["Biases"],
                demo:["tbd"], actors:["tbd"], admin:["Group projects"] } },
    { n:9, assertDate:"2026-11-10", title:null, provisional:true,
      strands:{ news:["News"], tech:["Voice AI and personas"],
                society:["Democracy and disinformation"], demo:["tbd"], actors:["tbd"],
                admin:["Group projects"] } },
    { n:10, assertDate:"2026-11-17", title:null, provisional:true,
      strands:{ news:["News"], tech:["Image and video"], demo:["tbd"], actors:["tbd"],
                admin:["Group projects"] } },
    { n:11, assertDate:"2026-11-24", title:null, provisional:true,
      strands:{ news:["News"], tech:["Multi-agent collaboration","Monitoring"],
                demo:["tbd"], actors:["Langfuse","LangSmith"], admin:["Group projects"] } },
    { n:12, assertDate:"2026-12-01", title:"Project Presentations",
      strands:{ admin:["Group project presentations"] }, deadlineHere:"dhum-a1" }
  ],

  unscheduled:["Model evaluation: RAGAS, LLM as a judge","Enriching data with LLMs"]
},

/* ============================================================= 4 ========= */
{
  id: "AHUM25A15",
  code: "AHUM 25A15",
  title: "Ethics of War and Peace",
  instructor: "Dr Pierre Bourgois",
  scheduleId: "ethics-war",         // Mon 17:00, 28 rue Saint-Guillaume AMPHI28
  building: "sg28",
  lastUpdated: "2026-09-10",
  aiPolicy: null,
  aiPolicyNote:"Syllabus reads \"is (not) allowed\" with the bracket unresolved. Ask Bourgois.",
  citationStyle: null,
  citationStyleNote:"Syllabus still shows the template placeholder \"XYZ Style\". Ask Bourgois.",
  submissionNote:"All written work submitted to the Urkund address or via Moodle.",
  note:"Syllabus gives no dates. All twelve sessions derive from the Monday 17:00 slot, session 12 landing on 30 November.",

  shelf: [
    { id:"ahum-b1", status:"required", author:"Michael Walzer",
      title:"Just and Unjust Wars: A Moral Argument with Historical Illustrations",
      publisher:"New York, Basic Books", year:1977 },
    { id:"ahum-b2", status:"recommended", author:"Fritz Allhoff, Nicholas G. Evans, Adam Henschke",
      title:"Routledge Handbook of Ethics and War: Just War Theory in the 21st Century",
      publisher:"New York, Routledge", year:2013 },
    { id:"ahum-b3", status:"recommended", author:"Daniel R. Brunstetter",
      title:"Just and Unjust Uses of Limited Force: A Moral Argument with Contemporary Illustrations",
      publisher:"Oxford University Press", year:2021 },
    { id:"ahum-b4", status:"recommended", author:"Daniel Brunstetter, Jean-Vincent Holeindre (eds)",
      title:"The Ethics of War and Peace Revisited: Moral Challenges in an Era of Contested and Fragmented Sovereignty",
      publisher:"Georgetown University Press", year:2018 },
    { id:"ahum-b5", status:"recommended", author:"Daniel Brunstetter, Cian O'Driscoll (eds)",
      title:"Just War Thinkers: From Cicero to the 21st Century",
      publisher:"New York, Routledge", year:2018 },
    { id:"ahum-b6", status:"recommended", author:"Daniel Brunstetter, Cian O'Driscoll (eds)",
      title:"Just War Thinkers Revisited: Heretics, Humanists and Radicals",
      publisher:"New York, Routledge", year:2024 },
    { id:"ahum-b7", status:"recommended", author:"Steven P. Lee",
      title:"Ethics and War: An Introduction",
      publisher:"Cambridge University Press", year:2012 },
    { id:"ahum-b8", status:"recommended", author:"Larry May (ed.)",
      title:"The Cambridge Handbook of the Just War",
      publisher:"Cambridge University Press", year:2018 },
    { id:"ahum-b9", status:"recommended", author:"Larry May, Elizabeth Edenberg (eds)",
      title:"Jus Post Bellum and Transitional Justice",
      publisher:"Cambridge University Press", year:2013 },
    { id:"ahum-b10", status:"recommended", author:"Paul D. Miller",
      title:"Ethics of War: A Short Companion",
      publisher:"Brentwood, B&H Academic", year:2025 }
  ],

  assessments: [
    { id:"ahum-a1", type:"paper", title:"Group policy paper",
      weight:40, due:"2026-10-19T17:00", channel:"Email",
      note:"Due before session 7. Topic chosen by the group; guidelines given in session 1.",
      group:true },
    { id:"ahum-a2", type:"exam", title:"Final written exam, four questions, two hours",
      weight:60, due:"2026-11-30T17:00", channel:"In class" }
  ],

  seminars: [
    { n:1, title:"Introduction to Just War Theory", readings:[] },
    { n:2, part:"I. Traditional and Contemporary Challenges", title:"Jus ad bellum: When to Go to War?", readings:[] },
    { n:3, part:"I. Traditional and Contemporary Challenges", title:"Jus in bello: How to Wage War?", readings:[] },
    { n:4, part:"I. Traditional and Contemporary Challenges", title:"Jus post bellum: How to End War?", readings:[] },
    { n:5, part:"I. Traditional and Contemporary Challenges", title:"Jus ad vim: How to Use Limited Force?", readings:[] },
    { n:6, part:"I. Traditional and Contemporary Challenges", title:"Ethical Issues of Contemporary Wars", readings:[] },
    { n:7, part:"II. Technological Challenges", title:"Cyber: Controlling a New Domain of Warfare",
      readings:[], deadlineHere:"ahum-a1" },
    { n:8, part:"II. Technological Challenges", title:"Soldier Enhancement: Changing the Nature of Combatants", readings:[] },
    { n:9, part:"II. Technological Challenges", title:"Drones: Redefining the Reality of the Battlefield", readings:[] },
    { n:10, part:"II. Technological Challenges", title:"Artificial Intelligence: Relying on Machines in War", readings:[] },
    { n:11, part:"II. Technological Challenges", title:"How to Deal with New Military Technologies?", readings:[] },
    { n:12, title:"Final Exam", readings:[], deadlineHere:"ahum-a2" }
  ]
},

/* ============================================================= 5 ========= */
{
  id: "AECO25A27",
  code: "AECO 25A27",
  title: "Econometrics and Mathematical Statistics for Opinion Polls and Policy Evaluation",
  registrarTitle: "Econo for enlightened citizens",
  instructor: "Clément de Chaisemartin",
  scheduleId: "econ",
  building: "chaise",
  lastUpdated: "2026-09-10",

  materialsNote: "Lecture notes on the course Moodle page. The class mostly follows them.",
  note: "Lectures 1-6 cover the statistical and econometric theory of surveys; lectures 7-12 cover counterfactual policy evaluation. Mathematically formalised: notation and proofs throughout. No TA sessions.",
  studyNote: "The blue questions in the lecture notes are the only practice problems provided, and are indicative of quiz and exam questions. Reading the notes in advance is optional; if you do, pause on each blue question before reading on.",
  examNote: "All four assessments are closed-book. Midterm and final include derivations, and one memorised proof from a list circulated beforehand. Full credit requires justifying every step by naming the property used.",
  missedAssessmentNote: "A quiz or midterm missed with medical documentation on letterhead shifts its weight to the final. No make-up sittings. Missing one quiz makes the final worth 55%.",
  attendanceNote: "In-person attendance mandatory. Lectures are not streamed or recorded.",
  regradeNote: "Written regrade request within one week of a grade being released.",

  shelf: [],

  assessments: [
    { id:"aeco-a1", type:"quiz", title:"Quiz 1", weight:15,
      due:"2026-10-01T14:45", channel:"In class",
      note:"15 minutes, closed book. Lecture 4." },
    { id:"aeco-a2", type:"exam", title:"Mid-term exam", weight:30,
      due:"2026-10-22T14:45", channel:"In class",
      note:"One hour, closed book. Derivations and one memorised proof. Lecture 7." },
    { id:"aeco-a3", type:"quiz", title:"Quiz 2", weight:15,
      due:"2026-11-19T14:45", channel:"In class",
      note:"15 minutes, closed book. Lecture 10." },
    { id:"aeco-a4", type:"exam", title:"Final exam", weight:40,
      due:"2026-12-03T14:45", channel:"In class",
      note:"Two hours, closed book. Derivations and one memorised proof. Lecture 12, in the normal slot, not the December examination window." }
  ],

  seminars: [
    { n:1,  assertDate:"2026-09-10", title:null,
      part:"I. Surveys: statistical and econometric theory",
      note:"Class representative chosen in this session." },
    { n:2,  assertDate:"2026-09-22", title:null,
      part:"I. Surveys: statistical and econometric theory",
      note:"Moved from Thursday 17 September. Tuesday 14:45-16:45, bâtiment L, 28 rue Saint-Guillaume, salle C." },
    { n:3,  assertDate:"2026-09-24", title:null, part:"I. Surveys: statistical and econometric theory" },
    { n:4,  assertDate:"2026-10-01", title:null, part:"I. Surveys: statistical and econometric theory",
      deadlineHere:"aeco-a1" },
    { n:5,  assertDate:"2026-10-08", title:null, part:"I. Surveys: statistical and econometric theory" },
    { n:6,  assertDate:"2026-10-15", title:null, part:"I. Surveys: statistical and econometric theory" },
    { n:7,  assertDate:"2026-10-22", title:null, part:"II. Counterfactual policy evaluation",
      deadlineHere:"aeco-a2" },
    { n:8,  assertDate:"2026-11-05", title:null, part:"II. Counterfactual policy evaluation" },
    { n:9,  assertDate:"2026-11-12", title:null, part:"II. Counterfactual policy evaluation" },
    { n:10, assertDate:"2026-11-19", title:null, part:"II. Counterfactual policy evaluation",
      deadlineHere:"aeco-a3" },
    { n:11, assertDate:"2026-11-26", title:null, part:"II. Counterfactual policy evaluation" },
    { n:12, assertDate:"2026-12-03", title:null, part:"II. Counterfactual policy evaluation",
      deadlineHere:"aeco-a4" }
  ],

  todo:"Individual lecture titles not published. Sessions render as 'Lecture n' under their part heading."
}

];
