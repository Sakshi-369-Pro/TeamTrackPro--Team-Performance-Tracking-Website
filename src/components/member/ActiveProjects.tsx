import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useTaskStore } from '../../store/taskStore';
import {
  FolderKanban, Users, CheckCircle2, Clock,
  MessageSquare, ChevronRight, BarChart3, Target, Calendar,
  TrendingUp, Star, Zap, Search,
  Activity
} from 'lucide-react';
import ProjectChat from '../chat/ProjectChat';

const ALL_MEMBERS: Record<string, { name: string; role: string; avatar: string; availability: string }> = {
  '1': { name: 'John Manager',    role: 'Project Manager', avatar: 'JM', availability: 'available' },
  '2': { name: 'Sarah Developer', role: 'Frontend Dev',    avatar: 'SD', availability: 'available' },
  '3': { name: 'Mike Designer',   role: 'UI/UX Designer',  avatar: 'MD', availability: 'busy'      },
  '4': { name: 'Alex Backend',    role: 'Backend Dev',     avatar: 'AB', availability: 'available' },
  '5': { name: 'Emma QA',         role: 'QA Engineer',     avatar: 'EQ', availability: 'offline'   },
};

const AVATAR_COLORS: Record<string, string> = {
  '1': 'from-purple-500 to-indigo-600',
  '2': 'from-blue-500 to-cyan-600',
  '3': 'from-pink-500 to-rose-600',
  '4': 'from-green-500 to-emerald-600',
  '5': 'from-orange-500 to-amber-600',
};

const STATUS_COLORS: Record<string, string> = {
  available: 'bg-green-500',
  busy:      'bg-yellow-500',
  offline:   'bg-gray-400',
};

const TASK_STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  'todo':        { bg: 'bg-gray-600',          text: 'text-white',   label: 'To Do'       },
  'in-progress': { bg: 'bg-blue-600',          text: 'text-white',   label: 'In Progress' },
  'review':      { bg: 'bg-yellow-600',        text: 'text-white',   label: 'In Review'   },
  'completed':   { bg: 'bg-green-600',         text: 'text-white',   label: 'Completed'   },
};

const PRIORITY_DOT: Record<string, string> = {
  urgent: 'bg-red-500',
  high:   'bg-orange-500',
  medium: 'bg-yellow-500',
  low:    'bg-green-500',
};

interface ChatConfig {
  isGroup: boolean;
  projectName: string;
  participants: { id: string; name: string; avatar: string; role: string; isOnline: boolean }[];
}

