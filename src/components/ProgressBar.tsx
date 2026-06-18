import clsx from 'clsx';

interface ProgressBarProps {
  completed: number;
  total: number;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function ProgressBar({ completed, total, size = 'md', showText = true, className }: ProgressBarProps) {
  const percentage = total === 0 ? 100 : Math.round((completed / total) * 100);
  
  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };
  
  return (
    <div className={clsx('w-full', className)}>
      <div className={clsx(
        'w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden',
        heightClasses[size]
      )}>
        <div
          className={clsx(
            'h-full bg-green-500 transition-all duration-300 rounded-full',
            percentage === 100 ? 'bg-green-500' : 'bg-blue-500'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showText && (
        <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
          <span>{completed} / {total}</span>
          <span>{percentage}%</span>
        </div>
      )}
    </div>
  );
}
