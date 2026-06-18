export type CheckItemType = 'boolean' | 'text' | 'rating' | 'date' | 'file';

export type CheckItemStatus = 'not_started' | 'in_progress' | 'completed' | 'skipped' | 'needs_materials';

export type SectionStatus = 'all_completed' | 'all_skipped' | 'mixed';

export type ChecklistStatus = 'blocked' | 'conditional' | 'passed' | 'submitted';

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string;
  uploadedAt: string;
}

export interface CheckItemValue {
  boolean?: boolean;
  text?: string;
  rating?: number;
  date?: string;
  files?: Attachment[];
}

export interface CheckItem {
  id: string;
  title: string;
  description?: string;
  type: CheckItemType;
  mandatory: boolean;
  status: CheckItemStatus;
  value: CheckItemValue;
  notes?: string;
  dependencies: string[];
  updatedAt?: string;
}

export interface Section {
  id: string;
  title: string;
  description?: string;
  items: CheckItem[];
}

export interface Checklist {
  id: string;
  title: string;
  description?: string;
  templateId?: string;
  sections: Section[];
  status: ChecklistStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateSectionItem {
  id: string;
  title: string;
  description?: string;
  type: CheckItemType;
  mandatory: boolean;
  dependencies: string[];
}

export interface TemplateSection {
  id: string;
  title: string;
  description?: string;
  items: TemplateSectionItem[];
}

export interface Template {
  id: string;
  title: string;
  description?: string;
  sections: TemplateSection[];
  createdAt: string;
}
