import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useChecklistStore } from '../stores/checklistStore';
import { useTemplateStore } from '../stores/templateStore';
import { createChecklistFromTemplate } from '../utils/template';
import { calculateChecklistProgress, getStatusLabel, getStatusColorClass } from '../utils/status';
import { ProgressBar } from '../components/ProgressBar';
import { ThemeToggle } from '../components/ThemeToggle';
import { format } from 'date-fns';
import clsx from 'clsx';

export function Home() {
  const navigate = useNavigate();
  const { checklists, addChecklist } = useChecklistStore();
  const { templates } = useTemplateStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [newChecklistTitle, setNewChecklistTitle] = useState('');

  const handleCreateChecklist = () => {
    if (!selectedTemplateId || !newChecklistTitle.trim()) return;
    
    const template = templates.find(t => t.id === selectedTemplateId);
    if (!template) return;
    
    const newChecklist = createChecklistFromTemplate(template, newChecklistTitle.trim());
    addChecklist(newChecklist);
    setShowCreateModal(false);
    setNewChecklistTitle('');
    setSelectedTemplateId('');
    navigate(`/checklist/${newChecklist.id}`);
  };

  const sortedChecklists = [...checklists].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            投资尽调检查清单
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            系统化管理项目尽调流程，确保每一项都有据可查
          </p>
        </header>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            我的清单
          </h2>
          <div className="flex space-x-3 items-center">
            <ThemeToggle />
            <Link
              to="/templates"
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 
                       border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 
                       dark:hover:bg-gray-700 transition-colors"
            >
              模板管理
            </Link>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                       transition-colors font-medium"
            >
              + 新建清单
            </button>
          </div>
        </div>

        {sortedChecklists.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <svg
              className="mx-auto h-16 w-16 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              还没有清单
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              点击上方按钮创建你的第一份尽调清单
            </p>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              立即创建
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {sortedChecklists.map((checklist) => {
              const progress = calculateChecklistProgress(checklist);
              return (
                <Link
                  key={checklist.id}
                  to={`/checklist/${checklist.id}`}
                  className="block p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 
                           dark:border-gray-700 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {checklist.title}
                      </h3>
                      {checklist.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {checklist.description}
                        </p>
                      )}
                    </div>
                    <span
                      className={clsx(
                        'px-3 py-1 text-xs font-medium rounded-full text-white',
                        getStatusColorClass(checklist.status)
                      )}
                    >
                      {getStatusLabel(checklist.status)}
                    </span>
                  </div>
                  
                  <div className="mb-2">
                    <ProgressBar
                      completed={progress.completed}
                      total={progress.total}
                      size="sm"
                      showText={false}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>
                      {progress.completed}/{progress.total} 必填项已完成
                    </span>
                    <span>
                      更新于 {format(new Date(checklist.updatedAt), 'MM-dd HH:mm')}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                新建清单
              </h3>
            </div>
            
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  清单名称
                </label>
                <input
                  type="text"
                  value={newChecklistTitle}
                  onChange={(e) => setNewChecklistTitle(e.target.value)}
                  placeholder="输入项目名称..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  选择模板
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">请选择模板...</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="p-5 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setNewChecklistTitle('');
                  setSelectedTemplateId('');
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 
                         border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 
                         dark:hover:bg-gray-700 transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleCreateChecklist}
                disabled={!selectedTemplateId || !newChecklistTitle.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                         transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
