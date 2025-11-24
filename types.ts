export interface UserProfile {
  id: string;
  fullName: string;
  gender: string;
  age: number;
  educationLevel: string;
  specialization: string;
  residenceCountry: string;
  preferredWorkCountry: string; // Supports 'Undecided'
}

export type CareerDomain = 'science' | 'commerce' | 'arts' | 'general';

export interface QuizQuestion {
  id: number;
  text: string;
  options: string[];
  category: 'personality' | 'aptitude' | 'preference';
  domain: CareerDomain;
}

export interface QuizAnswer {
  questionId: number;
  answer: string;
  domain: CareerDomain;
}

export interface CareerRoadmapStep {
  title: string;
  description: string; // General description
  localPath?: string; // Specific to residence
  targetPath?: string; // Specific to target country
  duration: string;
}

export interface CareerRecommendation {
  id: string;
  title: string;
  matchScore: number; // 0-100
  summary: string;
  salaryRange: string;
  growth: string;
  tags: string[];
  isPivot?: boolean; // New: Is this a major domain switch?
  pivotAnalysis?: string; // New: Explanation of the gap/eligibility
  roadmap: CareerRoadmapStep[];
  dayInLifePrompts?: string[]; // For slideshow generation
  slideImages?: string[]; // URLs of generated/saved images
}

export interface Slide {
  id: number;
  imageUrl: string;
  text: string;
}

export enum AppView {
  LANDING = 'LANDING',
  AUTH = 'AUTH',
  ONBOARDING = 'ONBOARDING',
  DASHBOARD = 'DASHBOARD',
  PROFILE = 'PROFILE',
  SAVED_PATHS = 'SAVED_PATHS',
  QUIZ = 'QUIZ',
  ANALYSIS = 'ANALYSIS',
  RESULTS = 'RESULTS',
  CAREER_DETAIL = 'CAREER_DETAIL',
  SLIDESHOW = 'SLIDESHOW',
}