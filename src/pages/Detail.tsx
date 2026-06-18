import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useChecklistStore } from '../stores/checklistStore';
import { useTemplateStore } from '../stores/templateStore';
import { SectionList } from '../components/SectionList';
import { CheckItem } from '../components/CheckItem';
import { ProgressBar } from '../components/ProgressBar';
import { 
  calculateChecklistProgress, 
  getStatusLabel, 
  getStatusColorClass,
  getIncompleteMandatoryItems,
  checkDependenciesMet,
} from '../utils/status';
import { createTemplateFromChecklist } from '../utils/template';
import { downloadMarkdown, printReport } from '../utils/export';
import clsx from 'clsx';
import { format } from 'date-fns';

export function Detail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { checklists, updateCheckItem, updateCheckItemStatus, updateCheckItemValue, deleteChecklist } = useChecklistStore();
  const { addTemplate } = useTemplateStore();
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const checklist = checklists.find(c => c.id === id);
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(
    checklist?.sections[0]?.id || null
  );

  const progress = useMemo(
    () => (checklist ? calculateChecklistProgress(checklist) : { completed: 0, total: 0 }),
    [checklist]
  );

  const incompleteItems = useMemo(
    () => (checklist ? getIncompleteMandatoryItems(checklist) : []),
    [checklist]
  );

  const currentSection = useMemo(() => {
    if (!checklist || !currentSectionId) return null;
    return checklist.sections.find(s => s.id === currentSectionId) || null;
  }, [checklist, currentSectionId]);

  const allItems = useMemo(() => {
    if (!checklist) return [];
    return checklist.sections.flatMap(s => s.items);
  }, [checklist]);

  const handleNotesChange = (itemId: string, notes: string) => {
    if (!checklist || !currentSection) return;
    updateCheckItem(checklist.id, currentSection.id, itemId, { notes });
  };

  const handleSubmit = () => {
    if (!checklist) return;
    setShowSubmitModal(false);
    updateChecklistSubmitted(checklist.id);
  };

  const updateChecklistSubmitted = (id: string) => {
    const { updateChecklist } = useChecklistStore.getState();
    updateChecklist(id, { status: 'submitted' });
  };

  const handleSaveAsTemplate = () => {
    if (!checklist || !templateName.trim()) return;
    const template = createTemplateFromChecklist(checklist, templateName.trim());
    addTemplate(template);
    setShowSaveTemplateModal(false);
    setTemplateName('');
  };

  const handleDelete = () => {
    if (!checklist) return;
    if (confirm(`确定要删除「${checklist.title}」吗？此操作不可恢复。`)) {
      deleteChecklist(checklist.id);
      navigate('/');
    }
  };

  if (!checklist) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            清单不存在
          </h2>
          <Link
            to="/"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* 侧边栏 */}
      <aside
        className={clsx(
          'bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700',
          'flex flex-col transition-all duration-300',
          sidebarOpen ? 'w-72' : 'w-0 overflow-hidden'
        )}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <Link
            to="/"
            className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回清单列表
          </Link>
        </div>

        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white truncate">
            {checklist.title}
          </h2>
          <div className="flex items-center space-x-2 mt-2">
            <span
              className={clsx(
                'w-2.5 h-2.5 rounded-full',
                getStatusColorClass(checklist.status)
              )}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {getStatusLabel(checklist.status)}
            </span>
          </div>
        </div>

        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          总体进度
          </div>
          <ProgressBar completed={progress.completed} total={progress.total} />
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {checklist.sections.length > 0 && (
            <SectionList
              sections={checklist.sections}
              currentSectionId={currentSectionId}
              onSectionSelect={setCurrentSectionId}
            />
          )}
        </div>

        <div className="p-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <button
            type="button"
            onClick={() => setShowSaveTemplateModal(true)}
            className="w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-left"
          >
            保存为模板
          </button>
          <button
            type="button"
            onClick={() => downloadMarkdown(checklist)}
            className="w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-left"
          >
            导出 Markdown
          </button>
          <button
            type="button"
            onClick={() => printReport(checklist)}
            className="w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-left"
          >
            打印 / 导出 PDF
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-left"
          >
            删除清单
          </button>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* 顶部栏 */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {currentSection?.title || '请选择章节'}
              </h1>
              {currentSection?.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {currentSection.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              更新于 {format(new Date(checklist.updatedAt), 'yyyy-MM-dd HH:mm')}
            </span>
            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              disabled={checklist.status === 'submitted'}
              className={clsx(
                'px-4 py-2 rounded-lg font-medium transition-colors',
                checklist.status === 'submitted'
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              )}
            >
              {checklist.status === 'submitted' ? '已提交' : '提交通过'}
            </button>
          </div>
        </header>

        {/* 内容区 */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentSection ? (
            <div className="max-w-3xl mx-auto space-y-4">
              {currentSection.items.map((item) => {
                const depsMet = checkDependenciesMet(item, allItems);
                return (
                  <CheckItem
                    key={item.id}
                    item={item}
                    disabled={checklist.status === 'submitted'}
                    dependenciesUnmet={!depsMet}
                    onStatusChange={(status) => {
                      updateCheckItemStatus(checklist.id, currentSection.id, item.id, status);
                    }}
                    onValueChange={(value) => {
                      updateCheckItemValue(checklist.id, currentSection.id, item.id, value);
                    }}
                    onNotesChange={(notes) => handleNotesChange(item.id, notes)}
                  />
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
              请从左侧选择一个章节
            </div>
          )}
        </div>
      </main>

      {/* 提交确认弹窗 */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                提交清单
              </h3>
            </div>
            
            <div className="p-5">
              {incompleteItems.length > 0 ? (
                <div>
                  <p className="text-red-600 dark:text-red-400 font-medium mb-3">
                  ⚠️ 以下必填项尚未完成，无法标记为通过：
                </p>
                  <ul className="space-y-2">
                    {incompleteItems.map((item) => {
                      const section = checklist.sections.find(s =>
                        s.items.some(i => i.id === item.id)
                      );
                      return (
                        <li key={item.id} className="text-sm text-gray-700 dark:text-gray-300">
                          <span className="text-gray-500 dark:text-gray-400">
                            [{section?.title}]
                          </span>{' '}
                          {item.title}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : (
                <div>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    确定要将此清单标记为「通过」吗？
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    提交后清单状态将变为"已提交"，数据将被锁定不可修改。
                  </p>
                </div>
              )}
            </div>
            
            <div className="p-5 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 
                         border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 
                         dark:hover:bg-gray-700 transition-colors"
              >
                取消
              </button>
              {incompleteItems.length === 0 && (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 
                           transition-colors font-medium"
                >
                  确认提交
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 保存为模板弹窗 */}
      {showSaveTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                保存为模板
              </h3>
            </div>
            
            <div className="p-5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                模板名称
              </label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="输入模板名称..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="p-5 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowSaveTemplateModal(false);
                  setTemplateName('');
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 
                         border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 
                         dark:hover:bg-gray-700 transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSaveAsTemplate}
                disabled={!templateName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                         transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
