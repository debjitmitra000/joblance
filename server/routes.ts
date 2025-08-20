import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { authenticateToken } from "./middleware/auth";
import { upload } from "./middleware/upload";
import {
  analyzeResumeSkills,
  analyzeSkillGap,
  analyzeResumeComprehensive,
  analyzeJobWithResume,
} from "./utils/geminiApi";
import { parseDOCX } from "./utils/docxParse";
import { insertUserSchema, insertAnalysisSchema } from "@shared/schema";

// Extend Express Request interface to include file and userId
interface AuthenticatedRequest extends Request {
  userId?: string;
  file?: Express.Multer.File;
}

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString("hex");

function encryptText(text: string): string {
  // Simple base64 encoding for now to avoid crypto issues
  return Buffer.from(text).toString("base64");
}

function decryptText(encryptedText: string): string {
  try {
    // Try base64 decoding first
    return Buffer.from(encryptedText, "base64").toString("utf8");
  } catch (error) {
    console.error("Decryption failed, treating as plain text:", error);
    // If it's already plain text, return as is
    return encryptedText;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, name } = insertUserSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        name,
      });

      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
        expiresIn: "7d",
      });

      res.status(201).json({
        message: "User created successfully",
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
        expiresIn: "7d",
      });

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.get(
    "/api/auth/me",
    authenticateToken,
    async (req: AuthenticatedRequest, res) => {
      try {
        if (!req.userId) {
          return res.status(401).json({ message: "User ID not found" });
        }

        const user = await storage.getUser(req.userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        res.json({
          id: user.id,
          email: user.email,
          name: user.name,
          hasGeminiKey: !!user.geminiApiKey,
        });
      } catch (error) {
        console.error("Get user error:", error);
        res.status(500).json({ message: "Failed to get user" });
      }
    }
  );

  // Resume routes
  app.post(
    "/api/resume/upload",
    authenticateToken,
    upload.single("resume"),
    async (req: AuthenticatedRequest, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ message: "No file uploaded" });
        }

        if (!req.userId) {
          return res.status(401).json({ message: "User ID not found" });
        }

        const file = req.file;
        let extractedText = "";

        // Parse DOCX file
        if (
          file.mimetype ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
          extractedText = await parseDOCX(file.buffer);
        } else {
          return res.status(400).json({
            message: "Unsupported file type. Please upload DOCX files only.",
          });
        }

        // Don't auto-analyze on upload - let user trigger manually
        const extractedSkills: string[] = [];

        // Create resume record
        const resume = await storage.createResume({
          userId: req.userId,
          filename: `${Date.now()}_${file.originalname}`,
          originalName: file.originalname,
          fileSize: file.size.toString(),
          mimeType: file.mimetype,
          extractedText,
          extractedSkills,
        });

        res.json({
          message: "Resume uploaded successfully",
          resume: {
            id: resume.id,
            originalName: resume.originalName,
            fileSize: resume.fileSize,
            uploadedAt: resume.uploadedAt,
            hasSkills: false,
            skillCount: 0,
          },
        });
      } catch (error) {
        console.error("Resume upload error:", error);
        res.status(500).json({ message: "Resume upload failed" });
      }
    }
  );

  app.get(
    "/api/resume",
    authenticateToken,
    async (req: AuthenticatedRequest, res) => {
      try {
        if (!req.userId) {
          return res.status(401).json({ message: "User ID not found" });
        }

        const resume = await storage.getUserResume(req.userId);
        if (!resume) {
          return res.status(404).json({ message: "No resume found" });
        }

        const skills = Array.isArray(resume.extractedSkills)
          ? resume.extractedSkills
          : [];

        res.json({
          id: resume.id,
          originalName: resume.originalName,
          fileSize: resume.fileSize,
          uploadedAt: resume.uploadedAt,
          hasSkills: skills.length > 0,
        });
      } catch (error) {
        console.error("Get resume error:", error);
        res.status(500).json({ message: "Failed to get resume" });
      }
    }
  );

  app.delete(
    "/api/resume",
    authenticateToken,
    async (req: AuthenticatedRequest, res) => {
      try {
        if (!req.userId) {
          return res.status(401).json({ message: "User ID not found" });
        }

        await storage.deleteUserResume(req.userId);
        res.json({ message: "Resume deleted successfully" });
      } catch (error) {
        console.error("Delete resume error:", error);
        res.status(500).json({ message: "Failed to delete resume" });
      }
    }
  );

  // API key management
  app.post(
    "/api/api-key/gemini",
    authenticateToken,
    async (req: AuthenticatedRequest, res) => {
      try {
        const { apiKey } = req.body;
        if (!apiKey) {
          return res.status(400).json({ message: "API key is required" });
        }

        if (!req.userId) {
          return res.status(401).json({ message: "User ID not found" });
        }

        // Encrypt and store the API key
        const encryptedKey = encryptText(apiKey);
        await storage.updateUserGeminiKey(req.userId, encryptedKey);

        res.json({ message: "Gemini API key updated successfully" });
      } catch (error) {
        console.error("API key update error:", error);
        res.status(500).json({ message: "Failed to update API key" });
      }
    }
  );

  // Enhanced Analysis routes
  // Enhanced Analysis routes
  app.post(
    "/api/analysis/job",
    authenticateToken,
    async (req: AuthenticatedRequest, res) => {
      try {
        const {
          jobHtml,
          jobTitle,
          company,
          location,
          structuredText,
          pageTitle,
          domain,
          contentHints,
        } = req.body;

        if (!jobHtml || !jobTitle || !company) {
          return res.status(400).json({ message: "Missing required job data" });
        }

        if (!req.userId) {
          return res.status(401).json({ message: "User ID not found" });
        }

        // Get user and resume
        const user = await storage.getUser(req.userId);
        const resume = await storage.getUserResume(req.userId);

        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        if (!resume) {
          return res.status(404).json({
            message: "No resume found. Please upload a resume first.",
          });
        }

        if (!user.geminiApiKey) {
          return res
            .status(400)
            .json({ message: "Gemini API key not configured" });
        }

        if (!resume.extractedText) {
          return res.status(400).json({
            message:
              "Resume text not available for analysis. Please re-upload your resume.",
          });
        }

        // FIXED: Extract skills from both legacy and comprehensive analysis
        let resumeSkills = [];

        // First try to get from extractedSkills (legacy format)
        if (
          Array.isArray(resume.extractedSkills) &&
          resume.extractedSkills.length > 0
        ) {
          resumeSkills = resume.extractedSkills;
          console.log(
            `Using legacy extractedSkills: ${resumeSkills.length} skills found`
          );
        }
        // Then try to get from comprehensive skills analysis (current data structure)
        else if (resume.skillsAnalysis) {
          const skills = resume.skillsAnalysis;
          resumeSkills = [
            ...(skills.technical || []),
            ...(skills.programming || []),
            ...(skills.frameworks || []),
            ...(skills.tools || []),
            ...(skills.databases || []),
            ...(skills.cloud || []),
            ...(skills.soft || []),
            ...(skills.languages || []),
            ...(skills.certifications || []),
          ].filter((skill) => skill && skill.trim());
          console.log(
            `Using comprehensive skillsAnalysis: ${resumeSkills.length} skills found`
          );
        }

        // If still no skills found, check if we can auto-extract them
        if (resumeSkills.length === 0) {
          try {
            console.log(
              "No skills found in resume, attempting auto-analysis..."
            );
            const decryptedKey = decryptText(user.geminiApiKey);

            // Try to extract skills automatically using the basic skill analysis
            const extractedSkills = await analyzeResumeSkills(
              resume.extractedText,
              decryptedKey
            );

            if (extractedSkills && extractedSkills.length > 0) {
              // Update resume with extracted skills
              await storage.updateResumeSkills(resume.id, extractedSkills);
              resumeSkills = extractedSkills;
              console.log(
                `Auto-extracted ${extractedSkills.length} skills from resume`
              );
            }
          } catch (autoAnalysisError) {
            console.warn("Auto-skill extraction failed:", autoAnalysisError);
          }
        }

        // Final check - if still no skills after all attempts
        if (resumeSkills.length === 0) {
          return res.status(400).json({
            message:
              "No skills found in resume. Please analyze your resume first using the 'Analyze Resume' button on your dashboard.",
            action: "analyze_resume_required",
            suggestion:
              "Go to your dashboard and click 'Analyze Resume' to extract your skills using AI, then try analyzing jobs again.",
          });
        }

        console.log(
          `Found ${resumeSkills.length} skills from resume:`,
          resumeSkills.slice(0, 10)
        ); // Log first 10 for debugging

        // Decrypt API key and perform enhanced analysis
        const decryptedKey = decryptText(user.geminiApiKey);

        console.log(
          `Starting enhanced AI analysis for job: ${jobTitle} at ${company}`
        );
        console.log(
          `Resume has ${resumeSkills.length} skills and ${resume.extractedText.length} chars of text`
        );

        // Use enhanced analysis that provides both legacy and new data
        const analysisResult = await analyzeJobWithResume(
          jobHtml,
          resume.extractedText,
          decryptedKey
        );

        console.log(
          `Enhanced analysis completed - ${analysisResult.matchPercentage}% match found`
        );

        // Store enhanced analysis result using new storage method
        const analysis = await storage.createEnhancedAnalysis({
          userId: req.userId,
          jobTitle,
          company,
          location: location || "",
          jobUrl: req.body.jobUrl,
          jobHtml,

          // Legacy fields (required for backward compatibility)
          matchedSkills: analysisResult.matchedSkills,
          missingSkills: analysisResult.missingSkills,
          partialSkills: analysisResult.partialSkills,
          matchPercentage: analysisResult.matchPercentage.toString(),
          recommendations: analysisResult.recommendations,
          skillsByCategory: analysisResult.skillsByCategory,

          // Enhanced fields (if available)
          jobDetails:
            analysisResult.comprehensiveAnalysis?.jobAnalysis?.jobDetails,
          requirements:
            analysisResult.comprehensiveAnalysis?.jobAnalysis?.requirements,
          jobCharacteristics:
            analysisResult.comprehensiveAnalysis?.jobAnalysis
              ?.jobCharacteristics,
          compensation:
            analysisResult.comprehensiveAnalysis?.jobAnalysis?.compensation,
          matchAnalysis:
            analysisResult.comprehensiveAnalysis?.jobAnalysis?.matchAnalysis,
          recommendation:
            analysisResult.comprehensiveAnalysis?.jobAnalysis?.recommendation,
          careerGrowth:
            analysisResult.comprehensiveAnalysis?.jobAnalysis?.careerGrowth,
          riskAssessment:
            analysisResult.comprehensiveAnalysis?.jobAnalysis?.riskAssessment,
          comprehensiveReport:
            analysisResult.comprehensiveAnalysis?.finalReport,

          // Quick decision fields
          shouldApply:
            analysisResult.comprehensiveAnalysis?.jobAnalysis?.recommendation
              ?.shouldApply,
          applicationPriority:
            analysisResult.comprehensiveAnalysis?.jobAnalysis?.recommendation
              ?.applicationPriority,
          confidence:
            analysisResult.comprehensiveAnalysis?.jobAnalysis?.recommendation
              ?.confidence,
          workType:
            analysisResult.comprehensiveAnalysis?.jobAnalysis
              ?.jobCharacteristics?.workType,
          employmentType:
            analysisResult.comprehensiveAnalysis?.jobAnalysis
              ?.jobCharacteristics?.employmentType,
          isPaid:
            analysisResult.comprehensiveAnalysis?.jobAnalysis?.compensation
              ?.isPaid,
          experienceLevel: analysisResult.experienceLevel,
        });

        // Also update resume with comprehensive profile if available
        if (analysisResult.comprehensiveAnalysis?.resumeProfile && resume.id) {
          try {
            await storage.updateResumeProfile(
              resume.id,
              analysisResult.comprehensiveAnalysis.resumeProfile
            );
            console.log("Resume profile updated with comprehensive analysis");
          } catch (profileError) {
            console.warn("Failed to update resume profile:", profileError);
            // Don't fail the entire request for this
          }
        }

        // Return legacy-compatible response format
        res.json({
          message: "Analysis completed successfully",
          analysis: {
            id: analysis.id,
            jobTitle: analysis.jobTitle,
            company: analysis.company,
            location: analysis.location,

            // Core skill analysis (legacy format)
            jobRequiredSkills: analysisResult.jobRequiredSkills,
            jobPreferredSkills: analysisResult.jobPreferredSkills,
            matchedSkills: analysisResult.matchedSkills,
            missingSkills: analysisResult.missingSkills,
            partialSkills: analysisResult.partialSkills,
            matchPercentage: analysisResult.matchPercentage,

            // Enhanced insights (legacy format)
            recommendations: analysisResult.recommendations,
            skillsByCategory: analysisResult.skillsByCategory,
            experienceLevel: analysisResult.experienceLevel,
            jobInsights: analysisResult.jobInsights,

            // Metadata
            analyzedAt: analysis.analyzedAt,

            // Additional context for frontend
            analysisContext: {
              resumeSkillCount: resumeSkills.length,
              jobRequiredSkillCount:
                analysisResult.jobRequiredSkills?.length || 0,
              jobPreferredSkillCount:
                analysisResult.jobPreferredSkills?.length || 0,
              totalJobSkills:
                (analysisResult.jobRequiredSkills?.length || 0) +
                (analysisResult.jobPreferredSkills?.length || 0),
              contentHints: contentHints || {},
              hasEnhancedData: !!analysisResult.comprehensiveAnalysis,
              enhancedFeatures: analysisResult.comprehensiveAnalysis
                ? {
                    hasComprehensiveReport:
                      !!analysisResult.comprehensiveAnalysis.finalReport,
                    hasJobDetails:
                      !!analysisResult.comprehensiveAnalysis.jobAnalysis
                        ?.jobDetails,
                    hasCareerGrowthAnalysis:
                      !!analysisResult.comprehensiveAnalysis.jobAnalysis
                        ?.careerGrowth,
                    hasRiskAssessment:
                      !!analysisResult.comprehensiveAnalysis.jobAnalysis
                        ?.riskAssessment,
                  }
                : null,
            },
          },
        });
      } catch (error) {
        console.error("Analysis error:", error);
        res.status(500).json({
          message: "Analysis failed",
          error: error.message || "Unknown error occurred",
        });
      }
    }
  );

  app.get(
    "/api/analysis/latest",
    authenticateToken,
    async (req: AuthenticatedRequest, res) => {
      try {
        if (!req.userId) {
          return res.status(401).json({ message: "User ID not found" });
        }

        const analysis = await storage.getUserLatestAnalysis(req.userId);
        if (!analysis) {
          return res.status(404).json({ message: "No analysis found" });
        }

        // Return legacy-compatible format
        res.json({
          id: analysis.id,
          jobTitle: analysis.jobTitle,
          company: analysis.company,
          location: analysis.location,
          matchedSkills: analysis.matchedSkills,
          missingSkills: analysis.missingSkills,
          partialSkills: analysis.partialSkills,
          matchPercentage: parseFloat(analysis.matchPercentage),
          recommendations: analysis.recommendations,
          skillsByCategory: analysis.skillsByCategory,
          analyzedAt: analysis.analyzedAt,

          // Enhanced data if available
          enhancedData: {
            hasEnhancedAnalysis: !!(
              analysis.jobDetails || analysis.comprehensiveReport
            ),
            jobDetails: analysis.jobDetails,
            requirements: analysis.requirements,
            jobCharacteristics: analysis.jobCharacteristics,
            compensation: analysis.compensation,
            matchAnalysis: analysis.matchAnalysis,
            recommendation: analysis.recommendation,
            careerGrowth: analysis.careerGrowth,
            riskAssessment: analysis.riskAssessment,
            comprehensiveReport: analysis.comprehensiveReport,
            shouldApply: analysis.shouldApply,
            applicationPriority: analysis.applicationPriority,
            confidence: analysis.confidence
              ? parseFloat(analysis.confidence)
              : null,
            workType: analysis.workType,
            employmentType: analysis.employmentType,
            isPaid: analysis.isPaid,
            experienceLevel: analysis.experienceLevel,
          },
        });
      } catch (error) {
        console.error("Get analysis error:", error);
        res.status(500).json({ message: "Failed to get analysis" });
      }
    }
  );

  // Extension auth endpoint (Enhanced)
  app.post("/api/extension/auth", async (req, res) => {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }

      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      const user = await storage.getUser(decoded.userId);

      if (!user) {
        return res.status(401).json({ message: "Invalid token" });
      }

      const resume = await storage.getUserResume(user.id);
      const hasSkills =
        resume &&
        Array.isArray(resume.extractedSkills) &&
        resume.extractedSkills.length > 0;

      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        hasResume: !!resume,
        hasGeminiKey: !!user.geminiApiKey,
        hasSkills: hasSkills,
        skillCount: hasSkills ? resume.extractedSkills.length : 0,
      });
    } catch (error) {
      res.status(401).json({ message: "Invalid token" });
    }
  });

  // Manual skill analysis endpoint - Enhanced
  app.post(
    "/api/resume/analyze",
    authenticateToken,
    async (req: AuthenticatedRequest, res) => {
      try {
        if (!req.userId) {
          return res.status(401).json({ message: "User ID not found" });
        }

        const user = await storage.getUser(req.userId);
        if (!user?.geminiApiKey) {
          return res.status(400).json({
            message:
              "Gemini API key not configured. Please add your API key in settings.",
          });
        }

        const resume = await storage.getUserResume(req.userId);
        if (!resume) {
          return res
            .status(404)
            .json({ message: "No resume found to analyze" });
        }

        if (!resume.extractedText) {
          return res.status(400).json({
            message:
              "Resume text not available for analysis. Please re-upload your resume.",
          });
        }

        const decryptedKey = decryptText(user.geminiApiKey);
        console.log("Starting enhanced resume analysis...");

        // Try comprehensive analysis first, fall back to legacy if it fails
        let extractedSkills: string[] = [];
        let comprehensiveProfile = null;

        try {
          // Get comprehensive analysis
          comprehensiveProfile = await analyzeResumeComprehensive(
            resume.extractedText,
            decryptedKey
          );

          // Extract skills from comprehensive analysis
          if (comprehensiveProfile && comprehensiveProfile.skills) {
            extractedSkills = [
              ...(comprehensiveProfile.skills.technical || []),
              ...(comprehensiveProfile.skills.programming || []),
              ...(comprehensiveProfile.skills.frameworks || []),
              ...(comprehensiveProfile.skills.tools || []),
              ...(comprehensiveProfile.skills.databases || []),
              ...(comprehensiveProfile.skills.cloud || []),
              ...(comprehensiveProfile.skills.soft || []),
              ...(comprehensiveProfile.skills.languages || []),
              ...(comprehensiveProfile.skills.certifications || []),
            ].filter((skill) => skill && skill.trim()); // Remove empty strings
          }

          console.log(
            "Comprehensive analysis successful, found",
            extractedSkills.length,
            "skills"
          );
        } catch (comprehensiveError) {
          console.warn(
            "Comprehensive analysis failed, falling back to legacy:",
            comprehensiveError
          );

          // Fall back to legacy skill extraction
          extractedSkills = await analyzeResumeSkills(
            resume.extractedText,
            decryptedKey
          );
          console.log(
            "Legacy analysis successful, found",
            extractedSkills.length,
            "skills"
          );
        }

        // Update resume with extracted skills
        await storage.updateResumeSkills(resume.id, extractedSkills);

        // Update resume with comprehensive profile if available
        if (comprehensiveProfile && resume.id) {
          try {
            await storage.updateResumeProfile(resume.id, comprehensiveProfile);
            console.log("Updated resume with comprehensive profile data");
          } catch (profileError) {
            console.warn(
              "Failed to update comprehensive profile:",
              profileError
            );
            // Don't fail the request for this
          }
        }

        res.json({
          message: `Successfully analyzed resume and extracted ${extractedSkills.length} skills`,
          skillCount: extractedSkills.length,
          skills: extractedSkills,
          hasComprehensiveProfile: !!comprehensiveProfile,
          comprehensiveData: comprehensiveProfile
            ? {
                careerLevel: comprehensiveProfile.careerLevel,
                primaryDomain: comprehensiveProfile.careerFit?.primaryDomain,
                experienceYears:
                  comprehensiveProfile.careerLevel?.experienceYears,
                readinessLevel: comprehensiveProfile.careerFit?.readinessLevel,
                suitableRoles:
                  comprehensiveProfile.careerFit?.suitableRoles?.slice(0, 3), // First 3 roles
              }
            : null,
        });
      } catch (error) {
        console.error("Manual skill analysis failed:", error);
        res.status(500).json({
          message:
            "Skill analysis failed. Please check your Gemini API key and try again.",
        });
      }
    }
  );

  // Extension token generation
  app.post(
    "/api/auth/extension-token",
    authenticateToken,
    async (req: AuthenticatedRequest, res) => {
      try {
        if (!req.userId) {
          return res.status(401).json({ message: "User ID not found" });
        }

        // Generate a new token for the extension with longer expiration
        const extensionToken = jwt.sign(
          {
            userId: req.userId,
            type: "extension",
          },
          JWT_SECRET,
          { expiresIn: "30d" } // Extension tokens last longer
        );

        res.json({
          message: "Extension token generated successfully",
          token: extensionToken,
          expiresIn: "30 days",
        });
      } catch (error) {
        console.error("Extension token generation error:", error);
        res.status(500).json({ message: "Failed to generate extension token" });
      }
    }
  );

  // Chrome Extension Download
  app.get("/api/extension/download", (req, res) => {
    const extensionPath = "skillgap-ai-extension.zip";
    res.download(extensionPath, "skillgap-ai-extension.zip", (err) => {
      if (err) {
        console.error("Extension download error:", err);
        res.status(404).json({ message: "Extension file not found" });
      }
    });
  });

  // Get extension download info
  app.get(
    "/api/extension/info",
    authenticateToken,
    async (req: AuthenticatedRequest, res) => {
      try {
        res.json({
          message: "SkillGap AI Chrome Extension",
          version: "1.0.0",
          downloadUrl: `${req.protocol}://${req.get(
            "host"
          )}/api/extension/download`,
          instructions: [
            "1. Download the extension ZIP file",
            "2. Extract it to a folder",
            "3. Open Chrome and go to chrome://extensions/",
            "4. Enable 'Developer mode' in the top right",
            "5. Click 'Load unpacked' and select the extracted folder",
            "6. Generate an extension token from your dashboard",
            "7. Use the token to authenticate the extension",
          ],
        });
      } catch (error) {
        res.status(500).json({ message: "Failed to get extension info" });
      }
    }
  );

  // New endpoint: Get comprehensive analysis data
  app.get(
    "/api/analysis/comprehensive",
    authenticateToken,
    async (req: AuthenticatedRequest, res) => {
      try {
        if (!req.userId) {
          return res.status(401).json({ message: "User ID not found" });
        }

        const analysis = await storage.getUserLatestAnalysis(req.userId);
        if (!analysis) {
          return res.status(404).json({ message: "No analysis found" });
        }

        // Return only comprehensive data
        res.json({
          hasEnhancedData: !!(
            analysis.jobDetails || analysis.comprehensiveReport
          ),
          jobDetails: analysis.jobDetails,
          requirements: analysis.requirements,
          jobCharacteristics: analysis.jobCharacteristics,
          compensation: analysis.compensation,
          matchAnalysis: analysis.matchAnalysis,
          recommendation: analysis.recommendation,
          careerGrowth: analysis.careerGrowth,
          riskAssessment: analysis.riskAssessment,
          comprehensiveReport: analysis.comprehensiveReport,
          quickDecision: {
            shouldApply: analysis.shouldApply,
            applicationPriority: analysis.applicationPriority,
            confidence: analysis.confidence
              ? parseFloat(analysis.confidence)
              : null,
          },
          jobInfo: {
            workType: analysis.workType,
            employmentType: analysis.employmentType,
            isPaid: analysis.isPaid,
            experienceLevel: analysis.experienceLevel,
          },
        });
      } catch (error) {
        console.error("Get comprehensive analysis error:", error);
        res
          .status(500)
          .json({ message: "Failed to get comprehensive analysis" });
      }
    }
  );

  // New endpoint: Get resume profile
  app.get(
    "/api/resume/profile",
    authenticateToken,
    async (req: AuthenticatedRequest, res) => {
      try {
        if (!req.userId) {
          return res.status(401).json({ message: "User ID not found" });
        }

        const resume = await storage.getUserResume(req.userId);
        if (!resume) {
          return res.status(404).json({ message: "No resume found" });
        }

        res.json({
          hasProfile: !!(resume.personalInfo || resume.careerLevel),
          personalInfo: resume.personalInfo,
          careerLevel: resume.careerLevel,
          skillsAnalysis: resume.skillsAnalysis,
          projectAnalysis: resume.projectAnalysis,
          education: resume.education,
          careerFit: resume.careerFit,
          workPreferences: resume.workPreferences,
          salaryInsights: resume.salaryInsights,
          basicInfo: {
            skillCount: Array.isArray(resume.extractedSkills)
              ? resume.extractedSkills.length
              : 0,
            uploadedAt: resume.uploadedAt,
            updatedAt: resume.updatedAt,
          },
        });
      } catch (error) {
        console.error("Get resume profile error:", error);
        res.status(500).json({ message: "Failed to get resume profile" });
      }
    }
  );

  const httpServer = createServer(app);
  return httpServer;
}
