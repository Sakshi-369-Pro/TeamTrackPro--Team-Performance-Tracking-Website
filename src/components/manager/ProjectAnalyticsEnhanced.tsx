import { useMemo, useState } from 'react';
import { useTaskStore } from '../../store/taskStore';
import { TrendingUp, TrendingDown, Users, Target, Award, Briefcase, BarChart3, Activity, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, AreaChart, Area } from 'recharts';

export default function ProjectAnalyticsEnhanced() {
  const { projects, getTasksByProject } = useTaskStore();
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  
  const projectAnalytics = useMemo(() => {
    return projects.map(project => {
      const projectTasks = getTasksByProject(project.id);
      const completedTasks = projectTasks.filter(t => t.status === 'completed');
      const inProgressTasks = projectTasks.filter(t => t.status === 'in-progress');
      
      const totalEstimated = projectTasks.reduce((sum, t) => sum + t.estimatedTime, 0);
      const totalActual = projectTasks.reduce((sum, t) => sum + t.actualTime, 0);
      const avgProgress = projectTasks.length > 0
        ? Math.round(projectTasks.reduce((sum, t) => sum + t.progress, 0) / projectTasks.length)
        : 0;
      
      const completionRate = projectTasks.length > 0
        ? Math.round((completedTasks.length / projectTasks.length) * 100)
        : 0;
      
      const qualityScore = completedTasks.length > 0
        ? completedTasks.reduce((sum, t) => sum + t.quality, 0) / completedTasks.length
        : 0;
      
      // Calculate growth (mock comparison with previous period)
      const growthRate = Math.floor(Math.random() * 30) - 10; // -10% to +20%
      
      // Team member contributions
      const memberContributions = new Map<string, { name: string; tasks: number; hours: number; completion: number }>();
      
      projectTasks.forEach(task => {
        const memberId = task.assignedTo;
        const memberNames: Record<string, string> = {
          '2': 'Sarah Developer',
          '3': 'Alex Designer',
          '4': 'Mike Backend',
          '5': 'Emma QA'
        };
        
        if (!memberContributions.has(memberId)) {
          memberContributions.set(memberId, {
            name: memberNames[memberId] || 'Unknown',
            tasks: 0,
            hours: 0,
            completion: 0
          });
        }
        
        const contrib = memberContributions.get(memberId)!;
        contrib.tasks += 1;
        contrib.hours += task.actualTime;
        contrib.completion += task.progress;
      });
      
      const teamData = Array.from(memberContributions.values()).map(c => ({
        ...c,
        avgCompletion: c.tasks > 0 ? Math.round(c.completion / c.tasks) : 0,
        hours: Number(c.hours.toFixed(1))
      }));
      
      // Project timeline data (last 6 months)
      const timelineData = [
        { month: 'Jul', progress: 15, tasks: 5 },
        { month: 'Aug', progress: 28, tasks: 8 },
        { month: 'Sep', progress: 42, tasks: 12 },
        { month: 'Oct', progress: 58, tasks: 15 },
        { month: 'Nov', progress: avgProgress - 10, tasks: projectTasks.length - 2 },
        { month: 'Dec', progress: avgProgress, tasks: projectTasks.length },
      ];
      
      // Skill distribution for this project
      const allSkills = projectTasks.flatMap(t => t.skillsRequired);
      const skillCounts = allSkills.reduce((acc, skill) => {
        acc[skill] = (acc[skill] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const skillsData = Object.entries(skillCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
      
      return {
        id: project.id,
        name: project.name,
        totalTasks: projectTasks.length,
        completedTasks: completedTasks.length,
        inProgressTasks: inProgressTasks.length,
        avgProgress,
        completionRate,
        qualityScore: qualityScore.toFixed(1),
        totalEstimated,
        totalActual: Number(totalActual.toFixed(1)),
        efficiency: totalEstimated > 0 ? Math.round((totalEstimated / Math.max(totalActual, 1)) * 100) : 100,
        growthRate,
        teamData,
        timelineData,
        skillsData,
        startDate: project.startDate,
      };
    });
  }, [projects, getTasksByProject]);

  const selectedProject = projectAnalytics.find(p => p.id === selectedProjectId) || projectAnalytics[0];

  if (!selectedProject) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-600 dark:text-gray-400">No projects available</p>
      </div>
    );
  }

  // Radar chart data for project health
  const healthData = [
    { metric: 'Progress', value: selectedProject.avgProgress },
    { metric: 'Quality', value: parseFloat(selectedProject.qualityScore) * 20 },
    { metric: 'Efficiency', value: Math.min(selectedProject.efficiency, 100) },
    { metric: 'Team Size', value: Math.min((selectedProject.teamData.length / 5) * 100, 100) },
    { metric: 'Completion', value: selectedProject.completionRate },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Project Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Project Analytics & Performance</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Detailed performance metrics and team contribution analysis</p>
        </div>
        <select
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {projects.map(project => (
            <option key={project.id} value={project.id}>{project.name}</option>
          ))}
        </select>
      </div>

      {/* Performance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <Briefcase className="w-8 h-8 opacity-80" />
            <div className={`flex items-center gap-1 text-sm ${selectedProject.growthRate >= 0 ? 'text-green-200' : 'text-red-200'}`}>
              {selectedProject.growthRate >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {Math.abs(selectedProject.growthRate)}%
            </div>
          </div>
          <p className="text-blue-100 text-sm">Project Progress</p>
          <p className="text-3xl font-bold mt-1">{selectedProject.avgProgress}%</p>
          <p className="text-xs text-blue-200 mt-2">{selectedProject.completedTasks}/{selectedProject.totalTasks} tasks completed</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <Target className="w-8 h-8 opacity-80" />
            <Award className="w-5 h-5 text-green-200" />
          </div>
          <p className="text-green-100 text-sm">Quality Score</p>
          <p className="text-3xl font-bold mt-1">{selectedProject.qualityScore}/5</p>
          <p className="text-xs text-green-200 mt-2">Average task quality</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <Users className="w-8 h-8 opacity-80" />
            <span className="text-xs bg-white/20 px-2 py-1 rounded">{selectedProject.teamData.length} members</span>
          </div>
          <p className="text-purple-100 text-sm">Team Efficiency</p>
          <p className="text-3xl font-bold mt-1">{selectedProject.efficiency}%</p>
          <p className="text-xs text-purple-200 mt-2">{selectedProject.totalActual}h / {selectedProject.totalEstimated}h estimated</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <Zap className="w-8 h-8 opacity-80" />
            <Activity className="w-5 h-5 text-orange-200" />
          </div>
          <p className="text-orange-100 text-sm">Completion Rate</p>
          <p className="text-3xl font-bold mt-1">{selectedProject.completionRate}%</p>
          <p className="text-xs text-orange-200 mt-2">{selectedProject.inProgressTasks} in progress</p>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Growth Timeline */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-blue-600" />
            Project Growth Over Time
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={selectedProject.timelineData}>
              <defs>
                <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="progress" stroke="#3B82F6" fillOpacity={1} fill="url(#colorProgress)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Project Health Radar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Activity size={20} className="text-purple-600" />
            Project Health Metrics
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={healthData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="metric" stroke="#6b7280" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#6b7280" />
              <Radar name="Health Score" dataKey="value" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} strokeWidth={2} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Team Member Contribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Users size={20} className="text-green-600" />
            Team Member Contributions
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={selectedProject.teamData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" stroke="#6b7280" />
              <YAxis dataKey="name" type="category" width={100} stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Bar dataKey="tasks" fill="#10B981" name="Tasks Assigned" radius={[0, 8, 8, 0]} />
              <Bar dataKey="avgCompletion" fill="#3B82F6" name="Avg Completion %" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Skills Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Zap size={20} className="text-orange-600" />
            Skills Required in Project
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={selectedProject.skillsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="value" fill="#F59E0B" name="Usage Count" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Team Member Contribution Details */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <Users size={20} />
          Individual Member Performance Breakdown
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedProject.teamData.map((member, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900 dark:text-white">{member.name}</h4>
                <div className={`w-3 h-3 rounded-full ${
                  member.avgCompletion >= 80 ? 'bg-green-500' :
                  member.avgCompletion >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Tasks Assigned</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{member.tasks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Hours Logged</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{member.hours}h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Avg Completion</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{member.avgCompletion}%</span>
                </div>
              </div>
              
              <div className="mt-3">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      member.avgCompletion >= 80 ? 'bg-green-500' :
                      member.avgCompletion >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${member.avgCompletion}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Manager Contribution Section */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Award size={24} />
          Your Contribution as Project Manager
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <p className="text-indigo-100 text-sm">Projects Managed</p>
            <p className="text-2xl font-bold mt-1">{projects.length}</p>
            <p className="text-xs text-indigo-200 mt-1">Active: {projects.filter(p => p.status === 'active').length}</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <p className="text-indigo-100 text-sm">Team Members Led</p>
            <p className="text-2xl font-bold mt-1">{selectedProject.teamData.length}</p>
            <p className="text-xs text-indigo-200 mt-1">In {selectedProject.name}</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <p className="text-indigo-100 text-sm">Tasks Delegated</p>
            <p className="text-2xl font-bold mt-1">{selectedProject.totalTasks}</p>
            <p className="text-xs text-indigo-200 mt-1">{selectedProject.completedTasks} completed</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <p className="text-indigo-100 text-sm">Project Success Rate</p>
            <p className="text-2xl font-bold mt-1">{selectedProject.completionRate}%</p>
            <p className="text-xs text-indigo-200 mt-1">Above team average</p>
          </div>
        </div>
      </div>
    </div>
  );
}
