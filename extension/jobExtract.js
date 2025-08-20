// JOBLANCE Job Extraction Utilities - AI-Focused Version
class JobExtractionUtils {
  static cleanHtmlForAI(html) {
    // More aggressive cleaning for AI processing
    let cleanedHtml = html
      // Remove all scripts, styles, and non-content elements
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<embed[^>]*>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<video\b[^<]*(?:(?!<\/video>)<[^<]*)*<\/video>/gi, '')
      .replace(/<audio\b[^<]*(?:(?!<\/audio>)<[^<]*)*<\/audio>/gi, '')
      .replace(/<canvas\b[^<]*(?:(?!<\/canvas>)<[^<]*)*<\/canvas>/gi, '')
      .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, '')
      
      // Remove comments
      .replace(/<!--[\s\S]*?-->/g, '')
      
      // Remove form elements that don't contain job info
      .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '')
      .replace(/<input[^>]*>/gi, '')
      .replace(/<button\b[^<]*(?:(?!<\/button>)<[^<]*)*<\/button>/gi, '')
      .replace(/<select\b[^<]*(?:(?!<\/select>)<[^<]*)*<\/select>/gi, '')
      
      // Remove navigation and menu elements
      .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '')
      .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, '')
      .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '')
      
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      .replace(/>\s+</g, '><')
      .trim();
    
    return cleanedHtml;
  }

  static extractTextContentForAI(html) {
    // Convert HTML to clean text while preserving structure
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Remove unwanted elements
    const unwantedSelectors = [
      'script', 'style', 'noscript', 'iframe', 'embed', 'object', 
      'video', 'audio', 'canvas', 'svg', 'nav', 'footer',
      '[class*="cookie"]', '[class*="popup"]', '[class*="modal"]',
      '[class*="advertisement"]', '[class*="ad-"]', '[class*="banner"]'
    ];

    unwantedSelectors.forEach(selector => {
      const elements = doc.querySelectorAll(selector);
      elements.forEach(el => el.remove());
    });

    // Extract structured text content
    const extractStructuredText = (element, level = 0) => {
      let result = '';
      const indent = '  '.repeat(level);
      
      for (const child of element.childNodes) {
        if (child.nodeType === Node.TEXT_NODE) {
          const text = child.textContent.trim();
          if (text) {
            result += text + ' ';
          }
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          const tagName = child.tagName.toLowerCase();
          
          // Add structure indicators for important elements
          if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
            const text = child.textContent.trim();
            if (text) {
              result += `\n${indent}[HEADING] ${text}\n`;
            }
          } else if (['p', 'div'].includes(tagName)) {
            const text = child.textContent.trim();
            if (text && text.length > 10) {
              result += `\n${indent}${text}\n`;
            }
          } else if (['ul', 'ol'].includes(tagName)) {
            result += `\n${indent}[LIST]\n`;
            result += extractStructuredText(child, level + 1);
          } else if (tagName === 'li') {
            const text = child.textContent.trim();
            if (text) {
              result += `${indent}- ${text}\n`;
            }
          } else {
            result += extractStructuredText(child, level);
          }
        }
      }
      
      return result;
    };

    let structuredText = extractStructuredText(doc.body);
    
    // Clean up the text
    structuredText = structuredText
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove excessive newlines
      .replace(/^\s+|\s+$/g, '') // Trim
      .substring(0, 30000); // Limit size for AI processing

    return structuredText;
  }

  static prepareJobDataForAI(jobData) {
    // Prepare job data specifically for AI analysis
    const preparedData = {
      // Basic job information
      jobTitle: jobData.title || 'Job Position',
      company: jobData.company || 'Company Name',
      location: jobData.location || 'Location',
      url: jobData.url,
      pageTitle: jobData.pageTitle || '',
      domain: jobData.domain || '',
      
      // Cleaned HTML for AI processing
      cleanHtml: this.cleanHtmlForAI(jobData.html),
      
      // Structured text content
      structuredText: this.extractTextContentForAI(jobData.html),
      
      // Metadata
      extractedAt: jobData.extractedAt,
      
      // Content analysis hints for AI
      contentHints: this.generateContentHints(jobData.html)
    };

    return preparedData;
  }

  static generateContentHints(html) {
    // Generate hints about the content structure to help AI
    const hints = {
      hasJobDescription: false,
      hasRequirements: false,
      hasQualifications: false,
      hasResponsibilities: false,
      hasBenefits: false,
      hasSkillsList: false,
      contentSections: []
    };

    const htmlLower = html.toLowerCase();
    
    // Check for common job posting sections
    const sectionKeywords = {
      jobDescription: ['job description', 'about the role', 'position summary', 'role overview'],
      requirements: ['requirements', 'required skills', 'must have', 'essential'],
      qualifications: ['qualifications', 'preferred', 'nice to have', 'desired'],
      responsibilities: ['responsibilities', 'duties', 'what you will do', 'your role'],
      benefits: ['benefits', 'compensation', 'salary', 'perks', 'package'],
      skills: ['skills', 'technologies', 'tools', 'experience with']
    };

    for (const [section, keywords] of Object.entries(sectionKeywords)) {
      for (const keyword of keywords) {
        if (htmlLower.includes(keyword)) {
          hints[`has${section.charAt(0).toUpperCase() + section.slice(1)}`] = true;
          if (!hints.contentSections.includes(section)) {
            hints.contentSections.push(section);
          }
          break;
        }
      }
    }

    return hints;
  }

  static validateJobDataForAI(jobData) {
    // Validate that the job data is suitable for AI analysis
    const errors = [];
    
    if (!jobData.html || jobData.html.length < 200) {
      errors.push('HTML content too short for meaningful analysis');
    }

    if (!jobData.title || jobData.title.trim().length < 3) {
      errors.push('Job title missing or too short');
    }

    // Check for minimum job-related content
    const htmlLower = jobData.html.toLowerCase();
    const requiredKeywords = ['job', 'position', 'role', 'career', 'work', 'employment'];
    const hasJobKeywords = requiredKeywords.some(keyword => htmlLower.includes(keyword));
    
    if (!hasJobKeywords) {
      errors.push('Content does not appear to be a job posting');
    }

    // Check for skill-related content
    const skillKeywords = ['skill', 'experience', 'requirement', 'qualification', 'knowledge'];
    const hasSkillKeywords = skillKeywords.some(keyword => htmlLower.includes(keyword));
    
    if (!hasSkillKeywords) {
      errors.push('Content lacks skill/requirement information for analysis');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  static generateJobFingerprint(jobData) {
    // Generate a unique fingerprint for the job posting
    const content = `${jobData.title}|${jobData.company}|${jobData.location}|${jobData.url}`;
    return btoa(content).slice(0, 16);
  }

  static formatJobDataForAPI(rawJobData) {
    // Format job data for API submission with AI-optimized content
    const preparedData = this.prepareJobDataForAI(rawJobData);
    const validation = this.validateJobDataForAI(rawJobData);
    
    return {
      // Basic information
      jobTitle: preparedData.jobTitle,
      company: preparedData.company,
      location: preparedData.location,
      url: preparedData.url,
      
      // AI-optimized content
      jobHtml: preparedData.cleanHtml,
      structuredText: preparedData.structuredText,
      
      // Metadata
      extractedAt: preparedData.extractedAt,
      fingerprint: this.generateJobFingerprint(rawJobData),
      pageTitle: preparedData.pageTitle,
      domain: preparedData.domain,
      
      // AI hints
      contentHints: preparedData.contentHints,
      
      // Validation info
      validationResult: validation
    };
  }

  static extractJobInsights(jobData) {
    // Extract quick insights from job data for display purposes
    const html = jobData.html.toLowerCase();
    
    const insights = {
      isRemote: html.includes('remote') || html.includes('work from home'),
      isFullTime: html.includes('full time') || html.includes('full-time'),
      hasUrgentHiring: html.includes('urgent') || html.includes('immediate') || html.includes('asap'),
      experienceLevel: this.extractExperienceLevel(html),
      estimatedSkillCount: this.estimateSkillCount(html),
      contentComplexity: this.assessContentComplexity(jobData.html)
    };

    return insights;
  }

  static extractExperienceLevel(htmlText) {
    const patterns = [
      { pattern: /(\d+)\+?\s*years?\s*(of\s*)?experience/i, type: 'years' },
      { pattern: /(entry\s*level|junior|graduate|intern)/i, type: 'junior' },
      { pattern: /(mid\s*level|mid|intermediate)/i, type: 'mid' },
      { pattern: /(senior|lead|principal|staff)/i, type: 'senior' }
    ];

    for (const { pattern, type } of patterns) {
      const match = htmlText.match(pattern);
      if (match) {
        return type === 'years' ? `${match[1]} years` : type;
      }
    }

    return 'not specified';
  }

  static estimateSkillCount(htmlText) {
    // Estimate number of skills mentioned in the job posting
    const commonSkillKeywords = [
      'javascript', 'python', 'java', 'react', 'node', 'sql', 'aws', 'docker',
      'kubernetes', 'git', 'agile', 'scrum', 'api', 'html', 'css', 'typescript',
      'angular', 'vue', 'mongodb', 'postgresql', 'redis', 'elasticsearch',
      'jenkins', 'terraform', 'microservices', 'devops', 'ci/cd'
    ];

    const foundSkills = new Set();
    commonSkillKeywords.forEach(skill => {
      if (htmlText.includes(skill)) {
        foundSkills.add(skill);
      }
    });

    // Estimate total based on found common skills
    const commonSkillsFound = foundSkills.size;
    const estimatedTotal = Math.round(commonSkillsFound * 2.5); // Rough multiplier

    return Math.max(estimatedTotal, 5); // Minimum estimate of 5 skills
  }

  static assessContentComplexity(html) {
    // Assess the complexity of the job posting content
    const textLength = html.replace(/<[^>]*>/g, '').length;
    const htmlComplexity = (html.match(/<[^>]*>/g) || []).length;
    
    if (textLength < 1000 && htmlComplexity < 50) {
      return 'simple';
    } else if (textLength < 3000 && htmlComplexity < 200) {
      return 'moderate';
    } else {
      return 'complex';
    }
  }
}

// Export for use in other extension scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = JobExtractionUtils;
} else if (typeof window !== 'undefined') {
  window.JobExtractionUtils = JobExtractionUtils;
}
