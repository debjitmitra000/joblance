// Enhanced Gemini API functions for comprehensive job-resume matching
import { GoogleGenerativeAI } from '@google/generative-ai';

// Legacy function - maintained for backward compatibility
export async function analyzeResumeSkills(resumeText: string, apiKey: string): Promise<string[]> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const cleanResumeText = resumeText.replace(/[^\x00-\x7F]/g, " ").substring(0, 15000);

    const prompt = `Analyze this resume and extract ALL skills mentioned, including:
    - Technical skills (programming languages, frameworks, tools, databases)
    - Software and platforms
    - Methodologies and processes
    - Soft skills and competencies
    - Certifications and qualifications

    RESUME TEXT:
    ${cleanResumeText}

    Return ONLY a JSON array of skill names as strings. Be comprehensive but avoid duplicates.
    Example: ["JavaScript", "React", "Node.js", "Problem Solving", "Team Leadership"]`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    try {
      const skills = JSON.parse(response.trim());
      return Array.isArray(skills) ? skills : [];
    } catch (parseError) {
      console.error('Failed to parse skills JSON:', parseError);
      return [];
    }
  } catch (error) {
    console.error('Resume skill analysis error:', error);
    throw new Error('Failed to analyze resume skills');
  }
}

// Legacy function - maintained for backward compatibility but enhanced
export async function analyzeSkillGap(
  jobHtml: string, 
  resumeSkills: string[], 
  apiKey: string
): Promise<{
  jobRequiredSkills: string[];
  jobPreferredSkills: string[];
  matchedSkills: string[];
  missingSkills: string[];
  partialSkills: string[];
  matchPercentage: number;
  recommendations: any;
  skillsByCategory: any;
  experienceLevel: string;
  jobInsights: any;
}> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const cleanHtml = cleanHtmlForAI(jobHtml);

    const prompt = `You are an expert technical recruiter. Analyze this job posting and compare it with the candidate's skills.

JOB POSTING HTML:
${cleanHtml}

CANDIDATE'S SKILLS:
${JSON.stringify(resumeSkills)}

Provide a comprehensive analysis in JSON format with these exact fields:
{
  "jobRequiredSkills": ["skill1", "skill2"],
  "jobPreferredSkills": ["skill3", "skill4"],
  "matchedSkills": ["skills that match exactly or closely"],
  "missingSkills": ["important skills candidate lacks"],
  "partialSkills": ["skills candidate has partial knowledge of"],
  "matchPercentage": 85,
  "experienceLevel": "junior|mid-level|senior",
  "recommendations": {
    "strengths": ["what candidate does well"],
    "improvements": ["areas to focus on"],
    "interviewTips": ["preparation advice"],
    "applicationAdvice": ["how to position yourself"]
  },
  "skillsByCategory": {
    "technical": {
      "matched": ["skills"],
      "missing": ["skills"],
      "partial": ["skills"]
    },
    "soft": {
      "matched": ["skills"],
      "missing": ["skills"]
    },
    "tools": {
      "matched": ["skills"],
      "missing": ["skills"]
    }
  },
  "jobInsights": {
    "companyType": "startup|enterprise|agency",
    "workType": "remote|hybrid|onsite",
    "seniorityLevel": "entry|mid|senior",
    "urgency": "high|medium|low",
    "competitiveFactors": ["what makes this role competitive"],
    "redFlags": ["potential concerns"],
    "opportunities": ["growth potential"]
  }
}

Calculate match percentage based on:
- Required skills match (60% weight)
- Preferred skills match (25% weight)  
- Overall profile fit (15% weight)

Be honest about gaps but also highlight transferable skills and potential.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    try {
      const analysis = JSON.parse(response);
      
      // Ensure all required fields exist with defaults
      return {
        jobRequiredSkills: analysis.jobRequiredSkills || [],
        jobPreferredSkills: analysis.jobPreferredSkills || [],
        matchedSkills: analysis.matchedSkills || [],
        missingSkills: analysis.missingSkills || [],
        partialSkills: analysis.partialSkills || [],
        matchPercentage: analysis.matchPercentage || 0,
        recommendations: analysis.recommendations || {
          strengths: [],
          improvements: [],
          interviewTips: [],
          applicationAdvice: []
        },
        skillsByCategory: analysis.skillsByCategory || {
          technical: { matched: [], missing: [], partial: [] },
          soft: { matched: [], missing: [] },
          tools: { matched: [], missing: [] }
        },
        experienceLevel: analysis.experienceLevel || 'unknown',
        jobInsights: analysis.jobInsights || {
          companyType: 'unknown',
          workType: 'unknown',
          seniorityLevel: 'unknown',
          urgency: 'medium',
          competitiveFactors: [],
          redFlags: [],
          opportunities: []
        }
      };
    } catch (parseError) {
      console.error('Failed to parse analysis JSON:', parseError);
      throw new Error('Failed to parse analysis results');
    }
  } catch (error) {
    console.error('Skill gap analysis error:', error);
    throw new Error('Failed to analyze job requirements');
  }
}

// Enhanced resume analysis with career insights
export async function analyzeResumeComprehensive(resumeText: string, apiKey: string) {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            // Personal Information
            personalInfo: {
              type: "object",
              properties: {
                name: { type: "string" },
                location: { type: "string" },
                email: { type: "string" },
                phone: { type: "string" },
                linkedIn: { type: "string" },
                github: { type: "string" },
                portfolio: { type: "string" }
              }
            },
            // Career Level Analysis
            careerLevel: {
              type: "object",
              properties: {
                experienceYears: { type: "number" },
                level: { type: "string" }, // "fresher", "junior", "mid-level", "senior", "lead", "executive"
                isFresher: { type: "boolean" },
                careerProgression: { type: "string" }
              }
            },
            // Skills Analysis
            skills: {
              type: "object",
              properties: {
                technical: { type: "array", items: { type: "string" } },
                programming: { type: "array", items: { type: "string" } },
                frameworks: { type: "array", items: { type: "string" } },
                tools: { type: "array", items: { type: "string" } },
                databases: { type: "array", items: { type: "string" } },
                cloud: { type: "array", items: { type: "string" } },
                soft: { type: "array", items: { type: "string" } },
                languages: { type: "array", items: { type: "string" } },
                certifications: { type: "array", items: { type: "string" } }
              }
            },
            // Project Analysis
            projectAnalysis: {
              type: "object",
              properties: {
                totalProjects: { type: "number" },
                hasGoodProjects: { type: "boolean" },
                projectQuality: { type: "string" }, // "excellent", "good", "average", "basic", "poor"
                projectTypes: { type: "array", items: { type: "string" } },
                technologiesUsed: { type: "array", items: { type: "string" } },
                complexityLevel: { type: "string" }, // "basic", "intermediate", "advanced", "expert"
                hasTeamProjects: { type: "boolean" },
                hasOpenSource: { type: "boolean" }
              }
            },
            // Education Analysis
            education: {
              type: "object",
              properties: {
                degree: { type: "string" },
                field: { type: "string" },
                university: { type: "string" },
                gpa: { type: "string" },
                graduationYear: { type: "number" },
                additionalCourses: { type: "array", items: { type: "string" } }
              }
            },
            // Career Fit Analysis
            careerFit: {
              type: "object",
              properties: {
                suitableRoles: { type: "array", items: { type: "string" } },
                primaryDomain: { type: "string" },
                secondaryDomains: { type: "array", items: { type: "string" } },
                readinessLevel: { type: "string" }, // "job-ready", "needs-improvement", "requires-training"
                strengthAreas: { type: "array", items: { type: "string" } },
                improvementAreas: { type: "array", items: { type: "string" } }
              }
            },
            // Work Preferences (inferred from resume)
            workPreferences: {
              type: "object",
              properties: {
                preferredLocation: { type: "string" },
                openToRemote: { type: "boolean" },
                willingToRelocate: { type: "boolean" },
                internshipExperience: { type: "boolean" },
                fullTimeReady: { type: "boolean" }
              }
            },
            // Salary Expectations (market-based estimation)
            salaryInsights: {
              type: "object",
              properties: {
                estimatedRange: { type: "string" },
                currency: { type: "string" },
                factorsConsidered: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      }
    });

    const cleanResumeText = resumeText.replace(/[^\x00-\x7F]/g, " ").substring(0, 20000);

    const prompt = `Analyze this resume comprehensively and extract detailed insights for career matching and job recommendations.

