import { Button } from "@/components/ui/button";

export default function ExtensionSetup() {
  const showExtensionGuide = () => {
    const guideContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 30px; background: linear-gradient(135deg, #1e293b 0%, #334155 100%); min-height: 100vh;">
        <div style="background: #0f172a; border-radius: 20px; padding: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.3); border: 1px solid #475569;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #a855f7; margin: 0; font-size: 2.5rem; font-weight: 800;">🚀 JOBLANCE</h1>
            <p style="color: #94a3b8; margin: 10px 0 0 0; font-size: 1.1rem;">AI-Powered Job Analysis Extension</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #581c87 0%, #7c3aed 100%); padding: 25px; border-radius: 15px; margin-bottom: 30px;">
            <h2 style="margin: 0 0 20px 0; color: white; display: flex; align-items: center; font-size: 1.4rem;">
              <span style="margin-right: 10px;">🔧</span>Installation Steps
            </h2>
            <div style="space-y: 10px;">
              <div style="display: flex; align-items: start; margin-bottom: 15px;">
                <span style="background: white; color: #7c3aed; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin-right: 15px; flex-shrink: 0;">1</span>
                <span style="color: #e0e7ff; line-height: 1.5;">Download the extension from the repository</span>
              </div>
              <div style="display: flex; align-items: start; margin-bottom: 15px;">
                <span style="background: white; color: #7c3aed; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin-right: 15px; flex-shrink: 0;">2</span>
                <span style="color: #e0e7ff; line-height: 1.5;">Open Chrome and navigate to <code style="background: rgba(255,255,255,0.1); color: white; padding: 2px 6px; border-radius: 4px; font-family: monospace;">chrome://extensions/</code></span>
              </div>
              <div style="display: flex; align-items: start; margin-bottom: 15px;">
                <span style="background: white; color: #7c3aed; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin-right: 15px; flex-shrink: 0;">3</span>
                <span style="color: #e0e7ff; line-height: 1.5;">Enable "Developer mode" in the top right corner</span>
              </div>
              <div style="display: flex; align-items: start; margin-bottom: 15px;">
                <span style="background: white; color: #7c3aed; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin-right: 15px; flex-shrink: 0;">4</span>
                <span style="color: #e0e7ff; line-height: 1.5;">Click "Load unpacked" and select the extension folder</span>
              </div>
            </div>
          </div>

          <div style="background: linear-gradient(135deg, #065f46 0%, #059669 100%); padding: 25px; border-radius: 15px; margin-bottom: 30px;">
            <h2 style="margin: 0 0 20px 0; color: white; display: flex; align-items: center; font-size: 1.4rem;">
              <span style="margin-right: 10px;">🎯</span>How to Use
            </h2>
            <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px;">
              <ol style="margin: 0; color: #dcfce7; line-height: 1.6;">
                <li style="margin-bottom: 8px;">Navigate to <strong>any job posting website</strong> (LinkedIn, Indeed, Glassdoor, company career pages, or any other job site)</li>
                <li style="margin-bottom: 8px;">Click the JOBLANCE extension icon in your browser toolbar</li>
                <li style="margin-bottom: 8px;">The extension will automatically detect and analyze the job posting</li>
                <li style="margin-bottom: 8px;">Get instant AI-powered insights and recommendations</li>
                <li>View detailed reports in your dashboard</li>
              </ol>
            </div>
          </div>

          <div style="background: linear-gradient(135deg, #b45309 0%, #d97706 100%); padding: 25px; border-radius: 15px;">
            <h2 style="margin: 0 0 20px 0; color: white; display: flex; align-items: center; font-size: 1.4rem;">
              <span style="margin-right: 10px;">💡</span>Pro Tips
            </h2>
            <div style="display: grid; gap: 12px;">
              <div style="display: flex; align-items: start;">
                <span style="color: #fed7aa; margin-right: 10px; font-weight: bold;">▸</span>
                <span style="color: #fed7aa;">Make sure you're logged in to JOBLANCE</span>
              </div>
              <div style="display: flex; align-items: start;">
                <span style="color: #fed7aa; margin-right: 10px; font-weight: bold;">▸</span>
                <span style="color: #fed7aa;">Upload your resume first for accurate analysis</span>
              </div>
              <div style="display: flex; align-items: start;">
                <span style="color: #fed7aa; margin-right: 10px; font-weight: bold;">▸</span>
                <span style="color: #fed7aa;">Configure your Gemini API key in settings</span>
              </div>
              <div style="display: flex; align-items: start;">
                <span style="color: #fed7aa; margin-right: 10px; font-weight: bold;">▸</span>
                <span style="color: #fed7aa;"><strong>Works on any job website</strong> - no matter the format or platform</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    `;

    const newWindow = window.open('', '_blank', 'width=900,height=700,scrollbars=yes');
    if (newWindow) {
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>JOBLANCE - Extension Guide</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0;">
            ${guideContent}
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  };

  const downloadExtension = () => {
    // Create a temporary anchor element to trigger download
    const link = document.createElement('a');
    link.href = '/downloads/extension.zip'; // Path to your zip file in public folder
    link.download = 'extension.zip'; // Optional: specify download filename
    link.style.display = 'none';
    
    // Add to DOM, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-card rounded-2xl shadow-md border border-border p-8">
      <h3 className="text-xl font-bold text-foreground mb-6 flex items-center">
        <span className="text-2xl mr-3">🌐</span>
        Chrome Extension
      </h3>
      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800/30">
          <div className="flex items-center">
            <span className="text-amber-600 dark:text-amber-400 mr-3 text-lg">⚠️</span>
            <span className="text-base font-semibold text-amber-800 dark:text-amber-100">Manual Install Required</span>
          </div>
        </div>
        
        <p className="text-base text-muted-foreground">
          Install the Chrome extension to analyze job postings instantly from <strong>any job website</strong> with comprehensive AI insights.
        </p>
        
        <div className="space-y-3">
          <Button
            onClick={downloadExtension}
            className="w-full bg-brand-purple text-white py-3 px-4 rounded-lg hover:bg-purple-600 transition-colors text-base font-semibold"
          >
            <span className="mr-2">📥</span>
            Download JOBLANCE Extension
          </Button>
          <Button
            onClick={showExtensionGuide}
            variant="outline"
            className="w-full bg-muted text-muted-foreground py-3 px-4 rounded-lg hover:bg-muted/80 transition-colors text-base font-semibold border-border"
          >
            <span className="mr-2">📋</span>
            View Installation Guide
          </Button>
        </div>
      </div>
    </div>
  );
}