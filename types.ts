export interface UserProfile {
  id: string;
  fullName: string;
  gender: string;
  age: number;
  educationLevel: string;
  specialization: string;
  residenceCountry: string;
  preferredWorkCountry: string;
  // Quota Fields
  dailyImageGenerationsCount?: number;
  lastImageGenerationDate?: string;
  dailyCareerGenerationsCount?: number;
  lastCareerGenerationDate?: string;
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
  description: string;
  localPath?: string;
  targetPath?: string;
  duration: string;
}

export interface CareerRecommendation {
  id: string;
  title: string;
  matchScore: number;
  summary: string;
  salaryRange: string;
  growth: string;
  tags: string[];
  isPivot?: boolean;
  pivotAnalysis?: string;
  roadmap: CareerRoadmapStep[];
  dayInLifePrompts?: string[];
  slideImages?: string[];
}

export interface Slide {
  id: number;
  imageUrl: string;
  text: string;
}

export enum AppView {
  LANDING = 'LANDING',
  AUTH = 'AUTH',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
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