RESUME TEXT:
${cleanResumeText}

ANALYSIS REQUIREMENTS:

1. **Personal Information**: Extract contact details, portfolio links, social profiles
2. **Career Level Assessment**: 
   - Calculate years of experience
   - Determine career level (fresher/junior/mid/senior/lead)
   - Assess career progression trajectory
3. **Comprehensive Skills Analysis**: Categorize all skills by type and proficiency
4. **Project Quality Evaluation**:
   - Assess project complexity and innovation
   - Check for team collaboration, real-world impact
   - Evaluate technology stack diversity
   - Rate overall project portfolio quality
5. **Education Context**: Academic background relevance to career goals
6. **Career Fit Analysis**: 
   - Identify most suitable job roles
   - Determine primary and secondary domains
   - Assess job market readiness
7. **Work Preferences**: Infer location preferences, remote work openness
8. **Market-based Insights**: Provide salary range estimations based on skills and experience

Be thorough and analytical. Consider the global job market context and provide actionable insights.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    return JSON.parse(response);
  } catch (error) {
    console.error('Comprehensive resume analysis error:', error);
    throw new Error('Failed to analyze resume comprehensively');
  }
}

// Enhanced job analysis with detailed matching
export async function analyzeJobComprehensive(jobHtml: string, resumeProfile: any, apiKey: string) {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            // Job Details
            jobDetails: {
              type: "object",
              properties: {
                title: { type: "string" },
                company: { type: "string" },
                location: { type: "string" },
                department: { type: "string" },
                industry: { type: "string" },
                companySize: { type: "string" },
                companyType: { type: "string" } // startup, mid-size, enterprise, agency, etc.
              }
            },
            // Job Requirements Analysis
            requirements: {
              type: "object",
              properties: {
                experienceRequired: { type: "string" },
                experienceYears: { type: "number" },
                education: { type: "string" },
                skills: {
                  type: "object",
                  properties: {
                    mandatory: { type: "array", items: { type: "string" } },
                    preferred: { type: "array", items: { type: "string" } },
                    niceToHave: { type: "array", items: { type: "string" } }
                  }
                },
                certifications: { type: "array", items: { type: "string" } }
              }
            },
            // Job Characteristics
            jobCharacteristics: {
              type: "object",
              properties: {
                workType: { type: "string" }, // remote, hybrid, onsite
                employmentType: { type: "string" }, // full-time, part-time, contract, internship
                workSchedule: { type: "string" }, // flexible, fixed, rotating
                travelRequired: { type: "boolean" },
                teamSize: { type: "string" },
                reportingStructure: { type: "string" }
              }
            },
            // Compensation Analysis
            compensation: {
              type: "object",
              properties: {
                salaryRange: { type: "string" },
                currency: { type: "string" },
                isPaid: { type: "boolean" },
                compensationType: { type: "string" }, // salary, hourly, commission, equity
                benefits: { type: "array", items: { type: "string" } },
                bonuses: { type: "array", items: { type: "string" } }
              }
            },
            // Matching Analysis
            matchAnalysis: {
              type: "object",
              properties: {
                overallMatch: { type: "number" }, // 0-100
                skillMatch: { type: "number" },
                experienceMatch: { type: "number" },
                locationMatch: { type: "number" },
                compensationMatch: { type: "number" },
                cultureMatch: { type: "number" },
                matchedRequirements: { type: "array", items: { type: "string" } },
                missingRequirements: { type: "array", items: { type: "string" } },
                overqualifiedAreas: { type: "array", items: { type: "string" } }
              }
            },
            // Application Recommendation
            recommendation: {
              type: "object",
              properties: {
                shouldApply: { type: "boolean" },
                confidence: { type: "number" }, // 0-100
                applicationPriority: { type: "string" }, // high, medium, low
                reasonsToApply: { type: "array", items: { type: "string" } },
                concernsToAddress: { type: "array", items: { type: "string" } },
                preparationTips: { type: "array", items: { type: "string" } },
                interviewFocus: { type: "array", items: { type: "string" } }
              }
            },
            // Career Growth Potential
            careerGrowth: {
              type: "object",
              properties: {
                growthPotential: { type: "string" }, // high, medium, low
                skillDevelopment: { type: "array", items: { type: "string" } },
                careerPath: { type: "array", items: { type: "string" } },
                learningOpportunities: { type: "array", items: { type: "string" } }
              }
            },
            // Risk Assessment
            riskAssessment: {
              type: "object",
              properties: {
                riskLevel: { type: "string" }, // low, medium, high
                riskFactors: { type: "array", items: { type: "string" } },
                mitigationStrategies: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      }
    });

    const cleanHtml = cleanHtmlForAI(jobHtml);

    const prompt = `You are an expert career consultant and technical recruiter. Analyze this job posting and provide a comprehensive match assessment against the candidate's resume profile.

JOB POSTING HTML:
${cleanHtml}

CANDIDATE RESUME PROFILE:
${JSON.stringify(resumeProfile, null, 2)}

COMPREHENSIVE ANALYSIS REQUIREMENTS:

1. **Job Details Extraction**:
   - Extract all job information, company details, industry, size
   - Identify department, team structure, work culture indicators

2. **Requirements Analysis**:
   - Categorize skills by importance (mandatory/preferred/nice-to-have)
   - Assess experience requirements realistically
   - Identify soft skill requirements

3. **Job Characteristics**:
   - Work arrangement (remote/hybrid/onsite)
   - Employment type and schedule flexibility
   - Team dynamics and collaboration requirements

4. **Compensation Analysis**:
   - Extract salary information (be realistic about ranges)
   - Identify all forms of compensation and benefits
   - Assess if role is paid/unpaid (important for internships)

5. **Multi-dimensional Matching**:
   - Technical skill alignment
   - Experience level appropriateness
   - Geographic and lifestyle fit
   - Compensation alignment with candidate's level
   - Company culture and values alignment

6. **Strategic Recommendation**:
   - Clear yes/no on whether to apply
   - Priority level (high/medium/low)
   - Specific preparation advice
   - Areas to highlight in application

7. **Growth and Risk Assessment**:
   - Career development potential
   - Learning opportunities
   - Potential risks or red flags
   - Long-term career alignment

Consider factors like:
- Is the candidate overqualified or underqualified?
- Does the role offer appropriate challenges for growth?
- Are there any red flags in the job posting?
- How does the compensation compare to market rates?
- What are the chances of actually getting the role?

Be honest and practical in your assessment. Consider the candidate's career stage, goals, and market realities.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    return JSON.parse(response);
  } catch (error) {
    console.error('Comprehensive job analysis error:', error);
    throw new Error('Failed to analyze job comprehensively');
  }
}

// Generate a comprehensive report combining all analyses
// In geminiApi.ts - Replace the generateComprehensiveReport function with this version

export async function generateComprehensiveReport(
  resumeProfile: any, 
  jobAnalysis: any, 
  apiKey: string
) {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        maxOutputTokens: 8192, // Add limit to prevent truncation
        responseSchema: {
          type: "object",
          properties: {
            executiveSummary: {
              type: "object",
              properties: {
                recommendation: { type: "string" }, // APPLY, CONSIDER, SKIP
                matchScore: { type: "number" },
                keyStrengths: { type: "array", items: { type: "string" } },
                majorConcerns: { type: "array", items: { type: "string" } },
                oneLineAdvice: { type: "string" }
              }
            },
            detailedAnalysis: {
              type: "object",
              properties: {
                fitAssessment: { type: "string" },
                careerImpact: { type: "string" },
                compensationAnalysis: { type: "string" },
                skillGapAnalysis: { type: "string" },
                interviewPreparation: { type: "string" }
              }
            },
            actionItems: {
              type: "object",
              properties: {
                beforeApplying: { type: "array", items: { type: "string" } },
                applicationTips: { type: "array", items: { type: "string" } },
                interviewPrep: { type: "array", items: { type: "string" } },
                skillsToImprove: { type: "array", items: { type: "string" } }
              }
            },
            alternativeOptions: {
              type: "object",
              properties: {
                similarRoles: { type: "array", items: { type: "string" } },
                betterFitCompanies: { type: "array", items: { type: "string" } },
                skillBuildingPath: { type: "array", items: { type: "string" } }
              }
            },
            timeline: {
              type: "object",
              properties: {
                immediateActions: { type: "array", items: { type: "string" } },
                shortTerm: { type: "array", items: { type: "string" } },
                longTerm: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      }
    });

    // Truncate input data to prevent token limit issues
    const resumeSummary = JSON.stringify(resumeProfile).substring(0, 5000);
    const jobSummary = JSON.stringify(jobAnalysis).substring(0, 5000);

    const prompt = `As a senior career strategist, create a comprehensive job application report that synthesizes the resume analysis and job matching data into actionable insights.

