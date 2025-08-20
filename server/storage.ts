import {
  users,
  resumes,
  analyses,
  type User,
  type InsertUser,
  type Resume,
  type InsertResume,
  type Analysis,
  type InsertAnalysis,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserGeminiKey(userId: string, encryptedKey: string): Promise<void>;
  
  // Resume operations
  getUserResume(userId: string): Promise<Resume | undefined>;
  createResume(resume: InsertResume): Promise<Resume>;
  updateResume(userId: string, updates: Partial<Resume>): Promise<Resume>;
  updateResumeSkills(resumeId: string, skills: string[]): Promise<void>;
  updateResumeProfile(resumeId: string, profile: any): Promise<void>;
  deleteUserResume(userId: string): Promise<void>;
  
  // Analysis operations
  getUserLatestAnalysis(userId: string): Promise<Analysis | undefined>;
  getUserAnalyses(userId: string, limit?: number): Promise<Analysis[]>;
  createAnalysis(analysis: InsertAnalysis): Promise<Analysis>;
  createEnhancedAnalysis(analysisData: {
    userId: string;
    jobTitle: string;
    company: string;
    location?: string;
    jobUrl?: string;
    jobHtml: string;
    // Legacy fields
    matchedSkills: any;
    missingSkills: any;
    partialSkills: any;
    matchPercentage: string;
    recommendations: any;
    skillsByCategory: any;
    // Enhanced fields (optional)
    jobDetails?: any;
    requirements?: any;
    jobCharacteristics?: any;
    compensation?: any;
    matchAnalysis?: any;
    recommendation?: any;
    careerGrowth?: any;
    riskAssessment?: any;
    comprehensiveReport?: any;
    // Quick decision fields
    shouldApply?: boolean;
    applicationPriority?: string;
    confidence?: number;
    workType?: string;
    employmentType?: string;
    isPaid?: boolean;
    experienceLevel?: string;
  }): Promise<Analysis>;
  deleteUserAnalysis(userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async updateUserGeminiKey(userId: string, encryptedKey: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        geminiApiKey: encryptedKey,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  // Resume operations
  async getUserResume(userId: string): Promise<Resume | undefined> {
    const [resume] = await db
      .select()
      .from(resumes)
      .where(eq(resumes.userId, userId))
      .orderBy(desc(resumes.uploadedAt))
      .limit(1);
    return resume;
  }

  async createResume(resumeData: InsertResume): Promise<Resume> {
    // First delete any existing resume for this user
    await this.deleteUserResume(resumeData.userId);
    
    const [resume] = await db
      .insert(resumes)
      .values(resumeData)
      .returning();
    return resume;
  }

  async updateResume(userId: string, updates: Partial<Resume>): Promise<Resume> {
    const [resume] = await db
      .update(resumes)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(resumes.userId, userId))
      .returning();
    return resume;
  }

  async updateResumeSkills(resumeId: string, skills: string[]): Promise<void> {
    await db.update(resumes)
      .set({ 
        extractedSkills: skills,
        updatedAt: new Date()
      })
      .where(eq(resumes.id, resumeId));
  }

  async updateResumeProfile(resumeId: string, profile: any): Promise<void> {
    await db.update(resumes)
      .set({ 
        personalInfo: profile.personalInfo,
        careerLevel: profile.careerLevel,
        skillsAnalysis: profile.skills,
        projectAnalysis: profile.projectAnalysis,
        education: profile.education,
        careerFit: profile.careerFit,
        workPreferences: profile.workPreferences,
        salaryInsights: profile.salaryInsights,
        updatedAt: new Date()
      })
      .where(eq(resumes.id, resumeId));
  }

  async deleteUserResume(userId: string): Promise<void> {
    await db.delete(resumes).where(eq(resumes.userId, userId));
  }

  // Analysis operations
  async getUserLatestAnalysis(userId: string): Promise<Analysis | undefined> {
    const [analysis] = await db
      .select()
      .from(analyses)
      .where(eq(analyses.userId, userId))
      .orderBy(desc(analyses.analyzedAt))
      .limit(1);
    return analysis;
  }

  async getUserAnalyses(userId: string, limit: number = 10): Promise<Analysis[]> {
    const analysesData = await db
      .select()
      .from(analyses)
      .where(eq(analyses.userId, userId))
      .orderBy(desc(analyses.analyzedAt))
      .limit(limit);
    return analysesData;
  }

  async createAnalysis(analysisData: InsertAnalysis): Promise<Analysis> {
    // Delete any existing analysis for this user (single result storage for backward compatibility)
    await this.deleteUserAnalysis(analysisData.userId);
    
    const [analysis] = await db
      .insert(analyses)
      .values(analysisData)
      .returning();
    return analysis;
  }

  // 🔥 FIXED VERSION - This is the method that was causing the error
  async createEnhancedAnalysis(analysisData: {
    userId: string;
    jobTitle: string;
    company: string;
    location?: string;
    jobUrl?: string;
    jobHtml: string;
    // Legacy fields
    matchedSkills: any;
    missingSkills: any;
    partialSkills: any;
    matchPercentage: string;
    recommendations: any;
    skillsByCategory: any;
    // Enhanced fields (optional)
    jobDetails?: any;
    requirements?: any;
    jobCharacteristics?: any;
    compensation?: any;
    matchAnalysis?: any;
    recommendation?: any;
    careerGrowth?: any;
    riskAssessment?: any;
    comprehensiveReport?: any;
    // Quick decision fields
    shouldApply?: boolean;
    applicationPriority?: string;
    confidence?: number;
    workType?: string;
    employmentType?: string;
    isPaid?: boolean;
    experienceLevel?: string;
  }): Promise<Analysis> {
    // Delete any existing analysis for this user
    await this.deleteUserAnalysis(analysisData.userId);
    
    // Prepare the data for insertion, handling optional enhanced fields
    const insertData: any = {
      userId: analysisData.userId,
      jobTitle: analysisData.jobTitle,
      company: analysisData.company,
      location: analysisData.location || "",
      jobUrl: analysisData.jobUrl,
      jobHtml: analysisData.jobHtml,
      
      // Legacy fields (required for backward compatibility)
      matchedSkills: analysisData.matchedSkills,
      missingSkills: analysisData.missingSkills,
      partialSkills: analysisData.partialSkills,
      matchPercentage: analysisData.matchPercentage,
      recommendations: analysisData.recommendations,
      skillsByCategory: analysisData.skillsByCategory,
    };

    // Add enhanced fields if provided
    if (analysisData.jobDetails) {
      insertData.jobDetails = analysisData.jobDetails;
    }
    if (analysisData.requirements) {
      insertData.requirements = analysisData.requirements;
    }
    if (analysisData.jobCharacteristics) {
      insertData.jobCharacteristics = analysisData.jobCharacteristics;
    }
    if (analysisData.compensation) {
      insertData.compensation = analysisData.compensation;
    }
    if (analysisData.matchAnalysis) {
      insertData.matchAnalysis = analysisData.matchAnalysis;
      // Extract individual match scores if available
      if (analysisData.matchAnalysis.skillMatch !== undefined) {
        insertData.skillMatch = analysisData.matchAnalysis.skillMatch.toString();
      }
      if (analysisData.matchAnalysis.experienceMatch !== undefined) {
        insertData.experienceMatch = analysisData.matchAnalysis.experienceMatch.toString();
      }
      if (analysisData.matchAnalysis.locationMatch !== undefined) {
        insertData.locationMatch = analysisData.matchAnalysis.locationMatch.toString();
      }
      if (analysisData.matchAnalysis.compensationMatch !== undefined) {
        insertData.compensationMatch = analysisData.matchAnalysis.compensationMatch.toString();
      }
      if (analysisData.matchAnalysis.cultureMatch !== undefined) {
        insertData.cultureMatch = analysisData.matchAnalysis.cultureMatch.toString();
      }
      // 🔥 CRITICAL FIX: Always provide overallMatch - use from matchAnalysis or fallback to matchPercentage
      if (analysisData.matchAnalysis.overallMatch !== undefined) {
        insertData.overallMatch = analysisData.matchAnalysis.overallMatch.toString();
      } else {
        // Fallback to legacy matchPercentage if overallMatch not available
        insertData.overallMatch = analysisData.matchPercentage;
      }
    } else {
      // 🔥 CRITICAL FIX: If no matchAnalysis provided, use matchPercentage as overallMatch
      insertData.overallMatch = analysisData.matchPercentage;
    }
    
    if (analysisData.recommendation) {
      insertData.recommendation = analysisData.recommendation;
    }
    if (analysisData.careerGrowth) {
      insertData.careerGrowth = analysisData.careerGrowth;
    }
    if (analysisData.riskAssessment) {
      insertData.riskAssessment = analysisData.riskAssessment;
    }
    if (analysisData.comprehensiveReport) {
      insertData.comprehensiveReport = analysisData.comprehensiveReport;
    }

    // Quick decision fields
    if (analysisData.shouldApply !== undefined) {
      insertData.shouldApply = analysisData.shouldApply;
    }
    if (analysisData.applicationPriority) {
      insertData.applicationPriority = analysisData.applicationPriority;
    }
    if (analysisData.confidence !== undefined) {
      insertData.confidence = analysisData.confidence.toString();
    }
    if (analysisData.workType) {
      insertData.workType = analysisData.workType;
    }
    if (analysisData.employmentType) {
      insertData.employmentType = analysisData.employmentType;
    }
    if (analysisData.isPaid !== undefined) {
      insertData.isPaid = analysisData.isPaid;
    }
    if (analysisData.experienceLevel) {
      insertData.experienceLevel = analysisData.experienceLevel;
    }

    const [analysis] = await db
      .insert(analyses)
      .values(insertData)
      .returning();
    return analysis;
  }

  async deleteUserAnalysis(userId: string): Promise<void> {
    await db.delete(analyses).where(eq(analyses.userId, userId));
  }
}

export const storage = new DatabaseStorage();