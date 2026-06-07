import { QuizQuestion } from './types';

// --- CONFIGURATION ---
export const APP_NAME = "CareerPath AI";
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export const QUESTIONS: QuizQuestion[] = [
  {
    id: 101,
    text: "When you lose track of time, you're usually...",
    options: [
      "Solving a puzzle or figuring out how something works",
      "Helping someone through a problem or teaching them",
      "Creating, designing, or building something visual",
      "Organizing, planning, or strategizing",
      "Reading, researching, or diving deep into a topic"
    ],
    category: 'preference',
    domain: 'general'
  },
  {
    id: 102,
    text: "Which of these problems would you most want to solve?",
    options: [
      "Climate change or sustainable energy",
      "Economic inequality and access to opportunity",
      "Mental health and wellbeing in society",
      "Creating media or art that genuinely moves people",
      "Building technology that changes daily life"
    ],
    category: 'values',
    domain: 'general'
  },
  {
    id: 103,
    text: "In a group setting, people usually come to you for...",
    options: [
      "Logical analysis and breaking down complex problems",
      "Creative ideas and a fresh take on things",
      "Emotional support and just listening",
      "Getting things organized and moving forward",
      "Technical help or explaining something tricky"
    ],
    category: 'aptitude',
    domain: 'general'
  },
  {
    id: 104,
    text: "What kind of impact do you want your work to have?",
    options: [
      "Advance human knowledge or technical capability",
      "Directly help individuals improve their lives",
      "Build something profitable that can scale",
      "Express ideas that shift how people see the world",
      "Keep essential systems running smoothly"
    ],
    category: 'values',
    domain: 'general'
  },
  {
    id: 105,
    text: "Which work environment sounds most appealing?",
    options: [
      "A lab, workshop, or technical space with equipment",
      "A collaborative office with lots of back and forth",
      "A quiet space where you can focus without interruption",
      "Out in the field, different locations regularly",
      "A creative studio or flexible workspace"
    ],
    category: 'environment',
    domain: 'general'
  },
  {
    id: 106,
    text: "When making a big decision, you typically...",
    options: [
      "Gather data and work through the options systematically",
      "Go with your gut after sitting with it for a bit",
      "Talk it through with people whose judgment you trust",
      "Think about how it lines up with your core values",
      "Weigh the practical and financial side of things"
    ],
    category: 'personality',
    domain: 'general'
  },
  {
    id: 107,
    text: "You have a free Saturday with no obligations. You'd probably...",
    options: [
      "Tinker with a project, code something, or build",
      "Volunteer or spend real quality time helping someone",
      "Hit up a museum, gallery, concert, or cultural spot",
      "Catch up on reading about ideas, news, or history",
      "Work on a side hustle or personal finance stuff"
    ],
    category: 'preference',
    domain: 'general'
  },
  {
    id: 108,
    text: "How do you feel about presenting or public speaking?",
    options: [
      "I actually enjoy it and feel energized after",
      "I can pull it off when I've prepared, but it drains me",
      "I prefer smaller conversations, one on one or small groups",
      "I'd rather put my thoughts into writing or visuals",
      "I avoid it whenever I can"
    ],
    category: 'personality',
    domain: 'general'
  },
  {
    id: 109,
    text: "What frustrates you most at work or school?",
    options: [
      "Inefficiency and systems that are poorly thought out",
      "Rigid rules that crush any sense of creativity",
      "People being treated unfairly or without empathy",
      "Shallow busywork that doesn't actually matter",
      "Unclear goals and constant disorganization"
    ],
    category: 'values',
    domain: 'general'
  },
  {
    id: 110,
    text: "How do you prefer to learn new skills?",
    options: [
      "Hands on practice and trial and error",
      "Structured courses with clear milestones",
      "Reading docs or self study at my own pace",
      "Watching someone experienced and asking questions",
      "Jumping in headfirst and figuring it out live"
    ],
    category: 'workstyle',
    domain: 'general'
  },
  {
    id: 111,
    text: "What's your relationship with risk?",
    options: [
      "I chase it. High risk, high reward.",
      "I'm comfortable taking calculated bets",
      "I lean toward stability but I can adapt when I need to",
      "I like predictability and steady, incremental progress",
      "I strongly prefer security and avoiding uncertainty"
    ],
    category: 'personality',
    domain: 'general'
  },
  {
    id: 112,
    text: "Which statement hits closest to home?",
    options: [
      "I want to understand how things actually work",
      "I want to make people's lives tangibly better",
      "I want to build something that outlasts me",
      "I want to create things that move or inspire others",
      "I want to lead, influence, and shape decisions"
    ],
    category: 'values',
    domain: 'general'
  },
  {
    id: 113,
    text: "How important is work-life balance to you?",
    options: [
      "Non negotiable. I have a whole life outside of work.",
      "Important. I want flexibility but I'll show up when it counts.",
      "I can sprint hard in bursts when the work demands it",
      "I find a lot of my meaning through work, so the line blurs",
      "I want work and life to feel integrated, not separate"
    ],
    category: 'workstyle',
    domain: 'general'
  },
  {
    id: 114,
    text: "What type of recognition matters most to you?",
    options: [
      "Respect from experts and peers in my field",
      "Seeing a real, visible difference in someone's life",
      "Financial success and the freedom it brings",
      "Creative recognition and leaving an artistic mark",
      "Knowing I did the right thing, even if nobody noticed"
    ],
    category: 'values',
    domain: 'general'
  },
  {
    id: 115,
    text: "How do you handle repetitive tasks?",
    options: [
      "I automate or streamline them immediately",
      "I find a rhythm in routine and don't mind them",
      "I tolerate them as part of the deal",
      "I struggle. I need variety or I lose focus.",
      "I delegate them as soon as I possibly can"
    ],
    category: 'workstyle',
    domain: 'general'
  },
  {
    id: 201,
    text: "What draws you to technical or scientific work?",
    options: [
      "The satisfaction of cracking a hard problem",
      "Building things people will actually use",
      "Understanding how nature and complex systems behave",
      "The field keeps evolving so I'm always learning",
      "Solid job security and earning potential"
    ],
    category: 'values',
    domain: 'science'
  },
  {
    id: 202,
    text: "Which of these would you most enjoy working on?",
    options: [
      "A product or app that millions of people use daily",
      "Research that pushes the boundary of what we know",
      "Hardware, robotics, or something you can physically touch",
      "Data analysis that uncovers patterns nobody saw before",
      "Infrastructure that quietly keeps everything running"
    ],
    category: 'preference',
    domain: 'science'
  },
  {
    id: 203,
    text: "When you're debugging a stubborn problem, you usually...",
    options: [
      "Systematically isolate variables until something clicks",
      "Trust your instincts about where to look first",
      "Search for similar issues others have already solved",
      "Step away and let your brain work on it in the background",
      "Get frustrated pretty quickly if the answer isn't obvious"
    ],
    category: 'aptitude',
    domain: 'science'
  },
  {
    id: 204,
    text: "How do you feel about math?",
    options: [
      "I genuinely enjoy it, especially the abstract stuff",
      "I see it as a useful tool for real problems",
      "I can handle it when I need to",
      "I prefer to keep it minimal in my work",
      "I actively steer clear of math heavy tasks"
    ],
    category: 'aptitude',
    domain: 'science'
  },
  {
    id: 205,
    text: "What's your preferred relationship with code or technology?",
    options: [
      "I want to write code and build systems every day",
      "I want to use tech as a tool, not be a full time developer",
      "I'd rather design and architect than implement",
      "I want to know enough to talk to technical people",
      "I'd prefer to stay on the non technical side"
    ],
    category: 'workstyle',
    domain: 'science'
  },
  {
    id: 206,
    text: "Which scientific approach appeals to you most?",
    options: [
      "Theoretical work, building models and frameworks",
      "Experimental work, testing hypotheses with real data",
      "Applied work, solving practical problems in the world",
      "Computational work, simulations and heavy analysis",
      "Interdisciplinary work, mixing multiple fields together"
    ],
    category: 'preference',
    domain: 'science'
  },
  {
    id: 207,
    text: "How would you handle being on call or dealing with emergencies?",
    options: [
      "I actually thrive when the pressure is on",
      "I can manage it but prefer planned, scheduled work",
      "I'd rather have predictable hours",
      "It would take a real toll on me",
      "That's a hard no. Dealbreaker."
    ],
    category: 'workstyle',
    domain: 'science'
  },
  {
    id: 208,
    text: "When you're learning a new technology, you...",
    options: [
      "Dig into the documentation and understand it deeply first",
      "Start building something right away",
      "Follow a tutorial step by step",
      "Watch videos to see how others approach it",
      "Put it off until you absolutely have to learn it"
    ],
    category: 'personality',
    domain: 'science'
  },
  {
    id: 209,
    text: "What scale of impact interests you?",
    options: [
      "Global, technology used by billions",
      "Industry wide, transforming how a whole sector operates",
      "Organizational, making one company genuinely excellent",
      "Team level, helping a group do their best work",
      "Deep expertise in a narrow niche"
    ],
    category: 'values',
    domain: 'science'
  },
  {
    id: 210,
    text: "Specialist or generalist?",
    options: [
      "I want to be the world expert on one specific thing",
      "Depth in one area, awareness of related ones",
      "Generalist who can adapt to just about anything",
      "T shaped, deep in one thing but broad everywhere else",
      "Still figuring out what I want to go deep on"
    ],
    category: 'workstyle',
    domain: 'science'
  },
  {
    id: 211,
    text: "How do you feel about long term research with uncertain outcomes?",
    options: [
      "That's exactly what excites me about science",
      "I can handle ambiguity if there's a clear direction",
      "I prefer projects with more predictable timelines",
      "I need to see tangible progress regularly or I lose steam",
      "Uncertainty stresses me out"
    ],
    category: 'personality',
    domain: 'science'
  },
  {
    id: 212,
    text: "Which of these scientific fields pulls you in?",
    options: [
      "Computer science, AI, or software engineering",
      "Medicine, biology, or healthcare",
      "Physics, astronomy, or earth sciences",
      "Chemistry, materials, or pharmaceuticals",
      "Engineering: mechanical, electrical, civil, or similar"
    ],
    category: 'preference',
    domain: 'science'
  },
  {
    id: 213,
    text: "How important is it that your work has direct real world application?",
    options: [
      "Critical. I want to see my work used by people.",
      "Important, but I'm okay with longer timelines to impact",
      "I'm fine with foundational research that enables others",
      "Application matters less than the intellectual challenge",
      "I care more about the journey than the destination"
    ],
    category: 'values',
    domain: 'science'
  },
  {
    id: 214,
    text: "Lab work, fieldwork, or desk work?",
    options: [
      "Lab. I like controlled environments and equipment.",
      "Field. Get me outside collecting data or on site.",
      "Desk. I'm happiest with a computer and quiet space.",
      "Mix of all three depending on the project phase",
      "I'd rather manage or coordinate than do hands on work"
    ],
    category: 'environment',
    domain: 'science'
  },
  {
    id: 215,
    text: "How do you feel about publishing, presenting, and academic visibility?",
    options: [
      "I want to build a reputation and be known in my field",
      "I'll do what's needed but it's not my main motivation",
      "I prefer the work to speak for itself",
      "I find self promotion uncomfortable",
      "I'd rather work in industry where this matters less"
    ],
    category: 'personality',
    domain: 'science'
  },
  {
    id: 301,
    text: "What about business gets you excited?",
    options: [
      "Building something from scratch",
      "Analyzing markets and making strategic calls",
      "Leading people and running operations",
      "Working with numbers, financial models, analysis",
      "Marketing, branding, and understanding what makes people buy"
    ],
    category: 'preference',
    domain: 'commerce'
  },
  {
    id: 302,
    text: "How do you think about money and wealth?",
    options: [
      "It's a primary scoreboard for success and freedom",
      "Important, but not what drives me day to day",
      "A means to support the kind of life I want",
      "Less important than doing meaningful work",
      "Honestly, I have complicated feelings about it"
    ],
    category: 'values',
    domain: 'commerce'
  },
  {
    id: 303,
    text: "When you're sizing up an opportunity, you focus most on...",
    options: [
      "The upside and growth potential",
      "The risks and everything that could go sideways",
      "The people and team behind it",
      "How it fits your longer term trajectory",
      "The numbers and financial projections"
    ],
    category: 'aptitude',
    domain: 'commerce'
  },
  {
    id: 304,
    text: "How do you feel about sales and persuasion?",
    options: [
      "I like it. Connecting people with real value feels good.",
      "I can sell when I believe in what I'm offering",
      "I'd rather let the work speak for itself",
      "I get uncomfortable with explicit selling",
      "Give me an analytical role, no pitching required"
    ],
    category: 'personality',
    domain: 'commerce'
  },
  {
    id: 305,
    text: "What's your management preference?",
    options: [
      "I want to lead and manage teams",
      "Individual contributor with real influence",
      "I'd like to manage eventually, but not right away",
      "I prefer collaborative, flat team structures",
      "I want to work independently with minimal oversight"
    ],
    category: 'workstyle',
    domain: 'commerce'
  },
  {
    id: 306,
    text: "How do you feel about corporate environments?",
    options: [
      "I do well in structured, larger organizations",
      "Mid size companies hit the sweet spot for me",
      "Startups. Fast paced, less red tape.",
      "I'd rather work for myself or freelance",
      "Still figuring out where I fit best"
    ],
    category: 'environment',
    domain: 'commerce'
  },
  {
    id: 307,
    text: "Which business function would you gravitate toward?",
    options: [
      "Strategy and executive leadership",
      "Finance, accounting, or investment",
      "Marketing, sales, or business development",
      "Operations, supply chain, or logistics",
      "HR or organizational development"
    ],
    category: 'preference',
    domain: 'commerce'
  },
  {
    id: 308,
    text: "How much does industry matter to you?",
    options: [
      "A lot. I want to work in a space I care about deeply.",
      "Somewhat. I have preferences but I can flex.",
      "Not much. Business skills transfer anywhere.",
      "Culture matters more to me than industry",
      "Haven't given specific industries much thought yet"
    ],
    category: 'values',
    domain: 'commerce'
  },
  {
    id: 309,
    text: "When you read a contract, you...",
    options: [
      "Jump straight to the numbers",
      "Read every clause carefully",
      "Focus on deliverables and timelines",
      "Skim it and hand it to someone who enjoys this stuff",
      "Dread it but push through anyway"
    ],
    category: 'aptitude',
    domain: 'commerce'
  },
  {
    id: 310,
    text: "What's the most important metric for a business?",
    options: [
      "Profit and healthy margins",
      "Customer satisfaction and retention",
      "Market share relative to competitors",
      "Brand strength and recognition",
      "Employee engagement and culture health"
    ],
    category: 'preference',
    domain: 'commerce'
  },
  {
    id: 311,
    text: "How do you feel about networking and relationship building?",
    options: [
      "I'm energized by meeting new people and maintaining connections",
      "I do it because it's necessary and I've gotten decent at it",
      "I prefer deeper relationships with fewer people",
      "I find it exhausting but push through",
      "I'd rather let my work open doors than schmooze"
    ],
    category: 'personality',
    domain: 'commerce'
  },
  {
    id: 312,
    text: "What's your appetite for travel?",
    options: [
      "Love it. The more the better.",
      "Happy to travel regularly, maybe 25 to 50 percent",
      "Occasional trips are fine, but I want a home base",
      "Minimal travel preferred",
      "I want a role with basically no travel"
    ],
    category: 'workstyle',
    domain: 'commerce'
  },
  {
    id: 313,
    text: "How do you handle high pressure deadlines and targets?",
    options: [
      "I perform best under pressure",
      "I can handle it in bursts",
      "Manageable if I have enough lead time",
      "Constant pressure wears me down",
      "I actively avoid high pressure environments"
    ],
    category: 'personality',
    domain: 'commerce'
  },
  {
    id: 314,
    text: "Which business problem sounds most interesting to solve?",
    options: [
      "Scaling a company from startup to market leader",
      "Turning around a struggling organization",
      "Optimizing operations for efficiency and cost",
      "Breaking into a new market or launching a product",
      "Building a team and culture that attracts top talent"
    ],
    category: 'aptitude',
    domain: 'commerce'
  },
  {
    id: 315,
    text: "What matters more: stability or upside?",
    options: [
      "Upside. I'll take equity and variable comp over a safe salary.",
      "Lean toward upside, but I need some baseline security",
      "Balanced. Good salary with reasonable bonus potential.",
      "Lean toward stability. Predictable income matters.",
      "Stability first. I'll sacrifice upside for peace of mind."
    ],
    category: 'values',
    domain: 'commerce'
  },
  {
    id: 401,
    text: "What role does creativity play in your ideal career?",
    options: [
      "It's central. I need to create or express something daily.",
      "Important. I want creative threads woven into my work.",
      "Nice to have, but not the main thing",
      "I lean toward structured, well defined work",
      "I'm more analytical than creative"
    ],
    category: 'values',
    domain: 'arts'
  },
  {
    id: 402,
    text: "Which creative medium resonates most with you?",
    options: [
      "Visual: design, illustration, photography, film",
      "Written: storytelling, copywriting, journalism",
      "Interactive: games, apps, digital experiences",
      "Performing: music, theater, dance",
      "Physical: fashion, architecture, product design"
    ],
    category: 'preference',
    domain: 'arts'
  },
  {
    id: 403,
    text: "Client work vs. personal projects?",
    options: [
      "I love bringing other people's visions to life",
      "Client work pays the bills, but I need my own stuff too",
      "I'd rather chase my own creative direction",
      "I want to build a brand around my personal work",
      "Depends on the project. I'm open either way."
    ],
    category: 'workstyle',
    domain: 'arts'
  },
  {
    id: 404,
    text: "How do you handle feedback and criticism?",
    options: [
      "I actively chase it. Makes the work better.",
      "I value input from people I trust and respect",
      "I can take it, but it sticks with me emotionally",
      "I prefer to trust my own instincts",
      "Criticism hits hard. I'm working on it."
    ],
    category: 'personality',
    domain: 'arts'
  },
  {
    id: 405,
    text: "Commercial success vs. artistic integrity?",
    options: [
      "I want both. Mainstream success with quality work.",
      "Commercial success first. It funds more creative freedom.",
      "Artistic integrity wins, even if the money's thin",
      "Still navigating that tension honestly",
      "I lean toward practical, commercially viable creative work"
    ],
    category: 'values',
    domain: 'arts'
  },
  {
    id: 406,
    text: "Which creative environment fits you?",
    options: [
      "Agency or studio, collaborative with diverse projects",
      "In house at a company, going deep on one brand",
      "Freelance, variety and independence",
      "My own studio or small practice",
      "Entertainment industry: film, TV, games, music"
    ],
    category: 'environment',
    domain: 'arts'
  },
  {
    id: 407,
    text: "How technically skilled do you want to be in your craft?",
    options: [
      "Expert level. I want to master specific tools.",
      "Skilled enough to execute what I envision",
      "I'd rather direct others who handle execution",
      "Some technical ability, but heavier on strategy",
      "I care more about ideas than how they get made"
    ],
    category: 'aptitude',
    domain: 'arts'
  },
  {
    id: 408,
    text: "What fuels your creative work?",
    options: [
      "Self expression and personal meaning",
      "Solving problems and serving real user needs",
      "Beauty, aesthetics, and the craft itself",
      "Impact. Changing how people think or feel.",
      "Building a name and reputation in my field"
    ],
    category: 'values',
    domain: 'arts'
  },
  {
    id: 409,
    text: "What draws you to people focused or humanities work?",
    options: [
      "Understanding why humans behave the way they do",
      "Teaching and watching others grow",
      "Advocating for fairness and justice",
      "Preserving and sharing culture and ideas",
      "Communicating and telling stories that matter"
    ],
    category: 'values',
    domain: 'arts'
  },
  {
    id: 410,
    text: "One on one or groups?",
    options: [
      "Deep one on one connections",
      "Small groups, maybe 5 to 15 people",
      "Large groups and public facing engagement",
      "Indirect impact through systems, policy, or content",
      "I'm comfortable across all of those"
    ],
    category: 'workstyle',
    domain: 'arts'
  },
  {
    id: 411,
    text: "How do you feel about the instability that often comes with creative careers?",
    options: [
      "It's part of the deal and I've accepted it",
      "I'm willing to hustle through the uncertain periods",
      "I'd prefer a creative role with more stability, like in house",
      "Financial instability would seriously stress me out",
      "I need a stable foundation before I can be creative"
    ],
    category: 'values',
    domain: 'arts'
  },
  {
    id: 412,
    text: "What's your relationship with deadlines in creative work?",
    options: [
      "Deadlines focus me. I do my best work under them.",
      "I meet them, but I prefer generous timelines",
      "I struggle when deadlines feel arbitrary or too tight",
      "I'd rather set my own pace when possible",
      "Tight deadlines kill my creativity"
    ],
    category: 'workstyle',
    domain: 'arts'
  },
  {
    id: 413,
    text: "How important is collaboration vs. solo work in your creative process?",
    options: [
      "I thrive bouncing ideas off others",
      "I like collaborating but need solo time to execute",
      "Mostly solo with occasional input from others",
      "I do my best work completely alone",
      "Depends entirely on the project"
    ],
    category: 'environment',
    domain: 'arts'
  },
  {
    id: 414,
    text: "Which audience do you most want to reach?",
    options: [
      "Mass market, as many people as possible",
      "A specific niche that really gets what I do",
      "Industry peers and fellow creatives",
      "Clients or businesses who need creative solutions",
      "Myself first, audience second"
    ],
    category: 'values',
    domain: 'arts'
  },
  {
    id: 415,
    text: "How do you feel about trends and what's currently popular?",
    options: [
      "I stay on top of them and adapt my work accordingly",
      "I'm aware of trends but don't chase them",
      "I deliberately avoid trends to stay original",
      "I follow trends in some areas but not others",
      "Trends feel like noise to me"
    ],
    category: 'personality',
    domain: 'arts'
  }
];

export const FALLBACK_COUNTRIES = [
  "Australia", "Brazil", "Canada", "China", "France", "Germany",
  "India", "Italy", "Japan", "Netherlands", "Singapore",
  "South Korea", "Spain", "Sweden", "Switzerland",
  "United Arab Emirates", "United Kingdom", "United States"
];