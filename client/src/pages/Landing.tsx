import { useState } from "react";
import AuthModal from "@/components/Auth/AuthModal";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function Landing() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  const handleShowAuth = (mode: "login" | "register") => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <nav className="flex justify-between items-center px-6 py-6 bg-card border-b border-border">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">🚀</span>
          <span className="text-foreground font-bold text-2xl tracking-tight">JOBLANCE</span>
        </div>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <button 
            onClick={() => handleShowAuth("login")}
            className="text-muted-foreground hover:text-foreground hover:bg-muted px-5 py-2.5 rounded-xl transition-all duration-200 font-medium"
          >
            Sign In
          </button>
          <button 
            onClick={() => handleShowAuth("register")}
            className="bg-brand-purple text-white px-7 py-2.5 rounded-xl font-semibold hover:bg-purple-600 transition-all duration-200 shadow-lg"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-5xl mx-auto text-center">
          <div className="mb-8">
            <span className="inline-block bg-muted text-muted-foreground px-4 py-2 rounded-full text-sm font-medium border border-border">
              ✨ AI-Powered Job Analysis
            </span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-8 leading-tight text-foreground">
            Analyze <span className="text-brand-purple">Job Opportunities</span> with AI
          </h1>
          
          <p className="text-xl md:text-2xl mb-12 text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Get detailed analysis of any job posting. Compare your skills, understand requirements, and make informed career decisions.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <button 
              onClick={() => handleShowAuth("register")}
              className="bg-brand-purple text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-purple-600 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              Start Analysis
            </button>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="group bg-card border border-border rounded-2xl p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
              <div className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-300">🌐</div>
              <h3 className="text-xl font-bold mb-4 text-foreground">Chrome Extension</h3>
              <p className="text-muted-foreground leading-relaxed">
                Analyze job postings directly from any website with our browser extension.
              </p>
            </div>

            <div className="group bg-card border border-border rounded-2xl p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
              <div className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-300">📊</div>
              <h3 className="text-xl font-bold mb-4 text-foreground">Detailed Reports</h3>
              <p className="text-muted-foreground leading-relaxed">
                Get comprehensive insights including skill gaps, career fit, and growth potential.
              </p>
            </div>

            <div className="group bg-card border border-border rounded-2xl p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
              <div className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-300">🎯</div>
              <h3 className="text-xl font-bold mb-4 text-foreground">Smart Insights</h3>
              <p className="text-muted-foreground leading-relaxed">
                Receive personalized recommendations to improve your job application success.
              </p>
            </div>
          </div>

          {/* How it Works Section */}
          <div className="mt-20 pt-16 border-t border-border">
            <h2 className="text-3xl font-bold mb-12 text-foreground">How JOBLANCE Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📄</span>
                </div>
                <h4 className="text-lg font-semibold mb-2 text-foreground">1. Upload Resume</h4>
                <p className="text-muted-foreground">Upload your resume and let AI extract your skills and experience</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔍</span>
                </div>
                <h4 className="text-lg font-semibold mb-2 text-foreground">2. Analyze Jobs</h4>
                <p className="text-muted-foreground">Use our extension to analyze any job posting with one click</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📈</span>
                </div>
                <h4 className="text-lg font-semibold mb-2 text-foreground">3. Get Insights</h4>
                <p className="text-muted-foreground">Receive detailed analysis and recommendations for your career</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </div>
  );
}
