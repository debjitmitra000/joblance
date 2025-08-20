// JOBLANCE Chrome Extension Popup
class SkillGapPopup {
  constructor() {
    this.apiBase = 'http://localhost:5000';
    this.currentUser = null;
    this.currentJobData = null;
    this.isAnalyzing = false;
    
    this.init();
  }

  async init() {
    // Set up API base URL from storage
    try {
      const result = await chrome.storage.sync.get(['api_base']);
      if (result.api_base) {
        this.apiBase = result.api_base;
      }
    } catch (error) {
      console.error('Failed to load API base:', error);
    }

    // Clear any previous display first
    this.clearPreviousDisplay();

    // Set up event listeners
    this.setupEventListeners();
    
    // Initialize popup state
    await this.checkAuthStatus();
  }

  // Clear previous analysis display
  clearPreviousDisplay() {
    // Hide analysis result sections
    const quickResults = document.getElementById('quickResults');
    if (quickResults) quickResults.classList.add('hidden');

    const enhancedResults = document.getElementById('enhancedResults');
    if (enhancedResults) enhancedResults.classList.add('hidden');

    // Clear any text content from previous sessions
    const elementsToReset = [
      'matchPercentage', 'matchedCount', 'partialCount', 'missingCount'
    ];
    
    elementsToReset.forEach(id => {
      const element = document.getElementById(id);
      if (element) element.textContent = '';
    });
  }

