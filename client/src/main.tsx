import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Function to mount the React app
function mountApp() {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    console.error("Root element not found!");
    return;
  }

  const root = createRoot(rootElement);
  
  try {
    root.render(<App />);
  } catch (error) {
    console.error("Failed to render React app:", error);
    
    // Show error message in case of failure
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: Inter, sans-serif;
          text-align: center;
          padding: 20px;
        ">
          <div>
            <div style="font-size: 4rem; margin-bottom: 1rem;">⚠️</div>
            <h1 style="color: #dc2626; margin-bottom: 1rem;">Loading Error</h1>
            <p style="color: #6b7280; margin-bottom: 2rem;">
              There was an issue loading JOBLANCE. Please refresh the page.
            </p>
            <button 
              onclick="window.location.reload()"
              style="
                background: linear-gradient(135deg, #9333ea, #3b82f6);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 6px;
                font-weight: 500;
                cursor: pointer;
              "
            >
              Refresh Page
            </button>
          </div>
        </div>
      `;
    }
    
    // Hide initial loader even on error
    const loader = document.getElementById('initial-loader');
    if (loader) {
      document.body.classList.add('app-loaded');
      setTimeout(() => {
        loader.classList.add('hidden');
      }, 500);
    }
  }
}

// Mount the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp);
} else {
  mountApp();
}

// Global error handling
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});