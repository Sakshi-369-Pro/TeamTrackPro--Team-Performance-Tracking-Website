import { Trophy, Medal, Star, TrendingUp, Award, Zap } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  score: number;
  tasksCompleted: number;
  rating: number;
  badges: string[];
  trend: 'up' | 'down' | 'stable';
}

const leaderboardData: LeaderboardEntry[] = [
  {
    id: '3',
    name: 'Alex Backend',
    avatar: '👨‍💻',
    score: 9750,
    tasksCompleted: 52,
    rating: 4.9,
    badges: ['Fast Finisher', 'Quality Star', 'Team Contributor'],
    trend: 'up',
  },
  {
    id: '2',
    name: 'Sarah Developer',
    avatar: '👩‍💻',
    score: 9250,
    tasksCompleted: 45,
    rating: 4.8,
    badges: ['Fast Finisher', 'Problem Solver'],
    trend: 'stable',
  },
  {
    id: '4',
    name: 'Emma QA',
    avatar: '🔍',
    score: 8900,
    tasksCompleted: 41,
    rating: 4.7,
    badges: ['Quality Star'],
    trend: 'up',
  },
  {
    id: '5',
    name: 'Mike Designer',
    avatar: '🎨',
    score: 8500,
    tasksCompleted: 38,
    rating: 4.6,
    badges: ['Team Contributor'],
    trend: 'down',
  },
];

const badgeIcons: Record<string, string> = {
  'Fast Finisher': '⚡',
  'Quality Star': '⭐',
  'Team Contributor': '🤝',
  'Problem Solver': '🧩',
};

export default function Leaderboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Trophy className="w-8 h-8 text-yellow-500" />
          Team Leaderboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Top performers of this month
        </p>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* 2nd Place */}
        <div className="order-2 md:order-1">
          <div className="bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded-2xl p-6 text-center transform md:translate-y-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center text-4xl">
              {leaderboardData[1].avatar}
            </div>
            <Medal className="w-12 h-12 mx-auto mb-2 text-gray-500" />
            <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-1">
              {leaderboardData[1].name}
            </h3>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-500 mb-2">
              {leaderboardData[1].score.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {leaderboardData[1].tasksCompleted} tasks
            </p>
          </div>
        </div>

        {/* 1st Place */}
        <div className="order-1 md:order-2">
          <div className="bg-gradient-to-br from-yellow-100 to-orange-200 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-2xl p-6 text-center border-4 border-yellow-400 dark:border-yellow-600">
            <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-5xl shadow-lg">
              {leaderboardData[0].avatar}
            </div>
            <Trophy className="w-16 h-16 mx-auto mb-2 text-yellow-500" />
            <h3 className="font-bold text-2xl text-gray-900 dark:text-white mb-1">
              {leaderboardData[0].name}
            </h3>
            <p className="text-4xl font-bold text-yellow-600 dark:text-yellow-500 mb-2">
              {leaderboardData[0].score.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {leaderboardData[0].tasksCompleted} tasks
            </p>
          </div>
        </div>

        {/* 3rd Place */}
        <div className="order-3">
          <div className="bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded-2xl p-6 text-center transform md:translate-y-12">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center text-4xl">
              {leaderboardData[2].avatar}
            </div>
            <Medal className="w-12 h-12 mx-auto mb-2 text-orange-500" />
            <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-1">
              {leaderboardData[2].name}
            </h3>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-500 mb-2">
              {leaderboardData[2].score.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {leaderboardData[2].tasksCompleted} tasks
            </p>
          </div>
        </div>
      </div>

      {/* Full Leaderboard */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
          <h2 className="text-xl font-semibold text-white">Full Rankings</h2>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {leaderboardData.map((entry, index) => (
            <div
              key={entry.id}
              className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                index < 3 ? 'bg-gradient-to-r from-yellow-50/50 to-orange-50/50 dark:from-yellow-900/10 dark:to-orange-900/10' : ''
              }`}
            >
              <div className="flex items-center gap-6">
                {/* Rank */}
                <div className="flex-shrink-0 w-12 text-center">
                  {index === 0 && <Trophy className="w-8 h-8 text-yellow-500 mx-auto" />}
                  {index === 1 && <Medal className="w-8 h-8 text-gray-500 mx-auto" />}
                  {index === 2 && <Medal className="w-8 h-8 text-orange-500 mx-auto" />}
                  {index > 2 && (
                    <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                  )}
                </div>

                {/* Avatar & Name */}
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-3xl">
                    {entry.avatar}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                      {entry.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {entry.rating} rating
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="hidden md:flex items-center gap-8">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {entry.score.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">Score</p>
                  </div>

                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {entry.tasksCompleted}
                    </p>
                    <p className="text-xs text-gray-500">Tasks</p>
                  </div>

                  <div className="flex items-center gap-1">
                    {entry.trend === 'up' && <TrendingUp className="w-5 h-5 text-green-500" />}
                    {entry.trend === 'down' && <TrendingUp className="w-5 h-5 text-red-500 transform rotate-180" />}
                    {entry.trend === 'stable' && <div className="w-5 h-0.5 bg-gray-400" />}
                  </div>
                </div>

                {/* Badges */}
                <div className="hidden lg:flex gap-2">
                  {entry.badges.map(badge => (
                    <div
                      key={badge}
                      className="px-3 py-1 bg-purple-600 text-white rounded-full text-xs font-medium flex items-center gap-1 shadow-sm"
                      title={badge}
                    >
                      <span>{badgeIcons[badge]}</span>
                      <span className="hidden xl:inline">{badge}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievement Badges */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Award className="w-6 h-6 text-purple-600" />
          Achievement Badges
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(badgeIcons).map(([badge, icon]) => (
            <div
              key={badge}
              className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg text-center border-2 border-purple-200 dark:border-purple-800"
            >
              <div className="text-4xl mb-2">{icon}</div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                {badge}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {badge === 'Fast Finisher' && 'Complete tasks ahead of schedule'}
                {badge === 'Quality Star' && 'Maintain high quality ratings'}
                {badge === 'Team Contributor' && 'Help teammates succeed'}
                {badge === 'Problem Solver' && 'Solve complex challenges'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Challenge */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl p-6 shadow-lg text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Zap className="w-6 h-6" />
              Monthly Challenge
            </h2>
            <p className="text-white/90 mb-4">
              Complete 10 high-priority tasks to unlock the "Elite Performer" badge!
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-3 bg-white/20 rounded-full overflow-hidden max-w-xs">
                <div className="h-full bg-white rounded-full" style={{ width: '70%' }} />
              </div>
              <span className="font-semibold">7/10</span>
            </div>
          </div>
          <div className="hidden md:block text-6xl">🏆</div>
        </div>
      </div>
    </div>
  );
}
