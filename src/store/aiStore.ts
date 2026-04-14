import { create } from 'zustand';
import type { User } from './authStore';
import type { Task } from './taskStore';

export interface AISubtask {
  id: string;
  title: string;
  description: string;
  estimatedHours: number;
  order: number;
}

export interface AITaskAnalysis {
  taskId: string;
  summary: string;
  complexityScore: number;
  estimatedHours: number;
  confidence: number;
  suggestedSkills: string[];
  missingSkills: string[];
  riskFactors: string[];
  suggestions: string[];
  subtasks: AISubtask[];
  generatedAt: string;
}

export interface SkillGap {
  skill: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
}

export interface CourseRecommendation {
  title: string;
  provider: string;
  url: string;
  relevance: string;
}

export interface CareerInsight {
  userId: string;
  growthScore: number;
  workStyle: string;
  strengths: string[];
  focusAreas: string[];
  skillGaps: SkillGap[];
  courseRecommendations: CourseRecommendation[];
  nextRole: {
    title: string;
    timeline: string;
    reason: string;
  };
  weeklyGoals: string[];
  efficiencyTips: string[];
  generatedAt: string;
}

export interface ResumeAnalysis {
  atsScore: number;
  missingKeywords: string[];
  suggestedSummary: string;
  formattingTips: string[];
  contentImprovements: {
    section: string;
    suggestion: string;
    impact: 'high' | 'medium' | 'low';
  }[];
  isOptimized: boolean;
}

interface AIState {
  taskAnalyses: Record<string, AITaskAnalysis>;
  careerInsights: Record<string, CareerInsight>;
  resumeAnalysis: ResumeAnalysis | null;
  analyzeTaskLoading: boolean;
  generateCareerLoading: boolean;
  resumeLoading: boolean;
  analyzeTask: (task: Task, user: User) => Promise<AITaskAnalysis>;
  generateCareerInsights: (user: User, tasks: Task[]) => Promise<CareerInsight>;
  analyzeResume: (userData: any) => Promise<ResumeAnalysis>;
  optimizeResumeContent: (userData: any) => Promise<string>;
}

const unique = (items: string[]) => Array.from(new Set(items.filter(Boolean)));

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const courseCatalog: Record<string, CourseRecommendation> = {
  TypeScript: {
    title: 'Advanced TypeScript Patterns',
    provider: 'TypeScript Docs',
    url: 'https://www.typescriptlang.org/docs/',
    relevance: 'Improve safety, scalability, and refactoring confidence in complex apps.',
  },
  React: {
    title: 'Modern React Architecture',
    provider: 'React Docs',
    url: 'https://react.dev/learn',
    relevance: 'Strengthen component design, hooks usage, and rendering patterns.',
  },
  'Node.js': {
    title: 'Node.js API Engineering',
    provider: 'Node.js Learn',
    url: 'https://nodejs.org/en/learn',
    relevance: 'Build stronger backend services, APIs, and async workflows.',
  },
  Testing: {
    title: 'Testing JavaScript Applications',
    provider: 'Testing Library',
    url: 'https://testing-library.com/docs/',
    relevance: 'Improve delivery confidence with unit and integration testing.',
  },
  Security: {
    title: 'OWASP Top 10 Fundamentals',
    provider: 'OWASP',
    url: 'https://owasp.org/www-project-top-ten/',
    relevance: 'Learn secure coding, authentication, and vulnerability awareness.',
  },
  'State Management': {
    title: 'Scalable State Management',
    provider: 'Redux Essentials',
    url: 'https://redux.js.org/tutorials/essentials/part-1-overview-concepts',
    relevance: 'Handle complex client state and predictable UI behavior.',
  },
  'API Integration': {
    title: 'REST API Integration Patterns',
    provider: 'MDN',
    url: 'https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Client-side_web_APIs/Fetching_data',
    relevance: 'Improve API contracts, error handling, and async data flows.',
  },
  'UI Development': {
    title: 'Accessible UI Engineering',
    provider: 'W3C WAI',
    url: 'https://www.w3.org/WAI/fundamentals/accessibility-intro/',
    relevance: 'Build highly usable and accessible interfaces.',
  },
  'Responsive Design': {
    title: 'Responsive Web Design',
    provider: 'MDN',
    url: 'https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design',
    relevance: 'Improve mobile-first layouts and adaptive design systems.',
  },
  Database: {
    title: 'Database Design Essentials',
    provider: 'MongoDB University',
    url: 'https://learn.mongodb.com/',
    relevance: 'Understand schema design and efficient data modeling.',
  },
};

