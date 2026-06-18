import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Template } from '../types';

interface TemplateStore {
  templates: Template[];
  addTemplate: (template: Template) => void;
  updateTemplate: (id: string, updates: Partial<Template>) => void;
  deleteTemplate: (id: string) => void;
  getTemplate: (id: string) => Template | undefined;
}

const seedTemplate: Template = {
  id: 'default-template',
  title: '标准尽调清单模板',
  description: '通用投资项目尽调检查清单模板',
  createdAt: new Date().toISOString(),
  sections: [
    {
      id: 'section-1',
      title: '公司基本面',
      description: '公司基本情况核查',
      items: [
        {
          id: 'item-1-1',
          title: '公司主体合法存续',
          description: '核实公司营业执照、工商登记信息',
          type: 'boolean',
          mandatory: true,
          dependencies: [],
        },
        {
          id: 'item-1-2',
          title: '工商信息核查',
          description: '查询工商登记信息，确认股东结构、注册资本等',
          type: 'file',
          mandatory: true,
          dependencies: ['item-1-1'],
        },
        {
          id: 'item-1-3',
          title: '公司简介',
          description: '公司业务、产品、市场等基本介绍',
          type: 'text',
          mandatory: false,
          dependencies: [],
        },
        {
          id: 'item-1-4',
          title: '公司基本面评分',
          description: '对公司基本面的综合评分',
          type: 'rating',
          mandatory: true,
          dependencies: [],
        },
      ],
    },
    {
      id: 'section-2',
      title: '财务',
      description: '财务状况核查',
      items: [
        {
          id: 'item-2-1',
          title: '近三年审计报告',
          description: '提供近三年经审计的财务报告',
          type: 'file',
          mandatory: true,
          dependencies: [],
        },
        {
          id: 'item-2-2',
          title: '最近一期财务报表',
          description: '提供最近一期的财务报表',
          type: 'file',
          mandatory: true,
          dependencies: [],
        },
        {
          id: 'item-2-3',
          title: '财务状况评分',
          description: '对公司财务状况的综合评分',
          type: 'rating',
          mandatory: true,
          dependencies: ['item-2-1', 'item-2-2'],
        },
        {
          id: 'item-2-4',
          title: '财务尽调日期',
          description: '实际完成财务尽调的日期',
          type: 'date',
          mandatory: false,
          dependencies: [],
        },
      ],
    },
    {
      id: 'section-3',
      title: '团队',
      description: '核心团队核查',
      items: [
        {
          id: 'item-3-1',
          title: '核心团队背景',
          description: '创始人及核心团队成员的背景资料',
          type: 'text',
          mandatory: true,
          dependencies: [],
        },
        {
          id: 'item-3-2',
          title: '团队能力评分',
          description: '对核心团队能力的综合评分',
          type: 'rating',
          mandatory: true,
          dependencies: ['item-3-1'],
        },
        {
          id: 'item-3-3',
          title: '股权激励计划',
          description: '是否有员工股权激励计划',
          type: 'boolean',
          mandatory: false,
          dependencies: [],
        },
      ],
    },
    {
      id: 'section-4',
      title: '行业',
      description: '行业与市场分析',
      items: [
        {
          id: 'item-4-1',
          title: '行业研究报告',
          description: '提供行业研究报告或市场分析资料',
          type: 'file',
          mandatory: false,
          dependencies: [],
        },
        {
          id: 'item-4-2',
          title: '行业地位评价',
          description: '公司在行业中的地位和竞争力评价',
          type: 'text',
          mandatory: true,
          dependencies: [],
        },
        {
          id: 'item-4-3',
          title: '行业吸引力评分',
          description: '对行业整体吸引力的评分',
          type: 'rating',
          mandatory: true,
          dependencies: [],
        },
      ],
    },
    {
      id: 'section-5',
      title: '风险',
      description: '风险因素评估',
      items: [
        {
          id: 'item-5-1',
          title: '法律风险评估',
          description: '公司面临的主要法律风险',
          type: 'text',
          mandatory: true,
          dependencies: [],
        },
        {
          id: 'item-5-2',
          title: '市场风险评估',
          description: '公司面临的主要市场风险',
          type: 'text',
          mandatory: true,
          dependencies: [],
        },
        {
          id: 'item-5-3',
          title: '风险等级评估',
          description: '综合风险等级评分（1-5，1分风险最低）',
          type: 'rating',
          mandatory: true,
          dependencies: ['item-5-1', 'item-5-2'],
        },
        {
          id: 'item-5-4',
          title: '风险是否可接受',
          description: '总体风险是否在可接受范围内',
          type: 'boolean',
          mandatory: true,
          dependencies: ['item-5-3'],
        },
      ],
    },
  ],
};

export const useTemplateStore = create<TemplateStore>()(
  persist(
    (set, get) => ({
      templates: [seedTemplate],
      
      addTemplate: (template) => set((state) => ({
        templates: [...state.templates, template],
      })),
      
      updateTemplate: (id, updates) => set((state) => ({
        templates: state.templates.map((t) =>
          t.id === id ? { ...t, ...updates } : t
        ),
      })),
      
      deleteTemplate: (id) => set((state) => ({
        templates: state.templates.filter((t) => t.id !== id),
      })),
      
      getTemplate: (id) => {
        return get().templates.find((t) => t.id === id);
      },
    }),
    {
      name: 'template-store',
    }
  )
);
