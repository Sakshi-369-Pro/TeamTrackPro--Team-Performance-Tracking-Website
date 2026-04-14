import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useTaskStore } from '../../store/taskStore';
import { useAIStore } from '../../store/aiStore';
import {
  FileText, Download, Star, Loader2, CheckCircle,
  Sparkles, Zap, AlertCircle, Search,
  Upload, X, ChevronDown, ChevronUp, Brain,
  Target, TrendingUp, RefreshCw, Copy, Check
} from 'lucide-react';
import ResumePreview from './ResumePreview';

type TemplateType = 'modern' | 'classic' | 'minimal';

interface JDAnalysis {
  matchScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
  jobTitle: string;
  requiredSkills: string[];
}

function analyzeJD(jdText: string, userSkills: string[]): JDAnalysis {
  const text = jdText.toLowerCase();
  const skillPool = [
    'React', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'Java',
    'AWS', 'Docker', 'Kubernetes', 'GraphQL', 'REST API', 'MongoDB',
    'PostgreSQL', 'Redis', 'CI/CD', 'Git', 'Agile', 'Scrum',
    'Microservices', 'System Design', 'Unit Testing', 'Jest',
    'Tailwind CSS', 'Next.js', 'Vue.js', 'Angular', 'Express.js',
    'Machine Learning', 'Data Analysis', 'SQL', 'NoSQL', 'Linux',
    'Figma', 'UI/UX', 'Firebase', 'Serverless', 'WebSockets',
    'Redux', 'Context API', 'Performance Optimization', 'SEO',
    'Leadership', 'Communication', 'Problem Solving', 'Team Collaboration'
  ];

  const requiredSkills = skillPool.filter(skill =>
    text.includes(skill.toLowerCase())
  );

  const userSkillsLower = userSkills.map(s => s.toLowerCase());
  const matchedKeywords = requiredSkills.filter(skill =>
    userSkillsLower.includes(skill.toLowerCase())
  );
  const missingKeywords = requiredSkills.filter(skill =>
    !userSkillsLower.includes(skill.toLowerCase())
  ).slice(0, 8);

  const matchScore = requiredSkills.length > 0
    ? Math.round((matchedKeywords.length / requiredSkills.length) * 100)
    : 70;

  const titlePatterns = [
    'senior', 'junior', 'lead', 'principal', 'staff',
    'frontend', 'backend', 'fullstack', 'full stack', 'full-stack',
    'engineer', 'developer', 'architect', 'designer', 'manager'
  ];
  const titleWords = text.split(/[\n,.()|]/)[0]
    .split(' ')
    .filter(w => titlePatterns.some(p => w.includes(p)))
    .join(' ');

  const suggestions: string[] = [];
  if (missingKeywords.length > 0) {
    suggestions.push(`Add these missing skills to your profile: ${missingKeywords.slice(0, 3).join(', ')}`);
  }
  if (text.includes('agile') || text.includes('scrum')) {
    suggestions.push('Mention Agile/Scrum methodology experience in your summary');
  }
  if (text.includes('team') || text.includes('collaborate')) {
    suggestions.push('Highlight team collaboration achievements with measurable results');
  }
  if (text.includes('lead') || text.includes('mentor')) {
    suggestions.push('Add leadership or mentoring experience to stand out');
  }
  if (matchScore < 60) {
    suggestions.push('Your current skill match is below 60% — consider tailoring your work history descriptions');
  }
  if (text.includes('year') && /\d+\+?\s*year/.test(text)) {
    suggestions.push('Clearly state your years of experience in the resume summary');
  }

  return {
    matchScore: Math.min(matchScore, 98),
    matchedKeywords,
    missingKeywords,
    suggestions: suggestions.slice(0, 5),
    jobTitle: titleWords || 'Software Engineer',
    requiredSkills,
  };
}