export default function ActiveProjects() {
  const { user } = useAuthStore();
  const { projects, tasks } = useTaskStore();

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'mytasks' | 'team' | 'timeline'>('overview');
  const [chatConfig, setChatConfig] = useState<ChatConfig | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const myProjects = projects.filter(
    (p) => p.teamMembers.includes(user?.id ?? '') && p.status === 'active'
  );

  const filteredProjects = myProjects.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentProject = selectedProjectId ? projects.find(p => p.id === selectedProjectId) ?? null : null;
  const projectTasks     = selectedProjectId ? tasks.filter(t => t.projectId === selectedProjectId) : [];
  const myProjectTasks   = projectTasks.filter(t => t.assignedTo === (user?.id ?? ''));
  const completedTasks   = projectTasks.filter(t => t.status === 'completed');
  const myCompletedTasks = myProjectTasks.filter(t => t.status === 'completed');

  const overallProgress = projectTasks.length > 0
    ? Math.round((completedTasks.length / projectTasks.length) * 100) : 0;
  const myProgress = myProjectTasks.length > 0
    ? Math.round((myCompletedTasks.length / myProjectTasks.length) * 100) : 0;

  const getSkillsForProject = (memberId: string, projectId: string) => {
    const memberTasks = tasks.filter(t => t.projectId === projectId && t.assignedTo === memberId);
    const skills = new Set<string>();
    memberTasks.forEach(t => t.skillsRequired.forEach(s => skills.add(s)));
    return Array.from(skills).slice(0, 3);
  };

  const getMemberStats = (memberId: string, projectId: string) => {
    const memberTasks = tasks.filter(t => t.projectId === projectId && t.assignedTo === memberId);
    const completed   = memberTasks.filter(t => t.status === 'completed').length;
    const avgProgress = memberTasks.length > 0
      ? Math.round(memberTasks.reduce((s, t) => s + t.progress, 0) / memberTasks.length) : 0;
    const totalHours  = memberTasks.reduce((s, t) => s + t.actualTime, 0);
    return { total: memberTasks.length, completed, avgProgress, totalHours };
  };

  const buildParticipants = (memberIds: string[], includeManager = true) => {
    const ids = includeManager ? ['1', ...memberIds] : memberIds;
    return ids.map(id => {
      const m = ALL_MEMBERS[id] ?? { name: 'Unknown', role: 'Member', avatar: '?', availability: 'offline' };
      return {
        id,
        name:     m.name,
        avatar:   m.avatar,
        role:     m.role,
        isOnline: m.availability === 'available',
      };
    });
  };

  const openGroupChat = (project: { id: string; name: string; teamMembers: string[] }) => {
    setChatConfig({
      isGroup:     true,
      projectName: project.name + ' — Group Chat',
      participants: buildParticipants(project.teamMembers),
    });
  };

  const openDmChat = (memberId: string) => {
    const m = ALL_MEMBERS[memberId];
    if (!m) return;
    setChatConfig({
      isGroup:     false,
      projectName: m.name,
      participants: [{ id: memberId, name: m.name, avatar: m.avatar, role: m.role, isOnline: m.availability === 'available' }],
    });
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // PROJECT LIST VIEW
  // ─────────────────────────────────────────────────────────────────────────────
  if (!selectedProjectId) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <FolderKanban className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              Active Projects
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Track your active project contributions and team progress
            </p>
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg">
            {myProjects.length} Active Project{myProjects.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: 'Active Projects',
              value: myProjects.length,
              icon: FolderKanban,
              gradient: 'from-blue-500 to-blue-600',
              bg: 'bg-blue-50 dark:bg-blue-900/20',
            },
            {
              label: 'My Total Tasks',
              value: tasks.filter(t => myProjects.some(p => p.id === t.projectId) && t.assignedTo === (user?.id ?? '')).length,
              icon: Target,
              gradient: 'from-purple-500 to-purple-600',
              bg: 'bg-purple-50 dark:bg-purple-900/20',
            },
            {
              label: 'Completed',
              value: tasks.filter(t => myProjects.some(p => p.id === t.projectId) && t.assignedTo === (user?.id ?? '') && t.status === 'completed').length,
              icon: CheckCircle2,
              gradient: 'from-green-500 to-green-600',
              bg: 'bg-green-50 dark:bg-green-900/20',
            },
            {
              label: 'In Progress',
              value: tasks.filter(t => myProjects.some(p => p.id === t.projectId) && t.assignedTo === (user?.id ?? '') && t.status === 'in-progress').length,
              icon: Activity,
              gradient: 'from-orange-500 to-orange-600',
              bg: 'bg-orange-50 dark:bg-orange-900/20',
            },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className={`${stat.bg} rounded-2xl p-4 flex items-center gap-4`}>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg flex-shrink-0`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Project Cards */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
            <FolderKanban className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No active projects found</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">You haven't been assigned to any active projects yet.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredProjects.map(project => {
              const pTasks    = tasks.filter(t => t.projectId === project.id);
              const pDone     = pTasks.filter(t => t.status === 'completed');
              const pProgress = pTasks.length > 0 ? Math.round((pDone.length / pTasks.length) * 100) : 0;
              const myT       = pTasks.filter(t => t.assignedTo === (user?.id ?? ''));
              const myD       = myT.filter(t => t.status === 'completed');
              const myPct     = myT.length > 0 ? Math.round((myD.length / myT.length) * 100) : 0;
              const inProg    = myT.find(t => t.status === 'in-progress');
              const members   = project.teamMembers.map(id => ({ id, ...ALL_MEMBERS[id] })).filter(m => m.name);

              return (
                <div
                  key={project.id}
                  onClick={() => { setSelectedProjectId(project.id); setActiveTab('overview'); }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 cursor-pointer hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:-translate-y-1 group"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg flex-shrink-0">
                        <FolderKanban className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{project.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{project.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold rounded-full">🟢 Active</span>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>

                  {/* Overall progress */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500 dark:text-gray-400 font-medium">Overall Progress</span>
                      <span className="font-bold text-gray-900 dark:text-white">{pProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all" style={{ width: `${pProgress}%` }} />
                    </div>
                  </div>

                  {/* My contribution */}
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-1"><Star className="w-3 h-3" /> My Contribution</span>
                      <span className="font-bold text-blue-700 dark:text-blue-300">{myPct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full" style={{ width: `${myPct}%` }} />
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">{myD.length}/{myT.length} tasks completed</p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[
                      { label: 'Total Tasks', value: pTasks.length,    color: '' },
                      { label: 'Done',        value: pDone.length,     color: 'text-green-600' },
                      { label: 'Members',     value: members.length + 1, color: 'text-blue-600' },
                    ].map((s, i) => (
                      <div key={i} className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p className={`text-lg font-bold ${s.color || 'text-gray-900 dark:text-white'}`}>{s.value}</p>
                        <p className="text-xs text-gray-400">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Active task pill */}
                  {inProg && (
                    <div className="mb-4 p-2.5 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-100 dark:border-orange-800/30 flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                      <p className="text-xs text-orange-700 dark:text-orange-300 font-medium line-clamp-1 flex-1">Working on: {inProg.title}</p>
                      <span className="text-xs font-bold text-orange-600">{inProg.progress}%</span>
                    </div>
                  )}

                  {/* Footer: avatars + chat buttons */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex -space-x-2">
                      {/* manager */}
                      <div title="John Manager" className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-gray-800">JM</div>
                      {members.slice(0, 4).map(m => (
                        <div key={m.id} title={m.name} className={`w-8 h-8 rounded-full bg-gradient-to-br ${AVATAR_COLORS[m.id] || 'from-gray-400 to-gray-600'} flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-gray-800`}>
                          {m.avatar}
                        </div>
                      ))}
                      {members.length > 4 && (
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300 border-2 border-white dark:border-gray-800">+{members.length - 4}</div>
                      )}
                    </div>
                    <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => openDmChat('1')}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-lg text-xs font-medium transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> Manager
                      </button>
                      <button
                        onClick={() => openGroupChat(project)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg text-xs font-medium transition-colors"
                      >
                        <Users className="w-3.5 h-3.5" /> Group
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Chat modal */}
        {chatConfig && (
          <ProjectChat
            isOpen
            onClose={() => setChatConfig(null)}
            chatType={chatConfig.isGroup ? 'group' : 'individual'}
            projectName={chatConfig.projectName}
            participants={chatConfig.participants}
            currentUserId={user?.id ?? '2'}
          />
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PROJECT DETAIL VIEW
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Back + title */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedProjectId(null)}
            className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-600 dark:text-gray-300 transition-colors"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{currentProject?.name}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{currentProject?.description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => openDmChat('1')}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
          >
            <MessageSquare className="w-4 h-4" /> Message Manager
          </button>
          <button
            onClick={() => currentProject && openGroupChat(currentProject)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
          >
            <Users className="w-4 h-4" /> Group Chat
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit flex-wrap">
        {([
          { id: 'overview',  label: 'Overview',  icon: BarChart3 },
          { id: 'mytasks',   label: 'My Tasks',  icon: Target    },
          { id: 'team',      label: 'Team',      icon: Users     },
          { id: 'timeline',  label: 'Timeline',  icon: Calendar  },
        ] as const).map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── OVERVIEW ── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Overall Progress', value: `${overallProgress}%`,  icon: TrendingUp, gradient: 'from-blue-500 to-blue-600',   sub: `${completedTasks.length}/${projectTasks.length} tasks` },
              { label: 'My Progress',      value: `${myProgress}%`,       icon: Star,       gradient: 'from-purple-500 to-purple-600', sub: `${myCompletedTasks.length}/${myProjectTasks.length} my tasks` },
              { label: 'Hours Logged',     value: `${myProjectTasks.reduce((s, t) => s + t.actualTime, 0).toFixed(1)}h`, icon: Clock, gradient: 'from-green-500 to-green-600', sub: 'Total time logged' },
              { label: 'Team Size',        value: (currentProject?.teamMembers.length ?? 0) + 1, icon: Users, gradient: 'from-orange-500 to-orange-600', sub: 'Including manager' },
            ].map((c, i) => {
              const Icon = c.icon;
              return (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center mb-3`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{c.value}</p>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{c.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{c.sub}</p>
                </div>
              );
            })}
          </div>

          {/* Progress breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" /> Progress Breakdown
            </h3>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Overall Project</span>
                <span className="font-bold text-blue-600">{overallProgress}%</span>
              </div>
              <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full" style={{ width: `${overallProgress}%` }} />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-5">
              {[
                { label: 'To Do',       count: projectTasks.filter(t => t.status === 'todo').length,        color: 'bg-gray-400'   },
                { label: 'In Progress', count: projectTasks.filter(t => t.status === 'in-progress').length, color: 'bg-blue-500'   },
                { label: 'In Review',   count: projectTasks.filter(t => t.status === 'review').length,      color: 'bg-yellow-500' },
                { label: 'Completed',   count: projectTasks.filter(t => t.status === 'completed').length,   color: 'bg-green-500'  },
              ].map((item, i) => (
                <div key={i} className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className={`w-3 h-3 ${item.color} rounded-full mx-auto mb-2`} />
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{item.count}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
                </div>
              ))}
            </div>

            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                  <Star className="w-4 h-4" /> My Contribution
                </span>
                <span className="text-sm font-bold text-purple-700 dark:text-purple-300">{myProgress}%</span>
              </div>
              <div className="w-full h-2.5 bg-blue-100 dark:bg-blue-900/50 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full" style={{ width: `${myProgress}%` }} />
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                You completed {myCompletedTasks.length} of {myProjectTasks.length} assigned tasks
              </p>
            </div>
          </div>

          {/* Skills used */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" /> Skills Used in This Project
            </h3>
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set(myProjectTasks.flatMap(t => t.skillsRequired))).map((skill, i) => (
                <span key={i} className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium rounded-full border border-blue-100 dark:border-blue-800/30">
                  {skill}
                </span>
              ))}
              {myProjectTasks.flatMap(t => t.skillsRequired).length === 0 && (
                <p className="text-gray-400 text-sm">No skills recorded yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MY TASKS ── */}
      {activeTab === 'mytasks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">My Tasks in {currentProject?.name}</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">{myCompletedTasks.length}/{myProjectTasks.length} completed</span>
          </div>

          {myProjectTasks.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
              <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No tasks assigned to you in this project</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myProjectTasks.map(task => {
                const st = TASK_STATUS_CONFIG[task.status] ?? TASK_STATUS_CONFIG['todo'];
                return (
                  <div key={task.id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-3 gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5 ${PRIORITY_DOT[task.priority]}`} />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 dark:text-white truncate">{task.title}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{task.description}</p>
                        </div>
                      </div>
                      <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${st.bg} ${st.text}`}>{st.label}</span>
                    </div>

                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">Progress</span>
                        <span className="font-bold text-gray-900 dark:text-white">{task.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${task.progress === 100 ? 'bg-green-500' : task.progress >= 50 ? 'bg-blue-500' : 'bg-orange-500'}`}
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{task.actualTime}h / {task.estimatedTime}h</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {task.skillsRequired.slice(0, 2).map((s, i) => (
                          <span key={i} className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded-full">{s}</span>
                        ))}
                        {task.skillsRequired.length > 2 && (
                          <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 text-xs rounded-full">+{task.skillsRequired.length - 2}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TEAM ── */}
      {activeTab === 'team' && (
        <div className="space-y-4">
          <h3 className="font-bold text-gray-900 dark:text-white text-lg">Project Team Members</h3>

          {/* Manager */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl p-5 border border-purple-100 dark:border-purple-800/30">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">JM</div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-gray-900 dark:text-white">John Manager</p>
                    <span className="px-2 py-0.5 bg-purple-600 text-white text-xs font-semibold rounded-full shadow-sm">👑 Manager</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Project Manager</p>
                  <div className="flex gap-1.5 mt-1.5 flex-wrap">
                    {['Agile', 'Leadership', 'Planning'].map((s, i) => (
                      <span key={i} className="px-2 py-0.5 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full shadow-sm">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={() => openDmChat('1')}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
              >
                <MessageSquare className="w-4 h-4" /> Message
              </button>
            </div>
          </div>

          {/* Members grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {currentProject!.teamMembers.map(memberId => {
              const member = ALL_MEMBERS[memberId];
              if (!member) return null;
              const stats  = getMemberStats(memberId, currentProject!.id);
              const skills = getSkillsForProject(memberId, currentProject!.id);
              const isMe   = memberId === (user?.id ?? '');

              return (
                <div key={memberId} className={`bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border transition-all hover:shadow-md ${isMe ? 'border-blue-200 dark:border-blue-800/50' : 'border-gray-100 dark:border-gray-700'}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${AVATAR_COLORS[memberId] || 'from-gray-400 to-gray-600'} flex items-center justify-center text-white font-bold shadow-md`}>
                          {member.avatar}
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${STATUS_COLORS[member.availability]} rounded-full border-2 border-white dark:border-gray-800`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">{member.name}</p>
                          {isMe && <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded-full font-medium shadow-sm">You</span>}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{member.role}</p>
                        <span className={`text-xs capitalize ${member.availability === 'available' ? 'text-green-600' : member.availability === 'busy' ? 'text-yellow-600' : 'text-gray-400'}`}>
                          ● {member.availability}
                        </span>
                      </div>
                    </div>
                    {!isMe && (
                      <button
                        onClick={() => openDmChat(memberId)}
                        className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-xl transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[
                      { label: 'Tasks', value: stats.total,                           color: '' },
                      { label: 'Done',  value: stats.completed,                       color: 'text-green-600' },
                      { label: 'Hours', value: `${stats.totalHours.toFixed(1)}h`,     color: '' },
                    ].map((s, i) => (
                      <div key={i} className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p className={`text-base font-bold ${s.color || 'text-gray-900 dark:text-white'}`}>{s.value}</p>
                        <p className="text-xs text-gray-400">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">Completion</span>
                      <span className="font-bold text-gray-900 dark:text-white">{stats.avgProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${stats.avgProgress >= 80 ? 'bg-green-500' : stats.avgProgress >= 50 ? 'bg-blue-500' : 'bg-orange-500'}`}
                        style={{ width: `${stats.avgProgress}%` }}
                      />
                    </div>
                  </div>

                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {skills.map((s, i) => (
                        <span key={i} className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded-full">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Group chat CTA */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-5 flex items-center justify-between flex-wrap gap-3">
            <div className="text-white">
              <p className="font-bold text-lg">Team Group Chat</p>
              <p className="text-blue-100 text-sm">Chat with all {(currentProject?.teamMembers.length ?? 0) + 1} project members</p>
            </div>
            <button
              onClick={() => currentProject && openGroupChat(currentProject)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-blue-600 hover:bg-blue-50 rounded-xl font-semibold text-sm transition-colors shadow-lg"
            >
              <MessageSquare className="w-4 h-4" /> Open Group Chat
            </button>
          </div>
        </div>
      )}

      {/* ── TIMELINE ── */}
      {activeTab === 'timeline' && (
        <div className="space-y-4">
          <h3 className="font-bold text-gray-900 dark:text-white text-lg">Project Activity Timeline</h3>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
              <div className="space-y-6">
                {projectTasks
                  .flatMap(task => task.updates.map(u => ({ ...u, taskTitle: task.title })))
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .slice(0, 12)
                  .map((item, i) => (
                    <div key={i} className="flex gap-4 pl-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 relative z-10 border-2 border-white dark:border-gray-800">
                        <Activity className="w-4 h-4 text-blue-500" />
                      </div>
                      <div className="flex-1 pb-2">
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                          <div className="flex items-start justify-between mb-1 flex-wrap gap-1">
                            <p className="font-semibold text-sm text-gray-900 dark:text-white">{item.userName}</p>
                            <span className="text-xs text-gray-400">{new Date(item.timestamp).toLocaleDateString()}</span>
                          </div>
                          <p className="text-xs text-gray-500 mb-2">on <span className="font-medium text-gray-700 dark:text-gray-300">{item.taskTitle}</span></p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{item.description}</p>
                          {item.skillsUsed.length > 0 && (
                            <div className="flex gap-1.5 mt-2 flex-wrap">
                              {item.skillsUsed.map((s, si) => (
                                <span key={si} className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded-full">{s}</span>
                              ))}
                            </div>
                          )}
                          <div className="mt-2 flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${item.progress}%` }} />
                            </div>
                            <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{item.progress}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                {projectTasks.flatMap(t => t.updates).length === 0 && (
                  <div className="text-center py-10 text-gray-400">
                    <Activity className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>No activity yet in this project</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat modal */}
      {chatConfig && (
        <ProjectChat
          isOpen
          onClose={() => setChatConfig(null)}
          chatType={chatConfig.isGroup ? 'group' : 'individual'}
          projectName={chatConfig.projectName}
          participants={chatConfig.participants}
          currentUserId={user?.id ?? '2'}
        />
      )}
    </div>
  );
}
