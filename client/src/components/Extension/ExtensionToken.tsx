import React, { useState } from 'react';

const ExtensionToken: React.FC = () => {
  const [extensionToken, setExtensionToken] = useState<string>('');
  const [showToken, setShowToken] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const generateExtensionToken = async (): Promise<void> => {
    setIsGenerating(true);
    try {
      // Get the actual JWT token from localStorage with the correct key
      const token = localStorage.getItem('skillgap_token'); // Changed from 'token' to 'skillgap_token'
      if (!token) {
        throw new Error('Please log in to generate an extension token');
      }

      // Call the actual API endpoint
      const response = await fetch('/api/auth/extension-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to generate token: ${response.status}`);
      }

      const data = await response.json();
      setExtensionToken(data.token);
    } catch (error) {
      console.error('Failed to generate extension token:', error);
      alert(`Failed to generate extension token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(extensionToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      const textArea = document.createElement('textarea');
      textArea.value = extensionToken;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadExtension = (): void => {
    window.open('/api/extension/download', '_blank');
  };

  const formatTokenDisplay = (token: string, show: boolean): string => {
    if (show) return token;
    return '•'.repeat(Math.min(40, token.length));
  };

  return (
    <div className="bg-card rounded-2xl shadow-md border border-border p-8 w-full max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-foreground mb-2 flex items-center">
            <span className="text-brand-purple text-2xl mr-3">🎟️</span>
            Generate Authentication Token
          </h3>
          <p className="text-base text-muted-foreground">
            Generate a secure token to authenticate the extension with your account.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-100 dark:border-purple-800/30 rounded-xl p-6">
          {!extensionToken ? (
            <div className="text-center space-y-4">
              <button
                onClick={generateExtensionToken}
                disabled={isGenerating}
                className="inline-flex items-center px-6 py-3 bg-brand-purple text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base font-semibold w-full sm:w-auto justify-center"
              >
                <span className={`text-xl mr-2 ${isGenerating ? 'animate-spin' : ''}`}>
                  {isGenerating ? '🔄' : '⚡'}
                </span>
                {isGenerating ? 'Generating...' : 'Generate Token'}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Token Display */}
              <div className="space-y-4">
                <label className="block text-base font-semibold text-foreground">
                  Authentication Token
                </label>
                
                {/* Desktop Token Display */}
                <div className="hidden sm:flex items-center space-x-3">
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={formatTokenDisplay(extensionToken, showToken)}
                      readOnly
                      className="w-full font-mono text-sm bg-muted border border-border p-4 rounded-lg text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                  <button
                    onClick={() => setShowToken(!showToken)}
                    className="flex-shrink-0 p-3 text-muted-foreground hover:text-foreground border border-border rounded-lg transition-colors"
                    title={showToken ? 'Hide token' : 'Show token'}
                  >
                    <span className="text-lg">{showToken ? '🙈' : '👁️'}</span>
                  </button>
                  <button
                    onClick={copyToClipboard}
                    className={`flex-shrink-0 p-3 rounded-lg border transition-colors ${
                      copied
                        ? 'text-green-600 dark:text-green-400 border-green-200 dark:border-green-600 bg-green-50 dark:bg-green-900/20'
                        : 'text-muted-foreground hover:text-foreground border-border hover:bg-muted/50'
                    }`}
                    title="Copy token"
                  >
                    <span className="text-lg">{copied ? '✅' : '📋'}</span>
                  </button>
                </div>

                {/* Mobile Token Display */}
                <div className="sm:hidden space-y-3">
                  <div className="relative">
                    <textarea
                      value={formatTokenDisplay(extensionToken, showToken)}
                      readOnly
                      className="w-full h-24 font-mono text-sm bg-muted border border-border p-4 rounded-lg text-foreground resize-none"
                      style={{ wordBreak: 'break-all' }}
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowToken(!showToken)}
                      className="flex-1 inline-flex items-center justify-center px-4 py-3 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg transition-colors font-medium"
                    >
                      <span className="text-base mr-2">{showToken ? '🙈' : '👁️'}</span>
                      {showToken ? 'Hide' : 'Show'}
                    </button>
                    <button
                      onClick={copyToClipboard}
                      className={`flex-1 inline-flex items-center justify-center px-4 py-3 text-sm rounded-lg border transition-colors font-medium ${
                        copied
                          ? 'text-green-600 dark:text-green-400 border-green-200 dark:border-green-600 bg-green-50 dark:bg-green-900/20'
                          : 'text-muted-foreground hover:text-foreground border-border hover:bg-muted/50'
                      }`}
                    >
                      <span className="text-base mr-2">{copied ? '✅' : '📋'}</span>
                      Copy
                    </button>
                  </div>
                </div>
              </div>
              
              {copied && (
                <div className="flex items-center space-x-3 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 p-4 rounded-lg">
                  <span>✅</span>
                  <span className="font-medium">Token copied to clipboard!</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-border">
                <button
                  onClick={generateExtensionToken}
                  disabled={isGenerating}
                  className="text-sm text-brand-purple hover:text-purple-700 dark:hover:text-purple-300 underline disabled:opacity-50 font-medium"
                >
                  Generate New Token
                </button>
                <span className="text-sm text-muted-foreground text-center sm:text-right">
                  Token expires in 30 days
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExtensionToken;
