import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Checklist, CheckItem, CheckItemStatus, CheckItemValue } from '../types';
import { calculateChecklistStatus } from '../utils/status';

interface ChecklistStore {
  checklists: Checklist[];
  addChecklist: (checklist: Checklist) => void;
  updateChecklist: (id: string, updates: Partial<Checklist>) => void;
  deleteChecklist: (id: string) => void;
  getChecklist: (id: string) => Checklist | undefined;
  updateCheckItem: (checklistId: string, sectionId: string, itemId: string, updates: Partial<CheckItem>) => void;
  updateCheckItemStatus: (checklistId: string, sectionId: string, itemId: string, status: CheckItemStatus) => void;
  updateCheckItemValue: (checklistId: string, sectionId: string, itemId: string, value: Partial<CheckItemValue>) => void;
  validateAndFixData: () => boolean;
}

const validateChecklist = (checklist: any): checklist is Checklist => {
  if (!checklist || typeof checklist !== 'object') return false;
  if (!checklist.id || typeof checklist.id !== 'string') return false;
  if (!checklist.title || typeof checklist.title !== 'string') return false;
  if (!checklist.sections || !Array.isArray(checklist.sections)) return false;
  if (!checklist.createdAt || typeof checklist.createdAt !== 'string') return false;
  if (!checklist.updatedAt || typeof checklist.updatedAt !== 'string') return false;
  
  for (const section of checklist.sections) {
    if (!section.id || typeof section.id !== 'string') return false;
    if (!section.title || typeof section.title !== 'string') return false;
    if (!section.items || !Array.isArray(section.items)) return false;
    
    for (const item of section.items) {
      if (!item.id || typeof item.id !== 'string') return false;
      if (!item.title || typeof item.title !== 'string') return false;
      if (!item.type || !['boolean', 'text', 'rating', 'date', 'file'].includes(item.type)) return false;
      if (typeof item.mandatory !== 'boolean') return false;
      if (!item.status || !['not_started', 'in_progress', 'completed', 'skipped', 'needs_materials'].includes(item.status)) return false;
      if (!item.value || typeof item.value !== 'object') return false;
      if (!item.dependencies || !Array.isArray(item.dependencies)) return false;
    }
  }
  
  return true;
};

export const useChecklistStore = create<ChecklistStore>()(
  persist(
    (set, get) => ({
      checklists: [],
      
      addChecklist: (checklist) => set((state) => ({
        checklists: [...state.checklists, checklist],
      })),
      
      updateChecklist: (id, updates) => set((state) => ({
        checklists: state.checklists.map((c) =>
          c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
        ),
      })),
      
      deleteChecklist: (id) => set((state) => ({
        checklists: state.checklists.filter((c) => c.id !== id),
      })),
      
      getChecklist: (id) => {
        return get().checklists.find((c) => c.id === id);
      },
      
      updateCheckItem: (checklistId, sectionId, itemId, updates) => set((state) => {
        const now = new Date().toISOString();
        const checklists = state.checklists.map((checklist) => {
          if (checklist.id !== checklistId) return checklist;
          
          const sections = checklist.sections.map((section) => {
            if (section.id !== sectionId) return section;
            
            const items = section.items.map((item) => {
              if (item.id !== itemId) return item;
              return { ...item, ...updates, updatedAt: now };
            });
            
            return { ...section, items };
          });
          
          const updatedChecklist = { ...checklist, sections, updatedAt: now };
          updatedChecklist.status = calculateChecklistStatus(updatedChecklist);
          return updatedChecklist;
        });
        
        return { checklists };
      }),
      
      updateCheckItemStatus: (checklistId, sectionId, itemId, status) => {
        get().updateCheckItem(checklistId, sectionId, itemId, { status });
      },
      
      updateCheckItemValue: (checklistId, sectionId, itemId, value) => {
        const state = get();
        const checklist = state.checklists.find(c => c.id === checklistId);
        if (!checklist) return;
        
        const section = checklist.sections.find(s => s.id === sectionId);
        if (!section) return;
        
        const item = section.items.find(i => i.id === itemId);
        if (!item) return;
        
        const newValue = { ...item.value, ...value };
        state.updateCheckItem(checklistId, sectionId, itemId, { value: newValue });
      },
      
      validateAndFixData: () => {
        const state = get();
        const validChecklists = state.checklists.filter(validateChecklist);
        
        if (validChecklists.length !== state.checklists.length) {
          const invalidCount = state.checklists.length - validChecklists.length;
          set({ checklists: validChecklists });
          console.warn(`Removed ${invalidCount} invalid checklists due to data corruption`);
          return false;
        }
        
        return true;
      },
    }),
    {
      name: 'checklist-store',
      onRehydrateStorage: () => (state) => {
        if (state) {
          const isValid = state.validateAndFixData?.();
          if (!isValid) {
            setTimeout(() => {
              if (window.confirm('检测到数据损坏，已恢复到有效数据。是否需要了解更多信息？')) {
                alert('数据恢复说明：\n\n系统检测到部分清单数据存在损坏，已自动清理无效数据。\n\n如果问题持续出现，请联系技术支持。');
              }
            }, 100);
          }
        }
      },
    }
  )
);
