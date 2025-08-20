import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ComprehensiveAnalysisProps {
  data: {
    hasEnhancedData: boolean;
    jobDetails?: any;
    requirements?: any;
    jobCharacteristics?: any;
    compensation?: any;
    matchAnalysis?: any;
    recommendation?: any;
    careerGrowth?: any;
    riskAssessment?: any;
    comprehensiveReport?: string;
    quickDecision?: {
      shouldApply?: boolean;
      applicationPriority?: string;
      confidence?: number;
    };
    jobInfo?: {
      workType?: string;
      employmentType?: string;
      isPaid?: boolean;
      experienceLevel?: string;
    };
  };
}

export default function ComprehensiveAnalysis({ data }: ComprehensiveAnalysisProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (!data.hasEnhancedData) {
    return (
      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
          <span className="mr-2 text-purple-500">✨</span>
          Enhanced AI Analysis
        </h2>
        <div className="text-center py-8">
          <span className="text-4xl mb-2 block text-muted-foreground/30">✨</span>
          <p className="text-muted-foreground text-sm">
            Enhanced analysis will appear here after processing
          </p>
        </div>
      </div>
    );
  }

  // Parse the JSON data from the first document
  const parseJsonData = () => {
    try {
      // The JSON data appears to be in the comprehensiveReport field
      if (typeof data.comprehensiveReport === 'string') {
        return JSON.parse(data.comprehensiveReport);
      }
      return data.comprehensiveReport;
    } catch (error) {
      // If it's not valid JSON, try to extract from the string
      const jsonMatch = data.comprehensiveReport?.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch {
          return null;
        }
      }
      return null;
    }
  };

  const jsonData = parseJsonData();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📋' },
    { id: 'details', label: 'Job Details', icon: '📝' },
    { id: 'growth', label: 'Career Growth', icon: '📈' },
    { id: 'risks', label: 'Risk Assessment', icon: '⚠️' }
  ];

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-foreground flex items-center">
          <span className="mr-2 text-purple-500">✨</span>
          Enhanced AI Analysis
        </h2>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-1 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Quick Decision */}
            {(jsonData?.executiveSummary || data.quickDecision) && (
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-100 dark:border-purple-800/30">
                <h3 className="font-medium text-foreground mb-3 flex items-center">
                  <span className="mr-2">🎯</span>
                  Quick Decision
                </h3>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Recommendation</p>
                      <p className="font-medium flex items-center">
                        {jsonData?.executiveSummary?.recommendation === 'CONSIDER' || data.quickDecision?.shouldApply ? (
                          <>
                            <span className="mr-2 text-green-500">✅</span>
                            <span className="text-green-700 dark:text-green-300">
                              {jsonData?.executiveSummary?.recommendation === 'CONSIDER' ? 'Consider for Application' : 'Apply for this position'}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="mr-2 text-amber-500">⚠️</span>
                            <span className="text-amber-700 dark:text-amber-300">Consider carefully</span>
                          </>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Priority Level</p>
                      <p className="font-medium text-purple-600 dark:text-purple-400 capitalize">
                        {data.quickDecision?.applicationPriority || 'Medium'}
                      </p>
                    </div>
                  </div>
                  
                  {jsonData?.executiveSummary?.oneLineAdvice && (
                    <div className="pt-3 border-t border-purple-200 dark:border-purple-800">
                      <p className="text-sm text-muted-foreground mb-1">Key Advice</p>
                      <p className="text-sm italic text-foreground break-words">
                        "{jsonData.executiveSummary.oneLineAdvice}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Job Characteristics */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-100 dark:border-blue-800/30">
              <h3 className="font-medium text-foreground mb-3 flex items-center">
                <span className="mr-2">💼</span>
                Job Characteristics
              </h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Work Type</p>
                  <p className="font-medium text-blue-600 dark:text-blue-400">
                    {data.jobInfo?.workType || 'Remote'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Employment</p>
                  <p className="font-medium text-blue-600 dark:text-blue-400">
                    {data.jobInfo?.employmentType || 'Full-time'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Compensation</p>
                  <p className="font-medium text-blue-600 dark:text-blue-400">
                    {data.jobInfo?.isPaid !== false ? 'Paid' : 'Unpaid'}
                  </p>
                </div>
              </div>
            </div>

            {/* Key Strengths & Concerns */}
            {jsonData?.executiveSummary && (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-100 dark:border-green-800/30">
                  <h3 className="font-medium text-foreground mb-3 flex items-center">
                    <span className="mr-2">💪</span>
                    Key Strengths
                  </h3>
                  <ul className="space-y-2">
                    {jsonData.executiveSummary.keyStrengths?.map((strength: string, index: number) => (
                      <li key={index} className="text-sm text-green-700 dark:text-green-300 flex items-start">
                        <span className="mr-2 mt-1 text-green-500">•</span>
                        <span className="break-words">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg border border-amber-100 dark:border-amber-800/30">
                  <h3 className="font-medium text-foreground mb-3 flex items-center">
                    <span className="mr-2">⚠️</span>
                    Major Concerns
                  </h3>
                  <ul className="space-y-2">
                    {jsonData.executiveSummary.majorConcerns?.map((concern: string, index: number) => (
                      <li key={index} className="text-sm text-amber-700 dark:text-amber-300 flex items-start">
                        <span className="mr-2 mt-1 text-amber-500">•</span>
                        <span className="break-words">{concern}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Match Score Visualization */}
            {jsonData?.executiveSummary?.matchScore && (
              <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800/30">
                <h3 className="font-medium text-foreground mb-4 flex items-center">
                  <span className="mr-2">📊</span>
                  Match Score Analysis
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Overall Match</span>
                    <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                      {jsonData.executiveSummary.matchScore}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${jsonData.executiveSummary.matchScore}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Poor Match</span>
                    <span>Perfect Match</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'details' && (
          <div className="space-y-4">
            {/* Detailed Analysis */}
            {jsonData?.detailedAnalysis && (
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-lg border border-cyan-100 dark:border-cyan-800/30">
                  <h3 className="font-medium text-foreground mb-3 flex items-center">
                    <span className="mr-2">🎯</span>
                    Fit Assessment
                  </h3>
                  <p className="text-sm text-muted-foreground break-words">
                    {jsonData.detailedAnalysis.fitAssessment}
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-lg border border-teal-100 dark:border-teal-800/30">
                  <h3 className="font-medium text-foreground mb-3 flex items-center">
                    <span className="mr-2">🛠️</span>
                    Skill Gap Analysis
                  </h3>
                  <p className="text-sm text-muted-foreground break-words">
                    {jsonData.detailedAnalysis.skillGapAnalysis}
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg border border-emerald-100 dark:border-emerald-800/30">
                  <h3 className="font-medium text-foreground mb-3 flex items-center">
                    <span className="mr-2">💰</span>
                    Compensation Analysis
                  </h3>
                  <p className="text-sm text-muted-foreground break-words">
                    {jsonData.detailedAnalysis.compensationAnalysis}
                  </p>
                </div>
              </div>
            )}

            {!jsonData?.detailedAnalysis && (
              <div className="text-center py-8">
                <span className="text-4xl mb-2 block">📝</span>
                <p className="text-muted-foreground">No detailed analysis available</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'growth' && (
          <div className="space-y-4">
            {jsonData?.detailedAnalysis?.careerImpact ? (
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-100 dark:border-green-800/30">
                  <h3 className="font-medium text-foreground mb-3 flex items-center">
                    <span className="mr-2">📈</span>
                    Career Growth Potential
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 break-words">
                    {jsonData.detailedAnalysis.careerImpact}
                  </p>
                </div>
                
                {jsonData?.timeline && (
                  <div className="space-y-4">
                    {jsonData.timeline.immediateActions && (
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-100 dark:border-blue-800/30">
                        <h4 className="font-medium text-foreground mb-3 flex items-center">
                          <span className="mr-2">⚡</span>
                          Immediate Actions
                        </h4>
                        <ul className="space-y-2">
                          {jsonData.timeline.immediateActions.map((action: string, index: number) => (
                            <li key={index} className="text-sm text-blue-700 dark:text-blue-300 flex items-start">
                              <span className="mr-2 text-blue-500 mt-1">•</span>
                              <span className="break-words">{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {jsonData.timeline.shortTerm && (
                      <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800/30">
                        <h4 className="font-medium text-foreground mb-3 flex items-center">
                          <span className="mr-2">📅</span>
                          Short-term Goals (3-6 months)
                        </h4>
                        <ul className="space-y-2">
                          {jsonData.timeline.shortTerm.map((goal: string, index: number) => (
                            <li key={index} className="text-sm text-indigo-700 dark:text-indigo-300 flex items-start">
                              <span className="mr-2 text-indigo-500 mt-1">•</span>
                              <span className="break-words">{goal}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {jsonData.timeline.longTerm && (
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-100 dark:border-purple-800/30">
                        <h4 className="font-medium text-foreground mb-3 flex items-center">
                          <span className="mr-2">🎯</span>
                          Long-term Goals (1+ years)
                        </h4>
                        <ul className="space-y-2">
                          {jsonData.timeline.longTerm.map((goal: string, index: number) => (
                            <li key={index} className="text-sm text-purple-700 dark:text-purple-300 flex items-start">
                              <span className="mr-2 text-purple-500 mt-1">•</span>
                              <span className="break-words">{goal}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <span className="text-4xl mb-2 block">📈</span>
                <p className="text-muted-foreground">No career growth analysis available</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'risks' && (
          <div className="space-y-4">
            {jsonData?.actionItems?.skillsToImprove ? (
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg border border-amber-100 dark:border-amber-800/30">
                  <h3 className="font-medium text-foreground mb-3 flex items-center">
                    <span className="mr-2">⚠️</span>
                    Skills to Improve
                  </h3>
                  <ul className="space-y-2">
                    {jsonData.actionItems.skillsToImprove.map((skill: string, index: number) => (
                      <li key={index} className="text-sm text-amber-700 dark:text-amber-300 flex items-start">
                        <span className="mr-2 text-amber-500 mt-1">⚠️</span>
                        <span className="break-words">{skill}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {jsonData?.alternativeOptions && (
                  <div className="grid md:grid-cols-2 gap-4">
                    {jsonData.alternativeOptions.similarRoles && (
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-100 dark:border-blue-800/30">
                        <h3 className="font-medium text-foreground mb-3 flex items-center">
                          <span className="mr-2">🎯</span>
                          Similar Roles
                        </h3>
                        <ul className="space-y-2">
                          {jsonData.alternativeOptions.similarRoles.map((role: string, index: number) => (
                            <li key={index} className="text-sm text-blue-700 dark:text-blue-300 flex items-start">
                              <span className="mr-2 text-blue-500 mt-1">•</span>
                              <span className="break-words">{role}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {jsonData.alternativeOptions.skillBuildingPath && (
                      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-100 dark:border-green-800/30">
                        <h3 className="font-medium text-foreground mb-3 flex items-center">
                          <span className="mr-2">🛤️</span>
                          Skill Building Path
                        </h3>
                        <ul className="space-y-2">
                          {jsonData.alternativeOptions.skillBuildingPath.map((path: string, index: number) => (
                            <li key={index} className="text-sm text-green-700 dark:text-green-300 flex items-start">
                              <span className="mr-2 text-green-500 mt-1">•</span>
                              <span className="break-words">{path}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <span className="text-4xl mb-2 block">⚠️</span>
                <p className="text-muted-foreground">No specific risks identified</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}