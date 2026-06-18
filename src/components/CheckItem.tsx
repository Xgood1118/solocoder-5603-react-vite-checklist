import { useState } from 'react';
import clsx from 'clsx';
import type { CheckItem as CheckItemType, CheckItemStatus } from '../types';
import { getStatusLabel, getStatusColorClass } from '../utils/status';
import { AttachmentUploader } from './AttachmentUploader';

interface CheckItemProps {
  item: CheckItemType;
  disabled?: boolean;
  dependenciesUnmet?: boolean;
  onStatusChange: (status: CheckItemStatus) => void;
  onValueChange: (value: any) => void;
  onNotesChange: (notes: string) => void;
}

const statusOptions: { value: CheckItemStatus; label: string; color: string }[] = [
  { value: 'not_started', label: '未开始', color: 'bg-gray-400' },
  { value: 'in_progress', label: '进行中', color: 'bg-blue-500' },
  { value: 'completed', label: '已完成', color: 'bg-green-500' },
  { value: 'skipped', label: '已跳过', color: 'bg-gray-500' },
  { value: 'needs_materials', label: '需补充材料', color: 'bg-yellow-500' },
];

export function CheckItem({
  item,
  disabled = false,
  dependenciesUnmet = false,
  onStatusChange,
  onValueChange,
  onNotesChange,
}: CheckItemProps) {
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const isDisabled = disabled || dependenciesUnmet;

  const renderValueInput = () => {
    if (isDisabled) return null;

    switch (item.type) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                checked={item.value.boolean === true}
                onChange={() => {
                  onValueChange({ boolean: true });
                  if (item.status === 'not_started') {
                    onStatusChange('in_progress');
                  }
                }}
                disabled={isDisabled}
                className="w-4 h-4 text-green-600"
              />
              <span className="text-green-600 dark:text-green-400">通过</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                checked={item.value.boolean === false}
                onChange={() => {
                  onValueChange({ boolean: false });
                  if (item.status === 'not_started') {
                    onStatusChange('in_progress');
                  }
                }}
                disabled={isDisabled}
                className="w-4 h-4 text-red-600"
              />
              <span className="text-red-600 dark:text-red-400">不通过</span>
            </label>
          </div>
        );

      case 'text':
        return (
          <textarea
            value={item.value.text || ''}
            onChange={(e) => {
              onValueChange({ text: e.target.value });
              if (item.status === 'not_started') {
                onStatusChange('in_progress');
              }
            }}
            disabled={isDisabled}
            placeholder="请输入说明..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     disabled:opacity-50 disabled:cursor-not-allowed resize-none"
          />
        );

      case 'rating':
        return (
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => {
                  onValueChange({ rating: star });
                  if (item.status === 'not_started') {
                    onStatusChange('in_progress');
                  }
                }}
                disabled={isDisabled}
                className="p-1 hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  className={clsx(
                    'w-6 h-6',
                    (item.value.rating || 0) >= star
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300 dark:text-gray-600'
                  )}
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </button>
            ))}
            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
              {item.value.rating || 0} / 5 星
            </span>
          </div>
        );

      case 'date':
        return (
          <input
            type="date"
            value={item.value.date || ''}
            onChange={(e) => {
              onValueChange({ date: e.target.value });
              if (item.status === 'not_started') {
                onStatusChange('in_progress');
              }
            }}
            disabled={isDisabled}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     disabled:opacity-50 disabled:cursor-not-allowed"
          />
        );

      case 'file':
        return (
          <AttachmentUploader
            files={item.value.files || []}
            onChange={(files) => {
              onValueChange({ files });
              if (item.status === 'not_started') {
                onStatusChange('in_progress');
              }
            }}
            disabled={isDisabled}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={clsx(
        'p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700',
        'transition-all duration-200 hover:shadow-md',
        dependenciesUnmet && 'opacity-50 bg-gray-50 dark:bg-gray-900'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">
              {item.title}
            </h4>
            {item.mandatory && (
              <span className="px-1.5 py-0.5 text-xs font-medium text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300 rounded">
                必填
              </span>
            )}
          </div>
          {item.description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {item.description}
            </p>
          )}
          {dependenciesUnmet && (
            <p className="mt-1 text-xs text-orange-500 dark:text-orange-400">
              ⚠️ 需先完成前置依赖项
            </p>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => !isDisabled && setShowStatusDropdown(!showStatusDropdown)}
            disabled={isDisabled}
            className={clsx(
              'flex items-center space-x-2 px-3 py-1.5 text-sm rounded-lg border transition-colors',
              isDisabled
                ? 'opacity-50 cursor-not-allowed border-gray-200 dark:border-gray-700'
                : 'hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600'
            )}
          >
            <span className={clsx('w-2.5 h-2.5 rounded-full', getStatusColorClass(item.status))} />
            <span className="text-gray-700 dark:text-gray-300">
              {getStatusLabel(item.status)}
            </span>
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showStatusDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowStatusDropdown(false)} />
              <div className="absolute right-0 z-20 mt-1 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onStatusChange(option.value);
                      setShowStatusDropdown(false);
                    }}
                    className={clsx(
                      'w-full flex items-center space-x-2 px-3 py-2 text-sm text-left',
                      'hover:bg-gray-50 dark:hover:bg-gray-700',
                      item.status === option.value && 'bg-blue-50 dark:bg-blue-900/30'
                    )}
                  >
                    <span className={clsx('w-2.5 h-2.5 rounded-full', option.color)} />
                    <span className="text-gray-700 dark:text-gray-300">{option.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mb-3">
        {renderValueInput()}
      </div>

      <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
          备注
        </label>
        <textarea
          value={item.notes || ''}
          onChange={(e) => onNotesChange(e.target.value)}
          disabled={isDisabled}
          placeholder="添加备注..."
          rows={2}
          className="w-full px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded 
                   bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300
                   focus:ring-1 focus:ring-blue-500 focus:border-transparent
                   disabled:opacity-50 disabled:cursor-not-allowed resize-none"
        />
      </div>
    </div>
  );
}
