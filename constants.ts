import { QuizQuestion } from './types';

// --- CONFIGURATION ---
export const APP_NAME = "CareerPath AI";
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const QUESTIONS: QuizQuestion[] = [
  {
    id: 101,
    text: "When you lose track of time, you're usually...",
    options: [
      "Solving a puzzle or figuring out how something works",
      "Planning, strategizing, or organizing something",
      "Creating, designing, or expressing an idea",
      "Learning about people, cultures, or stories"
    ],
    category: 'preference',
    domain: 'general'
  },
  {
    id: 102,
    text: "Which of these problems would you most want to solve?",
    options: [
      "Climate change or disease prevention",
      "Economic inequality or business efficiency",
      "Cultural preservation or creative expression",
      "I'm drawn to multiple areas equally"
    ],
    category: 'values',
    domain: 'general'
  },
  {
    id: 103,
    text: "In a group setting, people usually come to you for...",
    options: [
      "Logical analysis and technical explanations",
      "Getting things organized and decisions made",
      "Creative ideas and fresh perspectives",
      "Emotional support and understanding"
    ],
    category: 'aptitude',
    domain: 'general'
  },
  {
    id: 104,
    text: "What kind of impact do you want your work to have?",
    options: [
      "Advance human knowledge or capability",
      "Build something profitable and scalable",
      "Express ideas that change how people think or feel",
      "Directly help individuals improve their lives"
    ],
    category: 'values',
    domain: 'general'
  },
  {
    id: 105,
    text: "Which work environment sounds most appealing?",
    options: [
      "A lab, hospital, or technical space with equipment",
      "A professional office with clear structure",
      "A creative studio or flexible workspace",
      "Out in the field, meeting different people"
    ],
    category: 'environment',
    domain: 'general'
  },
  {
    id: 106,
    text: "When making a big decision, you typically...",
    options: [
      "Gather data and analyze the options systematically",
      "Weigh the practical and financial implications",
      "Go with your gut feeling after some reflection",
      "Talk it through with people you trust"
    ],
    category: 'personality',
    domain: 'general'
  },
  {
    id: 107,
    text: "Which of these activities would you choose for a free Saturday?",
    options: [
      "Tinkering with a project or learning how something works",
      "Working on personal finances or a side business",
      "Visiting a museum, concert, or cultural event",
      "Volunteering or spending time helping others"
    ],
    category: 'preference',
    domain: 'general'
  },
  {
    id: 108,
    text: "What frustrates you most at work or school?",
    options: [
      "Inefficiency and poorly designed systems",
      "Unclear goals or disorganization",
      "Lack of creativity or rigid rules",
      "People not being treated fairly"
    ],
    category: 'values',
    domain: 'general'
  },
  {
    id: 109,
    text: "How do you prefer to learn new skills?",
    options: [
      "Reading documentation and understanding the theory",
      "Structured courses with clear progression",
      "Hands-on experimentation and creative exploration",
      "Learning from a mentor or watching others"
    ],
    category: 'workstyle',
    domain: 'general'
  },
  {
    id: 110,
    text: "What's your relationship with risk?",
    options: [
      "I prefer calculated risks based on evidence",
      "I'm comfortable with financial and business risks",
      "I take creative risks and embrace uncertainty",
      "I prefer stability and minimizing uncertainty"
    ],
    category: 'personality',
    domain: 'general'
  },
  {
    id: 111,
    text: "Which statement resonates most with you?",
    options: [
      "I want to understand how the world works",
      "I want to build something successful",
      "I want to express myself and inspire others",
      "I want to make a difference in people's lives"
    ],
    category: 'values',
    domain: 'general'
  },
  {
    id: 112,
    text: "How important is work-life balance to you?",
    options: [
      "I can work intensely when solving interesting problems",
      "I'll sacrifice balance for career advancement",
      "Critical—I need time for personal creative pursuits",
      "Important—I want flexibility and boundaries"
    ],
    category: 'workstyle',
    domain: 'general'
  },
  {
    id: 113,
    text: "What type of recognition matters most to you?",
    options: [
      "Respect from experts in my field",
      "Financial success and professional advancement",
      "Creative recognition and lasting impact",
      "Knowing I helped someone, even if unnoticed"
    ],
    category: 'values',
    domain: 'general'
  },
  {
    id: 114,
    text: "How do you handle repetitive tasks?",
    options: [
      "I automate or optimize them",
      "I systematize them into efficient processes",
      "I struggle—I need variety and novelty",
      "I find rhythm in routine and don't mind them"
    ],
    category: 'workstyle',
    domain: 'general'
  },
  {
    id: 115,
    text: "When watching a documentary, which topic grabs you?",
    options: [
      "Scientific discoveries or medical breakthroughs",
      "Business empires or economic systems",
      "Artists, musicians, or cultural movements",
      "Social issues or human stories"
    ],
    category: 'preference',
    domain: 'general'
  },

  // ============================================
  // SCIENCE DOMAIN (201-215)
  // Covers: STEM, Healthcare, Engineering, Research
  // ============================================
  {
    id: 201,
    text: "What draws you to scientific or technical work?",
    options: [
      "The elegance of solving complex problems",
      "Building things that people actually use",
      "Understanding how nature and systems work",
      "Helping people through medical or health advances"
    ],
    category: 'values',
    domain: 'science'
  },
  {
    id: 202,
    text: "Which of these would you most enjoy working on?",
    options: [
      "Software, apps, or digital products",
      "Research that advances scientific understanding",
      "Hardware, robotics, or physical systems",
      "Healthcare, diagnostics, or patient care"
    ],
    category: 'preference',
    domain: 'science'
  },
  {
    id: 203,
    text: "When debugging a problem, you typically...",
    options: [
      "Systematically isolate variables until you find it",
      "Trust your intuition about where to look first",
      "Search for similar problems others have solved",
      "Step away and let your subconscious work on it"
    ],
    category: 'aptitude',
    domain: 'science'
  },
  {
    id: 204,
    text: "How do you feel about math and quantitative work?",
    options: [
      "I enjoy it—the more complex, the better",
      "I appreciate it as a tool for solving real problems",
      "I can handle it when necessary",
      "I prefer to minimize it in my work"
    ],
    category: 'aptitude',
    domain: 'science'
  },
  {
    id: 205,
    text: "What's your preferred relationship with technology?",
    options: [
      "I want to build and code systems daily",
      "I want to use technology as a tool, not build it",
      "I want to design and architect, less implementation",
      "I prefer hands-on work with physical systems or patients"
    ],
    category: 'workstyle',
    domain: 'science'
  },
  {
    id: 206,
    text: "Which scientific approach appeals to you most?",
    options: [
      "Theoretical—developing models and frameworks",
      "Experimental—testing hypotheses with data",
      "Applied—solving practical real-world problems",
      "Clinical—working directly with patients or subjects"
    ],
    category: 'preference',
    domain: 'science'
  },
  {
    id: 207,
    text: "How do you feel about being on-call or handling emergencies?",
    options: [
      "I thrive under pressure",
      "I can handle it but prefer planned work",
      "I'd rather have predictable hours",
      "It would significantly impact my wellbeing"
    ],
    category: 'workstyle',
    domain: 'science'
  },
  {
    id: 208,
    text: "How do you feel about long training periods (5+ years)?",
    options: [
      "Worth it for the right career",
      "I'd prefer shorter paths to start working",
      "I'm open to it if I can work while training",
      "That's too long for me to consider"
    ],
    category: 'workstyle',
    domain: 'science'
  },
  {
    id: 209,
    text: "What scale of impact interests you most?",
    options: [
      "Global—technology or research affecting millions",
      "Industry—transforming how a sector works",
      "Individual—directly helping one person at a time",
      "Local—improving systems in my community"
    ],
    category: 'values',
    domain: 'science'
  },
  {
    id: 210,
    text: "Which work setting appeals to you?",
    options: [
      "Tech company or startup",
      "Research lab or university",
      "Hospital or clinical setting",
      "Engineering firm or manufacturing"
    ],
    category: 'environment',
    domain: 'science'
  },
  {
    id: 211,
    text: "How do you feel about specialization vs. breadth?",
    options: [
      "I want to be an expert in one specific area",
      "I prefer depth in one area with awareness of others",
      "I like being a generalist who can adapt",
      "I'm still figuring out what to focus on"
    ],
    category: 'workstyle',
    domain: 'science'
  },
  {
    id: 212,
    text: "What motivates you most in technical work?",
    options: [
      "Intellectual challenge and problem-solving",
      "Creating something useful that works",
      "Making discoveries that advance knowledge",
      "Improving people's health or quality of life"
    ],
    category: 'values',
    domain: 'science'
  },
  {
    id: 213,
    text: "How do you prefer to work with data?",
    options: [
      "Analyzing patterns and building models",
      "Visualizing and communicating insights",
      "Collecting through experiments or research",
      "Using it to make clinical or practical decisions"
    ],
    category: 'aptitude',
    domain: 'science'
  },
  {
    id: 214,
    text: "Which tools would you rather work with?",
    options: [
      "Code editors and software development tools",
      "Laboratory equipment and instruments",
      "Medical devices and diagnostic tools",
      "CAD software and engineering systems"
    ],
    category: 'preference',
    domain: 'science'
  },
  {
    id: 215,
    text: "How important is direct human interaction in your work?",
    options: [
      "Minimal—I prefer working with systems and data",
      "Some—I like collaborating with technical peers",
      "Significant—I want regular patient or client contact",
      "Central—I want to help people face-to-face daily"
    ],
    category: 'workstyle',
    domain: 'science'
  },
  {
    id: 301,
    text: "What aspect of business excites you most?",
    options: [
      "Building something from nothing",
      "Analyzing markets and making strategic decisions",
      "Managing people and operations",
      "Working with numbers and financial analysis"
    ],
    category: 'preference',
    domain: 'commerce'
  },
  {
    id: 302,
    text: "How do you view money and wealth?",
    options: [
      "A primary measure of success",
      "Important but not the main driver",
      "A means to support the life I want",
      "Less important than meaningful work"
    ],
    category: 'values',
    domain: 'commerce'
  },
  {
    id: 303,
    text: "When evaluating an opportunity, you focus on...",
    options: [
      "The potential upside and growth",
      "The risks and what could go wrong",
      "The people and team involved",
      "The numbers and financial projections"
    ],
    category: 'aptitude',
    domain: 'commerce'
  },
  {
    id: 304,
    text: "How do you feel about sales and persuasion?",
    options: [
      "I enjoy connecting people with value",
      "I can do it when I believe in the product",
      "I prefer to let the work speak for itself",
      "I'd rather be in a purely analytical role"
    ],
    category: 'personality',
    domain: 'commerce'
  },
  {
    id: 305,
    text: "What's your management style preference?",
    options: [
      "I want to lead and manage teams",
      "I want to be an individual contributor with influence",
      "I'd like to manage eventually, not immediately",
      "I prefer working independently"
    ],
    category: 'workstyle',
    domain: 'commerce'
  },
  {
    id: 306,
    text: "How do you feel about corporate environments?",
    options: [
      "I thrive in structured, large organizations",
      "I prefer mid-size companies with some structure",
      "I like startups—fast-paced, less bureaucracy",
      "I'd rather work for myself or freelance"
    ],
    category: 'environment',
    domain: 'commerce'
  },
  {
    id: 307,
    text: "Which business function interests you most?",
    options: [
      "Strategy and leadership",
      "Finance, accounting, or investment",
      "Marketing, sales, or business development",
      "Operations, logistics, or supply chain"
    ],
    category: 'preference',
    domain: 'commerce'
  },
  {
    id: 308,
    text: "How do you handle high-pressure deadlines?",
    options: [
      "I thrive—pressure brings out my best",
      "I manage well with proper planning",
      "I can handle them but prefer steady pacing",
      "I find them stressful and prefer to avoid them"
    ],
    category: 'personality',
    domain: 'commerce'
  },
  {
    id: 309,
    text: "What's your approach to negotiation?",
    options: [
      "I aim to win and get the best deal",
      "I focus on creating win-win outcomes",
      "I prioritize maintaining relationships",
      "I prefer to avoid confrontational situations"
    ],
    category: 'aptitude',
    domain: 'commerce'
  },
  {
    id: 310,
    text: "How interested are you in legal and regulatory matters?",
    options: [
      "Very—I find law and compliance fascinating",
      "Somewhat—it's a necessary part of business",
      "Minimal—I'd rather focus on other areas",
      "Not at all—I'd outsource that entirely"
    ],
    category: 'preference',
    domain: 'commerce'
  },
  {
    id: 311,
    text: "What drives your career ambition?",
    options: [
      "Reaching executive or leadership positions",
      "Building wealth and financial independence",
      "Having influence and making key decisions",
      "Work-life balance with good compensation"
    ],
    category: 'values',
    domain: 'commerce'
  },
  {
    id: 312,
    text: "How do you feel about networking and relationship building?",
    options: [
      "Essential—I actively build my network",
      "Important—I do it strategically",
      "Tolerable—I do it when necessary",
      "Uncomfortable—I prefer merit-based advancement"
    ],
    category: 'personality',
    domain: 'commerce'
  },
  {
    id: 313,
    text: "Which appeals more: stability or growth potential?",
    options: [
      "High growth, even if risky",
      "Balance of growth and stability",
      "Stability with steady advancement",
      "Security is my top priority"
    ],
    category: 'values',
    domain: 'commerce'
  },
  {
    id: 314,
    text: "How do you approach decision-making with incomplete information?",
    options: [
      "I'm comfortable making quick calls",
      "I gather what I can, then decide",
      "I prefer to wait for more data",
      "I consult others before deciding"
    ],
    category: 'aptitude',
    domain: 'commerce'
  },
  {
    id: 315,
    text: "What's your ideal client or customer relationship?",
    options: [
      "B2B—working with other businesses",
      "B2C—serving individual consumers",
      "Internal—supporting colleagues and teams",
      "No direct client work—focus on analysis or operations"
    ],
    category: 'preference',
    domain: 'commerce'
  },
  {
    id: 401,
    text: "What role does creativity play in your ideal career?",
    options: [
      "Central—I need to create and express daily",
      "Important—I want creative elements in my work",
      "Moderate—I appreciate it but structure matters too",
      "I'm more interested in helping people than creating"
    ],
    category: 'values',
    domain: 'arts'
  },
  {
    id: 402,
    text: "Which type of work resonates most with you?",
    options: [
      "Visual—design, illustration, photography, film",
      "Written—storytelling, journalism, content",
      "Performing—music, theater, presenting",
      "Human-focused—teaching, counseling, social work"
    ],
    category: 'preference',
    domain: 'arts'
  },
  {
    id: 403,
    text: "How do you feel about client work vs. personal projects?",
    options: [
      "I enjoy bringing others' visions to life",
      "I prefer client work but need personal projects too",
      "I'd rather focus on my own creative vision",
      "I want to serve people's needs, not create for them"
    ],
    category: 'workstyle',
    domain: 'arts'
  },
  {
    id: 404,
    text: "What's your relationship with feedback and criticism?",
    options: [
      "I actively seek it—it makes my work better",
      "I value feedback from people I respect",
      "I can handle it but it affects me emotionally",
      "I prefer to trust my own judgment"
    ],
    category: 'personality',
    domain: 'arts'
  },
  {
    id: 405,
    text: "How important is commercial success vs. meaningful impact?",
    options: [
      "Commercial success enables more creativity",
      "I want both—success with quality work",
      "Impact and meaning matter more than money",
      "Helping individuals matters more than scale"
    ],
    category: 'values',
    domain: 'arts'
  },
  {
    id: 406,
    text: "Which work environment suits you best?",
    options: [
      "Agency or studio—collaborative with diverse projects",
      "In-house at a company—depth on one brand",
      "Freelance or independent—variety and autonomy",
      "Institution—school, nonprofit, or community organization"
    ],
    category: 'environment',
    domain: 'arts'
  },
  {
    id: 407,
    text: "How technically skilled do you want to be in your craft?",
    options: [
      "Expert level—mastering tools and techniques",
      "Proficient—skilled enough to execute my vision",
      "Conceptual—I prefer to direct others who execute",
      "Practical—enough skill to communicate and connect"
    ],
    category: 'aptitude',
    domain: 'arts'
  },
  {
    id: 408,
    text: "What motivates your work?",
    options: [
      "Self-expression and personal meaning",
      "Solving problems through creative solutions",
      "Beauty, aesthetics, and craft excellence",
      "Making a difference in people's lives"
    ],
    category: 'values',
    domain: 'arts'
  },
  {
    id: 409,
    text: "How do you feel about working one-on-one vs. reaching many?",
    options: [
      "I prefer deep one-on-one relationships",
      "I like small groups (5-15 people)",
      "I want to reach large audiences",
      "I'm comfortable with all formats"
    ],
    category: 'workstyle',
    domain: 'arts'
  },
  {
    id: 410,
    text: "What population would you most want to serve?",
    options: [
      "General public through media or content",
      "Businesses and commercial clients",
      "Children, students, or learners",
      "Individuals needing support or guidance"
    ],
    category: 'preference',
    domain: 'arts'
  },
  {
    id: 411,
    text: "How important are academic credentials in your field?",
    options: [
      "Very—I'm willing to pursue advanced degrees",
      "Important—I'll get what's necessary",
      "Portfolio and experience matter more",
      "I prefer alternative paths to credentials"
    ],
    category: 'workstyle',
    domain: 'arts'
  },
  {
    id: 412,
    text: "Which aspect of media/content interests you most?",
    options: [
      "Creating the visual or audio experience",
      "Writing and narrative development",
      "Strategy and reaching the right audience",
      "The human stories and social impact"
    ],
    category: 'preference',
    domain: 'arts'
  },
  {
    id: 413,
    text: "How do you handle the uncertainty of creative careers?",
    options: [
      "I embrace it—unpredictability is exciting",
      "I can manage with some stable income sources",
      "I prefer more predictable career paths",
      "I want stability but with meaningful work"
    ],
    category: 'personality',
    domain: 'arts'
  },
  {
    id: 414,
    text: "What's your approach to collaboration?",
    options: [
      "I prefer working solo on my vision",
      "I like collaborating with other creatives",
      "I enjoy leading creative teams",
      "I thrive in service of others' needs"
    ],
    category: 'workstyle',
    domain: 'arts'
  },
  {
    id: 415,
    text: "Which career outcome would satisfy you most?",
    options: [
      "Recognition and respect in my creative field",
      "Building a sustainable creative business",
      "Creating work that outlasts me",
      "Knowing I changed individual lives for the better"
    ],
    category: 'values',
    domain: 'arts'
  }
];

export const FALLBACK_COUNTRIES = [
  "Australia", "Brazil", "Canada", "China", "France", "Germany",
  "India", "Italy", "Japan", "Netherlands", "Singapore",
  "South Korea", "Spain", "Sweden", "Switzerland",
  "United Arab Emirates", "United Kingdom", "United States"
];