RESUME PROFILE (Summary):
${resumeSummary}

JOB ANALYSIS (Summary):
${jobSummary}

Generate a strategic report with:

1. **Executive Summary** (for quick decision-making):
   - Clear APPLY/CONSIDER/SKIP recommendation
   - Overall match score (0-100)
   - Top 3 key strengths
   - Major concerns (max 2)
   - One-line strategic advice

2. **Detailed Analysis** (keep each section under 200 words):
   - Fit assessment
   - Career impact potential
   - Compensation analysis
   - Skill gaps and opportunities
   - Interview preparation needs

3. **Action Items** (max 3 items per category):
   - Steps before applying
   - Application strategy tips
   - Interview preparation focus
   - Skills to develop

4. **Alternatives** (max 3 items per category):
   - Similar role suggestions
   - Better fit companies
   - Skill building path

5. **Timeline** (max 3 items per timeframe):
   - Immediate actions (this week)
   - Short-term goals (1-3 months)
   - Long-term development (6+ months)

Keep responses concise, actionable, and realistic. Focus on the most impactful insights.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    try {
      return JSON.parse(response);
    } catch (parseError) {
      console.error('JSON parse failed, response was:', response.substring(0, 500));
      throw new Error(`Failed to parse comprehensive report: ${parseError.message}`);
    }
  } catch (error) {
    console.error('Report generation error:', error);
    throw new Error('Failed to generate comprehensive report');
  }
}

