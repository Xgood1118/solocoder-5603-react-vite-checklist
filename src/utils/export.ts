import type { Checklist, CheckItem } from '../types';
import { getStatusLabel } from './status';
import { format } from 'date-fns';

export const exportToMarkdown = (checklist: Checklist): string => {
  const lines: string[] = [];
  
  lines.push(`# ${escapeMarkdown(checklist.title)}`);
  lines.push('');
  
  if (checklist.description) {
    lines.push(escapeMarkdown(checklist.description));
    lines.push('');
  }
  
  lines.push(`- **状态**: ${getStatusLabel(checklist.status)}`);
  lines.push(`- **创建时间**: ${format(new Date(checklist.createdAt), 'yyyy-MM-dd HH:mm')}`);
  lines.push(`- **更新时间**: ${format(new Date(checklist.updatedAt), 'yyyy-MM-dd HH:mm')}`);
  lines.push('');
  
  for (const section of checklist.sections) {
    lines.push(`## ${escapeMarkdown(section.title)}`);
    lines.push('');
    
    if (section.description) {
      lines.push(escapeMarkdown(section.description));
      lines.push('');
    }
    
    for (const item of section.items) {
      const statusIcon = getItemStatusIcon(item);
      const mandatoryBadge = item.mandatory ? ' `[必填]`' : '';
      
      lines.push(`### ${statusIcon} ${escapeMarkdown(item.title)}${mandatoryBadge}`);
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
        lines.push(`- **说明**: ${escapeMarkdown(item.value.text)}`);
      }
      
      if (item.notes) {
        lines.push('');
        lines.push('**备注**:');
        lines.push('');
        lines.push(escapeMarkdown(item.notes));
      }
      
      if (item.value.files && item.value.files.length > 0) {
        lines.push('');
        lines.push('**附件**:');
        lines.push('');
        for (const file of item.value.files) {
          lines.push(`- [${escapeMarkdown(file.name)}](${file.dataUrl}) (${formatFileSize(file.size)})`);
        }
      }
      
      lines.push('');
    }
  }
  
  return lines.join('\n');
};

const escapeMarkdown = (text: string): string => {
  const specialChars = /[\\`*_{}[\]()>#+-.!]/g;
  return text.replace(specialChars, '\\$&');
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

export const sanitizeFileName = (fileName: string): string => {
  const invalidChars = /[<>:"/\\|?*\x00-\x1F]/g;
  const sanitized = fileName.replace(invalidChars, '_');
  return sanitized.replace(/^[\.]+/, '').substring(0, 200);
};

export const downloadMarkdown = (checklist: Checklist): void => {
  const content = exportToMarkdown(checklist);
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const safeFileName = sanitizeFileName(checklist.title);
  link.download = `${safeFileName}-尽调报告.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const printReport = (checklist: Checklist): void => {
  const content = exportToMarkdown(checklist);
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('无法打开打印窗口，请检查浏览器弹窗设置');
    return;
  }
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${escapeHtml(checklist.title)} - 尽调报告</title>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; line-height: 1.6; max-width: 800px; margin: 0 auto; }
        h1 { color: #1a1a2e; border-bottom: 2px solid #16213e; padding-bottom: 10px; }
        h2 { color: #16213e; margin-top: 30px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
        h3 { color: #0f3460; margin-top: 20px; }
        ul { padding-left: 20px; }
        li { margin: 8px 0; }
        .status-badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; }
        .mandatory { color: #dc3545; font-weight: bold; }
        @media print {
          body { padding: 10px; }
        }
      </style>
    </head>
    <body>
      <div id="content"></div>
      <script src="https://cdn.jsdelivr.net/npm/marked@12.0.2/lib/marked.min.js"></script>
      <script>
        (function() {
          var content = document.currentScript.dataset.content;
          document.getElementById('content').innerHTML = marked.parse(content);
          setTimeout(function() { window.print(); }, 500);
        })();
      <\/script>
    </body>
    </html>
  `);
  
  const script = printWindow.document.querySelector('script[data-content]');
  if (script) {
    script.setAttribute('data-content', content);
  }
  
  printWindow.document.close();
};

const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};
