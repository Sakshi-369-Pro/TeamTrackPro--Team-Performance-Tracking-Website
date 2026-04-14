import { create } from 'zustand';
import { useThemeStore } from './themeStore';

export type UserRole = 'manager' | 'member';

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  skills: Skill[];
  experience: number;
  avatar?: string;
  currentProjects: string[];
  rating: number;
  availability: 'available' | 'busy' | 'offline';
  companies: CompanyHistory[];
  achievements: Achievement[];
  bio?: string;
}

export interface Skill {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience: number;
  autoDetected: boolean;
  lastUsed?: Date;
}

export interface CompanyHistory {
  id: string;
  companyName: string;
  position: string;
  startDate: Date;
  endDate?: Date;
  description: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: Date;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Partial<User> & { password: string }) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string; otp?: string }>;
  verifyOtp: (email: string, otp: string) => Promise<boolean>;
  resetPassword: (email: string, newPassword: string) => Promise<boolean>;
}

const BASE_USERS: (User & { password: string })[] = [
  {
    id: '1',
    email: 'manager@test.com',
    password: 'manager123',
    name: 'John Manager',
    phone: '+1234567890',
    role: 'manager',
    skills: [
      { name: 'Project Management', level: 'expert', yearsOfExperience: 5, autoDetected: false },
      { name: 'Agile', level: 'advanced', yearsOfExperience: 4, autoDetected: false },
    ],
    experience: 5,
    currentProjects: ['Project Alpha', 'Project Beta'],
    rating: 4.8,
    availability: 'available',
    companies: [
      {
        id: 'c1',
        companyName: 'Tech Corp',
        position: 'Senior PM',
        startDate: new Date('2020-01-01'),
        description: 'Led multiple teams',
      },
    ],
    achievements: [
      {
        id: 'a1',
        title: 'Team Leader',
        description: 'Successfully managed 10+ projects',
        icon: '🏆',
        earnedAt: new Date(),
      },
    ],
  },
  {
    id: '2',
    email: 'member@test.com',
    password: 'member123',
    name: 'Sarah Developer',
    phone: '+1234567891',
    role: 'member',
    skills: [
      { name: 'React', level: 'advanced', yearsOfExperience: 3, autoDetected: true },
      { name: 'TypeScript', level: 'intermediate', yearsOfExperience: 2, autoDetected: true },
      { name: 'Node.js', level: 'intermediate', yearsOfExperience: 2, autoDetected: true },
    ],
    experience: 3,
    currentProjects: ['Project Alpha'],
    rating: 4.5,
    availability: 'available',
    companies: [
      {
        id: 'c2',
        companyName: 'StartupXYZ',
        position: 'Frontend Developer',
        startDate: new Date('2021-06-01'),
        description: 'Built modern web applications',
      },
    ],
    achievements: [
      {
        id: 'a2',
        title: 'Fast Finisher',
        description: 'Completed 50+ tasks ahead of schedule',
        icon: '⚡',
        earnedAt: new Date(),
      },
    ],
  },
];

// Initialize persistent users database
const savedUsers = localStorage.getItem('teamtrack_users');
const MOCK_USERS: (User & { password: string })[] = savedUsers 
  ? JSON.parse(savedUsers) 
  : BASE_USERS;

// Save initial users if not already saved
if (!savedUsers) {
  localStorage.setItem('teamtrack_users', JSON.stringify(BASE_USERS));
}

// Store OTP codes in memory for demo
const otpStore: Map<string, string> = new Map();

export const useAuthStore = create<AuthState>()((set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: async (email: string, password: string) => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        const user = MOCK_USERS.find(
          (u) => u.email === email && u.password === password
        );
        
        if (!user) {
          throw new Error('Invalid credentials');
        }
        
        const { password: _, ...userData } = user;
        const token = 'mock-jwt-token-' + Date.now();
        
        // Force dark mode after successful login.
        useThemeStore.getState().setTheme(true);
        set({ user: userData, token, isAuthenticated: true });
      },
      register: async (userData) => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        const newUser: User = {
          id: String(MOCK_USERS.length + 1),
          email: userData.email!,
          name: userData.name!,
          phone: userData.phone!,
          role: userData.role || 'member',
          skills: userData.skills || [],
          experience: userData.experience || 0,
          currentProjects: [],
          rating: 0,
          availability: 'available',
          companies: [],
          achievements: [],
        };
        
        const token = 'mock-jwt-token-' + Date.now();
        // Force dark mode after successful registration.
        useThemeStore.getState().setTheme(true);
        set({ user: newUser, token, isAuthenticated: true });
      },
      logout: () => {
        // Reset theme to dark at logout so next login starts in dark mode.
        useThemeStore.getState().setTheme(true);
        set({ user: null, token: null, isAuthenticated: false });
      },
      updateUser: (userData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },
      forgotPassword: async (email: string) => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Generate 6-digit OTP for ANY email
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        otpStore.set(email, otp);

        // In production, this would send real email via Nodemailer
        console.log(`[DEMO] OTP for ${email}: ${otp}`);

        return {
          success: true,
          message: `OTP has been sent to ${email}`,
          otp // Only for demo - in real app this would NOT be returned
        };
      },
      verifyOtp: async (email: string, otp: string) => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        const storedOtp = otpStore.get(email);
        if (storedOtp === otp) {
          return true;
        }
        return false;
      },
      resetPassword: async (email: string, newPassword: string) => {
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Update password in mock users
        const userIndex = MOCK_USERS.findIndex((u) => u.email === email);
        if (userIndex !== -1) {
          MOCK_USERS[userIndex].password = newPassword;
          console.log(`[DEMO] Password updated for ${email}`);
        } else {
          // If user doesn't exist in mock list, create a new entry for demo
          MOCK_USERS.push({
            id: 'demo-' + Date.now(),
            email: email,
            password: newPassword,
            name: email.split('@')[0],
            phone: '+1234567890',
            role: 'member',
            skills: [],
            experience: 0,
            currentProjects: [],
            rating: 4.0,
            availability: 'available',
            companies: [],
            achievements: [],
          });
          console.log(`[DEMO] New user created with reset password: ${email}`);
        }

        // Save to local storage to make it persistent across page refreshes!
        localStorage.setItem('teamtrack_users', JSON.stringify(MOCK_USERS));

        // Clean up OTP
        otpStore.delete(email);
        return true;
      },
    }));
