
import { QuizQuestion } from './types';

// --- CONFIGURATION ---
export const APP_NAME = "CareerPath AI";

// Load from Environment Variable (Vite) or fallback to Localhost
// The frontend will look for VITE_API_BASE_URL. 
// If deployed to Vercel/Netlify, you set this env var there to point to Hugging Face.
export const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:8000"; 

export const QUESTIONS: QuizQuestion[] = [
  // --- GENERAL / UNDECIDED (Helps identify the domain) --- //
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

  // --- SCIENCE & TECH ---
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

  // --- COMMERCE & BUSINESS ---
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

  // --- ARTS & HUMANITIES ---
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
  }
];

// Mock data for fallback
export const MOCK_CAREERS = [
  {
    id: "c1",
    title: "Data Scientist",
    matchScore: 95,
    summary: "Leverage mathematics and computer science to analyze complex datasets and drive business decisions.",
    salaryRange: "$95k - $160k",
    growth: "High (25% over 10 years)",
    tags: ["Tech", "Math", "Analytical"],
    roadmap: [
      { title: "Bachelor's Degree", description: "Computer Science or Statistics", duration: "4 Years" },
      { title: "Master's Degree", description: "Data Science or AI specialization", duration: "2 Years" },
      { title: "Junior Analyst", description: "Entry level position", duration: "1-2 Years" }
    ]
  },
  {
    id: "c2",
    title: "UX Designer",
    matchScore: 88,
    summary: "Design intuitive digital experiences by understanding user behavior and aesthetics.",
    salaryRange: "$75k - $130k",
    growth: "Moderate (15% over 10 years)",
    tags: ["Creative", "Tech", "Psychology"],
    roadmap: [
      { title: "Bachelor's Degree", description: "HCI, Design, or Psychology", duration: "4 Years" },
      { title: "Portfolio Building", description: "Freelance projects and bootcamps", duration: "6 Months" },
      { title: "Junior Designer", description: "Agency or In-house role", duration: "1-3 Years" }
    ]
  },
  {
    id: "c3",
    title: "Financial Analyst",
    matchScore: 92,
    summary: "Guide businesses and individuals in making investment decisions by assessing performance of stocks and bonds.",
    salaryRange: "$70k - $110k",
    growth: "Steady (9% over 10 years)",
    tags: ["Finance", "Math", "Business"],
    roadmap: [
      { title: "Bachelor's Degree", description: "Finance, Economics, or Accounting", duration: "4 Years" },
      { title: "CFA Certification", description: "Chartered Financial Analyst exams", duration: "1-2 Years" },
      { title: "Associate Analyst", description: "Investment firm entry role", duration: "2 Years" }
    ]
  }
];

export const FALLBACK_LOCATIONS: Record<string, string[]> = {
  "United States": ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "San Francisco", "Seattle", "Austin", "Boston", "Miami"],
  "United Kingdom": ["London", "Manchester", "Birmingham", "Glasgow", "Liverpool", "Edinburgh", "Bristol"],
  "Canada": ["Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa", "Edmonton"],
  "Australia": ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Gold Coast"],
  "Germany": ["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne", "Stuttgart"],
  "India": ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune"],
  "France": ["Paris", "Marseille", "Lyon", "Toulouse", "Nice"],
  "Japan": ["Tokyo", "Osaka", "Kyoto", "Yokohama", "Nagoya"],
  "Singapore": ["Singapore"],
  "China": ["Shanghai", "Beijing", "Shenzhen", "Guangzhou"],
  "Brazil": ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador"],
  "United Arab Emirates": ["Dubai", "Abu Dhabi", "Sharjah"],
  "Netherlands": ["Amsterdam", "Rotterdam", "The Hague"],
  "Sweden": ["Stockholm", "Gothenburg", "Malmö"],
  "Spain": ["Madrid", "Barcelona", "Valencia", "Seville"],
  "Italy": ["Rome", "Milan", "Naples", "Turin"],
  "South Korea": ["Seoul", "Busan", "Incheon"],
  "Switzerland": ["Zurich", "Geneva", "Basel"]
};

export const FALLBACK_COUNTRIES = Object.keys(FALLBACK_LOCATIONS).sort();
