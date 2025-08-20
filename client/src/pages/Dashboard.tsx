import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { removeAuthToken } from "@/utils/api";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LogOut } from "lucide-react"; // Add this import
import ResumeUpload from "@/components/ResumeUpload/ResumeUpload";
import SkillGapReport from "@/components/Analysis/SkillGapReport";
import ExtensionSetup from "@/components/Extension/ExtensionSetup";
import APIConfig from "@/components/API/APIConfig";
import ExtensionToken from "@/components/Extension/ExtensionToken";
import ComprehensiveAnalysis from "@/components/Analysis/ComprehensiveAnalysis";
import ResumeProfile from "@/components/Resume/ResumeProfile";

export default function Dashboard() {
  const { user } = useAuth();

  const { data: resume } = useQuery({
    queryKey: ["/api/resume"],
    retry: false,
  });

  const { data: analysis } = useQuery({
    queryKey: ["/api/analysis/latest"],
    retry: false,
  });

  // New queries for enhanced data
  const { data: comprehensiveAnalysis } = useQuery({
    queryKey: ["/api/analysis/comprehensive"],
    retry: false,
    enabled: !!analysis, // Only fetch if we have basic analysis
  });

  const { data: resumeProfile } = useQuery({
    queryKey: ["/api/resume/profile"],
    retry: false,
    enabled: !!resume, // Only fetch if we have a resume
  });

  const handleLogout = () => {
    removeAuthToken();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Dashboard Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🚀</span>
              <h1 className="text-xl font-bold text-foreground">JOBLANCE</h1>
            </div>
            <div className="flex items-center space-x-4">
              {resume && (
                <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-sm font-medium">
                  <span className="mr-1">✓</span>Resume Uploaded
                </span>
              )}
              {comprehensiveAnalysis?.hasEnhancedData && (
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                  <span className="mr-1">✨</span>Enhanced Analysis
                </span>
              )}
              <div className="flex items-center space-x-2 text-muted-foreground">
                <span>😁</span>
                <span>{user?.name}</span>
              </div>
              <ThemeToggle />
              <button 
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            <ResumeUpload />
            <SkillGapReport analysis={analysis} />
            
            {/* Add Comprehensive Analysis if available */}
            {comprehensiveAnalysis?.hasEnhancedData && (
              <ComprehensiveAnalysis data={comprehensiveAnalysis} />
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <ExtensionSetup />
            <ExtensionToken />
            
            {/* Add Resume Profile if available */}
            {resumeProfile?.hasProfile && (
              <ResumeProfile data={resumeProfile} />
            )}
            
            <APIConfig />
          </div>
        </div>
      </div>
    </div>
  );
}
