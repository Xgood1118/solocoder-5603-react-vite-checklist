import type { Checklist, CheckItem } from '../types';
import { getStatusLabel } from './status';
import { format } from 'date-fns';

export const exportToMarkdown = (checklist: Checklist): string => {
  const lines: string[] = [];
  
  lines.push(`# ${checklist.title}`);
  lines.push('');
  
  if (checklist.description) {
    lines.push(checklist.description);
    lines.push('');
  }
  
  lines.push(`- **状态**: ${getStatusLabel(checklist.status)}`);
  lines.push(`- **创建时间**: ${format(new Date(checklist.createdAt), 'yyyy-MM-dd HH:mm')}`);
  lines.push(`- **更新时间**: ${format(new Date(checklist.updatedAt), 'yyyy-MM-dd HH:mm')}`);
  lines.push('');
  
  for (const section of checklist.sections) {
    lines.push(`## ${section.title}`);
    lines.push('');
    
    if (section.description) {
      lines.push(section.description);
      lines.push('');
    }
    
    for (const item of section.items) {
      const statusIcon = getItemStatusIcon(item);
      const mandatoryBadge = item.mandatory ? ' `[必填]`' : '';
      
      lines.push(`### ${statusIcon} ${item.title}${mandatoryBadge}`);
      lines.push('');
      
      lines.push(`- **状态**: ${getStatusLabel(item.status)}`);
      lines.push(`- **类型**: ${getItemTypeLabel(item.type)}`);
      
      if (item.value.boolean !== undefined) {
        lines.push(`- **结果**: ${item.value.boolean ? '通过' : '不通过'}`);
      }
      
      if (item.value.rating !== undefined) {
        lines.push(`- **评分**: ${'★'.repeat(item.value.rating)}${'☆'.repeat(5 - item.value.rating)}`);
      }
      
      if (item.value.date) {
        lines.push(`- **日期**: ${item.value.date}`);
      }
      
      if (item.value.text) {
        lines.push(`- **说明**: ${item.value.text}`);
      }
      
      if (item.notes) {
        lines.push('');
        lines.push('**备注**:');
        lines.push('');
        lines.push(item.notes);
      }
      
      if (item.value.files && item.value.files.length > 0) {
        lines.push('');
        lines.push('**附件**:');
        lines.push('');
        for (const file of item.value.files) {
          lines.push(`- [${file.name}](${file.dataUrl}) (${formatFileSize(file.size)})`);
        }
      }
      
      lines.push('');
    }
  }
  
  return lines.join('\n');
};

const getItemStatusIcon = (item: CheckItem): string => {
  switch (item.status) {
    case 'completed': return '✅';
    case 'skipped': return '⏭️';
    case 'in_progress': return '🔄';
    case 'needs_materials': return '📋';
    default: return '⬜';
  }
};

const getItemTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    boolean: '布尔',
    text: '文本',
    rating: '评分',
    date: '日期',
    file: '文件',
  };
  return labels[type] || type;
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

export const downloadMarkdown = (checklist: Checklist): void => {
  const content = exportToMarkdown(checklist);
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${checklist.title}-尽调报告.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const printReport = (checklist: Checklist): void => {
  const content = exportToMarkdown(checklist);
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${checklist.title} - 尽调报告</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; line-height: 1.6; }
        h1 { color: #1a1a2e; border-bottom: 2px solid #16213e; padding-bottom: 10px; }
        h2 { color: #16213e; margin-top: 30px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
        h3 { color: #0f3460; margin-top: 20px; }
        .status-badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; }
        .status-completed { background: #d4edda; color: #155724; }
        .status-skipped { background: #e2e3e5; color: #383d41; }
        .status-in_progress { background: #d1ecf1; color: #0c5460; }
        .status-needs_materials { background: #fff3cd; color: #856404; }
        .status-not_started { background: #f8f9fa; color: #6c757d; }
        .mandatory { color: #dc3545; font-weight: bold; }
        .file-list { list-style: none; padding: 0; }
        .file-list li { padding: 5px 0; }
        @media print {
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <div id="content"></div>
      <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
      <script>
        document.getElementById('content').innerHTML = marked.parse(\`${content.replace(/`/g, '\\`')}\`);
        setTimeout(() => window.print(), 500);
      </script>
    </body>
    </html>
  `;
  
  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
