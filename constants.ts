import { QuizQuestion } from './types';

// --- CONFIGURATION ---
export const APP_NAME = "CareerPath AI";
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const QUESTIONS: QuizQuestion[] = [
  {
    id: 101,
    text: "When you walk into a bookstore, which section do you visit first?",
    options: ["Science, Tech & Gadgets", "Business, Biography & Money", "Art, Fiction & Design", "I browse everything"],
    category: 'preference',
    domain: 'general'
  },
  {
    id: 102,
    text: "How do you prefer to solve problems?",
    options: ["Using logic and data", "Negotiating and strategizing", "Creating something visual/emotional", "Talking to people"],
    category: 'personality',
    domain: 'general'
  },
  {
    id: 103,
    text: "What defines success for you?",
    options: ["Discovering new knowledge", "Building wealth and influence", "Expressing myself creatively", "Helping others"],
    category: 'preference',
    domain: 'general'
  },
  {
    id: 104,
    text: "In a group project, what role do you naturally take?",
    options: ["The Researcher/Analyst", "The Leader/Organizer", "The Creator/Designer", "The Supporter/Mediator"],
    category: 'personality',
    domain: 'general'
  },
  {
    id: 105,
    text: "Which type of news catches your eye?",
    options: ["New scientific discoveries", "Stock market and business trends", "Movie releases and art exhibits", "Human interest stories"],
    category: 'preference',
    domain: 'general'
  },
  {
    id: 201,
    text: "Which sounds more exciting?",
    options: ["Coding a new app", "Diagnosing a patient", "Designing a sustainable city", "Analyzing space data"],
    category: 'aptitude',
    domain: 'science'
  },
  {
    id: 202,
    text: "Do you prefer working with...",
    options: ["Abstract mathematical theories", "Hands-on machinery/hardware", "Biological specimens", "Computer algorithms"],
    category: 'preference',
    domain: 'science'
  },
  {
    id: 203,
    text: "When faced with a complex system, you want to...",
    options: ["Take it apart to see how it works", "Optimize it for efficiency", "Document its behavior", "Redesign it entirely"],
    category: 'personality',
    domain: 'science'
  },
  {
    id: 204,
    text: "Your favorite subject in school was/is:",
    options: ["Physics", "Biology", "Chemistry", "Computer Science"],
    category: 'aptitude',
    domain: 'science'
  },
  {
    id: 205,
    text: "How do you handle data?",
    options: ["I look for patterns and trends", "I check for accuracy and errors", "I visualize it into charts", "I find it boring"],
    category: 'aptitude',
    domain: 'science'
  },
  {
    id: 206,
    text: "You want to invent something that...",
    options: ["Automates daily tasks", "Cures a disease", "Explores the ocean", "Protects the environment"],
    category: 'preference',
    domain: 'science'
  },
  {
    id: 207,
    text: "When learning something new, you prefer...",
    options: ["Reading technical documentation", "Experimenting/Trial and error", "Watching tutorials", "Attending a lecture"],
    category: 'personality',
    domain: 'science'
  },
  {
    id: 208,
    text: "Which tool would you rather use?",
    options: ["Microscope", "Telescope", "Soldering Iron", "Code Editor"],
    category: 'preference',
    domain: 'science'
  },
  {
    id: 209,
    text: "A logical paradox is...",
    options: ["A fun puzzle to solve", "Frustrating", "Interesting philosophically", "Irrelevant to real life"],
    category: 'personality',
    domain: 'science'
  },
  {
    id: 210,
    text: "You are tasked with building a bridge. You focus on:",
    options: ["Structural integrity/Physics", "Cost efficiency", "Aesthetics", "Environmental impact"],
    category: 'aptitude',
    domain: 'science'
  },
  {
    id: 301,
    text: "In a team project, you are usually...",
    options: ["The Project Manager", "The Financial Planner", "The Marketer/Presenter", "The Risk Analyst"],
    category: 'personality',
    domain: 'commerce'
  },
  {
    id: 302,
    text: "What interests you about a product?",
    options: ["How it's marketed and sold", "How much profit it generates", "The legal regulations behind it", "The logistics of shipping it"],
    category: 'aptitude',
    domain: 'commerce'
  },
  {
    id: 303,
    text: "You have $10,000 to invest. You...",
    options: ["Start a small side-hustle", "Put it in the stock market", "Save it for an emergency", "Invest in self-education"],
    category: 'preference',
    domain: 'commerce'
  },
  {
    id: 304,
    text: "A company is failing. You suggest:",
    options: ["Cutting costs immediately", "Rebranding and better marketing", "Restructuring the leadership", "Pivot to a new product"],
    category: 'aptitude',
    domain: 'commerce'
  },
  {
    id: 305,
    text: "Which concept appeals to you most?",
    options: ["Supply and Demand", "Compound Interest", "Corporate Law", "Consumer Psychology"],
    category: 'preference',
    domain: 'commerce'
  },
  {
    id: 306,
    text: "You are negotiating a deal. You focus on...",
    options: ["Creating a win-win situation", "Getting the lowest price possible", "Building a long-term relationship", "Ensuring all legal boxes are checked"],
    category: 'personality',
    domain: 'commerce'
  },
  {
    id: 307,
    text: "Your dream workspace is...",
    options: ["A high-rise corner office", "A bustling trading floor", "A courtroom", "A coworking space with startups"],
    category: 'preference',
    domain: 'commerce'
  },
  {
    id: 308,
    text: "How do you view competition?",
    options: ["It drives me to be better", "It's necessary for the market", "It's stressful", "I prefer collaboration"],
    category: 'personality',
    domain: 'commerce'
  },
  {
    id: 309,
    text: "When reading a contract, you...",
    options: ["Scan for the numbers", "Read every detail carefully", "Look for the deliverables", "Have someone else read it"],
    category: 'aptitude',
    domain: 'commerce'
  },
  {
    id: 310,
    text: "The most important metric for a business is...",
    options: ["Net Profit", "Customer Satisfaction", "Market Share", "Brand Recognition"],
    category: 'preference',
    domain: 'commerce'
  },
  {
    id: 401,
    text: "How do you express your ideas best?",
    options: ["Writing stories/essays", "Drawing or digital design", "Speaking/Performing", "Filmmaking/Photography"],
    category: 'aptitude',
    domain: 'arts'
  },
  {
    id: 402,
    text: "You prefer a workspace that is...",
    options: ["Messy but inspiring", "A quiet studio", "A collaborative open space", "Outdoors in nature"],
    category: 'preference',
    domain: 'arts'
  },
  {
    id: 403,
    text: "Critics say your work is...",
    options: ["Unique and provocative", "Technically skilled", "Emotionally moving", "Communicative and clear"],
    category: 'personality',
    domain: 'arts'
  },
  {
    id: 404,
    text: "Which historical figure interests you most?",
    options: ["Leonardo da Vinci (Artist)", "Shakespeare (Writer)", "Beethoven (Musician)", "Plato (Philosopher)"],
    category: 'preference',
    domain: 'arts'
  },
  {
    id: 405,
    text: "You have free time. You...",
    options: ["Sketch or Paint", "Read a novel", "Watch an indie film", "Go to a museum"],
    category: 'preference',
    domain: 'arts'
  },
  {
    id: 406,
    text: "The purpose of art is to...",
    options: ["Evoke emotion", "Document history", "Challenge society", "Be beautiful"],
    category: 'personality',
    domain: 'arts'
  },
  {
    id: 407,
    text: "You are designing a poster. You start with...",
    options: ["The color palette", "The typography/font", "The message/concept", "The layout structure"],
    category: 'aptitude',
    domain: 'arts'
  },
  {
    id: 408,
    text: "Which career sounds worst to you?",
    options: ["Data Entry Clerk", "Factory Worker", "Investment Banker", "Tax Auditor"],
    category: 'preference',
    domain: 'arts'
  },
  {
    id: 409,
    text: "When watching a movie, you notice...",
    options: ["The cinematography/lighting", "The dialogue/script", "The acting performance", "The costume design"],
    category: 'aptitude',
    domain: 'arts'
  },
  {
    id: 410,
    text: "Creativity comes from...",
    options: ["Spontaneous inspiration", "Disciplined practice", "Observing the world", "Personal suffering"],
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