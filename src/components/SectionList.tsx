import type { Section, CheckItemStatus } from '../types';
import { calculateSectionProgress, getStatusLabel, getStatusColorClass } from '../utils/status';
import { ProgressBar } from './ProgressBar';
import clsx from 'clsx';

interface SectionListProps {
  sections: Section[];
  currentSectionId: string | null;
  onSectionSelect: (sectionId: string) => void;
}

export function SectionList({ sections, currentSectionId, onSectionSelect }: SectionListProps) {
  return (
    <div className="space-y-1">
      <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        检查章节
      </div>
      {sections.map((section) => {
        const progress = calculateSectionProgress(section);
        const status = getSectionStatus(section) as CheckItemStatus;
        
        return (
          <button
            key={section.id}
            type="button"
            onClick={() => onSectionSelect(section.id)}
            className={clsx(
              'w-full text-left px-3 py-3 rounded-lg transition-colors',
              currentSectionId === section.id
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm truncate">{section.title}</span>
              <span
                className={clsx(
                  'w-2 h-2 rounded-full flex-shrink-0 ml-2',
                  getStatusColorClass(status)
                )}
                title={getStatusLabel(status)}
              />
            </div>
            <ProgressBar
              completed={progress.completed}
              total={progress.total}
              size="sm"
              showText={false}
            />
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {progress.completed}/{progress.total} 必填项
            </div>
          </button>
        );
      })}
    </div>
  );
}

// 计算 section 状态
function getSectionStatus(section: Section): string {
  const items = section.items;
  if (items.length === 0) return 'completed';
  
  const allCompleted = items.every(item => item.status === 'completed');
  const allSkipped = items.every(item => item.status === 'skipped');
  const anyInProgress = items.some(item => item.status === 'in_progress');
  const anyNeedsMaterials = items.some(item => item.status === 'needs_materials');
  
  if (allCompleted) return 'completed';
  if (allSkipped) return 'skipped';
  if (anyNeedsMaterials) return 'needs_materials';
  if (anyInProgress) return 'in_progress';
  return 'not_started';
}
