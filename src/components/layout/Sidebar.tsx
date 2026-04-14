import { 
  LayoutDashboard, Users, FolderKanban, Target,
  TrendingUp, Award, FileText, BarChart3,
  MessageSquare, Crown, Briefcase, Layers
} from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  role: 'manager' | 'member';
}

export default function Sidebar({ activeTab, onTabChange, role }: SidebarProps) {
  const { isDark } = useThemeStore();
  const { user } = useAuthStore();

  const managerTabs = [
    { id: 'dashboard',   label: 'Dashboard',      icon: LayoutDashboard, color: '#6366F1' },
    { id: 'team',        label: 'Team Members',   icon: Users,           color: '#8B5CF6' },
    { id: 'projects',    label: 'Projects',        icon: FolderKanban,    color: '#EC4899' },
    { id: 'analytics',   label: 'Analytics',       icon: BarChart3,       color: '#06B6D4' },
    { id: 'selection',   label: 'Smart Selection', icon: Crown,           color: '#F59E0B' },
    { id: 'leaderboard', label: 'Leaderboard',     icon: Award,           color: '#10B981' },
    { id: 'chat',        label: 'Team Chat',       icon: MessageSquare,   color: '#3B82F6' },
  ];

  const memberTabs = [
    { id: 'dashboard',       label: 'Dashboard',       icon: LayoutDashboard, color: '#6366F1' },
    { id: 'active-projects', label: 'Active Projects', icon: Layers,          color: '#8B5CF6' },
    { id: 'tasks',           label: 'My Tasks',         icon: Target,          color: '#EC4899' },
    { id: 'progress',        label: 'Progress',         icon: TrendingUp,      color: '#10B981' },
    { id: 'skills',          label: 'Skills',           icon: Award,           color: '#F59E0B' },
    { id: 'experience',      label: 'Work Experience',  icon: Briefcase,       color: '#06B6D4' },
    { id: 'resume',          label: 'Resume',           icon: FileText,        color: '#3B82F6' },
    { id: 'chat',            label: 'Team Chat',        icon: MessageSquare,   color: '#14B8A6' },
  ];

  const tabs = role === 'manager' ? managerTabs : memberTabs;
  const activeTasks = user?.role === 'manager' ? 12 : 12;
  const completed   = user?.role === 'manager' ? 28 : 34;
  const rating      = user?.role === 'manager' ? '4.9' : '4.8';

  return (
    <aside
      className="w-64 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto flex flex-col transition-all duration-300"
      style={{
        background: isDark
          ? 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)'
          : 'linear-gradient(180deg, #FFFFFF 0%, #F5F0FF 60%, #EDE9FE 100%)',
        borderRight: isDark
          ? '1px solid #334155'
          : '1px solid #DDD6FE',
        boxShadow: isDark
          ? '4px 0 20px rgba(0,0,0,0.3)'
          : '4px 0 20px rgba(99,102,241,0.08)',
      }}
    >
      {/* Nav tabs */}
      <nav className="p-4 space-y-1 flex-1">
        {tabs.map((tab) => {
          const Icon     = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-semibold text-sm group"
              style={
                isActive
                  ? {
                      background: isDark
                        ? `linear-gradient(135deg, ${tab.color}22 0%, ${tab.color}10 100%)`
                        : `linear-gradient(135deg, ${tab.color}18 0%, ${tab.color}0D 100%)`,
                      color: isDark ? '#FFFFFF' : '#111827',
                      borderLeft: `3px solid ${tab.color}`,
                      boxShadow: `0 4px 16px ${tab.color}20`,
                      paddingLeft: '13px',
                    }
                  : {
                      color: isDark ? '#F8FAFC' : '#1E293B',
                      borderLeft: '3px solid transparent',
                    }
              }
              onMouseEnter={(e) => {
                if (!isActive) {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.background = isDark
                    ? `${tab.color}18`
                    : `${tab.color}10`;
                  el.style.color = isDark ? '#FFFFFF' : '#111827';
                  el.style.borderLeft = `3px solid ${tab.color}50`;
                  el.style.paddingLeft = '13px';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.background = 'transparent';
                  el.style.color = isDark ? '#F8FAFC' : '#1E293B';
                  el.style.borderLeft = '3px solid transparent';
                  el.style.paddingLeft = '16px';
                }
              }}
            >
              {/* Icon container */}
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200"
                style={{
                  background: isActive
                    ? `${tab.color}22`
                    : isDark ? '#334155' : '#E0E7FF',
                }}
              >
                <Icon
                  className="w-4 h-4"
                  style={{ color: isActive ? tab.color : isDark ? '#E2E8F0' : '#374151' }}
                />
              </span>
              <span>{tab.label}</span>

              {/* Active dot */}
              {isActive && (
                <span
                  className="ml-auto w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: tab.color }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Stats */}
      <div
        className="p-4 m-3 rounded-2xl"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, #1E293B, #334155)'
            : 'linear-gradient(135deg, #EDE9FE, #FCE7F3)',
          border: isDark ? '1px solid #334155' : '1px solid #DDD6FE',
        }}
      >
        <h3
          className="text-xs font-bold uppercase tracking-widest mb-3"
          style={{ color: '#6366F1' }}
        >
          Quick Stats
        </h3>
        <div className="space-y-3">
          {[
            { label: 'Active Tasks', value: activeTasks, color: '#6366F1' },
            { label: 'Completed',    value: completed,   color: '#10B981' },
            { label: 'Rating',       value: `${rating} ⭐`, color: '#F59E0B' },
          ].map((stat) => (
            <div key={stat.label} className="flex justify-between items-center">
              <span
                className="text-xs font-semibold"
                style={{ color: isDark ? '#F1F5F9' : '#374151' }}
              >
                {stat.label}
              </span>
              <span
                className="text-sm font-bold"
                style={{ color: stat.color }}
              >
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
