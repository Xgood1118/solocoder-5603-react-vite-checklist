import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Checklist, CheckItem, CheckItemStatus, CheckItemValue } from '../types';
import { calculateChecklistStatus } from '../utils/status';

interface ChecklistStore {
  checklists: Checklist[];
  currentChecklistId: string | null;
  setCurrentChecklist: (id: string | null) => void;
  addChecklist: (checklist: Checklist) => void;
  updateChecklist: (id: string, updates: Partial<Checklist>) => void;
  deleteChecklist: (id: string) => void;
  getChecklist: (id: string) => Checklist | undefined;
  updateCheckItem: (checklistId: string, sectionId: string, itemId: string, updates: Partial<CheckItem>) => void;
  updateCheckItemStatus: (checklistId: string, sectionId: string, itemId: string, status: CheckItemStatus) => void;
  updateCheckItemValue: (checklistId: string, sectionId: string, itemId: string, value: Partial<CheckItemValue>) => void;
}

export const useChecklistStore = create<ChecklistStore>()(
  persist(
    (set, get) => ({
      checklists: [],
      currentChecklistId: null,
      
      setCurrentChecklist: (id) => set({ currentChecklistId: id }),
      
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
        currentChecklistId: state.currentChecklistId === id ? null : state.currentChecklistId,
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
    }),
    {
      name: 'checklist-store',
    }
  )
);
