import { useState } from 'react';
import { Building2, Calendar, MapPin, Code, Award, ChevronDown, ChevronUp, Briefcase, Star, Users, FolderKanban } from 'lucide-react';


interface CompanyHistory {
  id: string;
  companyName: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string | null;
  isCurrentJob: boolean;
  description: string;
  technologiesUsed: string[];
  achievements: string[];
  projectsWorkedOn: {
    name: string;
    role: string;
    duration: string;
    skillsUsed: string[];
    status: 'completed' | 'ongoing';
  }[];
  teamSize: number;
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
}

// Mock work history data
const mockCompanyHistory: CompanyHistory[] = [
  {
    id: '1',
    companyName: 'TechCorp Solutions',
    position: 'Senior Software Engineer',
    location: 'San Francisco, CA',
    startDate: '2022-03-01',
    endDate: null,
    isCurrentJob: true,
    description: 'Leading frontend development team, architecting scalable web applications, and mentoring junior developers.',
    technologiesUsed: ['React', 'TypeScript', 'Node.js', 'AWS', 'Docker', 'GraphQL'],
    achievements: [
      'Led migration of legacy system to microservices architecture',
      'Reduced page load time by 40% through optimization',
      'Mentored 5 junior developers',
      'Implemented CI/CD pipeline saving 20hrs/week'
    ],
    projectsWorkedOn: [
      { name: 'E-Commerce Platform Redesign', role: 'Lead Developer', duration: '6 months', skillsUsed: ['React', 'Redux', 'Node.js'], status: 'completed' },
      { name: 'Real-time Analytics Dashboard', role: 'Full Stack Developer', duration: '4 months', skillsUsed: ['TypeScript', 'D3.js', 'WebSocket'], status: 'completed' },
      { name: 'Mobile App Backend API', role: 'Backend Architect', duration: '3 months', skillsUsed: ['Node.js', 'PostgreSQL', 'Redis'], status: 'ongoing' }
    ],
    teamSize: 12,
    employmentType: 'Full-time'
  },
  {
    id: '2',
    companyName: 'InnovateTech Inc',
    position: 'Software Developer',
    location: 'Austin, TX',
    startDate: '2020-06-01',
    endDate: '2022-02-28',
    isCurrentJob: false,
    description: 'Developed and maintained web applications for enterprise clients using modern JavaScript frameworks.',
    technologiesUsed: ['React', 'JavaScript', 'Python', 'Django', 'MySQL', 'Git'],
    achievements: [
      'Built customer portal used by 10,000+ users',
      'Won "Employee of the Quarter" twice',
      'Reduced bug reports by 35% through code reviews'
    ],
    projectsWorkedOn: [
      { name: 'Customer Portal 2.0', role: 'Frontend Developer', duration: '8 months', skillsUsed: ['React', 'CSS', 'REST API'], status: 'completed' },
      { name: 'Internal HR System', role: 'Full Stack Developer', duration: '5 months', skillsUsed: ['Python', 'Django', 'PostgreSQL'], status: 'completed' }
    ],
    teamSize: 8,
    employmentType: 'Full-time'
  },
  {
    id: '3',
    companyName: 'StartupHub',
    position: 'Junior Developer',
    location: 'New York, NY',
    startDate: '2018-09-01',
    endDate: '2020-05-31',
    isCurrentJob: false,
    description: 'Started as an intern and grew into a full-time role building MVPs for startup clients.',
    technologiesUsed: ['JavaScript', 'Vue.js', 'PHP', 'Laravel', 'MySQL'],
    achievements: [
      'Promoted from intern to full-time in 3 months',
      'Delivered 15+ client projects on time',
      'Created reusable component library'
    ],
    projectsWorkedOn: [
      { name: 'Food Delivery MVP', role: 'Frontend Developer', duration: '3 months', skillsUsed: ['Vue.js', 'Vuex', 'SCSS'], status: 'completed' },
      { name: 'Fitness Tracking App', role: 'Junior Developer', duration: '4 months', skillsUsed: ['JavaScript', 'PHP', 'MySQL'], status: 'completed' },
      { name: 'Social Media Dashboard', role: 'Junior Developer', duration: '2 months', skillsUsed: ['Vue.js', 'Chart.js'], status: 'completed' }
    ],
    teamSize: 5,
    employmentType: 'Full-time'
  },
  {
    id: '4',
    companyName: 'FreelanceWork',
    position: 'Freelance Web Developer',
    location: 'Remote',
    startDate: '2017-01-01',
    endDate: '2018-08-31',
    isCurrentJob: false,
    description: 'Worked with multiple clients to build websites and web applications.',
    technologiesUsed: ['HTML', 'CSS', 'JavaScript', 'WordPress', 'PHP'],
    achievements: [
      'Completed 25+ freelance projects',
      'Maintained 5-star rating on all platforms',
      'Built long-term relationships with 10+ recurring clients'
    ],
    projectsWorkedOn: [
      { name: 'Restaurant Website', role: 'Web Developer', duration: '2 weeks', skillsUsed: ['WordPress', 'CSS', 'JavaScript'], status: 'completed' },
      { name: 'Portfolio Sites (Various)', role: 'Web Developer', duration: 'Ongoing', skillsUsed: ['HTML', 'CSS', 'JavaScript'], status: 'completed' }
    ],
    teamSize: 1,
    employmentType: 'Contract'
  }
];