export default function ResumeGenerator() {
  const user = useAuthStore((s) => s.user);
  const { tasks } = useTaskStore();
  const { resumeAnalysis, analyzeResume, optimizeResumeContent } = useAIStore();

  const [template, setTemplate] = useState<TemplateType>('modern');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadDone, setDownloadDone] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizeDone, setOptimizeDone] = useState(false);

  // JD states
  const [jdText, setJdText] = useState('');
  const [jdAnalysis, setJdAnalysis] = useState<JDAnalysis | null>(null);
  const [isAnalyzingJD, setIsAnalyzingJD] = useState(false);
  const [jdAnalysisDone, setJdAnalysisDone] = useState(false);
  const [showJDPanel, setShowJDPanel] = useState(true);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user && !resumeAnalysis) {
      analyzeResume({
        title: user.role === 'manager' ? 'Project Manager' : 'Software Developer',
        skills: user.skills.map(s => s.name),
        experience: user.experience
      });
    }
  }, [user, resumeAnalysis, analyzeResume]);

  const completedTasks = tasks.filter(
    (t) => t.assignedTo === user?.id && t.status === 'completed'
  );

  const resumeData = {
    name: user?.name || 'John Doe',
    title: user?.role === 'manager' ? 'Project Manager' : 'Software Developer',
    email: user?.email || 'email@example.com',
    phone: user?.phone || '+1234567890',
    rating: user?.rating || 4.5,
    experience: user?.experience || 3,
    bio: user?.bio || `Results-driven professional with ${user?.experience || 3}+ years of experience delivering high-quality software solutions.`,
    skills: user?.skills || [],
    companies: (user?.companies || []).map(c => ({
      companyName: c.companyName,
      position: c.position,
      startDate: c.startDate instanceof Date ? c.startDate.toISOString() : c.startDate,
      endDate: c.endDate ? (c.endDate instanceof Date ? c.endDate.toISOString() : c.endDate) : undefined,
      description: c.description
    })),
    projects: completedTasks.slice(0, 4).map(t => ({
      title: t.title,
      description: t.description,
      skillsRequired: t.skillsRequired || []
    })),
    achievements: user?.achievements || []
  };

  // Handle JD text paste / file upload
  const handleJDFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setJdText(ev.target?.result as string);
      setJdAnalysis(null);
      setJdAnalysisDone(false);
    };
    reader.readAsText(file);
  };

  const handleAnalyzeJD = async () => {
    if (!jdText.trim()) return;
    setIsAnalyzingJD(true);
    setJdAnalysis(null);
    setJdAnalysisDone(false);
    await new Promise(r => setTimeout(r, 1800));
    const userSkills = user?.skills.map(s => s.name) || [];
    const result = analyzeJD(jdText, userSkills);
    setJdAnalysis(result);
    setIsAnalyzingJD(false);
    setJdAnalysisDone(true);
  };

  const handleClearJD = () => {
    setJdText('');
    setJdAnalysis(null);
    setJdAnalysisDone(false);
  };

  const handleCopySuggestions = () => {
    if (!jdAnalysis) return;
    navigator.clipboard.writeText(jdAnalysis.suggestions.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOptimize = async () => {
    setIsOptimizing(true);
    setOptimizeDone(false);
    await optimizeResumeContent(resumeData);
    setIsOptimizing(false);
    setOptimizeDone(true);
    setTimeout(() => setOptimizeDone(false), 3000);
  };

  // PDF Download — opens ONLY resume in a new print window
  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadDone(false);
    try {
      const previewEl = document.getElementById('resume-preview-root');
      if (!previewEl) throw new Error('Resume preview not found');
      const html = previewEl.innerHTML;
      const printWindow = window.open('', '_blank', 'width=900,height=1200');
      if (!printWindow) throw new Error('Popup blocked');
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8" />
            <title>Resume - ${resumeData.name}</title>
            <style>
              @page { size: A4; margin: 0; }
              * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              body { margin: 0; padding: 0; background: white; font-family: Arial, sans-serif; }
              @media print {
                html, body { width: 210mm; height: 297mm; }
              }
            </style>
          </head>
          <body>${html}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
        setDownloadDone(true);
        setTimeout(() => setDownloadDone(false), 3000);
        setIsDownloading(false);
      }, 800);
    } catch {
      alert('Could not generate PDF. Please try again.');
      setIsDownloading(false);
    }
  };

  const activeAnalysis = jdAnalysis || resumeAnalysis;
  const atsScore = jdAnalysis ? jdAnalysis.matchScore : (resumeAnalysis?.atsScore || 0);
  const missingKw = jdAnalysis ? jdAnalysis.missingKeywords : (resumeAnalysis?.missingKeywords || []);

  const scoreColor =
    atsScore >= 80 ? 'text-green-600' :
    atsScore >= 60 ? 'text-yellow-500' :
    'text-red-500';

  const scoreBg =
    atsScore >= 80 ? 'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-700' :
    atsScore >= 60 ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700' :
    'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700';

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              ATS Resume Generator
            </h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm ml-13">
            Paste a Job Description → AI matches your profile → Download perfect ATS resume
          </p>
        </div>
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm whitespace-nowrap ${
            downloadDone
              ? 'bg-green-600 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          } disabled:opacity-60 disabled:cursor-not-allowed`}
        >
          {isDownloading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
          ) : downloadDone ? (
            <><CheckCircle className="w-4 h-4" /> Downloaded!</>
          ) : (
            <><Download className="w-4 h-4" /> Download PDF</>
          )}
        </button>
      </div>

      {/* ─── JOB DESCRIPTION PANEL ─── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        {/* Panel Header */}
        <button
          onClick={() => setShowJDPanel(p => !p)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
              <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                AI Job Description Analyzer
                {jdAnalysisDone && (
                  <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-xs rounded-full font-medium">
                    ✓ Analyzed
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Paste or upload a job description — AI will tailor your resume to match it
              </div>
            </div>
          </div>
          {showJDPanel
            ? <ChevronUp className="w-5 h-5 text-gray-400" />
            : <ChevronDown className="w-5 h-5 text-gray-400" />
          }
        </button>

        {showJDPanel && (
          <div className="px-5 pb-5 border-t border-gray-100 dark:border-gray-700">
            {/* Text area + upload */}
            <div className="mt-4 space-y-3">
              <div className="relative">
                <textarea
                  value={jdText}
                  onChange={e => { setJdText(e.target.value); setJdAnalysis(null); setJdAnalysisDone(false); }}
                  placeholder="Paste the full Job Description here…&#10;&#10;Example:&#10;We are looking for a Senior React Developer with 3+ years experience in TypeScript, Node.js, AWS, and Docker. You will lead frontend development and collaborate with cross-functional teams..."
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-400 dark:placeholder-gray-500"
                />
                {jdText && (
                  <button
                    onClick={handleClearJD}
                    className="absolute top-3 right-3 p-1 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-900/40 text-gray-500 dark:text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Upload + Analyze row */}
              <div className="flex flex-wrap gap-3 items-center">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:border-purple-400 hover:text-purple-600 dark:hover:text-purple-400 text-sm font-medium transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Upload .txt / .md / .pdf / .doc / .docx
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md,.text,.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  onChange={handleJDFile}
                />

                <button
                  onClick={handleAnalyzeJD}
                  disabled={!jdText.trim() || isAnalyzingJD}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {isAnalyzingJD ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing JD…</>
                  ) : (
                    <><Brain className="w-4 h-4" /> Analyze & Match</>
                  )}
                </button>

                {jdText && (
                  <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
                    {jdText.split(' ').length} words
                  </span>
                )}
              </div>
            </div>

            {/* JD Analysis Results */}
            {isAnalyzingJD && (
              <div className="mt-4 flex items-center gap-3 p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                <Loader2 className="w-5 h-5 text-purple-600 animate-spin flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-purple-700 dark:text-purple-300">AI is analyzing the job description…</div>
                  <div className="text-xs text-purple-500 dark:text-purple-400 mt-0.5">Matching your skills against requirements</div>
                </div>
              </div>
            )}

            {jdAnalysis && (
              <div className="mt-4 space-y-4">
                {/* Score Bar */}
                <div className={`rounded-xl border p-4 ${scoreBg}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        JD Match Score
                        {jdAnalysis.jobTitle && (
                          <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">
                            for "{jdAnalysis.jobTitle}"
                          </span>
                        )}
                      </span>
                    </div>
                    <span className={`text-2xl font-black ${scoreColor}`}>
                      {jdAnalysis.matchScore}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        jdAnalysis.matchScore >= 80 ? 'bg-green-500' :
                        jdAnalysis.matchScore >= 60 ? 'bg-yellow-400' : 'bg-red-400'
                      }`}
                      style={{ width: `${jdAnalysis.matchScore}%` }}
                    />
                  </div>
                  <div className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                    {jdAnalysis.matchScore >= 80
                      ? '✅ Excellent match — your profile is highly aligned'
                      : jdAnalysis.matchScore >= 60
                      ? '⚠️ Good match — add missing keywords to improve'
                      : '❌ Low match — tailor your resume to this JD'}
                  </div>
                </div>

                {/* 3 columns: Matched / Missing / Suggestions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Matched Keywords */}
                  <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                        Matched Skills ({jdAnalysis.matchedKeywords.length})
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {jdAnalysis.matchedKeywords.length > 0
                        ? jdAnalysis.matchedKeywords.map(kw => (
                          <span key={kw} className="px-2 py-0.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium border border-green-200 dark:border-green-700">
                            ✓ {kw}
                          </span>
                        ))
                        : <span className="text-xs text-gray-400">No direct matches found</span>
                      }
                    </div>
                  </div>

                  {/* Missing Keywords */}
                  <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Search className="w-4 h-4 text-orange-500" />
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                        Missing Keywords ({jdAnalysis.missingKeywords.length})
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {jdAnalysis.missingKeywords.length > 0
                        ? jdAnalysis.missingKeywords.map(kw => (
                          <span key={kw} className="px-2 py-0.5 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-xs font-medium border border-orange-200 dark:border-orange-700">
                            + {kw}
                          </span>
                        ))
                        : <span className="text-xs text-gray-400">No gaps — great match!</span>
                      }
                    </div>
                  </div>

                  {/* AI Suggestions */}
                  <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-500" />
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                          AI Suggestions
                        </span>
                      </div>
                      <button onClick={handleCopySuggestions} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                        {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-gray-400" />}
                      </button>
                    </div>
                    <ul className="space-y-1.5">
                      {jdAnalysis.suggestions.map((s, i) => (
                        <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1.5 leading-snug">
                          <span className="text-purple-400 mt-0.5 flex-shrink-0">•</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── AI OPTIMIZER HORIZONTAL STRIP ─── */}
      {activeAnalysis && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-blue-100 dark:border-blue-900/40 shadow-sm">
          {/* Top row — 4 stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-100 dark:divide-gray-700">
            {/* ATS Score */}
            <div className="p-4 flex flex-col gap-1">
              <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">ATS Score</span>
              <div className="flex items-baseline gap-1">
                <span className={`text-3xl font-black ${scoreColor}`}>{atsScore}</span>
                <span className="text-sm text-gray-400">/100</span>
              </div>
              <div className="flex gap-0.5 mt-1">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} className={`w-3 h-3 ${s <= Math.round(atsScore/20) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 dark:text-gray-600'}`} />
                ))}
              </div>
            </div>

            {/* Format */}
            <div className="p-4 flex flex-col gap-1">
              <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Format Match</span>
              <span className={`text-xl font-bold ${atsScore >= 80 ? 'text-green-600' : 'text-yellow-500'}`}>
                {atsScore >= 80 ? 'Excellent' : atsScore >= 60 ? 'Good' : 'Needs Work'}
              </span>
              <span className="text-xs text-gray-400">Machine Readable</span>
            </div>

            {/* Skills Count */}
            <div className="p-4 flex flex-col gap-1">
              <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Skills</span>
              <span className="text-3xl font-black text-gray-900 dark:text-white">{resumeData.skills.length}</span>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span className="text-xs text-green-500 font-medium">Top performer</span>
              </div>
            </div>

            {/* Projects */}
            <div className="p-4 flex flex-col gap-1">
              <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Projects Done</span>
              <span className="text-3xl font-black text-indigo-600">{completedTasks.length}</span>
              <span className="text-xs text-gray-400">Validated contributions</span>
            </div>
          </div>

          {/* Bottom row — horizontal optimizer strip */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 px-5 py-4 border-t border-gray-100 dark:border-gray-700 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-b-2xl">
            {/* Label */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Zap className="w-5 h-5 text-yellow-500 fill-yellow-400" />
              <span className="font-bold text-gray-900 dark:text-white text-sm">AI Optimizer</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${scoreBg} ${scoreColor}`}>
                {atsScore}% {jdAnalysis ? 'JD Match' : 'ATS Match'}
              </span>
            </div>

            {/* Missing Keywords */}
            <div className="flex-1 flex flex-col gap-1.5">
              <span className="text-xs text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                <AlertCircle className="w-3 h-3" />
                {jdAnalysis ? 'Missing from JD' : 'Missing Keywords'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {missingKw.slice(0, 6).map(kw => (
                  <span key={kw} className="px-2.5 py-0.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded text-xs font-medium">
                    + {kw}
                  </span>
                ))}
                {missingKw.length > 6 && (
                  <span className="px-2.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 rounded text-xs">
                    +{missingKw.length - 6} more
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={handleOptimize}
                disabled={isOptimizing}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 shadow-sm whitespace-nowrap"
              >
                {isOptimizing
                  ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Optimizing…</>
                  : optimizeDone
                  ? <><CheckCircle className="w-3.5 h-3.5" /> Done!</>
                  : <><Sparkles className="w-3.5 h-3.5" /> Auto-Fix Resume</>
                }
              </button>
              <button
                onClick={() => analyzeResume({ title: resumeData.title, skills: user?.skills.map(s=>s.name)||[], experience: user?.experience||0 })}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-600 transition-all whitespace-nowrap"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── TEMPLATE SELECTOR ─── */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Choose Template</h2>
        <div className="grid grid-cols-3 gap-3">
          {(['modern', 'classic', 'minimal'] as TemplateType[]).map(t => (
            <button
              key={t}
              onClick={() => setTemplate(t)}
              className={`p-3 md:p-4 rounded-xl border-2 text-left transition-all ${
                template === t
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 bg-white dark:bg-gray-800'
              }`}
            >
              <div className="font-semibold text-gray-900 dark:text-white text-sm capitalize">{t}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {t === 'modern' ? 'Clean, contemporary design' : t === 'classic' ? 'Traditional corporate format' : 'Simple & ATS-optimized'}
              </div>
              {template === t && (
                <div className="mt-2 flex items-center gap-1 text-blue-600 dark:text-blue-400 text-xs font-medium">
                  <CheckCircle className="w-3 h-3" /> Selected
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ─── RESUME PREVIEW ─── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            Resume Preview
          </h2>
          <div className="flex items-center gap-2">
            {jdAnalysis && (
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${scoreBg} ${scoreColor}`}>
                {jdAnalysis.matchScore}% JD Match
              </span>
            )}
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                downloadDone ? 'bg-green-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
              } disabled:opacity-60`}
            >
              {isDownloading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
                : downloadDone ? <><CheckCircle className="w-4 h-4" /> Downloaded!</>
                : <><Download className="w-4 h-4" /> Download PDF</>}
            </button>
          </div>
        </div>

        {/* White A4 preview container */}
        <div className="bg-gray-200 dark:bg-gray-900 rounded-xl p-4 md:p-8 overflow-auto">
          <div
            id="resume-preview-root"
            className="bg-white shadow-2xl mx-auto"
            style={{ maxWidth: '794px', minHeight: '1123px' }}
          >
            <ResumePreview data={resumeData} template={template} />
          </div>
        </div>
      </div>

      {/* ─── QUICK STATS ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Tasks', value: tasks.filter(t => t.assignedTo === user?.id && t.status !== 'completed').length, color: 'text-blue-600' },
          { label: 'Completed', value: completedTasks.length, color: 'text-green-600' },
          { label: 'Rating', value: `${resumeData.rating} ★`, color: 'text-yellow-500' },
          { label: 'Experience', value: `${resumeData.experience} yrs`, color: 'text-purple-600' },
        ].map(stat => (
          <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{stat.label}</div>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

    </div>
  );
}
