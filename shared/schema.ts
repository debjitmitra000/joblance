import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  boolean,
  decimal,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (unchanged)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Enhanced Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(),
  name: varchar("name").notNull(),
  geminiApiKey: text("gemini_api_key"), // encrypted storage
  
  // Profile preferences
  preferredLocation: varchar("preferred_location"),
  openToRemote: boolean("open_to_remote").default(false),
  willingToRelocate: boolean("willing_to_relocate").default(false),
  
  // Notification preferences
  emailNotifications: boolean("email_notifications").default(true),
  weeklyReports: boolean("weekly_reports").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhanced Resumes table with comprehensive profile data
export const resumes = pgTable("resumes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  filename: varchar("filename").notNull(),
  originalName: varchar("original_name").notNull(),
  fileSize: varchar("file_size").notNull(),
  mimeType: varchar("mime_type").notNull(),
  extractedText: text("extracted_text"),
  
  // Comprehensive profile data from AI analysis
  personalInfo: jsonb("personal_info"), // name, contact, links
  careerLevel: jsonb("career_level"), // experience, level, progression
  skillsAnalysis: jsonb("skills_analysis"), // categorized skills
  projectAnalysis: jsonb("project_analysis"), // project quality, complexity
  education: jsonb("education"), // academic background
  careerFit: jsonb("career_fit"), // suitable roles, domains
  workPreferences: jsonb("work_preferences"), // location, remote, etc.
  salaryInsights: jsonb("salary_insights"), // market-based estimation
  
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhanced Analysis results table
export const analyses = pgTable("analyses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  
  // Basic job information
  jobTitle: varchar("job_title").notNull(),
  company: varchar("company").notNull(),
  location: varchar("location"),
  jobUrl: text("job_url"), // store original URL
  jobHtml: text("job_html").notNull(),
  
  // Comprehensive job analysis
  jobDetails: jsonb("job_details"), // company, industry, size, type
  requirements: jsonb("requirements"), // skills, experience, education
  jobCharacteristics: jsonb("job_characteristics"), // work type, schedule, team
  compensation: jsonb("compensation"), // salary, benefits, type
  
  // Enhanced matching analysis
  matchAnalysis: jsonb("match_analysis"), // multi-dimensional matching
  skillMatch: decimal("skill_match", { precision: 5, scale: 2 }),
  experienceMatch: decimal("experience_match", { precision: 5, scale: 2 }),
  locationMatch: decimal("location_match", { precision: 5, scale: 2 }),
  compensationMatch: decimal("compensation_match", { precision: 5, scale: 2 }),
  cultureMatch: decimal("culture_match", { precision: 5, scale: 2 }),
  overallMatch: decimal("overall_match", { precision: 5, scale: 2 }).notNull(),
  
  // Recommendations and insights
  recommendation: jsonb("recommendation"), // shouldApply, confidence, tips
  careerGrowth: jsonb("career_growth"), // potential, path, learning
  riskAssessment: jsonb("risk_assessment"), // risks, factors, mitigation
  comprehensiveReport: jsonb("comprehensive_report"), // final strategic report
  
  // Quick decision fields
  shouldApply: boolean("should_apply"),
  applicationPriority: varchar("application_priority"), // high, medium, low
  confidence: decimal("confidence", { precision: 5, scale: 2 }),
  
  // Job characteristics (for filtering/searching)
  workType: varchar("work_type"), // remote, hybrid, onsite
  employmentType: varchar("employment_type"), // full-time, contract, internship
  isPaid: boolean("is_paid"),
  experienceLevel: varchar("experience_level"), // entry, junior, mid, senior
  
  // Legacy fields (maintain compatibility)
  matchedSkills: jsonb("matched_skills").notNull(),
  missingSkills: jsonb("missing_skills").notNull(),
  partialSkills: jsonb("partial_skills").notNull(),
  matchPercentage: decimal("match_percentage", { precision: 5, scale: 2 }).notNull(),
  recommendations: jsonb("recommendations").notNull(),
  skillsByCategory: jsonb("skills_by_category").notNull(),
  
  analyzedAt: timestamp("analyzed_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// New table: Job tracking and application status
export const jobApplications = pgTable("job_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  analysisId: varchar("analysis_id").references(() => analyses.id),
  
  // Application tracking
  status: varchar("status").notNull().default("not_applied"), // not_applied, applied, interview, offer, rejected, accepted
  appliedAt: timestamp("applied_at"),
  lastStatusUpdate: timestamp("last_status_update").defaultNow(),
  
  // Application details
  applicationMethod: varchar("application_method"), // website, email, referral, recruiter
  coverLetter: text("cover_letter"),
  notes: text("notes"),
  followUpDate: timestamp("follow_up_date"),
  
  // Interview process tracking
  interviewStages: jsonb("interview_stages"), // array of interview rounds
  feedback: text("feedback"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// New table: Skill development tracking
export const skillDevelopment = pgTable("skill_development", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  
  // Skill information
  skillName: varchar("skill_name").notNull(),
  category: varchar("category"), // technical, soft, certification
  currentLevel: varchar("current_level"), // beginner, intermediate, advanced, expert
  targetLevel: varchar("target_level"),
  
  // Learning tracking
  learningPath: jsonb("learning_path"), // courses, resources, milestones
  progress: decimal("progress", { precision: 5, scale: 2 }).default(sql`0`), // 0-100
  timeInvested: integer("time_invested").default(0), // hours
  
  // Goal setting
  targetDate: timestamp("target_date"),
  priority: varchar("priority"), // high, medium, low
  reason: text("reason"), // why learning this skill
  
  // Progress tracking
  milestones: jsonb("milestones"),
  resources: jsonb("resources"),
  projects: jsonb("projects"), // projects to practice this skill
  
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// New table: Market insights and salary data
export const marketInsights = pgTable("market_insights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Market data
  jobTitle: varchar("job_title").notNull(),
  location: varchar("location"),
  industry: varchar("industry"),
  experienceLevel: varchar("experience_level"),
  
  // Salary information
  avgSalary: decimal("avg_salary", { precision: 12, scale: 2 }),
  minSalary: decimal("min_salary", { precision: 12, scale: 2 }),
  maxSalary: decimal("max_salary", { precision: 12, scale: 2 }),
  currency: varchar("currency").default("USD"),
  
  // Market trends
  demandLevel: varchar("demand_level"), // high, medium, low
  growthProjection: varchar("growth_projection"), // growing, stable, declining
  skillsInDemand: jsonb("skills_in_demand"),
  
  // Competitiveness
  competitionLevel: varchar("competition_level"), // high, medium, low
  applicantPool: integer("applicant_pool"),
  
  // Data sources and freshness
  dataSource: varchar("data_source"),
  lastUpdated: timestamp("last_updated").defaultNow(),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// New table: Company insights
export const companyInsights = pgTable("company_insights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Company information
  companyName: varchar("company_name").notNull(),
  domain: varchar("domain"),
  industry: varchar("industry"),
  size: varchar("size"), // startup, small, medium, large, enterprise
  type: varchar("type"), // private, public, non-profit, government
  
  // Company culture and values
  culture: jsonb("culture"), // work-life balance, values, perks
  workEnvironment: varchar("work_environment"), // remote-first, hybrid, office-based
  diversityRating: decimal("diversity_rating", { precision: 3, scale: 1 }),
  
  // Employment data
  averageTenure: decimal("average_tenure", { precision: 4, scale: 1 }),
  employeeGrowth: decimal("employee_growth", { precision: 5, scale: 2 }),
  glassdoorRating: decimal("glassdoor_rating", { precision: 3, scale: 1 }),
  
  // Financial health
  fundingStage: varchar("funding_stage"), // seed, series-a, series-b, public, etc.
  recentFunding: decimal("recent_funding", { precision: 15, scale: 2 }),
  revenue: varchar("revenue_range"),
  
  // Hiring patterns
  hiringTrends: jsonb("hiring_trends"), // roles, frequency, seasons
  averageHiringTime: integer("average_hiring_time"), // days
  interviewProcess: jsonb("interview_process"),
  
  // Benefits and compensation
  benefits: jsonb("benefits"),
  compensationPhilosophy: text("compensation_philosophy"),
  stockOptions: boolean("stock_options").default(false),
  
  // Data freshness
  lastUpdated: timestamp("last_updated").defaultNow(),
  dataSource: varchar("data_source"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// New table: User career goals and preferences
export const careerGoals = pgTable("career_goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  
  // Career objectives
  shortTermGoals: jsonb("short_term_goals"), // 6-12 months
  longTermGoals: jsonb("long_term_goals"), // 2-5 years
  dreamJob: text("dream_job"),
  
  // Preferences
  preferredRoles: jsonb("preferred_roles"),
  preferredIndustries: jsonb("preferred_industries"),
  preferredCompanySize: varchar("preferred_company_size"),
  
  // Work-life preferences
  workLifeBalance: varchar("work_life_balance"), // high, medium, low priority
  travelTolerance: varchar("travel_tolerance"), // none, minimal, occasional, frequent
  overtimeAcceptance: varchar("overtime_acceptance"),
  
  // Compensation expectations
  salaryExpectation: decimal("salary_expectation", { precision: 12, scale: 2 }),
  salaryPriority: varchar("salary_priority"), // high, medium, low
  equityInterest: boolean("equity_interest").default(false),
  
  // Growth preferences
  learningPriority: varchar("learning_priority"), // high, medium, low
  leadershipAspiration: boolean("leadership_aspiration").default(false),
  entrepreneurialInterest: boolean("entrepreneurial_interest").default(false),
  
  // Risk tolerance
  riskTolerance: varchar("risk_tolerance"), // high, medium, low
  startupInterest: boolean("startup_interest").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas for new tables
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  name: true,
  preferredLocation: true,
  openToRemote: true,
  willingToRelocate: true,
});

export const insertResumeSchema = createInsertSchema(resumes).pick({
  userId: true,
  filename: true,
  originalName: true,
  fileSize: true,
  mimeType: true,
});

export const insertAnalysisSchema = createInsertSchema(analyses).pick({
  userId: true,
  jobTitle: true,
  company: true,
  location: true,
  jobUrl: true,
  jobHtml: true,
  jobDetails: true,
  requirements: true,
  jobCharacteristics: true,
  compensation: true,
  matchAnalysis: true,
  overallMatch: true,
  recommendation: true,
  careerGrowth: true,
  riskAssessment: true,
  comprehensiveReport: true,
  shouldApply: true,
  applicationPriority: true,
  confidence: true,
  workType: true,
  employmentType: true,
  isPaid: true,
  experienceLevel: true,
  matchedSkills: true,
  missingSkills: true,
  partialSkills: true,
  matchPercentage: true,
  recommendations: true,
  skillsByCategory: true,
});

export const insertJobApplicationSchema = createInsertSchema(jobApplications).pick({
  userId: true,
  analysisId: true,
  status: true,
  appliedAt: true,
  applicationMethod: true,
  coverLetter: true,
  notes: true,
  followUpDate: true,
});

export const insertSkillDevelopmentSchema = createInsertSchema(skillDevelopment).pick({
  userId: true,
  skillName: true,
  category: true,
  currentLevel: true,
  targetLevel: true,
  targetDate: true,
  priority: true,
  reason: true,
});

export const insertCareerGoalsSchema = createInsertSchema(careerGoals).pick({
  userId: true,
  shortTermGoals: true,
  longTermGoals: true,
  dreamJob: true,
  preferredRoles: true,
  preferredIndustries: true,
  preferredCompanySize: true,
  workLifeBalance: true,
  travelTolerance: true,
  overtimeAcceptance: true,
  salaryExpectation: true,
  salaryPriority: true,
  equityInterest: true,
  learningPriority: true,
  leadershipAspiration: true,
  entrepreneurialInterest: true,
  riskTolerance: true,
  startupInterest: true,
});

// Types for all tables
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Resume = typeof resumes.$inferSelect;
export type InsertResume = z.infer<typeof insertResumeSchema>;
export type Analysis = typeof analyses.$inferSelect;
export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;
export type JobApplication = typeof jobApplications.$inferSelect;
export type InsertJobApplication = z.infer<typeof insertJobApplicationSchema>;
export type SkillDevelopment = typeof skillDevelopment.$inferSelect;
export type InsertSkillDevelopment = z.infer<typeof insertSkillDevelopmentSchema>;
export type MarketInsight = typeof marketInsights.$inferSelect;
export type CompanyInsight = typeof companyInsights.$inferSelect;
export type CareerGoal = typeof careerGoals.$inferSelect;
export type InsertCareerGoal = z.infer<typeof insertCareerGoalsSchema>;

// Utility types for complex analysis data
export type ResumeProfile = {
  personalInfo: {
    name?: string;
    location?: string;
    email?: string;
    phone?: string;
    linkedIn?: string;
    github?: string;
    portfolio?: string;
  };
  careerLevel: {
    experienceYears: number;
    level: 'fresher' | 'junior' | 'mid-level' | 'senior' | 'lead' | 'executive';
    isFresher: boolean;
    careerProgression: string;
  };
  skills: {
    technical: string[];
    programming: string[];
    frameworks: string[];
    tools: string[];
    databases: string[];
    cloud: string[];
    soft: string[];
    languages: string[];
    certifications: string[];
  };
  projectAnalysis: {
    totalProjects: number;
    hasGoodProjects: boolean;
    projectQuality: 'excellent' | 'good' | 'average' | 'basic' | 'poor';
    projectTypes: string[];
    technologiesUsed: string[];
    complexityLevel: 'basic' | 'intermediate' | 'advanced' | 'expert';
    hasTeamProjects: boolean;
    hasOpenSource: boolean;
  };
  education: {
    degree?: string;
    field?: string;
    university?: string;
    gpa?: string;
    graduationYear?: number;
    additionalCourses: string[];
  };
  careerFit: {
    suitableRoles: string[];
    primaryDomain: string;
    secondaryDomains: string[];
    readinessLevel: 'job-ready' | 'needs-improvement' | 'requires-training';
    strengthAreas: string[];
    improvementAreas: string[];
  };
  workPreferences: {
    preferredLocation?: string;
    openToRemote: boolean;
    willingToRelocate: boolean;
    internshipExperience: boolean;
    fullTimeReady: boolean;
  };
  salaryInsights: {
    estimatedRange: string;
    currency: string;
    factorsConsidered: string[];
  };
};

export type JobAnalysis = {
  jobDetails: {
    title: string;
    company: string;
    location?: string;
    department?: string;
    industry?: string;
    companySize?: string;
    companyType?: string;
  };
  requirements: {
    experienceRequired: string;
    experienceYears: number;
    education?: string;
    skills: {
      mandatory: string[];
      preferred: string[];
      niceToHave: string[];
    };
    certifications: string[];
  };
  jobCharacteristics: {
    workType: 'remote' | 'hybrid' | 'onsite';
    employmentType: 'full-time' | 'part-time' | 'contract' | 'internship';
    workSchedule?: string;
    travelRequired: boolean;
    teamSize?: string;
    reportingStructure?: string;
  };
  compensation: {
    salaryRange?: string;
    currency: string;
    isPaid: boolean;
    compensationType: 'salary' | 'hourly' | 'commission' | 'equity';
    benefits: string[];
    bonuses: string[];
  };
  matchAnalysis: {
    overallMatch: number;
    skillMatch: number;
    experienceMatch: number;
    locationMatch: number;
    compensationMatch: number;
    cultureMatch: number;
    matchedRequirements: string[];
    missingRequirements: string[];
    overqualifiedAreas: string[];
  };
  recommendation: {
    shouldApply: boolean;
    confidence: number;
    applicationPriority: 'high' | 'medium' | 'low';
    reasonsToApply: string[];
    concernsToAddress: string[];
    preparationTips: string[];
    interviewFocus: string[];
  };
  careerGrowth: {
    growthPotential: 'high' | 'medium' | 'low';
    skillDevelopment: string[];
    careerPath: string[];
    learningOpportunities: string[];
  };
  riskAssessment: {
    riskLevel: 'low' | 'medium' | 'high';
    riskFactors: string[];
    mitigationStrategies: string[];
  };
};

export type ComprehensiveReport = {
  executiveSummary: {
    recommendation: 'APPLY' | 'CONSIDER' | 'SKIP';
    matchScore: number;
    keyStrengths: string[];
    majorConcerns: string[];
    oneLineAdvice: string;
  };
  detailedAnalysis: {
    fitAssessment: string;
    careerImpact: string;
    compensationAnalysis: string;
    skillGapAnalysis: string;
    interviewPreparation: string;
  };
  actionItems: {
    beforeApplying: string[];
    applicationTips: string[];
    interviewPrep: string[];
    skillsToImprove: string[];
  };
  alternativeOptions: {
    similarRoles: string[];
    betterFitCompanies: string[];
    skillBuildingPath: string[];
  };
  timeline: {
    immediateActions: string[];
    shortTerm: string[];
    longTerm: string[];
  };
};

