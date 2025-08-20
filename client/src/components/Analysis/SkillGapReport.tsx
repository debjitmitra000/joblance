import { useState } from "react";
import { Button } from "@/components/ui/button";

interface AnalysisData {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  matchedSkills: string[];
  missingSkills: string[];
  partialSkills: string[];
  matchPercentage: number;
  recommendations: string[];
  analyzedAt: string;
  // Enhanced data
  enhancedData?: {
    hasEnhancedAnalysis: boolean;
    jobDetails?: any;
    requirements?: any;
    jobCharacteristics?: any;
    compensation?: any;
    matchAnalysis?: any;
    recommendation?: any;
    careerGrowth?: any;
    riskAssessment?: any;
    comprehensiveReport?: string;
    shouldApply?: boolean;
    applicationPriority?: string;
    confidence?: number;
    workType?: string;
    employmentType?: string;
    isPaid?: boolean;
    experienceLevel?: string;
  };
}

interface SkillGapReportProps {
  analysis: AnalysisData | null;
}

export default function SkillGapReport({ analysis }: SkillGapReportProps) {
  const [expandedSkills, setExpandedSkills] = useState<Record<string, boolean>>({});
  const [showEnhancedInsights, setShowEnhancedInsights] = useState(false);

  const toggleSkillExpansion = (skillType: string) => {
    setExpandedSkills(prev => ({
      ...prev,
      [skillType]: !prev[skillType]
    }));
  };

  if (!analysis) {
    return (
      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-foreground flex items-center">
            <span className="mr-2 text-purple-500">📊</span>
            Analysis Results
          </h2>
        </div>
        <div className="text-center py-12">
          <span className="text-6xl mb-4 block text-muted-foreground/30">📊</span>
          <h3 className="text-lg font-medium text-foreground mb-2">No Analysis Yet</h3>
          <p className="text-muted-foreground mb-4">
            Upload your resume and use the Chrome extension to analyze job postings
          </p>
          <Button className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg transition-colors">
            Install Extension
          </Button>
        </div>
      </div>
    );
  }

  const hasEnhancedData = analysis.enhancedData?.hasEnhancedAnalysis;

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-foreground flex items-center">
          <span className="mr-2 text-purple-500">📊</span>
          Skill Matching Analysis Results
        </h2>
      </div>

      {/* Enhanced Quick Decision */}
      {hasEnhancedData && analysis.enhancedData?.shouldApply !== undefined && (
        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-100 dark:border-purple-800/30 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="mr-3 text-2xl">
                {analysis.enhancedData.shouldApply ? '✅' : '⚠️'}
              </span>
              <div>
                <h3 className="font-medium text-foreground">
                  {analysis.enhancedData.shouldApply 
                    ? 'Recommended to Apply' 
                    : 'Consider Carefully'
                  }
                </h3>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Job Info */}
      <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800/30 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-foreground">{analysis.jobTitle}</h3>
            <p className="text-muted-foreground">{analysis.company} • {analysis.location}</p>
            <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-1">
              Analyzed {new Date(analysis.analyzedAt).toLocaleDateString()}
            </p>
            {/* Enhanced job info */}
            {hasEnhancedData && (
              <div className="flex flex-wrap gap-2 mt-2">
                {analysis.enhancedData?.workType && (
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded">
                    {analysis.enhancedData.workType}
                  </span>
                )}
                {analysis.enhancedData?.employmentType && (
                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded">
                    {analysis.enhancedData.employmentType}
                  </span>
                )}
                {analysis.enhancedData?.experienceLevel && (
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 text-xs rounded">
                    {analysis.enhancedData.experienceLevel} level
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="text-center">
            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 block">
              {Math.round(analysis.matchPercentage)}%
            </span>
            <span className="text-xs text-muted-foreground">Match</span>
          </div>
        </div>
      </div>

      {/* Enhanced Insights */}
      {hasEnhancedData && showEnhancedInsights && analysis.enhancedData?.comprehensiveReport && (
        <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg border border-purple-100 dark:border-purple-800/30">
          <h4 className="font-medium text-foreground mb-3 flex items-center">
            <span className="mr-2 text-purple-500">🤖</span>
            Enhanced AI Analysis
          </h4>
          <div className="text-sm text-muted-foreground max-h-48 overflow-y-auto">
            <p className="whitespace-pre-wrap break-words">{analysis.enhancedData.comprehensiveReport}</p>
          </div>
        </div>
      )}

      {/* Skills Breakdown */}
      <div className="space-y-4">
        {/* Matched Skills */}
        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-100 dark:border-green-800/30">
          <button
            onClick={() => toggleSkillExpansion('matched')}
            className="w-full text-left"
          >
            <h4 className="font-medium text-foreground mb-3 flex items-center justify-between">
              <span className="flex items-center">
                <span className="mr-2 text-green-500 text-lg">✅</span>
                <span className="text-green-700 dark:text-green-300">Matched Skills ({analysis.matchedSkills.length})</span>
              </span>
              <span className={`text-green-500 transition-transform ${expandedSkills.matched ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </h4>
          </button>
          <div className="flex flex-wrap gap-2">
            {analysis.matchedSkills.slice(0, expandedSkills.matched ? undefined : 6).map((skill, index) => (
              <span key={index} className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <span className="mr-1 text-green-500">✓</span>
                {skill}
              </span>
            ))}
            {!expandedSkills.matched && analysis.matchedSkills.length > 6 && (
              <button
                onClick={() => toggleSkillExpansion('matched')}
                className="text-green-600 dark:text-green-400 text-sm hover:underline font-medium"
              >
                +{analysis.matchedSkills.length - 6} more
              </button>
            )}
          </div>
        </div>

        {/* Missing Skills */}
        <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-lg border border-red-100 dark:border-red-800/30">
          <button
            onClick={() => toggleSkillExpansion('missing')}
            className="w-full text-left"
          >
            <h4 className="font-medium text-foreground mb-3 flex items-center justify-between">
              <span className="flex items-center">
                <span className="mr-2 text-red-500 text-lg">❌</span>
                <span className="text-red-700 dark:text-red-300">Missing Skills ({analysis.missingSkills.length})</span>
              </span>
              <span className={`text-red-500 transition-transform ${expandedSkills.missing ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </h4>
          </button>
          <div className="flex flex-wrap gap-2">
            {analysis.missingSkills.slice(0, expandedSkills.missing ? undefined : 6).map((skill, index) => (
              <span key={index} className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <span className="mr-1 text-red-500">✗</span>
                {skill}
              </span>
            ))}
            {!expandedSkills.missing && analysis.missingSkills.length > 6 && (
              <button
                onClick={() => toggleSkillExpansion('missing')}
                className="text-red-600 dark:text-red-400 text-sm hover:underline font-medium"
              >
                +{analysis.missingSkills.length - 6} more
              </button>
            )}
          </div>
        </div>

        {/* Partial Skills */}
        {analysis.partialSkills.length > 0 && (
          <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg border border-amber-100 dark:border-amber-800/30">
            <button
              onClick={() => toggleSkillExpansion('partial')}
              className="w-full text-left"
            >
              <h4 className="font-medium text-foreground mb-3 flex items-center justify-between">
                <span className="flex items-center">
                  <span className="mr-2 text-amber-500 text-lg">⚠️</span>
                  <span className="text-amber-700 dark:text-amber-300">Partial Matches ({analysis.partialSkills.length})</span>
                </span>
                <span className={`text-amber-500 transition-transform ${expandedSkills.partial ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </h4>
            </button>
            <div className="flex flex-wrap gap-2">
              {analysis.partialSkills.slice(0, expandedSkills.partial ? undefined : 6).map((skill, index) => (
                <span key={index} className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                  <span className="mr-1 text-amber-500">~</span>
                  {skill}
                </span>
              ))}
              {!expandedSkills.partial && analysis.partialSkills.length > 6 && (
                <button
                  onClick={() => toggleSkillExpansion('partial')}
                  className="text-amber-600 dark:text-amber-400 text-sm hover:underline font-medium"
                >
                  +{analysis.partialSkills.length - 6} more
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-100 dark:border-blue-800/30">
          <h4 className="font-medium text-foreground mb-3 flex items-center">
            <span className="mr-2 text-blue-500">💡</span>
            <span className="text-blue-700 dark:text-blue-300">AI Recommendations</span>
          </h4>
          <ul className="space-y-2">
            {analysis.recommendations.map((rec, index) => (
              <li key={index} className="text-sm text-blue-700 dark:text-blue-300 flex items-start">
                <span className="mr-2 text-blue-500 mt-1">•</span>
                <span className="break-words">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}