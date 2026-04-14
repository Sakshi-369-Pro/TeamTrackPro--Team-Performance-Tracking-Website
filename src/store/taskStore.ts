import { create } from 'zustand';

export interface TaskUpdate {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  description: string;
  progress: number;
  timeSpent: number; // in minutes
  files: FileAttachment[];
  timestamp: Date;
  skillsUsed: string[];
}

export interface FileAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedBy: string;
  projectId: string;
  status: 'todo' | 'in-progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  progress: number;
  dueDate: Date;
  createdAt: Date;
  completedAt?: Date;
  updates: TaskUpdate[];
  estimatedTime: number; // in hours
  actualTime: number; // in hours
  quality: number; // 1-5 rating
  skillsRequired: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  managerId: string;
  teamMembers: string[];
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'completed' | 'on-hold';
  tasks: string[]; // task IDs
}

interface TaskState {
  tasks: Task[];
  projects: Project[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updates' | 'actualTime'>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  addTaskUpdate: (update: Omit<TaskUpdate, 'id' | 'timestamp'>) => void;
  completeTask: (taskId: string, quality: number) => void;
  getTasksByUser: (userId: string) => Task[];
  getTasksByProject: (projectId: string) => Task[];
  addProject: (project: Omit<Project, 'id'>) => void;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  deleteProject: (projectId: string) => void;
  addMemberToProject: (projectId: string, memberId: string) => void;
  removeMemberFromProject: (projectId: string, memberId: string) => void;
}

// Mock data
const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Project Alpha',
    description: 'E-commerce platform development',
    managerId: '1',
    teamMembers: ['2', '3', '4'],
    startDate: new Date('2024-01-01'),
    status: 'active',
    tasks: ['t1', 't2', 't3'],
  },
  {
    id: 'p2',
    name: 'Project Beta',
    description: 'Mobile app development',
    managerId: '1',
    teamMembers: ['2', '5'],
    startDate: new Date('2024-02-01'),
    status: 'active',
    tasks: ['t4', 't5'],
  },
];

const MOCK_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Build User Authentication',
    description: 'Implement JWT-based authentication system with email and password',
    assignedTo: '2',
    assignedBy: '1',
    projectId: 'p1',
    status: 'in-progress',
    priority: 'high',
    progress: 65,
    dueDate: new Date('2024-12-30'),
    createdAt: new Date('2024-12-01'),
    updates: [
      {
        id: 'u1',
        taskId: 't1',
        userId: '2',
        userName: 'Sarah Developer',
        description: 'Set up JWT authentication middleware',
        progress: 40,
        timeSpent: 120,
        files: [],
        timestamp: new Date('2024-12-15'),
        skillsUsed: ['Node.js', 'JWT', 'Express'],
      },
      {
        id: 'u2',
        taskId: 't1',
        userId: '2',
        userName: 'Sarah Developer',
        description: 'Integrated login and register endpoints',
        progress: 65,
        timeSpent: 90,
        files: [],
        timestamp: new Date('2024-12-20'),
        skillsUsed: ['React', 'TypeScript', 'API Integration'],
      },
    ],
    estimatedTime: 8,
    actualTime: 3.5,
    quality: 0,
    skillsRequired: ['React', 'Node.js', 'JWT', 'TypeScript'],
  },
  {
    id: 't2',
    title: 'Design Product Listing Page',
    description: 'Create responsive product listing with filters and sorting',
    assignedTo: '3',
    assignedBy: '1',
    projectId: 'p1',
    status: 'completed',
    priority: 'medium',
    progress: 100,
    dueDate: new Date('2024-12-25'),
    createdAt: new Date('2024-12-05'),
    completedAt: new Date('2024-12-24'),
    updates: [],
    estimatedTime: 6,
    actualTime: 5.5,
    quality: 5,
    skillsRequired: ['React', 'CSS', 'UI/UX'],
  },
  {
    id: 't3',
    title: 'Implement Shopping Cart',
    description: 'Build shopping cart with add/remove/update functionality',
    assignedTo: '2',
    assignedBy: '1',
    projectId: 'p1',
    status: 'todo',
    priority: 'high',
    progress: 0,
    dueDate: new Date('2025-01-05'),
    createdAt: new Date('2024-12-10'),
    updates: [],
    estimatedTime: 10,
    actualTime: 0,
    quality: 0,
    skillsRequired: ['React', 'Redux', 'TypeScript'],
  },
];

export const useTaskStore = create<TaskState>()((set, get) => ({
      tasks: MOCK_TASKS,
      projects: MOCK_PROJECTS,
      
      addTask: (task) => {
        const newTask: Task = {
          ...task,
          id: 't' + Date.now(),
          createdAt: new Date(),
          updates: [],
          actualTime: 0,
        };
        set((state) => ({ tasks: [...state.tasks, newTask] }));
      },
      
      updateTask: (taskId, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId ? { ...task, ...updates } : task
          ),
        }));
      },
      
      addTaskUpdate: (update) => {
        const newUpdate: TaskUpdate = {
          ...update,
          id: 'u' + Date.now(),
          timestamp: new Date(),
        };
        
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === update.taskId
              ? {
                  ...task,
                  updates: [...task.updates, newUpdate],
                  progress: update.progress,
                  status: update.progress === 100 ? 'review' : task.status,
                  actualTime: task.actualTime + update.timeSpent / 60,
                }
              : task
          ),
        }));
      },
      
      completeTask: (taskId, quality) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  status: 'completed',
                  progress: 100,
                  completedAt: new Date(),
                  quality,
                }
              : task
          ),
        }));
      },
      
      getTasksByUser: (userId) => {
        return get().tasks.filter((task) => task.assignedTo === userId);
      },
      
      getTasksByProject: (projectId) => {
        return get().tasks.filter((task) => task.projectId === projectId);
      },
      
      addProject: (project) => {
        const newProject: Project = {
          ...project,
          id: 'p' + Date.now(),
        };
        set((state) => ({ projects: [...state.projects, newProject] }));
      },
      
      updateProject: (projectId, updates) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId ? { ...project, ...updates } : project
          ),
        }));
      },
      
      deleteProject: (projectId) => {
        set((state) => ({
          projects: state.projects.filter((project) => project.id !== projectId),
          tasks: state.tasks.filter((task) => task.projectId !== projectId),
        }));
      },
      
      addMemberToProject: (projectId, memberId) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId && !project.teamMembers.includes(memberId)
              ? { ...project, teamMembers: [...project.teamMembers, memberId] }
              : project
          ),
        }));
      },
      
      removeMemberFromProject: (projectId, memberId) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? { ...project, teamMembers: project.teamMembers.filter((id) => id !== memberId) }
              : project
          ),
        }));
      },
    }));
