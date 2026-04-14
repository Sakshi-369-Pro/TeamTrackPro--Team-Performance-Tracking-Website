import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTaskStore } from '../../store/taskStore';
import { useAuthStore } from '../../store/authStore';
import { CheckCircle2, TrendingUp, Clock, Calendar } from 'lucide-react';

export default function MemberProgress() {
  const { user } = useAuthStore();
  const { tasks } = useTaskStore();

  const myTasks = tasks.filter((t) => t.assignedTo === user?.id);
  const completed = myTasks.filter((t) => t.status === 'completed');
  const totalHours = myTasks.reduce((acc, t) => acc + t.actualTime, 0);

  const progressData = [
    { name: 'Week 1', tasks: 2, hours: 8, efficiency: 80 },
    { name: 'Week 2', tasks: 5, hours: 15, efficiency: 85 },
    { name: 'Week 3', tasks: 3, hours: 12, efficiency: 90 },
    { name: 'Week 4', tasks: 6, hours: 18, efficiency: 88 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Progress Hub</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track your growth and efficiency over time</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total My Tasks</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{myTasks.length}</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-300" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed Tasks</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{completed.length}</p>
            </div>
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-300" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Hours Tracked</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{Math.round(totalHours)}h</p>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-300" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Rating Scale</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{user?.rating.toFixed(1)}/5.0</p>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-300" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Task Efficiency Tracking</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={progressData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="efficiency" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} name="Efficiency Rating" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Hourly Time Burndown</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={progressData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="hours" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Hours Worked" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
