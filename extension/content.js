// JOBLANCE Content Script - Complete HTML Version
class JobExtractor {
  constructor() {
    this.jobData = null;
    this.isInjected = false;
    this.init();
  }

  init() {
    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'extractJobData') {
        this.extractJobData()
          .then(jobData => {
            sendResponse({ success: true, jobData });
          })
          .catch(error => {
            console.error('Job extraction failed:', error);
            sendResponse({ success: false, error: error.message });
          });
        return true; // Keep message channel open for async response
      }
    });

    // Auto-detect job postings when page loads
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.detectJobPosting();
      });
    } else {
      this.detectJobPosting();
    }
  }

  async extractJobData() {
    // Get the complete, clean HTML of the page
    const fullHtml = this.getCleanPageHtml();
    
    // Extract basic job information for display purposes only
    const jobInfo = this.parseBasicJobInfo();
    
    return {
      html: fullHtml,
      title: jobInfo.title || 'Job Position',
      company: jobInfo.company || 'Company Name',
      location: jobInfo.location || 'Location',
      url: window.location.href,
      extractedAt: new Date().toISOString(),
      pageTitle: document.title,
      domain: window.location.hostname
    };
  }

  getCleanPageHtml() {
    // Clone the document to avoid modifying the original
    const docClone = document.cloneNode(true);
    
    // Remove scripts, styles, and other non-content elements
    const elementsToRemove = [
      'script',
      'style',
      'noscript',
      'iframe',
      'embed',
      'object',
      'video',
      'audio',
      'canvas',
      'svg'
    ];

    elementsToRemove.forEach(tag => {
      const elements = docClone.querySelectorAll(tag);
      elements.forEach(el => el.remove());
    });

    // Remove elements with certain classes/IDs that are typically ads or navigation
    const unwantedSelectors = [
      '[class*="ad-"]',
      '[class*="advertisement"]',
      '[class*="banner"]',
      '[class*="cookie"]',
      '[class*="popup"]',
      '[class*="modal"]',
      '[class*="overlay"]',
      '[id*="ad-"]',
      '[id*="advertisement"]',
      '[id*="banner"]',
      '[id*="cookie"]',
      '[id*="popup"]',
      '[id*="modal"]'
    ];

    unwantedSelectors.forEach(selector => {
      try {
        const elements = docClone.querySelectorAll(selector);
        elements.forEach(el => el.remove());
      } catch (e) {
        // Ignore invalid selectors
      }
    });

    // Remove comments
    const removeComments = (node) => {
      if (node.nodeType === Node.COMMENT_NODE) {
        node.remove();
        return;
      }
      
      const children = Array.from(node.childNodes);
      children.forEach(child => removeComments(child));
    };

    removeComments(docClone);

    // Get the cleaned HTML
    let cleanHtml = docClone.documentElement.outerHTML;
    
    // Additional text cleaning
    cleanHtml = cleanHtml
      .replace(/<!--[\s\S]*?-->/g, '') // Remove any remaining comments
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/>\s+</g, '><') // Remove spaces between tags
      .trim();

    // Limit size to prevent API issues (keep first 50KB of content)
    if (cleanHtml.length > 50000) {
      cleanHtml = cleanHtml.substring(0, 50000) + '... [truncated for analysis]';
    }

    return cleanHtml;
  }

  parseBasicJobInfo() {
    const jobInfo = {
      title: '',
      company: '',
      location: ''
    };

    // Try multiple selectors for job title (for display purposes only)
    const titleSelectors = [
      'h1[data-automation-id="jobPostingHeader"]', // Workday
      '.top-card-layout__title', // LinkedIn
      '.jobsearch-JobInfoHeader-title', // Indeed
      '[data-testid="jobTitle"]', // Various sites
      'h1.job-title',
      'h1[class*="title"]',
      'h1[class*="job"]',
      '.job-header h1',
      '.position-title',
      '.job-post-title',
      'h1', // Fallback to any h1
      'h2' // Fallback to h2 if no h1
    ];

    for (const selector of titleSelectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim()) {
        jobInfo.title = element.textContent.trim();
        break;
      }
    }

    // Try multiple selectors for company name
    const companySelectors = [
      '.top-card-layout__card .top-card-layout__second-subline', // LinkedIn
      '[data-testid="inlineHeader-companyName"]', // Indeed
      '[data-testid="employerName"]',
      '.company-name',
      '[class*="company"]',
      '.employer-name',
      '.job-company',
      '[data-automation-id="jobPostingCompany"]'
    ];

    for (const selector of companySelectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim()) {
        jobInfo.company = element.textContent.trim();
        break;
      }
    }

    // Try multiple selectors for location
    const locationSelectors = [
      '.top-card-layout__card .top-card-layout__third-subline', // LinkedIn
      '[data-testid="job-location"]', // Indeed
      '[data-testid="jobLocationText"]',
      '.location',
      '[class*="location"]',
      '.job-location',
      '[data-automation-id="jobPostingLocation"]'
    ];

    for (const selector of locationSelectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim()) {
        jobInfo.location = element.textContent.trim();
        break;
      }
    }

    // Enhanced fallback extraction from page content
    if (!jobInfo.title) {
      jobInfo.title = this.extractTitleFromContent();
    }

    if (!jobInfo.company) {
      jobInfo.company = this.extractCompanyFromContent();
    }

    if (!jobInfo.location) {
      jobInfo.location = this.extractLocationFromContent();
    }

    return jobInfo;
  }

  extractTitleFromContent() {
    // Try to extract from page title
    const title = document.title;
    const patterns = [
      /^([^|]+)\s*\|\s*([^|]+)/, // "Job Title | Company"
      /^([^-]+)\s*-\s*([^-]+)/, // "Job Title - Company"
      /^([^@]+)\s*@\s*([^@]+)/, // "Job Title @ Company"
      /^([^·]+)\s*·\s*([^·]+)/ // "Job Title · Company"
    ];

    for (const pattern of patterns) {
      const match = title.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    // Look for job-related headings in content
    const headings = document.querySelectorAll('h1, h2, h3');
    for (const heading of headings) {
      const text = heading.textContent.trim();
      if (text.length > 5 && text.length < 100 && !text.toLowerCase().includes('search')) {
        return text;
      }
    }

    return 'Job Position';
  }

  extractCompanyFromContent() {
    // Check meta tags
    const metaSelectors = [
      'meta[property="og:site_name"]',
      'meta[name="author"]',
      'meta[property="og:title"]'
    ];

    for (const selector of metaSelectors) {
      const element = document.querySelector(selector);
      if (element && element.content) {
        const content = element.content.trim();
        if (content && !content.toLowerCase().includes('job') && !content.toLowerCase().includes('career')) {
          return content;
        }
      }
    }

    // Extract from URL if it's a company domain
    const hostname = window.location.hostname;
    if (!hostname.includes('linkedin') && !hostname.includes('indeed') && 
        !hostname.includes('glassdoor') && !hostname.includes('monster')) {
      const parts = hostname.split('.');
      if (parts.length >= 2) {
        return parts[parts.length - 2].charAt(0).toUpperCase() + parts[parts.length - 2].slice(1);
      }
    }

    return 'Company Name';
  }

  extractLocationFromContent() {
    // Look for location patterns in text
    const bodyText = document.body.textContent || '';
    const locationPatterns = [
      /(?:located?\s+in|based\s+in|office\s+in)\s+([^,.]+)/gi,
      /([A-Z][a-z]+,\s*[A-Z]{2,})/g, // City, State/Country format
      /([A-Z][a-z]+\s+[A-Z][a-z]+,\s*[A-Z]{2})/g // City State, Country
    ];

    for (const pattern of locationPatterns) {
      const match = bodyText.match(pattern);
      if (match) {
        return (match[1] || match).trim();
      }
    }

    return 'Location';
  }

  detectJobPosting() {
    // Enhanced job posting detection
    const jobIndicators = [
      // Text content indicators
      () => this.containsJobKeywords(),
      
      // URL patterns
      () => /\/jobs?\//.test(window.location.pathname),
      () => /\/career[s]?\//.test(window.location.pathname),
      () => /\/position[s]?\//.test(window.location.pathname),
      () => /\/hiring\//.test(window.location.pathname),
      () => /\/vacancy\//.test(window.location.pathname),
      () => /\/opportunities\//.test(window.location.pathname),
      
      // Known job sites
      () => this.isKnownJobSite(),
      
      // DOM structure indicators
      () => this.hasJobPostingStructure()
    ];

    const isJobPosting = jobIndicators.some(indicator => {
      try {
        return indicator();
      } catch (error) {
        return false;
      }
    });

    if (isJobPosting) {
      this.injectPageIndicator();
    }
  }

  containsJobKeywords() {
    const text = document.body.textContent.toLowerCase();
    const keywords = [
      'apply now', 'job description', 'requirements', 'qualifications',
      'responsibilities', 'skills required', 'experience required',
      'apply for this position', 'job posting', 'employment opportunity',
      'candidate profile', 'we are looking for', 'join our team'
    ];
    
    return keywords.some(keyword => text.includes(keyword));
  }

  isKnownJobSite() {
    const hostname = window.location.hostname.toLowerCase();
    const jobSites = [
      'linkedin.com', 'indeed.com', 'glassdoor.com', 'monster.com',
      'ziprecruiter.com', 'careerbuilder.com', 'simplyhired.com',
      'stackoverflow.com', 'angellist.com', 'dice.com', 'hired.com',
      'greenhouse.io', 'lever.co', 'workday.com', 'bamboohr.com'
    ];
    
    return jobSites.some(site => hostname.includes(site)) && 
           (window.location.pathname.includes('/job') || 
            window.location.pathname.includes('/position') ||
            window.location.pathname.includes('/career'));
  }

  hasJobPostingStructure() {
    // Check for common job posting DOM patterns
    const jobStructureSelectors = [
      '.job-description', '.job-details', '.job-content',
      '.posting-description', '[class*="job"][class*="description"]',
      '[data-testid*="job"]', '[id*="job"][id*="description"]',
      '.position-details', '.role-description'
    ];

    return jobStructureSelectors.some(selector => 
      document.querySelector(selector) !== null
    );
  }

  injectPageIndicator() {
    if (this.isInjected) return;

    // Create a subtle indicator that the page has been detected
    const indicator = document.createElement('div');
    indicator.id = 'joblance-job-detected';
    indicator.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: #8b5cf6;
      color: white;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-family: system-ui, -apple-system, sans-serif;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
      opacity: 0;
      transform: translateY(-10px);
      transition: all 0.3s ease;
      pointer-events: none;
    `;
    indicator.innerHTML = `
      <div style="display: flex; align-items: center;">
        <div style="margin-right: 6px;">🚀</div>
        Job Detected - Ready for AI Analysis
      </div>
    `;

    document.body.appendChild(indicator);

    // Animate in
    setTimeout(() => {
      indicator.style.opacity = '1';
      indicator.style.transform = 'translateY(0)';
    }, 100);

    // Fade out after 4 seconds
    setTimeout(() => {
      indicator.style.opacity = '0';
      indicator.style.transform = 'translateY(-10px)';
      setTimeout(() => {
        if (indicator.parentNode) {
          indicator.parentNode.removeChild(indicator);
        }
      }, 300);
    }, 4000);

    this.isInjected = true;
  }
}

// Initialize the job extractor
new JobExtractor();
