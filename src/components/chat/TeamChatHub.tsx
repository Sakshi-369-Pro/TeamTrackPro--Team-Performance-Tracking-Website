import { useState, useMemo } from 'react';
import { MessageCircle, Users, Briefcase, Search, Shield, Clock, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useTaskStore } from '../../store/taskStore';
import ProjectChat from './ProjectChat';

interface ProjectMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  isOnline: boolean;
  isManager: boolean;
}

// Mock user data - in real app, fetch from API
const userDataMap: Record<string, { name: string; role: string; avatar: string; isOnline: boolean }> = {
  '1': { name: 'John Manager', role: 'Project Manager', avatar: '👨‍💼', isOnline: true },
  '2': { name: 'Sarah Developer', role: 'Frontend Developer', avatar: '👩‍💻', isOnline: true },
  '3': { name: 'Mike Designer', role: 'UI/UX Designer', avatar: '🎨', isOnline: false },
  '4': { name: 'Alex Backend', role: 'Backend Developer', avatar: '👨‍💻', isOnline: true },
  '5': { name: 'Emma QA', role: 'QA Engineer', avatar: '🔍', isOnline: true },
};

export default function TeamChatHub() {
  const { user: currentUser } = useAuthStore();
  const { projects } = useTaskStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [showGroupChat, setShowGroupChat] = useState(false);
  const [showIndividualChat, setShowIndividualChat] = useState(false);
  const [selectedMember, setSelectedMember] = useState<ProjectMember | null>(null);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  // Get projects accessible to current user
  const userProjects = useMemo(() => {
    if (!currentUser) return [];
    
    if (currentUser.role === 'manager') {
      // Managers see projects they manage
      return projects.filter(p => 
        p.managerId === currentUser.id && 
        p.status === 'active'
      );
    } else {
      // Team members see projects they're assigned to
      return projects.filter(p => 
        p.teamMembers.includes(currentUser.id) && 
        p.status === 'active'
      );
    }
  }, [currentUser, projects]);

  // Filter projects by search
  const filteredProjects = useMemo(() => {
    if (!searchTerm) return userProjects;
    return userProjects.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [userProjects, searchTerm]);

  // Get members for a specific project
  const getProjectMembers = (projectId: string): ProjectMember[] => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return [];

    const members: ProjectMember[] = [];

    // Add manager
    const managerData = userDataMap[project.managerId];
    if (managerData) {
      members.push({
        id: project.managerId,
        name: managerData.name,
        role: managerData.role,
        avatar: managerData.avatar,
        isOnline: managerData.isOnline,
        isManager: true,
      });
    }

    // Add team members
    project.teamMembers.forEach(memberId => {
      const memberData = userDataMap[memberId];
      if (memberData && memberId !== currentUser?.id) {
        members.push({
          id: memberId,
          name: memberData.name,
          role: memberData.role,
          avatar: memberData.avatar,
          isOnline: memberData.isOnline,
          isManager: false,
        });
      }
    });

    return members;
  };

  const activeProject = selectedProject ? projects.find(p => p.id === selectedProject) : null;
  const activeProjectMembers = activeProject ? getProjectMembers(activeProject.id) : [];

  const handleGroupChat = (projectId: string) => {
    setSelectedProject(projectId);
    setShowGroupChat(true);
  };

  const handleIndividualChat = (member: ProjectMember, projectId: string) => {
    setSelectedProject(projectId);
    setSelectedMember(member);
    setShowIndividualChat(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <MessageCircle className="w-8 h-8 text-blue-600" />
          Team Chat Hub
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {currentUser?.role === 'manager' 
            ? 'Chat with your project teams and team members'
            : 'Connect with your project teams and managers'
          }
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Projects List */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 shadow-lg text-center">
          <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Active Projects
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {currentUser?.role === 'manager'
              ? 'You don\'t have any active projects at the moment.'
              : 'You are not assigned to any active projects.'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProjects.map((project) => {
            const members = getProjectMembers(project.id);
            const onlineCount = members.filter(m => m.isOnline).length;
            const isExpanded = expandedProject === project.id;

            return (
              <div
                key={project.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all overflow-hidden border-2 border-transparent hover:border-blue-500"
              >
                {/* Project Header */}
                <div className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                        <Briefcase className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{project.name}</h3>
                        <div className="flex items-center gap-2 mt-1 text-sm text-white/80">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Active</span>
                          <span>•</span>
                          <Users className="w-3.5 h-3.5" />
                          <span>{members.length} members</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-white/20 backdrop-blur px-2.5 py-1 rounded-full">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-xs font-medium">{onlineCount} online</span>
                    </div>
                  </div>
                  <p className="text-sm text-white/90 line-clamp-2">{project.description}</p>
                </div>

                {/* Members List */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Team Members
                    </h4>
                    <button
                      onClick={() => setExpandedProject(isExpanded ? null : project.id)}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      {isExpanded ? 'Show less' : 'Show all'}
                      <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>
                  </div>

                  <div className="space-y-2 mb-4">
                    {(isExpanded ? members : members.slice(0, 3)).map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-lg">
                              {member.avatar}
                            </div>
                            {member.isOnline && (
                              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900 dark:text-white text-sm">
                                {member.name}
                                {member.id === currentUser?.id && (
                                  <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">(You)</span>
                                )}
                              </p>
                              {member.isManager && (
                                <Shield className="w-3.5 h-3.5 text-amber-500" />
                              )}
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{member.role}</p>
                          </div>
                        </div>

                        {member.id !== currentUser?.id && (
                          <button
                            onClick={() => handleIndividualChat(member, project.id)}
                            className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors text-blue-600 dark:text-blue-400"
                            title={`Chat with ${member.name}`}
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    
                    {!isExpanded && members.length > 3 && (
                      <div className="text-center py-2 text-sm text-gray-500 dark:text-gray-400">
                        +{members.length - 3} more members
                      </div>
                    )}
                  </div>

                  {/* Group Chat Button */}
                  <button
                    onClick={() => handleGroupChat(project.id)}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
                  >
                    <Users className="w-5 h-5" />
                    Open Project Group Chat
                    <span className="ml-auto bg-white/20 backdrop-blur px-2 py-0.5 rounded-full text-xs">
                      {members.length}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Group Chat Modal */}
      {activeProject && (
        <ProjectChat
          isOpen={showGroupChat}
          onClose={() => {
            setShowGroupChat(false);
            setSelectedProject(null);
          }}
          chatType="group"
          projectName={activeProject.name}
          participants={activeProjectMembers.map(m => ({
            id: m.id,
            name: m.name,
            avatar: m.avatar,
            role: m.role,
            isOnline: m.isOnline
          }))}
          currentUserId={currentUser?.id || ''}
        />
      )}

      {/* Individual Chat Modal */}
      {selectedMember && activeProject && (
        <ProjectChat
          isOpen={showIndividualChat}
          onClose={() => {
            setShowIndividualChat(false);
            setSelectedMember(null);
            setSelectedProject(null);
          }}
          chatType="individual"
          projectName={activeProject.name}
          participants={[{
            id: selectedMember.id,
            name: selectedMember.name,
            avatar: selectedMember.avatar,
            role: selectedMember.role,
            isOnline: selectedMember.isOnline
          }]}
          currentUserId={currentUser?.id || ''}
        />
      )}
    </div>
  );
}