const inferSuggestedSkills = (task: Task) => {
  const text = `${task.title} ${task.description} ${task.skillsRequired.join(' ')}`.toLowerCase();
  const inferred: string[] = [];

  if (/auth|jwt|login|token|session|password/.test(text)) {
    inferred.push('Authentication', 'Security', 'API Integration');
  }
  if (/react|component|frontend|page|ui|dashboard/.test(text)) {
    inferred.push('React', 'UI Development', 'Responsive Design');
  }
  if (/node|express|backend|server|api/.test(text)) {
    inferred.push('Node.js', 'API Integration');
  }
  if (/redux|zustand|state|store/.test(text)) {
    inferred.push('State Management');
  }
  if (/test|bug|fix|qa|debug/.test(text)) {
    inferred.push('Testing', 'Debugging');
  }
  if (/database|mongo|sql|schema/.test(text)) {
    inferred.push('Database');
  }

  return unique([...task.skillsRequired, ...inferred]);
};

const buildSubtasks = (task: Task, suggestedSkills: string[], complexityScore: number): AISubtask[] => {
  const text = `${task.title} ${task.description}`.toLowerCase();
  const estimatedTotal = Math.max(task.estimatedTime || 4, 4);

  const authFlow = [
    {
      title: 'Define auth requirements & user flows',
      description: 'Clarify login, registration, validation, and error handling scenarios.',
    },
    {
      title: 'Implement secure authentication logic',
      description: 'Build core auth flows, token/session handling, and field validation.',
    },
    {
      title: 'Integrate frontend/backend states',
      description: 'Connect UI states, API responses, and failure recovery paths.',
    },
    {
      title: 'Test security and edge cases',
      description: 'Validate invalid credentials, expiry, retries, and protected routes.',
    },
  ];

  const uiFlow = [
    {
      title: 'Break screen into reusable sections',
      description: 'Define layout, states, reusable components, and responsive behavior.',
    },
    {
      title: 'Build main UI implementation',
      description: 'Implement the core visual structure and data-driven states.',
    },
    {
      title: 'Connect interactions and feedback',
      description: 'Wire forms, filters, actions, transitions, and empty/loading states.',
    },
    {
      title: 'Polish responsiveness and QA',
      description: 'Test mobile layouts, accessibility, and visual consistency.',
    },
  ];

  const apiFlow = [
    {
      title: 'Review API contract & payloads',
      description: 'Confirm endpoints, request structure, validation, and expected responses.',
    },
    {
      title: 'Implement data integration logic',
      description: 'Build async fetch/mutation flows and transform returned data safely.',
    },
    {
      title: 'Handle errors and loading states',
      description: 'Add retry, fallback, empty, and failure states for robust UX.',
    },
    {
      title: 'Verify data accuracy end-to-end',
      description: 'Test network edge cases and ensure correct business-state rendering.',
    },
  ];

  const genericFlow = [
    {
      title: 'Clarify scope and success criteria',
      description: 'Translate the task description into explicit deliverables and acceptance points.',
    },
    {
      title: 'Implement the core solution',
      description: `Build the primary task outcome using ${suggestedSkills.slice(0, 3).join(', ') || 'the required stack'}.`,
    },
    {
      title: 'Review edge cases and integrations',
      description: 'Check dependencies, data flow, performance concerns, and handoff quality.',
    },
    {
      title: 'Test, polish, and document',
      description: 'Validate the feature thoroughly and leave it easy for others to review.',
    },
  ];

  const selectedFlow = /auth|jwt|login|token|password/.test(text)
    ? authFlow
    : /ui|design|page|layout|responsive|component/.test(text)
      ? uiFlow
      : /api|integration|backend|server|data/.test(text)
        ? apiFlow
        : genericFlow;

  const hourSplits = complexityScore >= 8 ? [0.2, 0.35, 0.25, 0.2] : [0.2, 0.4, 0.2, 0.2];

  return selectedFlow.map((step, index) => ({
    id: `${task.id}-subtask-${index + 1}`,
    title: step.title,
    description: step.description,
    estimatedHours: Math.max(1, Math.round(estimatedTotal * hourSplits[index])),
    order: index + 1,
  }));
};

