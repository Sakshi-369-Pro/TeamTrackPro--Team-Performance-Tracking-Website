import { Users, FolderKanban, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useTaskStore } from '../../store/taskStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function ManagerDashboard() {
  const { tasks, projects } = useTaskStore();

  const stats = [
    {
      title: 'Total Projects',
      value: projects.length,
      icon: FolderKanban,
      color: 'bg-blue-500',
      change: '+2 this month',
    },
    {
      title: 'Active Tasks',
      value: tasks.filter(t => t.status === 'in-progress').length,
      icon: Clock,
      color: 'bg-yellow-500',
      change: '12 in progress',
    },
    {
      title: 'Completed Tasks',
      value: tasks.filter(t => t.status === 'completed').length,
      icon: CheckCircle,
      color: 'bg-green-500',
      change: '+5 this week',
    },
    {
      title: 'Team Members',
      value: '8',
      icon: Users,
      color: 'bg-purple-500',
      change: '6 active now',
    },
  ];

  const taskDistribution = [
    { name: 'To Do', value: tasks.filter(t => t.status === 'todo').length, color: '#94a3b8' },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'in-progress').length, color: '#fbbf24' },
    { name: 'Review', value: tasks.filter(t => t.status === 'review').length, color: '#60a5fa' },
    { name: 'Completed', value: tasks.filter(t => t.status === 'completed').length, color: '#34d399' },
  ];

  const weeklyProgress = [
    { day: 'Mon', completed: 4, started: 3 },
    { day: 'Tue', completed: 6, started: 5 },
    { day: 'Wed', completed: 5, started: 4 },
    { day: 'Thu', completed: 8, started: 6 },
    { day: 'Fri', completed: 7, started: 5 },
    { day: 'Sat', completed: 3, started: 2 },
    { day: 'Sun', completed: 2, started: 1 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manager Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Overview of your projects and team performance
        </p>
      </div>

      {/* Stats Grid */}
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
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {stat.value}
                  </p>
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Weekly Progress
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyProgress}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: '#fff'
                }} 
              />
              <Bar dataKey="completed" fill="#34d399" radius={[8, 8, 0, 0]} />
              <Bar dataKey="started" fill="#60a5fa" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Task Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Task Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={taskDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {taskDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h2>
        <div className="space-y-4">
          {tasks.slice(0, 5).map((task) => (
            <div key={task.id} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className={`p-2 rounded-lg ${
                task.status === 'completed' ? 'bg-green-100 dark:bg-green-900' :
                task.status === 'in-progress' ? 'bg-yellow-100 dark:bg-yellow-900' :
                'bg-gray-100 dark:bg-gray-600'
              }`}>
                {task.status === 'completed' ? (
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : task.status === 'in-progress' ? (
                  <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white">{task.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {task.description}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs text-gray-500">Priority: {task.priority}</span>
                  <span className="text-xs text-gray-500">Progress: {task.progress}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Projects */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Active Projects
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project) => (
            <div key={project.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-900 dark:text-white">{project.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{project.description}</p>
              <div className="flex items-center gap-2 mt-3">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {project.teamMembers.length} members
                </span>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Progress</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {Math.floor(Math.random() * 40 + 40)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.floor(Math.random() * 40 + 40)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
