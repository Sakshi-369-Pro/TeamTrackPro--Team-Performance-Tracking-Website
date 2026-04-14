import { useEffect, useState } from 'react';
import { Target, Award, Clock, CheckCircle2, Brain, TrendingUp, BookOpen, Rocket, AlertTriangle, RefreshCw } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useTaskStore } from '../../store/taskStore';
import { useAIStore } from '../../store/aiStore';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export default function MemberDashboard() {
  const user = useAuthStore((state) => state.user);
  const { tasks } = useTaskStore();
  const { generateCareerInsights, careerInsights, generateCareerLoading } = useAIStore();
  const [refreshing, setRefreshing] = useState(false);

  const myTasks = tasks.filter((t) => t.assignedTo === user?.id);
  const completedTasks = myTasks.filter((t) => t.status === 'completed');
  const activeTasks = myTasks.filter((t) => t.status === 'in-progress');
  const insight = user ? careerInsights[user.id] : undefined;

  useEffect(() => {
    if (user && !insight) {
      generateCareerInsights(user, tasks);
    }
  }, []);

  const handleRefreshInsights = async () => {
    if (!user || refreshing) return;
    setRefreshing(true);
    await generateCareerInsights(user, tasks);
    setRefreshing(false);
  };

  const stats = [
    {
      title: 'Active Tasks',
      value: activeTasks.length,
      icon: Clock,
      color: 'bg-blue-500',
      change: 'In progress',
    },
    {
      title: 'Completed',
      value: completedTasks.length,
      icon: CheckCircle2,
      color: 'bg-green-500',
      change: 'This month',
    },
    {
      title: 'Rating',
      value: user?.rating.toFixed(1) || '0',
      icon: Award,
      color: 'bg-yellow-500',
      change: 'Average',
    },
    {
      title: 'Skills',
      value: user?.skills.length || 0,
      icon: Target,
      color: 'bg-purple-500',
      change: 'Total skills',
    },
  ];

  const performanceData = [
    { month: 'Jan', tasks: 8, quality: 4.2 },
    { month: 'Feb', tasks: 12, quality: 4.5 },
    { month: 'Mar', tasks: 10, quality: 4.3 },
    { month: 'Apr', tasks: 15, quality: 4.7 },
    { month: 'May', tasks: 18, quality: 4.6 },
    { month: 'Jun', tasks: 20, quality: 4.8 },
  ];

  const skillsRadar =
    user?.skills.slice(0, 6).map((skill) => ({
      skill: skill.name,
      level:
        skill.level === 'expert'
          ? 100
          : skill.level === 'advanced'
            ? 75
            : skill.level === 'intermediate'
              ? 50
              : 25,
    })) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Here's your performance overview and AI-guided growth plan.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-2">{stat.change}</p>
                </div>
                <div className={`${stat.color} p-4 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Performance Trend
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Area type="monotone" dataKey="tasks" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Skills Overview
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={skillsRadar}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="skill" stroke="#9ca3af" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9ca3af" />
              <Radar name="Skill Level" dataKey="level" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          My Active Tasks
        </h2>
        <div className="space-y-4">
          {activeTasks.length > 0 ? (
            activeTasks.map((task) => (
              <div key={task.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{task.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{task.description}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          task.priority === 'urgent'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                            : task.priority === 'high'
                              ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                              : task.priority === 'medium'
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                                : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        }`}
                      >
                        {task.priority}
                      </span>
                      <span className="text-xs text-gray-500">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="w-16 h-16 relative">
                      <svg className="w-16 h-16 transform -rotate-90">
                        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="none" className="text-gray-200 dark:text-gray-700" />
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 28}`}
                          strokeDashoffset={`${2 * Math.PI * 28 * (1 - task.progress / 100)}`}
                          className="text-blue-600 transition-all duration-300"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{task.progress}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">No active tasks at the moment</div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Recent Achievements
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {user?.achievements.map((achievement) => (
            <div key={achievement.id} className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg text-center">
              <div className="text-4xl mb-2">{achievement.icon}</div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{achievement.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{achievement.description}</p>
            </div>
          ))}
          {(!user?.achievements || user.achievements.length === 0) && (
            <div className="col-span-3 text-center py-8 text-gray-500 dark:text-gray-400">
              Complete tasks to earn achievements!
            </div>
          )}
        </div>
      </div>

      <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 shadow-lg border border-indigo-200 dark:border-indigo-800">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Brain className="w-6 h-6 text-indigo-600" />
              AI Career Insights
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Personalized growth recommendations based on your actual task patterns, skill profile, and delivery behavior.
            </p>
          </div>
          <button
            onClick={handleRefreshInsights}
            disabled={refreshing || generateCareerLoading}
            className={`px-4 py-2 text-white rounded-lg transition-all flex items-center gap-2 self-start font-medium shadow-sm
              ${refreshing || generateCareerLoading
                ? 'bg-indigo-400 cursor-not-allowed opacity-80'
                : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-md active:scale-95'
              }`}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing || generateCareerLoading ? 'animate-spin' : ''}`} />
            {refreshing || generateCareerLoading ? 'Refreshing...' : 'Refresh AI Insights'}
          </button>
        </div>

        {generateCareerLoading && !insight ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
            <div className="h-40 bg-white/60 dark:bg-gray-800/60 rounded-xl" />
            <div className="h-40 bg-white/60 dark:bg-gray-800/60 rounded-xl" />
            <div className="h-40 bg-white/60 dark:bg-gray-800/60 rounded-xl" />
          </div>
        ) : insight ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-indigo-100 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Growth Score</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{insight.growthScore}/100</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{insight.workStyle}</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-indigo-100 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                    <Rocket className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Next Role</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{insight.nextRole.title}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Timeline: {insight.nextRole.timeline}</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-indigo-100 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/40 flex items-center justify-center">
                    <Award className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Top Strengths</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{insight.strengths.length}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {insight.strengths.map((strength) => (
                    <span key={strength} className="px-2 py-1 text-xs rounded-full bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200">
                      {strength}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-indigo-100 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Focus Areas</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{insight.focusAreas.length}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {insight.focusAreas.map((area) => (
                    <span key={area} className="px-2 py-1 text-xs rounded-full bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-indigo-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-indigo-600" />
                  Skill Gaps & Growth Priorities
                </h3>
                <div className="space-y-3">
                  {insight.skillGaps.map((gap) => (
                    <div key={gap.skill} className="p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{gap.skill}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{gap.reason}</p>
                        </div>
                        <span
                          className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                            gap.priority === 'high'
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200'
                              : gap.priority === 'medium'
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-200'
                                : 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200'
                          }`}
                        >
                          {gap.priority} priority
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-indigo-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  Recommended Learning Path
                </h3>
                <div className="space-y-3">
                  {insight.courseRecommendations.map((course) => (
                    <a
                      key={course.title}
                      href={course.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block p-4 rounded-lg bg-gray-50 dark:bg-gray-700/60 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border border-gray-200 dark:border-gray-600 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{course.title}</p>
                          <p className="text-xs uppercase tracking-wide text-indigo-600 dark:text-indigo-400 mt-1">{course.provider}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{course.relevance}</p>
                        </div>
                        <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Open ↗</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-indigo-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Weekly AI Goals</h3>
                <ul className="space-y-3">
                  {insight.weeklyGoals.map((goal, index) => (
                    <li key={goal} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                      <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-semibold mt-0.5">
                        {index + 1}
                      </span>
                      <span>{goal}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-indigo-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI Efficiency Tips</h3>
                <div className="space-y-3">
                  {insight.efficiencyTips.map((tip) => (
                    <div key={tip} className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-sm text-gray-700 dark:text-gray-300 border border-blue-100 dark:border-blue-800">
                      {tip}
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                  <p className="text-sm font-semibold">Promotion Insight</p>
                  <p className="text-sm text-indigo-50 mt-1">{insight.nextRole.reason}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-600 dark:text-gray-400">
            AI insights are not available yet. Click refresh to generate them.
          </div>
        )}
      </div>
    </div>
  );
}