export default function WorkExperience() {
  const [expandedCompany, setExpandedCompany] = useState<string | null>('1');
  const [activeView, setActiveView] = useState<'timeline' | 'projects' | 'summary'>('timeline');

  const totalExperience = mockCompanyHistory.reduce((acc, company) => {
    const start = new Date(company.startDate);
    const end = company.endDate ? new Date(company.endDate) : new Date();
    const years = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
    return acc + years;
  }, 0);

  const allTechnologies = [...new Set(mockCompanyHistory.flatMap(c => c.technologiesUsed))];
  const totalProjects = mockCompanyHistory.reduce((acc, c) => acc + c.projectsWorkedOn.length, 0);

  const toggleExpand = (companyId: string) => {
    setExpandedCompany(expandedCompany === companyId ? null : companyId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Work Experience 💼
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Your complete professional journey and project history
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveView('timeline')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeView === 'timeline'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Timeline
          </button>
          <button
            onClick={() => setActiveView('projects')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeView === 'projects'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            All Projects
          </button>
          <button
            onClick={() => setActiveView('summary')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeView === 'summary'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Summary
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <p className="text-blue-100 text-sm">Total Experience</p>
              <p className="text-2xl font-bold">{totalExperience.toFixed(1)} Years</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-green-100 text-sm">Companies</p>
              <p className="text-2xl font-bold">{mockCompanyHistory.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <p className="text-purple-100 text-sm">Projects</p>
              <p className="text-2xl font-bold">{totalProjects}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <p className="text-orange-100 text-sm">Technologies</p>
              <p className="text-2xl font-bold">{allTechnologies.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline View */}
      {activeView === 'timeline' && (
        <div className="space-y-4">
          {mockCompanyHistory.map((company, index) => (
            <div
              key={company.id}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all ${
                expandedCompany === company.id ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {/* Company Header */}
              <div
                className="p-6 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group"
                onClick={() => toggleExpand(company.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg ${
                      company.isCurrentJob ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-gray-500 to-gray-600'
                    }`}>
                      {company.companyName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                          {company.companyName}
                        </h3>
                        {company.isCurrentJob && (
                          <span className="px-2 py-0.5 bg-green-600 text-white text-xs font-medium rounded-full shadow-sm">
                            Current
                          </span>
                        )}
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full shadow-sm ${
                          company.employmentType === 'Full-time' ? 'bg-blue-600 text-white' :
                          company.employmentType === 'Contract' ? 'bg-purple-600 text-white' :
                          'bg-gray-600 text-white'
                        }`}>
                          {company.employmentType}
                        </span>
                      </div>
                      <p className="text-lg text-gray-700 dark:text-gray-300 font-medium mt-1 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
                        {company.position}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {company.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(company.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - {' '}
                          {company.isCurrentJob ? 'Present' : new Date(company.endDate!).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          Team of {company.teamSize}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-lg transition-colors">
                    {expandedCompany === company.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    )}
                  </button>
                </div>

                {/* Quick Tech Stack Preview */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {company.technologiesUsed.slice(0, 5).map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-md"
                    >
                      {tech}
                    </span>
                  ))}
                  {company.technologiesUsed.length > 5 && (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs rounded-md">
                      +{company.technologiesUsed.length - 5} more
                    </span>
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {expandedCompany === company.id && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-800/50 space-y-6">
                  {/* Description */}
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">About This Role</h4>
                    <p className="text-gray-600 dark:text-gray-400">{company.description}</p>
                  </div>

                  {/* Projects Worked On */}
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <FolderKanban className="w-5 h-5 text-blue-500" />
                      Projects ({company.projectsWorkedOn.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {company.projectsWorkedOn.map((project, idx) => (
                        <div
                          key={idx}
                          className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-white">{project.name}</h5>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {project.role} • {project.duration}
                              </p>
                            </div>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                              project.status === 'completed'
                                ? 'bg-green-600 text-white'
                                : 'bg-blue-600 text-white'
                            }`}>
                              {project.status}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-3">
                            {project.skillsUsed.map((skill) => (
                              <span
                                key={skill}
                                className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs rounded"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Achievements */}
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Award className="w-5 h-5 text-yellow-500" />
                      Key Achievements
                    </h4>
                    <ul className="space-y-2">
                      {company.achievements.map((achievement, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Star className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-600 dark:text-gray-400">{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* All Technologies */}
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Code className="w-5 h-5 text-purple-500" />
                      Technologies Used
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {company.technologiesUsed.map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 text-sm rounded-lg font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Timeline Connector */}
              {index < mockCompanyHistory.length - 1 && (
                <div className="absolute left-10 top-full w-0.5 h-4 bg-gray-300 dark:bg-gray-600"></div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* All Projects View */}
      {activeView === 'projects' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            All Projects Across Companies
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Project Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Company</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Duration</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Skills</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                </tr>
              </thead>
              <tbody>
                {mockCompanyHistory.flatMap((company) =>
                  company.projectsWorkedOn.map((project, idx) => (
                    <tr key={`${company.id}-${idx}`} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-900 dark:text-white">{project.name}</span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{company.companyName}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{project.role}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{project.duration}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {project.skillsUsed.slice(0, 2).map((s) => (
                            <span key={s} className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded font-medium shadow-sm">
                              {s}
                            </span>
                          ))}
                          {project.skillsUsed.length > 2 && (
                            <span className="text-xs text-gray-500">+{project.skillsUsed.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          project.status === 'completed'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                        }`}>
                          {project.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary View */}
      {activeView === 'summary' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Career Progression */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-500" />
              Career Progression
            </h3>
            <div className="space-y-4">
              {mockCompanyHistory.map((company) => (
                <div key={company.id} className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${company.isCurrentJob ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{company.position}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{company.companyName}</p>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(company.startDate).getFullYear()} - {company.isCurrentJob ? 'Present' : new Date(company.endDate!).getFullYear()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Technology Expertise */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Code className="w-5 h-5 text-purple-500" />
              Technology Expertise
            </h3>
            <div className="flex flex-wrap gap-2">
              {allTechnologies.map((tech) => {
                const usageCount = mockCompanyHistory.filter(c => c.technologiesUsed.includes(tech)).length;
                return (
                  <span
                    key={tech}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm ${
                      usageCount >= 3
                        ? 'bg-purple-600 text-white'
                        : usageCount >= 2
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-600 text-white'
                    }`}
                  >
                    {tech}
                    {usageCount >= 2 && <span className="ml-1 text-xs opacity-70">×{usageCount}</span>}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Key Metrics */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              Career Highlights
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300">Total Achievements</span>
                <span className="font-bold text-yellow-600 dark:text-yellow-400">
                  {mockCompanyHistory.reduce((acc, c) => acc + c.achievements.length, 0)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300">Projects Completed</span>
                <span className="font-bold text-green-600 dark:text-green-400">
                  {mockCompanyHistory.reduce((acc, c) => acc + c.projectsWorkedOn.filter(p => p.status === 'completed').length, 0)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300">Companies Worked</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{mockCompanyHistory.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300">Longest Tenure</span>
                <span className="font-bold text-purple-600 dark:text-purple-400">2+ years</span>
              </div>
            </div>
          </div>

          {/* All Roles Held */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-orange-500" />
              Roles & Positions
            </h3>
            <div className="space-y-3">
              {mockCompanyHistory.map((company) => (
                <div key={company.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{company.position}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{company.companyName}</p>
                    </div>
                    <span className={`px-2 py-0.5 text-xs rounded-full shadow-sm ${
                      company.employmentType === 'Full-time'
                        ? 'bg-green-600 text-white'
                        : 'bg-purple-600 text-white'
                    }`}>
                      {company.employmentType}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
