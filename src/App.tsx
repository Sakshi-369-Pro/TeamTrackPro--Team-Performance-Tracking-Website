import { useState, useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import { Toaster } from 'react-hot-toast';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import ManagerDashboard from './components/dashboard/ManagerDashboard';
import MemberDashboard from './components/dashboard/MemberDashboard';
import TeamMembers from './components/manager/TeamMembers';
import SmartSelection from './components/manager/SmartSelection';
import Leaderboard from './components/manager/Leaderboard';
import MyTasks from './components/member/MyTasks';
import ResumeGenerator from './components/member/ResumeGenerator';
import ProjectManagement from './components/manager/ProjectManagement';
import ProjectAnalyticsEnhanced from './components/manager/ProjectAnalyticsEnhanced';
import SkillManagement from './components/member/SkillManagement';
import MemberProgress from './components/member/MemberProgress';
import WorkExperience from './components/member/WorkExperience';
import ActiveProjects from './components/member/ActiveProjects';
import TeamChatHub from './components/chat/TeamChatHub';

export default function App() {
  const { isAuthenticated, user } = useAuthStore();
  const { isDark, accentColor } = useThemeStore();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [activeTab, setActiveTab] = useState('dashboard');

  // Apply theme + accent
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
      body.style.background = '#0F172A';
      body.style.color = '#F1F5F9';
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      body.style.background = 'linear-gradient(135deg, #F5F0FF 0%, #EDE9FE 40%, #FCE7F3 100%)';
      body.style.color = '#1E1B4B';
    }

    root.setAttribute('data-accent', accentColor);

    const accentMap: Record<string, { primary: string; soft: string; ring: string }> = {
      blue:   { primary: '#2563eb', soft: '#dbeafe', ring: '#93c5fd' },
      purple: { primary: '#7c3aed', soft: '#ede9fe', ring: '#c4b5fd' },
      green:  { primary: '#16a34a', soft: '#dcfce7', ring: '#86efac' },
      rose:   { primary: '#e11d48', soft: '#ffe4e6', ring: '#fda4af' },
      orange: { primary: '#ea580c', soft: '#ffedd5', ring: '#fdba74' },
    };

    const selected = accentMap[accentColor] ?? accentMap.blue;
    root.style.setProperty('--accent-primary', selected.primary);
    root.style.setProperty('--accent-soft',    selected.soft);
    root.style.setProperty('--accent-ring',    selected.ring);
  }, [isDark, accentColor]);

  if (!isAuthenticated) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4 transition-all duration-300"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, #0F172A 0%, #111827 45%, #1E293B 100%)'
            : 'linear-gradient(135deg, #F5F0FF 0%, #EDE9FE 40%, #FCE7F3 100%)',
          color: isDark ? '#F1F5F9' : '#1E1B4B',
        }}
      >
        <Toaster position="top-right" />
        
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
          <div className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl top-1/2 left-1/2 animate-pulse delay-1000"></div>
          <div className="absolute w-96 h-96 bg-pink-500/10 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-10 w-full max-w-6xl flex items-center justify-center">
          {authMode === 'login' ? (
            <LoginForm onSwitchToRegister={() => setAuthMode('register')} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setAuthMode('login')} />
          )}
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (user?.role === 'manager') {
      switch (activeTab) {
        case 'dashboard':
          return <ManagerDashboard />;
        case 'team':
          return <TeamMembers />;
        case 'selection':
          return <SmartSelection />;
        case 'leaderboard':
          return <Leaderboard />;
        case 'projects':
          return <ProjectManagement />;
        case 'analytics':
          return <ProjectAnalyticsEnhanced />;
        case 'chat':
          return <TeamChatHub />;
        default:
          return <ManagerDashboard />;
      }
    } else {
      switch (activeTab) {
        case 'dashboard':
          return <MemberDashboard />;
        case 'active-projects':
          return <ActiveProjects />;
        case 'tasks':
          return <MyTasks />;
        case 'resume':
          return <ResumeGenerator />;
        case 'progress':
          return <MemberProgress />;
        case 'skills':
          return <SkillManagement />;
        case 'chat':
          return <TeamChatHub />;
        case 'experience':
          return <WorkExperience />;
        default:
          return <MemberDashboard />;
      }
    }
  };

  return (
    <div
      className="min-h-screen transition-all duration-300 relative overflow-x-hidden"
      style={{ background: 'var(--page-gradient)', color: 'var(--text-primary)' }}
    >
      {/* Light mode decorative orbs */}
      {!isDark && (
        <>
          <div className="fixed top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none z-0"
            style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.18) 0%, transparent 70%)' }} />
          <div className="fixed bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none z-0"
            style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)' }} />
          <div className="fixed top-1/2 left-1/2 w-[600px] h-[600px] rounded-full pointer-events-none z-0"
            style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)', transform: 'translate(-50%,-50%)' }} />
        </>
      )}

      <Toaster position="top-right" />
      
      <div className="relative z-10">
        <Navbar />
        
        <div className="flex">
          <Sidebar 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
            role={user?.role || 'member'} 
          />
          
          <main className="flex-1 p-6 md:p-8 min-h-screen">
            <div className="max-w-7xl mx-auto">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
