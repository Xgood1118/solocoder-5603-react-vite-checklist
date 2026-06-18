import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTemplateStore } from '../stores/templateStore';
import { format } from 'date-fns';

export function TemplatePage() {
  const { templates, deleteTemplate } = useTemplateStore();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleDelete = (id: string, title: string) => {
    if (confirm(`确定要删除模板「${title}」吗？`)) {
      deleteTemplate(id);
      if (selectedTemplate === id) {
        setSelectedTemplate(null);
      }
    }
  };

  const selectedTemplateData = templates.find(t => t.id === selectedTemplate);

  const totalItems = selectedTemplateData
    ? selectedTemplateData.sections.reduce((acc, s) => acc + s.items.length, 0)
    : 0;

  const mandatoryItems = selectedTemplateData
    ? selectedTemplateData.sections.reduce(
        (acc, s) => acc + s.items.filter(i => i.mandatory).length,
        0
      )
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <header className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回清单列表
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            模板管理
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            管理尽调清单模板，快速创建标准化的检查流程
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 模板列表 */}
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  所有模板
                </h2>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {templates.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                    暂无模板
                  </div>
                ) : (
                  templates.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => setSelectedTemplate(template.id)}
                      className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                        selectedTemplate === template.id
                          ? 'bg-blue-50 dark:bg-blue-900/20'
                          : ''
                      }`}
                    >
                      <div className="font-medium text-gray-900 dark:text-white text-sm">
                        {template.title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {template.sections.length} 个章节 ·{' '}
                        {template.sections.reduce((acc, s) => acc + s.items.length, 0)} 个检查项
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* 模板详情 */}
          <div className="md:col-span-2">
            {selectedTemplateData ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedTemplateData.title}
                      </h3>
                      {selectedTemplateData.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {selectedTemplateData.description}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => handleDelete(selectedTemplateData.id, selectedTemplateData.title)}
                        className="px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>{selectedTemplateData.sections.length} 个章节</span>
                    <span>·</span>
                    <span>{totalItems} 个检查项</span>
                    <span>·</span>
                    <span>{mandatoryItems} 个必填项</span>
                  </div>
                  
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    创建于 {format(new Date(selectedTemplateData.createdAt), 'yyyy-MM-dd HH:mm')}
                  </div>
                </div>

                <div className="p-5 space-y-6 max-h-[60vh] overflow-y-auto">
                  {selectedTemplateData.sections.map((section, sectionIdx) => (
                    <div key={section.id}>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                        <span className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs flex items-center justify-center mr-2">
                          {sectionIdx + 1}
                        </span>
                        {section.title}
                      </h4>
                      
                      {section.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 ml-8">
                          {section.description}
                        </p>
                      )}
                      
                      <ul className="ml-8 space-y-2">
                        {section.items.map((item) => (
                          <li
                            key={item.id}
                            className="flex items-start text-sm text-gray-700 dark:text-gray-300"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 mt-2 mr-3 flex-shrink-0" />
                            <div>
                              <div className="flex items-center space-x-2">
                                <span>{item.title}</span>
                                {item.mandatory && (
                                  <span className="px-1.5 py-0.5 text-xs font-medium text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300 rounded">
                                    必填
                                  </span>
                                )}
                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                  [{getTypeLabel(item.type)}]
                                </span>
                              </div>
                              {item.description && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                  {item.description}
                                </p>
                              )}
                              {item.dependencies.length > 0 && (
                                <p className="text-xs text-orange-500 dark:text-orange-400 mt-0.5">
                                  ⚠️ 依赖 {item.dependencies.length} 个前置项
                                </p>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-gray-500 dark:text-gray-400">
                  选择左侧模板查看详情
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    boolean: '布尔',
    text: '文本',
    rating: '评分',
    date: '日期',
    file: '文件',
  };
  return labels[type] || type;
}
