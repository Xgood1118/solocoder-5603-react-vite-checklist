import type { Checklist, Template, Section } from '../types';
import { generateId } from './status';

export const createChecklistFromTemplate = (template: Template, title: string): Checklist => {
  const now = new Date().toISOString();
  
  const sections: Section[] = template.sections.map(templateSection => ({
    id: generateId(),
    title: templateSection.title,
    description: templateSection.description,
    items: templateSection.items.map(templateItem => ({
      id: generateId(),
      title: templateItem.title,
      description: templateItem.description,
      type: templateItem.type,
      mandatory: templateItem.mandatory,
      status: 'not_started' as const,
      value: {},
      dependencies: [],
    })),
  }));
  
  const oldToNewIdMap = new Map<string, string>();
  template.sections.forEach((templateSection, sectionIdx) => {
    templateSection.items.forEach((templateItem, itemIdx) => {
      oldToNewIdMap.set(templateItem.id, sections[sectionIdx].items[itemIdx].id);
    });
  });
  
  template.sections.forEach((templateSection, sectionIdx) => {
    templateSection.items.forEach((templateItem, itemIdx) => {
      sections[sectionIdx].items[itemIdx].dependencies = templateItem.dependencies
        .map(depId => oldToNewIdMap.get(depId))
        .filter((id): id is string => id !== undefined);
    });
  });
  
  return {
    id: generateId(),
    title,
    description: template.description,
    templateId: template.id,
    sections,
    status: 'blocked',
    createdAt: now,
    updatedAt: now,
  };
};

export const createTemplateFromChecklist = (checklist: Checklist, title: string): Template => {
  const now = new Date().toISOString();
  
  return {
    id: generateId(),
    title,
    description: checklist.description,
    sections: checklist.sections.map(section => ({
      id: section.id,
      title: section.title,
      description: section.description,
      items: section.items.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        type: item.type,
        mandatory: item.mandatory,
        dependencies: item.dependencies,
      })),
    })),
    createdAt: now,
  };
};