export const useAIStore = create<AIState>()((set) => ({
  taskAnalyses: {},
  careerInsights: {},
  resumeAnalysis: null,
  analyzeTaskLoading: false,
  generateCareerLoading: false,
  resumeLoading: false,

  analyzeResume: async (userData: any) => {
    set({ resumeLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const analysis: ResumeAnalysis = {
      atsScore: Math.floor(Math.random() * 15) + 75,
      missingKeywords: ['CI/CD', 'Microservices', 'GraphQL', 'AWS', 'Unit Testing', 'System Design'],
      suggestedSummary: `Accomplished ${userData.title || 'Professional'} with expertise in delivering high-impact solutions using modern tech stacks. Strong focus on architectural scalability and user-centric design principles.`,
      formattingTips: [
        'Use standard section headings for better ATS parsing.',
        'Ensure a clean, single-column layout.',
        'Prioritize impact metrics in bullet points.'
      ],
      contentImprovements: [
        { section: 'Experience', suggestion: 'Add quantitative results to your recent roles.', impact: 'high' },
        { section: 'Skills', suggestion: 'Group technical skills by category for better readability.', impact: 'medium' }
      ],
      isOptimized: false
    };
    set({ resumeAnalysis: analysis, resumeLoading: false });
    return analysis;
  },

  optimizeResumeContent: async (userData: any) => {
    set({ resumeLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 1200));
    set({ resumeLoading: false });
    return `Highly skilled ${userData.title} with a track record of driving efficiency and innovation. Expert in building scalable applications and leading cross-functional teams toward technical excellence.`;
  },

  analyzeTask: async (task, user) => {
    set({ analyzeTaskLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 900));

    const userSkills = user.skills.map((skill) => skill.name.toLowerCase());
    const suggestedSkills = inferSuggestedSkills(task);
    const missingSkills = suggestedSkills.filter(
      (skill) => !userSkills.includes(skill.toLowerCase())
    );

    const priorityWeight = {
      low: 1,
      medium: 2,
      high: 3,
      urgent: 4,
    }[task.priority];

    const complexityScore = clamp(
      Math.round(
        priorityWeight * 1.5 +
          Math.min(task.skillsRequired.length, 4) +
          Math.min(task.estimatedTime / 2.5, 3) +
          (task.description.length > 80 ? 1 : 0.5)
      ),
      1,
      10
    );

    const dueInDays = Math.ceil(
      (new Date(task.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    const riskFactors = unique([
      complexityScore >= 8 ? 'High implementation complexity may require early review checkpoints.' : '',
      missingSkills.length > 0 ? `Missing or weak coverage in: ${missingSkills.slice(0, 3).join(', ')}.` : '',
      dueInDays <= 3 ? 'Deadline is very close, so delay risk is elevated.' : '',
      task.progress > 0 && task.progress < 40 && dueInDays <= 5 ? 'Current progress may be behind the expected pace.' : '',
    ]);

    const suggestions = unique([
      missingSkills.length > 0 ? `Start with ${missingSkills[0]} research before implementation.` : 'Start with scope clarification and acceptance criteria.',
      task.priority === 'high' || task.priority === 'urgent'
        ? 'Share an intermediate update early to reduce manager review risk.'
        : 'Batch similar implementation steps together for better focus.',
      task.actualTime > task.estimatedTime * 0.7
        ? 'You have already used a large part of the estimate—prioritize the highest-value deliverable first.'
        : 'Reserve the final 20% of time for testing and cleanup.',
    ]);

    const analysis: AITaskAnalysis = {
      taskId: task.id,
      summary: `This task focuses on ${task.title.toLowerCase()} and should be approached as a ${complexityScore >= 7 ? 'high-attention' : 'structured'} delivery with clear checkpoints.`,
      complexityScore,
      estimatedHours: task.estimatedTime,
      confidence: clamp(82 - missingSkills.length * 6 + task.skillsRequired.length * 2, 58, 96),
      suggestedSkills,
      missingSkills,
      riskFactors,
      suggestions,
      subtasks: buildSubtasks(task, suggestedSkills, complexityScore),
      generatedAt: new Date().toISOString(),
    };

    set((state) => ({
      analyzeTaskLoading: false,
      taskAnalyses: {
        ...state.taskAnalyses,
        [task.id]: analysis,
      },
    }));

    return analysis;
  },

  generateCareerInsights: async (user, tasks) => {
    set({ generateCareerLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 1100));

    const memberTasks = tasks.filter((task) => task.assignedTo === user.id);
    const completedTasks = memberTasks.filter((task) => task.status === 'completed');
    const activeTasks = memberTasks.filter((task) => task.status !== 'completed');

    const skillFrequency = new Map<string, number>();
    memberTasks.forEach((task) => {
      task.skillsRequired.forEach((skill) => {
        skillFrequency.set(skill, (skillFrequency.get(skill) || 0) + 1);
      });
      task.updates.forEach((update) => {
        update.skillsUsed.forEach((skill) => {
          skillFrequency.set(skill, (skillFrequency.get(skill) || 0) + 1);
        });
      });
    });

    const knownSkills = user.skills.map((skill) => skill.name);
    const strongestSkills = unique(
      [...user.skills]
        .sort((a, b) => b.yearsOfExperience - a.yearsOfExperience)
        .slice(0, 3)
        .map((skill) => skill.name)
    );

    const inferredGaps = Array.from(skillFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .filter(([skill]) => !knownSkills.some((known) => known.toLowerCase() === skill.toLowerCase()))
      .slice(0, 3)
      .map<SkillGap>(([skill, count], index) => ({
        skill,
        priority: index === 0 ? 'high' : index === 1 ? 'medium' : 'low',
        reason: `This skill appears in ${count} of your assigned task workflows but is not yet strong in your profile.`,
      }));

    const fallbackGaps: SkillGap[] = [
      {
        skill: 'Testing',
        priority: 'medium',
        reason: 'Adding stronger test coverage will improve delivery confidence and review quality.',
      },
      {
        skill: 'State Management',
        priority: 'medium',
        reason: 'Larger projects benefit from predictable state architecture and scalable UI logic.',
      },
      {
        skill: 'Security',
        priority: 'low',
        reason: 'Understanding auth and data protection patterns increases seniority readiness.',
      },
    ];

    const skillGaps = inferredGaps.length > 0 ? inferredGaps : fallbackGaps;

    const courseRecommendations = skillGaps.map((gap) => {
      const fromCatalog = courseCatalog[gap.skill] || courseCatalog.TypeScript;
      return {
        ...fromCatalog,
        relevance: `${fromCatalog.relevance} Focus reason: ${gap.reason}`,
      };
    });

    const completedCount = completedTasks.length;
    const averageQuality = completedTasks.length
      ? completedTasks.reduce((sum, task) => sum + task.quality, 0) / completedTasks.length
      : user.rating;

    const averageEstimateUsage = memberTasks.length
      ? memberTasks.reduce((sum, task) => sum + (task.estimatedTime ? task.actualTime / task.estimatedTime : 0), 0) / memberTasks.length
      : 0.65;

    const growthScore = clamp(
      Math.round(
        user.rating * 18 +
          user.skills.length * 5 +
          completedCount * 4 +
          Math.max(0, 20 - averageEstimateUsage * 10)
      ),
      45,
      98
    );

    const nextRole =
      user.experience >= 5 && user.rating >= 4.7
        ? {
            title: 'Lead Frontend Engineer',
            timeline: '6-9 months',
            reason: 'You already show strong delivery consistency, skill breadth, and team-readiness signals.',
          }
        : user.experience >= 3
          ? {
              title: 'Senior Software Developer',
              timeline: '6-12 months',
              reason: 'You are close to the next level; deeper architecture, testing, and ownership will accelerate promotion readiness.',
            }
          : {
              title: 'Software Developer II',
              timeline: '3-6 months',
              reason: 'Build momentum through consistent delivery, visible ownership, and one advanced skill upgrade.',
            };

    const workStyle =
      averageEstimateUsage <= 0.7
        ? 'Reliable and efficient finisher'
        : averageEstimateUsage <= 1
          ? 'Balanced executor with healthy pacing'
          : 'Deep problem-solver who may benefit from tighter estimation checkpoints';

    const focusAreas = unique([
      skillGaps[0]?.skill || 'Testing',
      activeTasks.some((task) => task.priority === 'high' || task.priority === 'urgent') ? 'Priority execution under deadlines' : 'Consistent quality improvement',
      strongestSkills.length > 0 ? `Scale your strength in ${strongestSkills[0]}` : 'Strengthen core implementation depth',
    ]);

    const weeklyGoals = unique([
      activeTasks[0] ? `Move "${activeTasks[0].title}" to the next milestone with one documented update.` : 'Complete one meaningful task update with measurable progress.',
      `Spend 2 focused learning sessions on ${skillGaps[0]?.skill || 'Testing'}.`,
      'Capture one proof-based work update with clear skills used and time spent.',
      completedCount < 2 ? 'Close one pending task this week to increase delivery momentum.' : 'Improve one finished task area through refactor, testing, or polish.',
    ]).slice(0, 4);

    const efficiencyTips = unique([
      'Break high-complexity work into smaller checkpoints before starting implementation.',
      activeTasks.length > 1 ? 'Prioritize one high-value task at a time to reduce context switching.' : 'Keep your current focus pattern; it is helping reduce switching overhead.',
      averageQuality < 4.5 ? 'Add a final self-review pass before submitting updates to improve quality scores.' : 'Maintain your current quality bar and document your decisions more visibly.',
      'Use skills tags consistently in updates so your profile reflects real growth automatically.',
    ]);

    const insight: CareerInsight = {
      userId: user.id,
      growthScore,
      workStyle,
      strengths: strongestSkills.length > 0 ? strongestSkills : ['React', 'Problem Solving', 'Delivery Ownership'],
      focusAreas,
      skillGaps,
      courseRecommendations,
      nextRole,
      weeklyGoals,
      efficiencyTips,
      generatedAt: new Date().toISOString(),
    };

    set((state) => ({
      generateCareerLoading: false,
      careerInsights: {
        ...state.careerInsights,
        [user.id]: insight,
      },
    }));

    return insight;
  },
}));
