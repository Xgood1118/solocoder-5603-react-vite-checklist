import type { CheckItem, CheckItemStatus, Section, SectionStatus, Checklist, ChecklistStatus } from '../types';

export const isItemCompleted = (item: CheckItem): boolean => {
  if (item.status === 'completed' || item.status === 'skipped') return true;
  return false;
};

export const isItemMandatoryAndIncomplete = (item: CheckItem): boolean => {
  return item.mandatory && item.status !== 'completed' && item.status !== 'skipped';
};

export const calculateSectionProgress = (section: Section): { completed: number; total: number } => {
  const mandatoryItems = section.items.filter(item => item.mandatory);
  const completedMandatory = mandatoryItems.filter(item => 
    item.status === 'completed' || item.status === 'skipped'
  );
  return {
    completed: completedMandatory.length,
    total: mandatoryItems.length,
  };
};

export const calculateSectionStatus = (section: Section): SectionStatus => {
  const items = section.items;
  if (items.length === 0) return 'all_completed';
  
  const allCompleted = items.every(item => item.status === 'completed');
  const allSkipped = items.every(item => item.status === 'skipped');
  
  if (allCompleted) return 'all_completed';
  if (allSkipped) return 'all_skipped';
  return 'mixed';
};

export const calculateChecklistProgress = (checklist: Checklist): { completed: number; total: number } => {
  let completed = 0;
  let total = 0;
  
  for (const section of checklist.sections) {
    const progress = calculateSectionProgress(section);
    completed += progress.completed;
    total += progress.total;
  }
  
  return { completed, total };
};

export const calculateChecklistStatus = (checklist: Checklist): ChecklistStatus => {
  if (checklist.status === 'submitted') return 'submitted';
  
  const allItems = checklist.sections.flatMap(s => s.items);
  const mandatoryItems = allItems.filter(item => item.mandatory);
  
  const allMandatoryPassed = mandatoryItems.every(
    item => item.status === 'completed' || item.status === 'skipped'
  );
  
  const hasNeedsMaterials = allItems.some(item => item.status === 'needs_materials');
  const hasBlockedMandatory = mandatoryItems.some(
    item => item.status === 'not_started' || item.status === 'in_progress'
  );
  
  if (hasBlockedMandatory) return 'blocked';
  if (hasNeedsMaterials && allMandatoryPassed) return 'conditional';
  if (allMandatoryPassed) return 'passed';
  return 'blocked';
};

export const getIncompleteMandatoryItems = (checklist: Checklist): CheckItem[] => {
  return checklist.sections
    .flatMap(s => s.items)
    .filter(item => item.mandatory && item.status !== 'completed' && item.status !== 'skipped');
};

export const checkDependenciesMet = (item: CheckItem, allItems: CheckItem[]): boolean => {
  if (item.dependencies.length === 0) return true;
  
  return item.dependencies.every(depId => {
    const depItem = allItems.find(i => i.id === depId);
    if (!depItem) return true;
    return depItem.status === 'completed' || depItem.status === 'skipped';
  });
};

export const getStatusLabel = (status: CheckItemStatus | SectionStatus | ChecklistStatus): string => {
  const labels: Record<string, string> = {
    not_started: '未开始',
    in_progress: '进行中',
    completed: '已完成',
    skipped: '已跳过',
    needs_materials: '需补充材料',
    all_completed: '全部完成',
    all_skipped: '全部跳过',
    mixed: '混合状态',
    blocked: '阻塞',
    conditional: '有条件通过',
    passed: '通过',
    submitted: '已提交',
  };
  return labels[status] || status;
};

export const getStatusColorClass = (status: CheckItemStatus | SectionStatus | ChecklistStatus): string => {
  const colors: Record<string, string> = {
    not_started: 'bg-gray-400',
    in_progress: 'bg-blue-500',
    completed: 'bg-green-500',
    skipped: 'bg-gray-500',
    needs_materials: 'bg-yellow-500',
    blocked: 'bg-red-500',
    conditional: 'bg-yellow-500',
    passed: 'bg-green-500',
    submitted: 'bg-purple-500',
  };
  return colors[status] || 'bg-gray-400';
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
