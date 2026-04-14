import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { LogIn, Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import ForgotPasswordModal from './ForgotPasswordModal';

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export default function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const login = useAuthStore((state) => state.login);
  const { isDark } = useThemeStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Login successful!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Invalid credentials. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="w-full max-w-md p-8 rounded-2xl border shadow-2xl backdrop-blur-sm"
      style={{
        background: isDark ? 'rgba(27, 42, 66, 0.95)' : 'rgba(255, 255, 255, 0.92)',
        borderColor: isDark ? 'rgba(30, 64, 175, 0.4)' : 'rgba(221, 214, 254, 0.9)',
        boxShadow: isDark ? '0 25px 60px rgba(0,0,0,0.38)' : '0 25px 60px rgba(99,102,241,0.18)',
      }}
    >
      <div className="flex items-center justify-center mb-8">
        <div
          className="p-3 rounded-full border"
          style={{
            background: isDark ? 'rgba(37, 99, 235, 0.18)' : 'rgba(99, 102, 241, 0.12)',
            borderColor: isDark ? 'rgba(59, 130, 246, 0.4)' : 'rgba(99, 102, 241, 0.25)',
          }}
        >
          <LogIn className="w-8 h-8 text-blue-500" />
        </div>
      </div>
      
      <h2 className="text-4xl font-bold text-center mb-2 tracking-tight" style={{ color: isDark ? '#FFFFFF' : '#111827' }}>
        Welcome Back
      </h2>
      <p className="text-center mb-8 text-lg" style={{ color: isDark ? '#CBD5E1' : '#4B5563' }}>
        Sign in to continue to TeamTrack Pro
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: isDark ? '#E2E8F0' : '#374151' }}>
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: isDark ? '#94A3B8' : '#6B7280' }} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{
                borderColor: isDark ? '#475569' : '#DDD6FE',
                background: isDark ? '#334155' : '#FEEFEF',
                color: isDark ? '#F8FAFC' : '#1F2937',
              }}
              placeholder="Enter your email"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: isDark ? '#E2E8F0' : '#374151' }}>
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: isDark ? '#94A3B8' : '#6B7280' }} />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{
                borderColor: isDark ? '#475569' : '#DDD6FE',
                background: isDark ? '#334155' : '#FEEFEF',
                color: isDark ? '#F8FAFC' : '#1F2937',
              }}
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: isDark ? '#94A3B8' : '#6B7280' }}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
            <span className="ml-2 text-sm" style={{ color: isDark ? '#CBD5E1' : '#4B5563' }}>
              Remember me
            </span>
          </label>
          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            className="text-sm text-blue-400 hover:underline"
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm" style={{ color: isDark ? '#CBD5E1' : '#4B5563' }}>
          Don't have an account?{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-blue-500 hover:underline font-semibold"
          >
            Sign up
          </button>
        </p>
      </div>

      <div
        className="mt-6 p-4 rounded-lg border"
        style={{
          background: isDark ? '#24385a' : 'rgba(237, 233, 254, 0.9)',
          borderColor: isDark ? 'rgba(30, 64, 175, 0.3)' : 'rgba(221, 214, 254, 0.9)',
        }}
      >
        <p className="text-xs text-center leading-relaxed" style={{ color: isDark ? '#CBD5E1' : '#4B5563' }}>
          <strong style={{ color: isDark ? '#E2E8F0' : '#1F2937' }}>Demo Accounts:</strong><br />
          Manager: manager@test.com / manager123<br />
          Member: member@test.com / member123
        </p>
      </div>

      <ForgotPasswordModal 
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </div>
  );
}
