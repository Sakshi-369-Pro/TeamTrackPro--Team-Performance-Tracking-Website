import { useMemo, useState } from 'react';
import { Search, Filter, Star, Mail, Phone, MessageCircle, Users, UserPlus, Plus, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import ProjectChat from '../chat/ProjectChat';

// Mock team members data
const teamMembers = [
  {
    id: '2',
    name: 'Sarah Developer',
    email: 'sarah@test.com',
    phone: '+1234567891',
    role: 'Frontend Developer',
    avatar: '👩‍💻',
    rating: 4.8,
    skills: ['React', 'TypeScript', 'Node.js', 'CSS'],
    experience: 3,
    availability: 'available',
    completedTasks: 45,
    activeProjects: 2,
    performance: 95,
  },
  {
    id: '3',
    name: 'Mike Designer',
    email: 'mike@test.com',
    phone: '+1234567892',
    role: 'UI/UX Designer',
    avatar: '🎨',
    rating: 4.6,
    skills: ['Figma', 'UI Design', 'Prototyping', 'CSS'],
    experience: 4,
    availability: 'available',
    completedTasks: 38,
    activeProjects: 1,
    performance: 88,
  },
  {
    id: '4',
    name: 'Alex Backend',
    email: 'alex@test.com',
    phone: '+1234567893',
    role: 'Backend Developer',
    avatar: '👨‍💻',
    rating: 4.9,
    skills: ['Node.js', 'MongoDB', 'Express', 'AWS'],
    experience: 5,
    availability: 'busy',
    completedTasks: 52,
    activeProjects: 3,
    performance: 97,
  },
  {
    id: '5',
    name: 'Emma QA',
    email: 'emma@test.com',
    phone: '+1234567894',
    role: 'QA Engineer',
    avatar: '🔍',
    rating: 4.7,
    skills: ['Testing', 'Selenium', 'Jest', 'Cypress'],
    experience: 2,
    availability: 'available',
    completedTasks: 41,
    activeProjects: 2,
    performance: 91,
  },
];

export default function TeamMembers() {
  const { user: currentUser } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('all');
  const [selectedMember, setSelectedMember] = useState<typeof teamMembers[0] | null>(null);
  const [showGroupChat, setShowGroupChat] = useState(false);
  const [showIndividualChat, setShowIndividualChat] = useState(false);
  const [groupChatMembers, setGroupChatMembers] = useState<typeof teamMembers>([]);

  const allSkills = Array.from(new Set(teamMembers.flatMap(m => m.skills)));

  const filteredMembers = useMemo(() => teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSkill = selectedSkill === 'all' || member.skills.includes(selectedSkill);
    return matchesSearch && matchesSkill;
  }), [searchTerm, selectedSkill]);

  const chatParticipants = (groupChatMembers.length > 0 ? groupChatMembers : filteredMembers).map((member) => ({
    id: member.id,
    name: member.name,
    avatar: member.avatar,
    role: member.role,
    isOnline: member.availability === 'available',
  }));

  const toggleGroupMember = (member: typeof teamMembers[0]) => {
    setGroupChatMembers((prev) => {
      const exists = prev.some((item) => item.id === member.id);

      if (exists) {
        return prev.filter((item) => item.id !== member.id);
      }

      return [...prev, member];
    });
  };

  const openGroupChat = () => {
    if (groupChatMembers.length === 0) {
      setGroupChatMembers(filteredMembers);
    }
    setShowGroupChat(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Team Members</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage and monitor your team's performance
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Skills</option>
              {allSkills.map(skill => (
                <option key={skill} value={skill}>{skill}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mt-5 pt-5 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Users className="w-4 h-4" />
            <span>{groupChatMembers.length > 0 ? `${groupChatMembers.length} members selected for group chat` : 'No members selected for group chat yet'}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setGroupChatMembers(filteredMembers)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Add Visible Members
            </button>
            <button
              type="button"
              onClick={() => setGroupChatMembers([])}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
            <button
              type="button"
              onClick={openGroupChat}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              Open Group Chat
            </button>
          </div>
        </div>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <div
            key={member.id}
            onClick={() => setSelectedMember(member)}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-blue-500"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-3xl">
                  {member.avatar}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{member.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{member.role}</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                member.availability === 'available' 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
              }`}>
                {member.availability}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Rating</span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold text-gray-900 dark:text-white">{member.rating}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Performance</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500"
                      style={{ width: `${member.performance}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {member.performance}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {member.completedTasks} tasks
                </span>
              </div>

              <div className="flex flex-wrap gap-1 pt-2">
                {member.skills.slice(0, 3).map(skill => (
                  <span 
                    key={skill}
                    className="px-2 py-1 text-xs bg-blue-600 text-white rounded-full font-medium shadow-sm"
                  >
                    {skill}
                  </span>
                ))}
                {member.skills.length > 3 && (
                  <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                    +{member.skills.length - 3}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 pt-4">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMember(member);
                    setShowIndividualChat(true);
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors font-medium"
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleGroupMember(member);
                  }}
                  className={`inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors font-medium ${
                    groupChatMembers.some((item) => item.id === member.id)
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  {groupChatMembers.some((item) => item.id === member.id) ? 'Added' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Member Detail Modal */}
      {selectedMember && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedMember(null)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-4xl">
                  {selectedMember.avatar}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedMember.name}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">{selectedMember.role}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Contact Info */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Contact Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Mail className="w-4 h-4" />
                    <span>{selectedMember.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Phone className="w-4 h-4" />
                    <span>{selectedMember.phone}</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Performance Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Rating</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedMember.rating} ⭐
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Completed Tasks</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedMember.completedTasks}
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Active Projects</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedMember.activeProjects}
                    </p>
                  </div>
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Experience</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedMember.experience} years
                    </p>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedMember.skills.map(skill => (
                    <span 
                      key={skill}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium shadow-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowIndividualChat(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  Start Individual Chat
                </button>
                <button
                  type="button"
                  onClick={() => toggleGroupMember(selectedMember)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
                    groupChatMembers.some((item) => item.id === selectedMember.id)
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  {groupChatMembers.some((item) => item.id === selectedMember.id) ? 'Remove from Group Chat' : 'Add to Group Chat'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ProjectChat
        isOpen={showGroupChat}
        onClose={() => setShowGroupChat(false)}
        chatType="group"
        projectName="Team Members"
        participants={chatParticipants}
        currentUserId={currentUser?.id || '1'}
      />

      {selectedMember && (
        <ProjectChat
          isOpen={showIndividualChat}
          onClose={() => {
            setShowIndividualChat(false);
            setSelectedMember(null);
          }}
          chatType="individual"
          projectName="Team Members"
          participants={[{
            id: selectedMember.id,
            name: selectedMember.name,
            avatar: selectedMember.avatar,
            role: selectedMember.role,
            isOnline: selectedMember.availability === 'available'
          }]}
          currentUserId={currentUser?.id || '1'}
        />
      )}
    </div>
  );
}