  setupEventListeners() {
    // Authenticate button
    const authenticateBtn = document.getElementById('authenticateBtn');
    if (authenticateBtn) {
      authenticateBtn.addEventListener('click', () => {
        this.authenticateWithToken();
      });
    }

    // Token input enter key
    const tokenInput = document.getElementById('tokenInput');
    if (tokenInput) {
      tokenInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.authenticateWithToken();
        }
      });
    }

    // Open dashboard for token button
    const openDashboardForTokenBtn = document.getElementById('openDashboardForTokenBtn');
    if (openDashboardForTokenBtn) {
      openDashboardForTokenBtn.addEventListener('click', () => {
        this.openDashboard();
      });
    }

    // Dashboard button
    const openDashboardBtn = document.getElementById('openDashboardBtn');
    if (openDashboardBtn) {
      openDashboardBtn.addEventListener('click', () => {
        this.openDashboard();
      });
    }

    // Try again button
    const tryAgainBtn = document.getElementById('tryAgainBtn');
    if (tryAgainBtn) {
      tryAgainBtn.addEventListener('click', () => {
        this.checkJobDetection();
      });
    }

    // Analyze button
    const analyzeBtn = document.getElementById('analyzeBtn');
    if (analyzeBtn) {
      analyzeBtn.addEventListener('click', () => {
        this.analyzeJob();
      });
    }

    // View report button
    const viewReportBtn = document.getElementById('viewReportBtn');
    if (viewReportBtn) {
      viewReportBtn.addEventListener('click', () => {
        this.openDashboard();
      });
    }
  }

  async authenticateWithToken() {
    const tokenInput = document.getElementById('tokenInput');
    const authenticateBtn = document.getElementById('authenticateBtn');
    
    if (!tokenInput || !authenticateBtn) return;
    
    const token = tokenInput.value.trim();
    
    if (!token) {
      this.showError('Please enter your authentication token');
      return;
    }

    // Show loading state
    authenticateBtn.disabled = true;
    authenticateBtn.innerHTML = '<span class="btn-icon">⏳</span>Authenticating...';

    try {
      // Store token and verify
      await chrome.storage.sync.set({ skillgap_token: token });
      
      // Verify token with backend
      const response = await fetch(`${this.apiBase}/api/extension/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token })
      });

      if (!response.ok) {
        throw new Error('Invalid token or authentication failed');
      }

      const data = await response.json();
      this.currentUser = data.user;

      // Clear the token input
      tokenInput.value = '';
      
      // Check setup status
      if (!data.hasResume || !data.hasGeminiKey) {
        this.showSetupRequired(data.hasResume, data.hasGeminiKey);
      } else {
        await this.checkJobDetection();
      }

    } catch (error) {
      console.error('Authentication failed:', error);
      this.showError('Authentication failed. Please check your token and try again.');
    } finally {
      authenticateBtn.disabled = false;
      authenticateBtn.innerHTML = '<span class="btn-icon">🔓</span>Authenticate';
    }
  }

  async checkAuthStatus() {
    this.showSection('loading');
    
    try {
      // Get stored token
      const result = await chrome.storage.sync.get(['skillgap_token']);
      const token = result.skillgap_token;

      if (!token) {
        this.showSection('loginRequired');
        return;
      }

      // Verify token with backend
      const response = await fetch(`${this.apiBase}/api/extension/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token })
      });

      if (!response.ok) {
        // Token is invalid, clear it and show login
        await chrome.storage.sync.remove(['skillgap_token']);
        this.showSection('loginRequired');
        return;
      }

      const data = await response.json();
      this.currentUser = data.user;

      // Check if setup is complete
      if (!data.hasResume || !data.hasGeminiKey) {
        this.showSetupRequired(data.hasResume, data.hasGeminiKey);
        return;
      }

      // Check for job posting detection
      await this.checkJobDetection();

    } catch (error) {
      console.error('Auth check failed:', error);
      this.showError('Failed to connect to JOBLANCE. Please check if the server is running.');
      this.showSection('loginRequired');
    }
  }

  showSetupRequired(hasResume, hasGeminiKey) {
    this.showSection('setupRequired');
    
    // Update checklist
    const resumeCheck = document.getElementById('resumeCheck');
    const apiKeyCheck = document.getElementById('apiKeyCheck');
    
    if (resumeCheck) {
      if (hasResume) {
        resumeCheck.classList.add('completed');
        resumeCheck.querySelector('.check-icon').textContent = '✅';
      } else {
        resumeCheck.querySelector('.check-icon').textContent = '❌';
      }
    }
    
    if (apiKeyCheck) {
      if (hasGeminiKey) {
        apiKeyCheck.classList.add('completed');
        apiKeyCheck.querySelector('.check-icon').textContent = '✅';
      } else {
        apiKeyCheck.querySelector('.check-icon').textContent = '❌';
      }
    }
  }

  async checkJobDetection() {
    console.log('Checking job detection...');
    
    try {
      // Get current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab) {
        console.error('No active tab found');
        this.showSection('noJobDetected');
        return;
      }

      console.log('Current tab URL:', tab.url);

      // Check if we can inject content script
      if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || 
          tab.url.startsWith('edge://') || tab.url.startsWith('moz-extension://')) {
        console.error('Cannot inject into browser internal pages');
        this.showError('Extension cannot work on browser internal pages. Please navigate to a job posting website.');
        this.showSection('noJobDetected');
        return;
      }

      // Wait a moment for content script to load
      await new Promise(resolve => setTimeout(resolve, 500));

      // Send message to content script to extract job data
      console.log('Sending extractJobData message to content script...');
      
      try {
        const response = await chrome.tabs.sendMessage(tab.id, { 
          action: 'extractJobData' 
        });

        console.log('Content script response:', response);

        if (response && response.success && response.jobData) {
          this.currentJobData = response.jobData;
          console.log('Job data extracted successfully:', this.currentJobData);
          this.showMainInterface();
        } else {
          console.error('Job extraction failed or no job data:', response);
          this.showSection('noJobDetected');
        }
      } catch (messageError) {
        console.error('Failed to communicate with content script:', messageError);
        
        // Try to inject the content script manually
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
          });
          
          // Wait a bit and try again
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const retryResponse = await chrome.tabs.sendMessage(tab.id, { 
            action: 'extractJobData' 
          });
          
          if (retryResponse && retryResponse.success && retryResponse.jobData) {
            this.currentJobData = retryResponse.jobData;
            console.log('Job data extracted after retry:', this.currentJobData);
            this.showMainInterface();
          } else {
            this.showSection('noJobDetected');
          }
        } catch (injectError) {
          console.error('Failed to inject content script:', injectError);
          this.showError('Could not analyze this page. Please try refreshing the page or navigate to a job posting.');
          this.showSection('noJobDetected');
        }
      }
    } catch (error) {
      console.error('Job detection failed:', error);
      this.showError('Job detection failed. Please try again.');
      this.showSection('noJobDetected');
    }
  }

  showMainInterface() {
    this.showSection('mainInterface');
    
    // ONLY show basic job detection info and user name
    const jobTitle = document.getElementById('jobTitle');
    const jobCompany = document.getElementById('jobCompany');
    const userName = document.getElementById('userName');
    
    if (jobTitle && this.currentJobData) {
      jobTitle.textContent = this.currentJobData.title || 'Job Position';
    }
    
    if (jobCompany && this.currentJobData) {
      jobCompany.textContent = this.currentJobData.company || 'Company Name';
    }
    
    if (userName && this.currentUser) {
      userName.textContent = this.currentUser.name || 'User';
    }

    // DON'T load previous analysis automatically
    // this.loadPreviousAnalysis(); // COMMENTED OUT
  }

  // Don't automatically display previous analysis
  async loadPreviousAnalysis() {
    // Don't show any previous analysis data automatically
    // User must click "Analyze with AI" to see results
    return;
  }

  showQuickResults(analysis) {
    const quickResults = document.getElementById('quickResults');
    const matchPercentage = document.getElementById('matchPercentage');
    const matchedCount = document.getElementById('matchedCount');
    const partialCount = document.getElementById('partialCount');
    const missingCount = document.getElementById('missingCount');

    if (quickResults) {
      quickResults.classList.remove('hidden');
    }

    if (matchPercentage) {
      matchPercentage.textContent = `${Math.round(analysis.matchPercentage)}% match`;
    }

    if (matchedCount) {
      matchedCount.textContent = `✅ ${analysis.matchedSkills?.length || 0} matched`;
    }

    if (partialCount) {
      partialCount.textContent = `⚠️ ${analysis.partialSkills?.length || 0} partial`;
    }

    if (missingCount) {
      missingCount.textContent = `❌ ${analysis.missingSkills?.length || 0} missing`;
    }

    // REMOVED: Enhanced results functionality
    // this.showEnhancedResults(analysis);
  }

  async analyzeJob() {
    if (this.isAnalyzing || !this.currentJobData) return;

    this.isAnalyzing = true;
    
    // Show analyzing state
    const analyzeBtn = document.getElementById('analyzeBtn');
    const analyzing = document.getElementById('analyzing');
    const viewReportBtn = document.getElementById('viewReportBtn');
    
    if (analyzeBtn) analyzeBtn.classList.add('hidden');
    if (analyzing) analyzing.classList.remove('hidden');
    
    // DISABLE view report button during analysis
    if (viewReportBtn) {
      viewReportBtn.disabled = true;
      viewReportBtn.style.opacity = '0.5';
      viewReportBtn.style.cursor = 'not-allowed';
    }

    try {
      const result = await chrome.storage.sync.get(['skillgap_token']);
      const token = result.skillgap_token;

      const response = await fetch(`${this.apiBase}/api/analysis/job`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          jobHtml: this.currentJobData.html,
          jobTitle: this.currentJobData.title,
          company: this.currentJobData.company,
          location: this.currentJobData.location
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Analysis failed: ${response.status}`);
      }

      const analysisData = await response.json();
      
      // Show results ONLY after analysis completes
      this.showQuickResults(analysisData.analysis);
      
      // Show success message
      this.showNotification('Analysis completed! Check JOBLANCE dashboard for full report.', 'success');

    } catch (error) {
      console.error('Analysis failed:', error);
      this.showError(`Analysis failed: ${error.message}`);
    } finally {
      this.isAnalyzing = false;
      
      // Hide analyzing state and re-enable buttons
      if (analyzing) analyzing.classList.add('hidden');
      if (analyzeBtn) analyzeBtn.classList.remove('hidden');
      
      // RE-ENABLE view report button after analysis
      if (viewReportBtn) {
        viewReportBtn.disabled = false;
        viewReportBtn.style.opacity = '1';
        viewReportBtn.style.cursor = 'pointer';
      }
    }
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      right: 10px;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
      color: white;
      padding: 12px;
      border-radius: 6px;
      font-size: 14px;
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 3000);
  }

  showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    
    if (errorMessage && errorText) {
      errorText.textContent = message;
      errorMessage.classList.remove('hidden');
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        errorMessage.classList.add('hidden');
      }, 5000);
    }
  }

  showSection(sectionId) {
    // Hide all sections
    const sections = ['loading', 'loginRequired', 'setupRequired', 'noJobDetected', 'mainInterface'];
    sections.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.classList.add('hidden');
      }
    });

    // Show requested section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
      targetSection.classList.remove('hidden');
    }
    
    // Hide error message when switching sections
    const errorMessage = document.getElementById('errorMessage');
    if (errorMessage) {
      errorMessage.classList.add('hidden');
    }
  }

  openDashboard() {
    // Open dashboard in new tab
    chrome.tabs.create({ url: this.apiBase });
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new SkillGapPopup();
});

// Add CSS animation keyframes
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateY(-100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);
