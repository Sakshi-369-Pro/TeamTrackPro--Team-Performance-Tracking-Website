import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useTaskStore } from '../../store/taskStore';
import { useAIStore } from '../../store/aiStore';
import {
  Clock, CheckCircle, AlertCircle, Upload, Plus, Brain,
  Sparkles, AlertTriangle, BookOpen, Gauge, ListTodo, X,
  ChevronRight, Star, Calendar, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { Task } from '../../store/taskStore';

export default function MyTasks() {
  const user = useAuthStore((state) => state.user);
  const { tasks, addTaskUpdate } = useTaskStore();
  const { analyzeTask, taskAnalyses, analyzeTaskLoading } = useAIStore();

  // ─── Separate modal states ────────────────────────────────────────────
  const [updateModalTask, setUpdateModalTask] = useState<Task | null>(null);
  const [aiModalTask, setAiModalTask]         = useState<Task | null>(null);

  const [updateForm, setUpdateForm] = useState({
    description: '',
    progress: 0,
    timeSpent: 0,
    skillsUsed: '',
  });

  const myTasks      = tasks.filter((t) => t.assignedTo === user?.id);
  const activeTasks  = myTasks.filter((t) => t.status !== 'completed');
  const completedTasks = myTasks.filter((t) => t.status === 'completed');

  const currentAnalysis = aiModalTask ? taskAnalyses[aiModalTask.id] : undefined;

  // ─── Submit update ────────────────────────────────────────────────────
  const handleSubmitUpdate = () => {
    if (!updateModalTask || !user) return;
    if (!updateForm.description.trim()) {
      toast.error('Please describe what you worked on.');
      return;
    }
    const skillsList = updateForm.skillsUsed
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    addTaskUpdate({
      taskId: updateModalTask.id,
      userId: user.id,
      userName: user.name,
      description: updateForm.description,
      progress: updateForm.progress,
      timeSpent: updateForm.timeSpent,
      files: [],
      skillsUsed: skillsList,
    });

    toast.success('Task update submitted successfully!');
    setUpdateModalTask(null);
    setUpdateForm({ description: '', progress: 0, timeSpent: 0, skillsUsed: '' });
  };

  // ─── Open AI modal ────────────────────────────────────────────────────
  const handleOpenAI = async (task: Task) => {
    setAiModalTask(task);
    if (!taskAnalyses[task.id] && user) {
      await analyzeTask(task, user);
    }
  };

  // ─── Refresh AI plan ──────────────────────────────────────────────────
  const handleRefreshAI = async () => {
    if (!aiModalTask || !user) return;
    await analyzeTask(aiModalTask, user);
    toast.success('AI plan refreshed!');
  };

  // ─── Priority colour helper ───────────────────────────────────────────
  const priorityClass = (p: string) =>
    p === 'urgent'
      ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
      : p === 'high'
      ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300'
      : p === 'medium'
      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300'
      : 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300';

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Tasks</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your assigned tasks, log updates, and use AI to plan smarter execution.
        </p>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Active Tasks</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{activeTasks.length}</p>
            </div>
            <Clock className="w-12 h-12 text-blue-500" />
          </div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">Completed</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{completedTasks.length}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Total Progress</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {Math.round(myTasks.reduce((a, t) => a + t.progress, 0) / (myTasks.length || 1))}%
              </p>
            </div>
            <AlertCircle className="w-12 h-12 text-purple-500" />
          </div>
        </div>
      </div>

      {/* ── Active Tasks ── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Active Tasks</h2>
        <div className="space-y-4">
          {activeTasks.length > 0 ? activeTasks.map((task) => (
            <div key={task.id} className="p-5 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-md transition-all">

              {/* Task header */}
              <div className="flex items-start justify-between mb-3 gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{task.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{task.description}</p>
                </div>
                <span className={`px-3 py-1 text-xs rounded-full font-medium whitespace-nowrap ${priorityClass(task.priority)}`}>
                  {task.priority}
                </span>
              </div>

              {/* Meta */}
              <div className="flex items-center gap-4 mb-3 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Est: {task.estimatedTime}h</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5" /> Spent: {task.actualTime.toFixed(1)}h</span>
              </div>

              {/* Progress bar */}
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Progress</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{task.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
              </div>

              {/* Skill tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {task.skillsRequired.map((skill) => (
                  <span key={skill} className="px-2 py-1 text-xs bg-purple-600 text-white rounded-full font-medium shadow-sm">
                    {skill}
                  </span>
                ))}
              </div>

              {/* ── Action buttons — COMPLETELY SEPARATE ── */}
              <div className="grid grid-cols-2 gap-3">
                {/* Add Update button → opens ONLY the update modal */}
                <button
                  onClick={() => {
                    setUpdateModalTask(task);
                    setUpdateForm({ description: '', progress: task.progress, timeSpent: 0, skillsUsed: '' });
                  }}
                  className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Update
                </button>

                {/* AI Assistant button → opens ONLY the AI modal */}
                <button
                  onClick={() => handleOpenAI(task)}
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-all flex items-center justify-center gap-2 font-medium"
                >
                  <Brain className="w-4 h-4" />
                  AI Assistant
                </button>
              </div>

              {/* Recent updates preview */}
              {task.updates.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Recent Updates</h4>
                  <div className="space-y-2">
                    {task.updates.slice(-2).reverse().map((update) => (
                      <div key={update.id} className="text-sm p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-900 dark:text-white">{update.description}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 flex-wrap">
                          <span>Progress: {update.progress}%</span>
                          <span>•</span>
                          <span>Time: {update.timeSpent}min</span>
                          <span>•</span>
                          <span>{new Date(update.timestamp).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">No active tasks at the moment.</div>
          )}
        </div>
      </div>

      {/* ── Completed Tasks ── */}
      {completedTasks.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Completed Tasks</h2>
          <div className="space-y-3">
            {completedTasks.map((task) => (
              <div key={task.id} className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{task.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Completed on {task.completedAt ? new Date(task.completedAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  {task.quality > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold text-gray-900 dark:text-white">{task.quality}/5</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          MODAL 1 — ADD UPDATE (standalone, no AI panel)
      ════════════════════════════════════════════════════ */}
      {updateModalTask && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setUpdateModalTask(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add Work Update</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{updateModalTask.title}</p>
              </div>
              <button
                onClick={() => setUpdateModalTask(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  What did you work on? <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={updateForm.description}
                  onChange={(e) => setUpdateForm({ ...updateForm, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  rows={4}
                  placeholder="Describe the work you completed..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Progress (%)
                  </label>
                  <input
                    type="number"
                    value={updateForm.progress}
                    onChange={(e) => setUpdateForm({ ...updateForm, progress: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    min="0"
                    max="100"
                  />
                  <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div className="bg-blue-600 h-1.5 rounded-full transition-all" style={{ width: `${updateForm.progress}%` }} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Time Spent (minutes)
                  </label>
                  <input
                    type="number"
                    value={updateForm.timeSpent}
                    onChange={(e) => setUpdateForm({ ...updateForm, timeSpent: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Skills Used <span className="text-gray-400 font-normal">(comma-separated)</span>
                </label>
                <input
                  type="text"
                  value={updateForm.skillsUsed}
                  onChange={(e) => setUpdateForm({ ...updateForm, skillsUsed: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="React, TypeScript, API Integration"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Upload Proof Files
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, PDF up to 10MB</p>
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={handleSubmitUpdate}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                Submit Update
              </button>
              <button
                onClick={() => setUpdateModalTask(null)}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          MODAL 2 — AI ASSISTANT (standalone, no update form)
      ════════════════════════════════════════════════════ */}
      {aiModalTask && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setAiModalTask(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-3xl shadow-2xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI Task Assistant</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{aiModalTask.title}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRefreshAI}
                  disabled={analyzeTaskLoading}
                  className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all
                    ${analyzeTaskLoading
                      ? 'bg-indigo-400 text-white cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
                    }`}
                >
                  <Sparkles className={`w-4 h-4 ${analyzeTaskLoading ? 'animate-pulse' : ''}`} />
                  {analyzeTaskLoading ? 'Analyzing...' : currentAnalysis ? 'Refresh Plan' : 'Generate Plan'}
                </button>
                <button
                  onClick={() => setAiModalTask(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Modal body — scrollable */}
            <div className="overflow-y-auto flex-1 p-6">
              {analyzeTaskLoading && !currentAnalysis ? (
                /* Loading skeleton */
                <div className="space-y-4 animate-pulse">
                  <div className="grid grid-cols-3 gap-4">
                    {[1,2,3].map(i => <div key={i} className="h-24 rounded-xl bg-gray-100 dark:bg-gray-700" />)}
                  </div>
                  <div className="h-20 rounded-xl bg-gray-100 dark:bg-gray-700" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-48 rounded-xl bg-gray-100 dark:bg-gray-700" />
                    <div className="h-48 rounded-xl bg-gray-100 dark:bg-gray-700" />
                  </div>
                </div>
              ) : currentAnalysis ? (
                <div className="space-y-5">

                  {/* Metric cards */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Gauge className="w-4 h-4 text-indigo-600" />
                        <p className="text-xs text-gray-500 dark:text-gray-400">Complexity</p>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{currentAnalysis.complexityScore}<span className="text-sm font-normal text-gray-400">/10</span></p>
                      <p className="text-xs text-gray-500 mt-1">Confidence: {currentAnalysis.confidence}%</p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <p className="text-xs text-gray-500 dark:text-gray-400">Est. Time</p>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{currentAnalysis.estimatedHours}<span className="text-sm font-normal text-gray-400">h</span></p>
                      <p className="text-xs text-gray-500 mt-1">AI-generated estimate</p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <p className="text-xs text-gray-500 dark:text-gray-400">Risk Factors</p>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{currentAnalysis.riskFactors.length}</p>
                      <p className="text-xs text-gray-500 mt-1">Potential blockers</p>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl p-4">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                      <Brain className="w-4 h-4 text-indigo-600" /> AI Summary
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{currentAnalysis.summary}</p>
                  </div>

                  {/* Subtasks + Skills */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Subtasks */}
                    <div className="bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <ListTodo className="w-4 h-4 text-indigo-600" />
                        Suggested Subtasks
                      </h4>
                      <div className="space-y-2">
                        {currentAnalysis.subtasks.map((subtask) => (
                          <div key={subtask.id} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  <span className="text-indigo-500 mr-1">{subtask.order}.</span>{subtask.title}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{subtask.description}</p>
                              </div>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-600 text-white whitespace-nowrap font-medium shadow-sm">
                                {subtask.estimatedHours}h
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Skills column */}
                    <div className="space-y-4">
                      {/* Suggested skills */}
                      <div className="bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">Suggested Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {currentAnalysis.suggestedSkills.map((skill) => (
                            <span key={skill} className="px-2.5 py-1 text-xs rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Missing skills */}
                      <div className="bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-amber-500" /> Skills to Develop
                        </h4>
                        {currentAnalysis.missingSkills.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {currentAnalysis.missingSkills.map((skill) => (
                              <span key={skill} className="px-2.5 py-1 text-xs rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                                {skill}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500">Your profile aligns well with this task.</p>
                        )}
                      </div>

                      {/* Risk factors */}
                      {currentAnalysis.riskFactors.length > 0 && (
                        <div className="bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl p-4">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-500" /> Risk Factors
                          </h4>
                          <div className="space-y-1.5">
                            {currentAnalysis.riskFactors.map((risk) => (
                              <div key={risk} className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-xs text-gray-700 dark:text-gray-300 border border-red-100 dark:border-red-800">
                                {risk}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Execution tips */}
                  <div className="bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <ChevronRight className="w-4 h-4 text-blue-500" /> Execution Suggestions
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {currentAnalysis.suggestions.map((tip) => (
                        <div key={tip} className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-sm text-gray-700 dark:text-gray-300">
                          {tip}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Empty state */
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 flex items-center justify-center mb-4">
                    <Brain className="w-10 h-10 text-indigo-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Generate Your AI Plan</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm">
                    Click "Generate Plan" above to get subtasks, missing skills, risk factors, and execution suggestions for this task.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
