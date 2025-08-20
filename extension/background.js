// JOBLANCE Background Service Worker
class SkillGapBackground {
  constructor() {
    // Use localhost for development
    this.apiBase = 'http://localhost:5000';
    this.init();
  }

  init() {
    // Handle installation
    chrome.runtime.onInstalled.addListener((details) => {
      this.handleInstallation(details);
    });

    // Handle extension icon click
    chrome.action.onClicked.addListener((tab) => {
      this.handleIconClick(tab);
    });

    // Handle messages from content scripts and popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true; // Keep message channel open for async responses
    });

    // Handle storage changes
    chrome.storage.onChanged.addListener((changes, areaName) => {
      this.handleStorageChange(changes, areaName);
    });

    // Set up periodic sync (if needed for offline capability)
    this.setupPeriodicSync();
  }

  handleInstallation(details) {
    if (details.reason === 'install') {
      // First time installation
      this.showWelcomeNotification();
      this.openDashboard();
    } else if (details.reason === 'update') {
      // Extension updated
      console.log('JOBLANCE extension updated');
    }
  }

  showWelcomeNotification() {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'assets/icon.svg',
      title: 'JOBLANCE Installed!',
      message: 'Click the extension icon on any job posting to analyze jobs with AI.'
    });
  }

  handleIconClick(tab) {
    // This is called when user clicks the extension icon
    // The popup will handle the main interaction
    console.log('JOBLANCE icon clicked on tab:', tab.url);
  }

  async handleMessage(request, sender, sendResponse) {
    try {
      switch (request.action) {
        case 'authenticateUser':
          await this.authenticateUser(request.token, sendResponse);
          break;
          
        case 'analyzeJobPosting':
          await this.analyzeJobPosting(request.data, sendResponse);
          break;
          
        case 'syncWithDashboard':
          await this.syncWithDashboard(sendResponse);
          break;
          
        case 'updateApiBase':
          await this.updateApiBase(request.apiBase, sendResponse);
          break;
          
        case 'getStoredData':
          await this.getStoredData(request.keys, sendResponse);
          break;
          
        case 'setStoredData':
          await this.setStoredData(request.data, sendResponse);
          break;
          
        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('Background script error:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  async authenticateUser(token, sendResponse) {
    try {
      // Store the token
      await chrome.storage.sync.set({ skillgap_token: token });
      
      // Verify with backend
      const response = await fetch(`${this.apiBase}/api/extension/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token })
      });

      if (response.ok) {
        const userData = await response.json();
        await chrome.storage.sync.set({ 
          user_data: userData,
          last_auth_check: Date.now()
        });
        sendResponse({ success: true, userData });
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  }

  async analyzeJobPosting(jobData, sendResponse) {
    try {
      // Get stored token
      const result = await chrome.storage.sync.get(['skillgap_token']);
      const token = result.skillgap_token;

      if (!token) {
        throw new Error('No authentication token found');
      }

      // Send job data to backend for analysis
      const response = await fetch(`${this.apiBase}/api/analysis/job`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(jobData)
      });

      if (response.ok) {
        const analysisResult = await response.json();
        
        // Store the latest analysis
        await chrome.storage.local.set({
          latest_analysis: analysisResult,
          analysis_timestamp: Date.now()
        });

        // Show success notification
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'assets/icon.svg',
          title: 'Analysis Complete!',
          message: `${Math.round(analysisResult.analysis.matchPercentage)}% skill match found. Check JOBLANCE dashboard for details.`
        });

        sendResponse({ success: true, analysis: analysisResult });
      } else {
        const errorText = await response.text();
        throw new Error(`Analysis failed: ${errorText}`);
      }
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  }

  async syncWithDashboard(sendResponse) {
    try {
      // Get stored token
      const result = await chrome.storage.sync.get(['skillgap_token']);
      const token = result.skillgap_token;

      if (!token) {
        throw new Error('No authentication token found');
      }

      // Fetch latest user data and analysis
      const [userResponse, analysisResponse] = await Promise.all([
        fetch(`${this.apiBase}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${this.apiBase}/api/analysis/latest`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const syncData = {};

      if (userResponse.ok) {
        syncData.user = await userResponse.json();
      }

      if (analysisResponse.ok) {
        syncData.latestAnalysis = await analysisResponse.json();
      }

      // Update local storage
      await chrome.storage.local.set({
        sync_data: syncData,
        last_sync: Date.now()
      });

      sendResponse({ success: true, syncData });
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  }

  async updateApiBase(newApiBase, sendResponse) {
    try {
      this.apiBase = newApiBase;
      await chrome.storage.sync.set({ api_base: newApiBase });
      sendResponse({ success: true });
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  }

  async getStoredData(keys, sendResponse) {
    try {
      const result = await chrome.storage.sync.get(keys);
      sendResponse({ success: true, data: result });
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  }

  async setStoredData(data, sendResponse) {
    try {
      await chrome.storage.sync.set(data);
      sendResponse({ success: true });
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  }

  handleStorageChange(changes, areaName) {
    // Handle storage changes if needed
    if (changes.api_base && changes.api_base.newValue) {
      this.apiBase = changes.api_base.newValue;
    }
  }

  setupPeriodicSync() {
    // Set up periodic background sync (optional)
    chrome.alarms.create('syncData', { periodInMinutes: 30 });
    
    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === 'syncData') {
        this.performBackgroundSync();
      }
    });
  }

  async performBackgroundSync() {
    try {
      // Check if user is authenticated
      const result = await chrome.storage.sync.get(['skillgap_token', 'last_sync']);
      
      if (!result.skillgap_token) return;
      
      // Only sync if it's been more than 15 minutes since last sync
      const lastSync = result.last_sync || 0;
      const fifteenMinutes = 15 * 60 * 1000;
      
      if (Date.now() - lastSync < fifteenMinutes) return;

      // Perform background sync
      await this.syncWithDashboard(() => {});
    } catch (error) {
      console.error('Background sync failed:', error);
    }
  }

  async openDashboard() {
    // Open dashboard in new tab
    await chrome.tabs.create({ url: this.apiBase });
  }
}

// Initialize background script
new SkillGapBackground();