// Helper function to clean HTML (enhanced version)
function cleanHtmlForAI(html: string): string {
  return html
    // Remove all scripts, styles, and non-content elements
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    // Remove navigation, ads, and other non-job-content
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '')
    .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, '')
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '')
    .replace(/<aside\b[^<]*(?:(?!<\/aside>)<[^<]*)*<\/aside>/gi, '')
    // Remove ads and tracking
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/class="[^"]*ad[^"]*"/gi, '')
    .replace(/id="[^"]*ad[^"]*"/gi, '')
    // Preserve important job-related content
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .trim()
    // Limit size for API efficiency
    .substring(0, 35000);
}

// New comprehensive analysis wrapper for backward compatibility
export async function analyzeJobWithResume(
  jobHtml: string,
  resumeText: string,
  apiKey: string
): Promise<{
  // Legacy format for existing frontend
  jobRequiredSkills: string[];
  jobPreferredSkills: string[];
  matchedSkills: string[];
  missingSkills: string[];
  partialSkills: string[];
  matchPercentage: number;
  recommendations: any;
  skillsByCategory: any;
  experienceLevel: string;
  jobInsights: any;
  // Enhanced data for future use
  comprehensiveAnalysis?: {
    resumeProfile: any;
    jobAnalysis: any;
    finalReport: any;
  };
}> {
  try {
    // First, get comprehensive resume analysis
    const resumeProfile = await analyzeResumeComprehensive(resumeText, apiKey);
    
    // Extract legacy skills format from comprehensive analysis
    const legacySkills = [
      ...(resumeProfile.skills.technical || []),
      ...(resumeProfile.skills.programming || []),
      ...(resumeProfile.skills.frameworks || []),
      ...(resumeProfile.skills.tools || []),
      ...(resumeProfile.skills.soft || [])
    ];

    // Get legacy analysis for immediate compatibility
    const legacyAnalysis = await analyzeSkillGap(jobHtml, legacySkills, apiKey);
    
    // Optionally get comprehensive analysis (can be used later)
    let comprehensiveData;
    try {
      const jobAnalysis = await analyzeJobComprehensive(jobHtml, resumeProfile, apiKey);
      const finalReport = await generateComprehensiveReport(resumeProfile, jobAnalysis, apiKey);
      
      comprehensiveData = {
        resumeProfile,
        jobAnalysis,
        finalReport
      };
    } catch (compError) {
      console.warn('Comprehensive analysis failed, using legacy only:', compError);
    }

    return {
      ...legacyAnalysis,
      comprehensiveAnalysis: comprehensiveData
    };
  } catch (error) {
    console.error('Job analysis error:', error);
    // Fallback to legacy analysis only
    const legacySkills = await analyzeResumeSkills(resumeText, apiKey);
    return await analyzeSkillGap(jobHtml, legacySkills, apiKey);
  }
}