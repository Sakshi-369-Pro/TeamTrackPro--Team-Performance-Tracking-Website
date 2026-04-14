import { useState } from 'react';
import { Crown, Star, TrendingUp, Target, Award, Search, MessageSquare, Eye, X, Shield, Calendar, Clock, BarChart2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import ProjectChat from '../chat/ProjectChat';

interface Candidate {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  skillMatch: number;
  workQuality: number;
  completionSpeed: number;
  availability: string;
  experience: number;
  matchScore: number;
  role: string;
  skills: string[];
}

export default function SmartSelection() {
  const { user: currentUser } = useAuthStore();
  const [searchInput, setSearchInput] = useState('');
  const [priority, setPriority] = useState<'quality' | 'speed' | 'balanced'>('balanced');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  
  const [showChat, setShowChat] = useState(false);
  const [chatCandidate, setChatCandidate] = useState<Candidate | null>(null);

  const initialCandidates: Candidate[] = [
    {
      id: '3',
      name: 'Alex Backend',
      avatar: '👨‍💻',
      rating: 4.9,
      skillMatch: 95,
      workQuality: 97,
      completionSpeed: 92,
      availability: 'available',
      experience: 5,
      matchScore: 96,
      role: 'Full Stack Engineer',
      skills: ['Node.js', 'PostgreSQL', 'Docker', 'AWS'],
    },
    {
      id: '2',
      name: 'Sarah Developer',
      avatar: '👩‍💻',
      rating: 4.8,
      skillMatch: 88,
      workQuality: 90,
      completionSpeed: 95,
      availability: 'available',
      experience: 3,
      matchScore: 91,
      role: 'Frontend Developer',
      skills: ['React', 'TypeScript', 'Tailwind CSS', 'Redux'],
    },
    {
      id: '4',
      name: 'Emma QA',
      avatar: '🔍',
      rating: 4.7,
      skillMatch: 82,
      workQuality: 91,
      completionSpeed: 88,
      availability: 'available',
      experience: 2,
      matchScore: 87,
      role: 'QA Engineer',
      skills: ['Cypress', 'Selenium', 'Jest', 'API Testing'],
    },
    {
      id: '5',
      name: 'Mike Designer',
      avatar: '🎨',
      rating: 4.6,
      skillMatch: 75,
      workQuality: 88,
      completionSpeed: 85,
      availability: 'busy',
      experience: 4,
      matchScore: 82,
      role: 'UI/UX Designer',
      skills: ['Figma', 'Adobe XD', 'User Research', 'Prototyping'],
    },
  ];

  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);

  const handleSearch = () => {
    setIsSearching(true);
    setTimeout(() => {
      const searchTerms = searchInput.toLowerCase().split(' ');
      let filtered = [...initialCandidates];

      if (searchInput.trim()) {
        filtered = initialCandidates.filter(c => 
          c.name.toLowerCase().includes(searchInput.toLowerCase()) ||
          c.role.toLowerCase().includes(searchInput.toLowerCase()) ||
          c.skills.some(s => s.toLowerCase().includes(searchInput.toLowerCase())) ||
          searchTerms.some(term => c.role.toLowerCase().includes(term))
        );
      }

      filtered = sortCandidatesByPriority(filtered, priority);
      setCandidates(filtered);
      setIsSearching(false);
    }, 800);
  };

  const sortCandidatesByPriority = (list: Candidate[], p: 'quality' | 'speed' | 'balanced') => {
    return [...list].sort((a, b) => {
      if (p === 'quality') {
        return b.workQuality - a.workQuality;
      } else if (p === 'speed') {
        return b.completionSpeed - a.completionSpeed;
      } else {
        return b.matchScore - a.matchScore;
      }
    });
  };

  const handlePriorityChange = (newPriority: 'quality' | 'speed' | 'balanced') => {
    setPriority(newPriority);
    setIsSearching(true);
    setTimeout(() => {
      const sorted = sortCandidatesByPriority(candidates, newPriority);
      setCandidates(sorted);
      setIsSearching(false);
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Crown className="w-8 h-8 text-yellow-500" />
          AI-Powered Smart Selection
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Type criteria or skills to find the perfect team member using AI recommendations
        </p>
      </div>

      {/* Selection Criteria */}
      <div className="rounded-2xl p-6 border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Selection Criteria
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Search Candidates by Criteria / Skills
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Ex: Expert React developer with UI/UX experience who works fast..."
                className="flex-1 px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 font-medium"
              >
                <Search className="w-4 h-4" />
                Find Best Match
              </button>
            </div>
            {isSearching && (
              <div className="mt-2 text-sm text-blue-600 dark:text-blue-400 flex items-center gap-2">
                <span className="animate-spin">🔄</span> AI is searching for best candidates...
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Priority Focus (Click to sort candidates by priority)
            </label>
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: 'quality', label: 'Work Quality', icon: Award },
                { value: 'speed', label: 'Completion Speed', icon: TrendingUp },
                { value: 'balanced', label: 'Balanced', icon: Target },
              ].map((option) => {
                const Icon = option.icon;
                const isActive = priority === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => handlePriorityChange(option.value as typeof priority)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isActive
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-md'
                        : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:border-blue-300 dark:hover:border-blue-500'
                    }`}
                  >
                    <Icon className={`w-6 h-6 mx-auto mb-2 ${
                      isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
                    }`} />
                    <p className={`text-sm font-semibold ${
                      isActive 
                        ? 'text-blue-700 dark:text-blue-300' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {option.label}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          🤖 AI Recommendations
          <span className="text-sm font-normal text-gray-500">(Matching Candidates)</span>
        </h2>

        {candidates.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No candidates found matching your criteria. Try another search.
          </div>
        ) : (
          <div className="space-y-4">
            {candidates.map((candidate, index) => (
              <div
                key={candidate.id}
                className={`p-6 rounded-xl border-2 transition-all ${
                  index === 0
                    ? 'bg-amber-50 border-amber-300 shadow-lg'
                    : 'bg-white border-gray-200 shadow-md'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    {index === 0 && (
                      <div className="flex-shrink-0 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                        <Crown className="w-6 h-6 text-white" />
                      </div>
                    )}
                    {index !== 0 && (
                      <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xl font-bold text-gray-700">
                        {index + 1}
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-3xl">
                        {candidate.avatar}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg flex items-center gap-2 text-gray-900">
                          {candidate.name}
                          {index === 0 && <span className="text-yellow-500">👑</span>}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm text-gray-600">
                            {candidate.rating} • {candidate.experience} years exp • {candidate.role}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900">
                      {candidate.matchScore}%
                    </div>
                    <p className="text-sm text-gray-500">Match Score</p>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Skill Match</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500"
                          style={{ width: `${candidate.skillMatch}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {candidate.skillMatch}%
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Work Quality</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500"
                          style={{ width: `${candidate.workQuality}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {candidate.workQuality}%
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Speed</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-500"
                          style={{ width: `${candidate.completionSpeed}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {candidate.completionSpeed}%
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Availability</p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${
                      candidate.availability === 'available'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {candidate.availability}
                    </span>
                  </div>
                </div>

                {index === 0 && (
                  <div className="mt-4 p-3 bg-white rounded-xl border border-amber-200 shadow-sm">
                    <p className="text-sm text-gray-700">
                      <strong className="text-amber-700">🎯 AI Insight:</strong> This candidate has the highest overall match score with excellent work quality and skill alignment. Recommended for high-priority tasks.
                    </p>
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  <button 
                    onClick={() => {
                      setChatCandidate(candidate);
                      setShowChat(true);
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Chat with Candidate
                  </button>
                  <button 
                    onClick={() => setSelectedCandidate(candidate)}
                    className="px-4 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Candidate Profile Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl">
                  {selectedCandidate.avatar}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {selectedCandidate.name}
                  </h2>
                  <p className="text-blue-100">{selectedCandidate.role}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCandidate(null)}
                className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl flex items-center gap-3">
                  <Star className="w-8 h-8 text-yellow-500" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Rating</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedCandidate.rating}/5.0</p>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl flex items-center gap-3">
                  <Shield className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Experience</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedCandidate.experience} Years</p>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl flex items-center gap-3">
                  <Calendar className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Availability</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400 capitalize">{selectedCandidate.availability}</p>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl flex items-center gap-3">
                  <Clock className="w-8 h-8 text-purple-500" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Speed Score</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedCandidate.completionSpeed}%</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-blue-500" />
                  Performance Profile
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Work Quality</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{selectedCandidate.workQuality}%</span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: `${selectedCandidate.workQuality}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Skill Alignment</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{selectedCandidate.skillMatch}%</span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${selectedCandidate.skillMatch}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-500" />
                  Skills & Expertise
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCandidate.skills.map((skill, i) => (
                    <span 
                      key={i}
                      className="px-4 py-2 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg font-medium text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button 
                  onClick={() => setSelectedCandidate(null)}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-semibold"
                >
                  Close Profile
                </button>
                <button 
                  onClick={() => {
                    setChatCandidate(selectedCandidate);
                    setShowChat(true);
                    setSelectedCandidate(null);
                  }}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-5 h-5" />
                  Start Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {chatCandidate && (
        <ProjectChat
          isOpen={showChat}
          onClose={() => {
            setShowChat(false);
            setChatCandidate(null);
          }}
          chatType="individual"
          projectName="Recruitment"
          participants={[{
            id: chatCandidate.id,
            name: chatCandidate.name,
            avatar: chatCandidate.avatar,
            role: chatCandidate.role,
            isOnline: chatCandidate.availability === 'available'
          }]}
          currentUserId={currentUser?.id || '1'}
        />
      )}
    </div>
  );
}
