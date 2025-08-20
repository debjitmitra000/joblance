import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ResumeProfileProps {
  data: {
    hasProfile: boolean;
    personalInfo?: any;
    careerLevel?: any;
    skillsAnalysis?: any;
    projectAnalysis?: any;
    education?: any;
    careerFit?: any;
    workPreferences?: any;
    salaryInsights?: any;
    basicInfo?: {
      skillCount: number;
      uploadedAt: string;
      updatedAt?: string;
    };
  };
}

export default function ResumeProfile({ data }: ResumeProfileProps) {
  const [activeSection, setActiveSection] = useState("overview");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [skillCategoryExpanded, setSkillCategoryExpanded] = useState<Record<string, boolean>>({});
  const [dropdowns, setDropdowns] = useState<Record<string, boolean>>({});

  // Helper to toggle dropdowns for new sections
  const toggleDropdown = (key: string) => {
    setDropdowns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSkillCategory = (category: string) => {
    setSkillCategoryExpanded(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const getTotalSkillCount = () => {
    if (!data.skillsAnalysis) return 0;
    let count = 0;
    Object.keys(data.skillsAnalysis).forEach((category) => {
      if (Array.isArray(data.skillsAnalysis[category])) {
        count += data.skillsAnalysis[category].length;
      }
    });
    return count;
  };

  // Mask email: show first 3 then ... then last part (after @)
  const maskEmail = (email: string) => {
    if (!email.includes("@")) return email;
    const [before, after] = email.split("@");
    return before.slice(0, 3) + "..." + "@" + after;
  };

  // Mask phone: show first 3 then ...
  const maskPhone = (phone: string) => {
    return phone.slice(0, 3) + "..." + phone.slice(-2);
  };

  const renderSkillCategories = (skillsData: any) => {
    const categoryConfig = {
      programming: { icon: "💻", label: "Programming Languages", color: "blue" },
      languages: { icon: "💻", label: "Programming Languages", color: "blue" },
      technical: { icon: "⚙️", label: "Technical Skills", color: "green" },
      frameworks: { icon: "🔧", label: "Frameworks & Libraries", color: "purple" },
      databases: { icon: "🗄️", label: "Databases", color: "orange" },
      tools: { icon: "🛠️", label: "Tools & Platforms", color: "indigo" },
      cloud: { icon: "☁️", label: "Cloud Services", color: "sky" },
      soft: { icon: "🤝", label: "Soft Skills", color: "pink" },
      certifications: { icon: "🎓", label: "Certifications", color: "emerald" },
    };

    const colorClasses = {
      blue: "bg-blue-100 dark:bg-blue-800/30 text-blue-700 dark:text-blue-300",
      green: "bg-green-100 dark:bg-green-800/30 text-green-700 dark:text-green-300",
      purple: "bg-purple-100 dark:bg-purple-800/30 text-purple-700 dark:text-purple-300",
      orange: "bg-orange-100 dark:bg-orange-800/30 text-orange-700 dark:text-orange-300",
      indigo: "bg-indigo-100 dark:bg-indigo-800/30 text-indigo-700 dark:text-indigo-300",
      sky: "bg-sky-100 dark:bg-sky-800/30 text-sky-700 dark:text-sky-300",
      pink: "bg-pink-100 dark:bg-pink-800/30 text-pink-700 dark:text-pink-300",
      emerald: "bg-emerald-100 dark:bg-emerald-800/30 text-emerald-700 dark:text-emerald-300",
    };

    return (
      <div className="space-y-4">
        {Object.entries(skillsData).map(([category, skills]) => {
          if (!Array.isArray(skills) || skills.length === 0) return null;
          const config = categoryConfig[category as keyof typeof categoryConfig] || {
            icon: "📋",
            label: category.charAt(0).toUpperCase() + category.slice(1),
            color: "gray",
          };
          const isExpanded = skillCategoryExpanded[category] || false;
          return (
            <div key={category} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSkillCategory(category)}
                className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 dark:bg-gray-800 text-left font-medium text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                type="button"
                aria-expanded={isExpanded}
                aria-controls={`skills-${category}`}
              >
                <span className="flex items-center gap-2">
                  <span>{config.icon}</span>
                  {config.label} ({skills.length})
                </span>
                <span className="text-lg select-none transition-transform duration-200" style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>
                  ▼
                </span>
              </button>
              {isExpanded && (
                <div id={`skills-${category}`} className="px-4 py-3 bg-white dark:bg-gray-900">
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill: string, index: number) => (
                      <span
                        key={index}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          colorClasses[config.color as keyof typeof colorClasses] ||
                          "bg-gray-100 dark:bg-gray-800/30 text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (!data.hasProfile) {
    return (
      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <span className="text-emerald-500 mr-2">👤</span>
          Resume Profile
        </h3>
        <div className="text-center py-8">
          <span className="text-4xl mb-2 block text-muted-foreground/30">👤</span>
          <p className="text-muted-foreground text-sm">
            Upload and analyze your resume to see detailed profile insights
          </p>
        </div>
      </div>
    );
  }

  const sections = [
    { id: "overview", label: "Overview", icon: "📋" },
    { id: "skills", label: "Skills", icon: "🛠️" },
    { id: "career", label: "Career Fit", icon: "🎯" },
    { id: "preferences", label: "Work Preferences", icon: "⚙️" },
  ];

  const totalSkills = getTotalSkillCount();

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-foreground flex items-center">
          <span className="text-emerald-500 mr-2">👤</span>
          Resume Profile
        </h3>
        <span className="text-xs text-muted-foreground">{totalSkills} skills extracted</span>
      </div>
      <div className="flex flex-wrap gap-1 mb-6">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`flex items-center px-3 py-2 rounded-lg text-sm transition-all duration-200 font-medium ${
              activeSection === section.id
                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
            }`}
          >
            <span className="mr-2 text-sm">{section.icon}</span>
            {section.label}
          </button>
        ))}
      </div>
      <div className="space-y-6">
        {/* Overview Section */}
        {activeSection === "overview" && (
          <div className="space-y-6">
            {/* Personal Info dropdown */}
            {data.personalInfo && (
              <div className="border border-blue-100 dark:border-blue-800/30 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                <button
                  className="w-full px-4 py-3 flex justify-between items-center font-semibold text-lg text-foreground"
                  onClick={() => toggleDropdown("personalInfo")}
                  aria-expanded={dropdowns.personalInfo || false}
                  aria-controls="personalInfo-section"
                >
                  <span className="flex items-center"><span className="mr-2">👋</span>Personal Information</span>
                  <span className="text-lg">{dropdowns.personalInfo ? "▼" : "►"}</span>
                </button>
                {dropdowns.personalInfo && (
                  <div id="personalInfo-section" className="px-4 pb-4">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        {data.personalInfo.name && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Name</p>
                            <p className="font-semibold text-lg text-foreground break-words">{data.personalInfo.name}</p>
                          </div>
                        )}
                        {data.personalInfo.location && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Location</p>
                            <p className="text-foreground break-words">{data.personalInfo.location}</p>
                          </div>
                        )}
                      </div>
                      <div className="space-y-4">
                        {data.personalInfo.email && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Email</p>
                            <p className="text-blue-600 dark:text-blue-400 break-all">{maskEmail(data.personalInfo.email)}</p>
                          </div>
                        )}
                        {data.personalInfo.phone && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Phone</p>
                            <p className="text-foreground break-words">{maskPhone(data.personalInfo.phone)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    {(data.personalInfo.github || data.personalInfo.linkedIn || data.personalInfo.portfolio) && (
                      <div className="mt-6 pt-4 border-t border-blue-200 dark:border-blue-800">
                        <p className="text-sm font-medium text-muted-foreground mb-3">Professional Links</p>
                        <div className="flex flex-wrap gap-2">
                          {data.personalInfo.github && (
                            <span className="px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm break-all font-medium">
                              📋 GitHub
                            </span>
                          )}
                          {data.personalInfo.linkedIn && (
                            <span className="px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm break-all font-medium">
                              💼 LinkedIn
                            </span>
                          )}
                          {data.personalInfo.portfolio && (
                            <span className="px-3 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-sm break-all font-medium">
                              🌐 Portfolio
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Education dropdown */}
            {data.education && (
              <div className="border border-green-100 dark:border-green-800/30 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                <button
                  className="w-full px-4 py-3 flex justify-between items-center font-semibold text-lg text-foreground"
                  onClick={() => toggleDropdown("education")}
                  aria-expanded={dropdowns.education || false}
                  aria-controls="education-section"
                >
                  <span className="flex items-center"><span className="mr-2">🎓</span>Education</span>
                  <span className="text-lg">{dropdowns.education ? "▼" : "►"}</span>
                </button>
                {dropdowns.education && (
                  <div id="education-section" className="px-4 pb-4">
                    <div className="grid md:grid-cols-2 gap-6">
                      {(data.education.degree || data.education.field) && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Degree</p>
                          <p className="font-semibold text-foreground break-words">
                            {data.education.degree}
                            {data.education.field && ` in ${data.education.field}`}
                          </p>
                        </div>
                      )}
                      {data.education.university && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">University</p>
                          <p className="font-medium text-foreground break-words">{data.education.university}</p>
                        </div>
                      )}
                      {data.education.gpa && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">GPA</p>
                          <p className="font-semibold text-green-600 dark:text-green-400">{data.education.gpa}/10</p>
                        </div>
                      )}
                      {data.education.graduationYear && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Graduation</p>
                          <p className="font-medium text-foreground">{data.education.graduationYear}</p>
                        </div>
                      )}
                    </div>
                    {data.education.additionalCourses && data.education.additionalCourses.length > 0 && (
                      <div className="mt-6 pt-4 border-t border-green-200 dark:border-green-800">
                        <p className="text-sm font-medium text-muted-foreground mb-3">Additional Courses</p>
                        <div className="space-y-2">
                          {data.education.additionalCourses.map((course: string, index: number) => (
                            <div key={index} className="flex items-start">
                              <span className="mr-2 text-green-500 mt-1 font-bold">•</span>
                              <span className="text-foreground break-words">{course}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Career Level dropdown */}
            {data.careerLevel && (
              <div className="border border-purple-100 dark:border-purple-800/30 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                <button
                  className="w-full px-4 py-3 flex justify-between items-center font-semibold text-lg text-foreground"
                  onClick={() => toggleDropdown("careerLevel")}
                  aria-expanded={dropdowns.careerLevel || false}
                  aria-controls="careerLevel-section"
                >
                  <span className="flex items-center"><span className="mr-2">📊</span>Career Level</span>
                  <span className="text-lg">{dropdowns.careerLevel ? "▼" : "►"}</span>
                </button>
                {dropdowns.careerLevel && (
                  <div id="careerLevel-section" className="px-4 pb-4">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Experience</p>
                        <p className="font-bold text-2xl text-purple-600 dark:text-purple-400">
                          {data.careerLevel.experienceYears || 0} years
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Level</p>
                        <p className="font-semibold text-lg text-foreground capitalize">
                          {data.careerLevel.level || "Entry Level"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Skills section */}
        {activeSection === "skills" && (
          <div className="space-y-6">
            {data.skillsAnalysis ? (
              <>
                <div className="border border-blue-100 dark:border-blue-800/30 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <button
                    className="w-full px-4 py-3 flex justify-between items-center font-semibold text-lg text-foreground"
                    onClick={() => toggleDropdown("skillsAnalysis")}
                    aria-expanded={dropdowns.skillsAnalysis || false}
                    aria-controls="skillsAnalysis-section"
                  >
                    <span className="flex items-center">
                      <span className="mr-2">🛠️</span>
                      Skills Analysis
                      <span className="ml-2 text-sm font-normal text-muted-foreground">
                        ({totalSkills} total skills)
                      </span>
                    </span>
                    <span className="text-lg">{dropdowns.skillsAnalysis ? "▼" : "►"}</span>
                  </button>
                  {dropdowns.skillsAnalysis && (
                    <div id="skillsAnalysis-section" className="px-4 pb-4">
                      {renderSkillCategories(data.skillsAnalysis)}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block opacity-30">🛠️</span>
                <p className="text-muted-foreground">No skills analysis available</p>
              </div>
            )}

            {/* Project Analysis dropdown */}
            {data.projectAnalysis && (
              <div className="border border-purple-100 dark:border-purple-800/30 rounded-xl">
                <button
                  className="w-full px-4 py-3 flex justify-between items-center font-semibold text-lg text-foreground"
                  onClick={() => toggleDropdown("projectAnalysis")}
                  aria-expanded={dropdowns.projectAnalysis || false}
                  aria-controls="projectAnalysis-section"
                >
                  <span className="flex items-center"><span className="mr-2">🚀</span>Project Analysis</span>
                  <span className="text-lg">{dropdowns.projectAnalysis ? "▼" : "►"}</span>
                </button>
                {dropdowns.projectAnalysis && (
                  <div id="projectAnalysis-section" className="px-4 pb-4">
                    <div className="grid md:grid-cols-2 gap-6 mb-4">
                      {data.projectAnalysis.complexityLevel && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Complexity Level</p>
                          <p className="font-semibold text-purple-600 dark:text-purple-400">
                            {data.projectAnalysis.complexityLevel}
                          </p>
                        </div>
                      )}
                      {data.projectAnalysis.projectQuality && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Quality Assessment</p>
                          <p className="text-foreground text-sm">
                            {data.projectAnalysis.projectQuality.length > 60
                              ? `${data.projectAnalysis.projectQuality.substring(0, 60)}...`
                              : data.projectAnalysis.projectQuality}
                          </p>
                        </div>
                      )}
                    </div>
                    {data.projectAnalysis.projectTypes && Array.isArray(data.projectAnalysis.projectTypes) && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-muted-foreground mb-2">Project Types</p>
                        <div className="flex flex-wrap gap-2">
                          {data.projectAnalysis.projectTypes.map((type: string, index: number) => (
                            <span key={index} className="px-3 py-1 bg-purple-100 dark:bg-purple-800/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                              {type}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Career section */}
        {activeSection === "career" && (
          <div className="space-y-6">
            {data.careerFit ? (
              <div className="space-y-6">
                <div className="p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                  <h4 className="font-semibold text-foreground mb-4 flex items-center">
                    <span className="mr-2">🎯</span>
                    Career Fit Analysis
                  </h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    {data.careerFit.primaryDomain && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Primary Domain</p>
                        <p className="font-bold text-lg text-emerald-600 dark:text-emerald-400 break-words">
                          {data.careerFit.primaryDomain}
                        </p>
                      </div>
                    )}
                    {data.careerFit.readinessLevel && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Readiness Level</p>
                        <p className="font-semibold text-lg text-foreground capitalize">
                          {data.careerFit.readinessLevel}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                {/* Recommended Roles dropdown */}
                {data.careerFit.suitableRoles && Array.isArray(data.careerFit.suitableRoles) && data.careerFit.suitableRoles.length > 0 && (
                  <div className="border border-green-100 dark:border-green-800/30 rounded-xl">
                    <button
                      className="w-full px-4 py-3 flex justify-between items-center font-semibold text-lg text-foreground"
                      onClick={() => toggleDropdown("recommendedRoles")}
                      aria-expanded={dropdowns.recommendedRoles || false}
                      aria-controls="recommendedRoles-section"
                    >
                      <span className="flex items-center"><span className="mr-2">🎯</span>Recommended Roles</span>
                      <span className="text-lg">{dropdowns.recommendedRoles ? "▼" : "►"}</span>
                    </button>
                    {dropdowns.recommendedRoles && (
                      <div id="recommendedRoles-section" className="px-4 pb-4">
                        <div className="flex flex-wrap gap-3">
                          {data.careerFit.suitableRoles.map((role: string, index: number) => (
                            <span key={index} className="bg-green-100 dark:bg-green-800/30 text-green-700 dark:text-green-300 px-4 py-2 rounded-full font-medium break-words">
                              {role}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block opacity-30">🎯</span>
                <p className="text-muted-foreground">No career fit analysis available</p>
              </div>
            )}
            {/* Salary Insights */}
            {data.salaryInsights && (
              <div className="p-6 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800/30">
                <h4 className="font-semibold text-foreground mb-4 flex items-center">
                  <span className="mr-2">💰</span>
                  Salary Insights
                </h4>
                {data.salaryInsights.estimatedRange && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Estimated Range</p>
                    <p className="font-bold text-xl text-amber-600 dark:text-amber-400">
                      {data.salaryInsights.currency} {data.salaryInsights.estimatedRange}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Preferences section */}
        {/* Preferences section */}
{activeSection === "preferences" && (
  <div className="space-y-6">
    {data.workPreferences ? (
      <div className="border border-indigo-100 dark:border-indigo-800/30 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl">
        <button
          className="w-full px-4 py-3 flex justify-between items-center font-semibold text-lg text-foreground"
          onClick={() => toggleDropdown("workPreferences")}
          aria-expanded={dropdowns.workPreferences || false}
          aria-controls="workPreferences-section"
        >
          <span className="flex items-center"><span className="mr-2">⚙️</span>Work Preferences</span>
          <span className="text-lg">{dropdowns.workPreferences ? "▼" : "►"}</span>
        </button>
        {dropdowns.workPreferences && (
          <div id="workPreferences-section" className="px-6 pb-6">
            <dl className="divide-y divide-gray-200 dark:divide-gray-700">
              {data.workPreferences.openToRemote !== undefined && (
                <div className="flex justify-between items-center py-4">
                  <dt className="text-sm font-medium text-foreground">Remote Work</dt>
                  <dd className={`text-sm font-semibold ${data.workPreferences.openToRemote ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {data.workPreferences.openToRemote ? "Available" : "Office Only"}
                  </dd>
                </div>
              )}

              {data.workPreferences.fullTimeReady !== undefined && (
                <div className="flex justify-between items-center py-4">
                  <dt className="text-sm font-medium text-foreground">Employment Type</dt>
                  <dd className={`text-sm font-semibold ${data.workPreferences.fullTimeReady ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {data.workPreferences.fullTimeReady ? "Full-time" : "Part-time"}
                  </dd>
                </div>
              )}

              {data.workPreferences.preferredLocation && (
                <div className="flex justify-between items-center py-4">
                  <dt className="text-sm font-medium text-foreground">Preferred Location</dt>
                  <dd className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 text-right">
                    {data.workPreferences.preferredLocation}
                  </dd>
                </div>
              )}

              {data.workPreferences.willingToRelocate !== undefined && (
                <div className="flex justify-between items-center py-4">
                  <dt className="text-sm font-medium text-foreground">Relocation</dt>
                  <dd className={`text-sm font-semibold text-right ${
                    data.workPreferences.willingToRelocate 
                      ? 'text-emerald-600 dark:text-emerald-400' 
                      : 'text-red-500 dark:text-red-400 line-through'
                  }`}>
                    {data.workPreferences.willingToRelocate ? "Open to relocate" : "Current location only"}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        )}
      </div>
    ) : (
      <div className="text-center py-12">
        <span className="text-6xl mb-4 block opacity-30">⚙️</span>
        <p className="text-muted-foreground">No work preferences analysis available</p>
      </div>
    )}
  </div>
)}

      </div>
      {/* Footer */}
      {data.basicInfo && (
        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Last updated: {new Date(data.basicInfo.updatedAt || data.basicInfo.uploadedAt).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
}
