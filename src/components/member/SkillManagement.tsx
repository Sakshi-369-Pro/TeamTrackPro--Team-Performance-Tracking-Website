import { useState } from 'react';
import { useAuthStore, Skill } from '../../store/authStore';
import { Award, Plus, Trash2, CheckCircle } from 'lucide-react';

export default function SkillManagement() {
  const { user, updateUser } = useAuthStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSkill, setNewSkill] = useState({
    name: '',
    level: 'intermediate' as Skill['level'],
    yearsOfExperience: 1,
    autoDetected: false,
  });

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const updatedSkills: Skill[] = [...user.skills, { ...newSkill }];
    updateUser({ skills: updatedSkills });
    setShowAddModal(false);
    setNewSkill({
      name: '',
      level: 'intermediate',
      yearsOfExperience: 1,
      autoDetected: false,
    });
  };

  const handleRemoveSkill = (skillName: string) => {
    if (!user) return;
    const updatedSkills = user.skills.filter((s) => s.name !== skillName);
    updateUser({ skills: updatedSkills });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Skill Profile</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Add and manage your expertise</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} /> Add Skill
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Current Skills</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {user?.skills.map((skill) => (
            <div key={skill.name} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-gray-900 dark:text-white">{skill.name}</h4>
                  {skill.autoDetected && (
                    <span className="text-xs px-2 py-0.5 bg-purple-600 text-white rounded-full font-medium shadow-sm">
                      Auto-detected
                    </span>
                  )}
                </div>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <CheckCircle size={14} className="text-green-500" /> Level: {skill.level}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <Award size={14} className="text-yellow-500" /> {skill.yearsOfExperience} years exp
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleRemoveSkill(skill.name)}
                className="text-red-500 hover:text-red-600 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Auto-Detection System</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Skills are automatically detected and ranked based on the content of your task updates and manager ratings. This builds an authentic, tamper-proof record of your growth.
        </p>
        <ul className="space-y-2 text-sm text-gray-800 dark:text-gray-300">
          <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Beginner level achieved after 2 tasks</li>
          <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Intermediate level achieved after 5 tasks and 4.0 quality rating</li>
          <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Advanced level achieved after 10 tasks and 4.5 quality rating</li>
        </ul>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add Manual Skill</h2>
            <form onSubmit={handleAddSkill} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Skill Name</label>
                <input
                  type="text"
                  required
                  value={newSkill.name}
                  onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Level</label>
                <select
                  value={newSkill.level}
                  onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value as Skill['level'] })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Years of Experience</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newSkill.yearsOfExperience}
                  onChange={(e) => setNewSkill({ ...newSkill, yearsOfExperience: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
