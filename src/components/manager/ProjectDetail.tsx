import { useState, useMemo } from 'react';
import { useTaskStore } from '../../store/taskStore';
import { useAuthStore } from '../../store/authStore';
import { ArrowLeft, Users, CheckCircle, Clock, Target, TrendingUp, Award, Calendar, BarChart3, PieChart, User, MessageSquare, MessageCircle, UserPlus, UserMinus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import ProjectChat from '../chat/ProjectChat';

interface ProjectDetailProps {
  projectId: string;
  onBack: () => void;
}

export default function ProjectDetail({ projectId, onBack }: ProjectDetailProps) {
  const { projects, getTasksByProject, addMemberToProject, removeMemberFromProject } = useTaskStore();
  const { user: currentUser } = useAuthStore();
  const [selectedView, setSelectedView] = useState<'overview' | 'members' | 'timeline'>('overview');
  const [showGroupChat, setShowGroupChat] = useState(false);
  const [showIndividualChat, setShowIndividualChat] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  
  const project = projects.find(p => p.id === projectId);
  const projectTasks = getTasksByProject(projectId);
  
  if (!project) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Project not found</p>
          <button onClick={onBack} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Mock user data for team members
  const teamMembersData = [
    { id: '2', name: 'Sarah Developer', role: 'Frontend Developer', avatar: '👩‍💻', skills: ['React', 'TypeScript', 'CSS'] },
    { id: '3', name: 'Alex Designer', role: 'UI/UX Designer', avatar: '👨‍🎨', skills: ['Figma', 'UI/UX', 'Prototyping'] },
    { id: '4', name: 'Mike Backend', role: 'Backend Developer', avatar: '👨‍💼', skills: ['Node.js', 'MongoDB', 'Express'] },
    { id: '5', name: 'Emma QA', role: 'Quality Assurance', avatar: '👩‍🔬', skills: ['Testing', 'Automation', 'Jest'] },
    { id: '6', name: 'David DevOps', role: 'DevOps Engineer', avatar: '👨‍🔧', skills: ['Docker', 'AWS', 'CI/CD'] },
    { id: '7', name: 'Lisa Product', role: 'Product Manager', avatar: '👩‍💼', skills: ['Agile', 'Scrum', 'Planning'] },
  ];

  const projectTeam = teamMembersData.filter(member => 
    project.teamMembers.includes(member.id) || project.managerId === member.id
  );

  // Calculate member statistics
  const memberStats = useMemo(() => {
    return projectTeam.map(member => {
      const memberTasks = projectTasks.filter(t => t.assignedTo === member.id);
      const completedTasks = memberTasks.filter(t => t.status === 'completed');
      const inProgressTasks = memberTasks.filter(t => t.status === 'in-progress');
      const totalTasks = memberTasks.length;
      
      const avgCompletion = totalTasks > 0 
        ? Math.round(memberTasks.reduce((sum, t) => sum + t.progress, 0) / totalTasks)
        : 0;
      
      const completedPercent = totalTasks > 0 
        ? Math.round((completedTasks.length / totalTasks) * 100)
        : 0;
      
      const totalHours = memberTasks.reduce((sum, t) => sum + t.actualTime, 0);
      const avgQuality = completedTasks.length > 0
        ? (completedTasks.reduce((sum, t) => sum + t.quality, 0) / completedTasks.length).toFixed(1)
        : '0.0';
      
      const tasksByPriority = {
        urgent: memberTasks.filter(t => t.priority === 'urgent').length,
        high: memberTasks.filter(t => t.priority === 'high').length,
        medium: memberTasks.filter(t => t.priority === 'medium').length,
        low: memberTasks.filter(t => t.priority === 'low').length,
      };

      const skillsUsed = Array.from(new Set(
        memberTasks.flatMap(t => t.updates.flatMap(u => u.skillsUsed))
      ));

      return {
        ...member,
        totalTasks,
        completedTasks: completedTasks.length,
        inProgressTasks: inProgressTasks.length,
        avgCompletion,
        completedPercent,
        totalHours: totalHours.toFixed(1),
        avgQuality,
        tasksByPriority,
        skillsUsed: skillsUsed.length > 0 ? skillsUsed : member.skills,
        recentTasks: memberTasks.slice(0, 3),
      };
    });
  }, [projectTeam, projectTasks]);

  // Project overall stats
  const projectStats = useMemo(() => {
    const totalTasks = projectTasks.length;
    const completedTasks = projectTasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = projectTasks.filter(t => t.status === 'in-progress').length;
    const todoTasks = projectTasks.filter(t => t.status === 'todo').length;
    
    const overallProgress = totalTasks > 0 
      ? Math.round(projectTasks.reduce((sum, t) => sum + t.progress, 0) / totalTasks)
      : 0;
    
    const totalEstimatedHours = projectTasks.reduce((sum, t) => sum + t.estimatedTime, 0);
    const totalActualHours = projectTasks.reduce((sum, t) => sum + t.actualTime, 0);
    const efficiency = totalEstimatedHours > 0 
      ? Math.round((totalEstimatedHours / Math.max(totalActualHours, 1)) * 100)
      : 100;

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      overallProgress,
      totalEstimatedHours,
      totalActualHours: totalActualHours.toFixed(1),
      efficiency,
    };
  }, [projectTasks]);

  // Data for charts
  const memberPerformanceData = memberStats.map(member => ({
    name: member.name.split(' ')[0],
    completion: member.completedPercent,
    tasks: member.totalTasks,
    quality: parseFloat(member.avgQuality) * 20, // Scale to 100
  }));

  const taskStatusData = [
    { name: 'Completed', value: projectStats.completedTasks, color: '#10B981' },
    { name: 'In Progress', value: projectStats.inProgressTasks, color: '#3B82F6' },
    { name: 'To Do', value: projectStats.todoTasks, color: '#6B7280' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} className="text-gray-600 dark:text-gray-400" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{project.name}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{project.description}</p>
        </div>
        <button
          onClick={() => setShowGroupChat(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
        >
          <MessageSquare size={18} />
          Group Chat
        </button>
        <div className={`px-4 py-2 rounded-lg text-sm font-medium ${
          project.status === 'active' 
            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
        }`}>
          {project.status.toUpperCase()}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Overall Progress</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{projectStats.overallProgress}%</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
              <Target className="w-6 h-6 text-blue-600 dark:text-blue-300" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${projectStats.overallProgress}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{projectStats.totalTasks}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {projectStats.completedTasks} completed
              </p>
            </div>
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-300" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Team Members</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{projectTeam.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Active contributors</p>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
              <Users className="w-6 h-6 text-purple-600 dark:text-purple-300" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Hours Logged</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{projectStats.totalActualHours}h</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                ~{projectStats.totalEstimatedHours}h estimated
              </p>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-300" />
            </div>
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {(['overview', 'members', 'timeline'] as const).map((view) => (
          <button
            key={view}
            onClick={() => setSelectedView(view)}
            className={`px-6 py-3 font-medium capitalize transition-colors relative ${
              selectedView === view
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {view === 'overview' && <BarChart3 size={18} className="inline mr-2" />}
            {view === 'members' && <Users size={18} className="inline mr-2" />}
            {view === 'timeline' && <Calendar size={18} className="inline mr-2" />}
            {view}
            {selectedView === view && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"></div>
            )}
          </button>
        ))}
      </div>

      {/* Content based on selected view */}
      {selectedView === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Member Performance Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp size={20} />
              Team Performance Comparison
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={memberPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Bar dataKey="completion" fill="#3B82F6" name="Completion %" radius={[8, 8, 0, 0]} />
                <Bar dataKey="quality" fill="#10B981" name="Quality Score" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Task Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <PieChart size={20} />
              Task Status Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>

          {/* Manager Contribution Highlight */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 shadow-lg lg:col-span-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Award size={20} className="text-yellow-500" />
              Manager Contribution in this Project
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Tasks Assigned</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {projectTasks.filter(t => t.assignedBy === currentUser?.id).length}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">By you</p>
              </div>
              <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Task Completion Time</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">4.2 days</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">↓ 15% faster than average</p>
              </div>
              <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Team Satisfaction</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">4.8/5</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Based on feedback</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedView === 'members' && (
        <div className="space-y-4">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowAddMemberModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlus size={18} /> Add Member
            </button>
          </div>
          {memberStats.map((member, index) => (
            <div key={member.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                {/* Member Info */}
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative">
                    <div className="text-4xl">{member.avatar}</div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{member.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{member.role}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {member.skillsUsed.slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="text-xs px-2 py-1 bg-blue-600 text-white rounded font-medium shadow-sm">
                          {skill}
                        </span>
                      ))}
                      {member.skillsUsed.length > 3 && (
                        <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                          +{member.skillsUsed.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="ml-auto flex flex-col gap-2 sm:flex-row">
                    <button
                      onClick={() => {
                        setSelectedMember(member);
                        setShowIndividualChat(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors font-medium"
                    >
                      <MessageCircle size={16} />
                      Chat
                    </button>
                    {project.managerId !== member.id && (
                      <button
                        onClick={() => removeMemberFromProject(project.id, member.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors font-medium"
                      >
                        <UserMinus size={16} />
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress Circle */}
                <div className="flex items-center gap-6">
                  <div className="relative w-24 h-24">
                    <svg className="transform -rotate-90 w-24 h-24">
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                        fill="none"
                        className="dark:stroke-gray-700"
                      />
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke={index % 2 === 0 ? '#3B82F6' : '#10B981'}
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - member.completedPercent / 100)}`}
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">{member.completedPercent}%</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Complete</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 min-w-[200px]">
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Total Tasks</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{member.totalTasks}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Completed</p>
                      <p className="text-xl font-bold text-green-600 dark:text-green-400">{member.completedTasks}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Hours Logged</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{member.totalHours}h</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Quality</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{member.avgQuality}/5</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Task Priority Breakdown */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Task Priority Distribution</p>
                <div className="flex gap-2">
                  {Object.entries(member.tasksByPriority).map(([priority, count]) => (
                    count > 0 && (
                      <div key={priority} className={`flex-1 text-center py-2 px-3 rounded-lg text-xs font-medium ${
                        priority === 'urgent' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                        priority === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
                        priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                        'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        <div className="capitalize font-semibold">{priority}</div>
                        <div className="text-lg font-bold">{count}</div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedView === 'timeline' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Calendar size={20} />
            Project Timeline & Activity
          </h3>
          
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
            
            <div className="space-y-6">
              {projectTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="relative flex gap-4">
                  <div className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center ${
                    task.status === 'completed' ? 'bg-green-100 dark:bg-green-900' :
                    task.status === 'in-progress' ? 'bg-blue-100 dark:bg-blue-900' :
                    'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    {task.status === 'completed' ? (
                      <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-300" />
                    ) : task.status === 'in-progress' ? (
                      <Clock className="w-8 h-8 text-blue-600 dark:text-blue-300" />
                    ) : (
                      <User className="w-8 h-8 text-gray-600 dark:text-gray-300" />
                    )}
                  </div>
                  
                  <div className="flex-1 pb-6">
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{task.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded ${
                          task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                          task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{task.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>Assigned to: {teamMembersData.find(m => m.id === task.assignedTo)?.name || 'Unknown'}</span>
                        <span>•</span>
                        <span>{task.progress}% complete</span>
                        <span>•</span>
                        <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full transition-all ${
                              task.status === 'completed' ? 'bg-green-500' :
                              task.status === 'in-progress' ? 'bg-blue-500' :
                              'bg-gray-400'
                            }`}
                            style={{ width: `${task.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Group Chat Modal */}
      <ProjectChat
        isOpen={showGroupChat}
        onClose={() => setShowGroupChat(false)}
        chatType="group"
        projectName={project.name}
        participants={projectTeam.map(m => ({
          id: m.id,
          name: m.name,
          avatar: m.avatar,
          role: m.role,
          isOnline: Math.random() > 0.3
        }))}
        currentUserId={currentUser?.id || '1'}
      />

      {/* Individual Chat Modal */}
      {selectedMember && (
        <ProjectChat
          isOpen={showIndividualChat}
          onClose={() => {
            setShowIndividualChat(false);
            setSelectedMember(null);
          }}
          chatType="individual"
          projectName={project.name}
          participants={[{
            id: selectedMember.id,
            name: selectedMember.name,
            avatar: selectedMember.avatar,
            role: selectedMember.role,
            isOnline: true
          }]}
          currentUserId={currentUser?.id || '1'}
        />
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add Team Member</h2>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {teamMembersData.filter(m => !project.teamMembers.includes(m.id) && project.managerId !== m.id).length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">All available members are already in this project.</p>
              ) : (
                teamMembersData.filter(m => !project.teamMembers.includes(m.id) && project.managerId !== m.id).map(member => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{member.avatar}</span>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{member.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{member.role}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        addMemberToProject(project.id, member.id);
                        setShowAddMemberModal(false);
                      }}
                      className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      Add
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowAddMemberModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
