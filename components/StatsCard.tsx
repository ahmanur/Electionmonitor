import React from 'react';
import type { StatsCardData } from '../types';

const StatsCard: React.FC<StatsCardData> = ({ title, value, icon: Icon, progress, progressColor, onClick }) => {
  const cardClasses = `bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md transition-transform duration-300 hover:-translate-y-1.5 ${onClick ? 'cursor-pointer' : ''}`;
  
  return (
    <div 
      className={cardClasses} 
      onClick={onClick} 
      role={onClick ? 'button' : undefined} 
      tabIndex={onClick ? 0 : undefined} 
      onKeyDown={e => { if (onClick && e.key === 'Enter') onClick() }}
      aria-label={onClick ? `View details for ${title}` : undefined}
    >
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
        </div>
        <div className="text-3xl text-primary-green">
          <Icon />
        </div>
      </div>
      <div className="mt-3 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
        <div className={`${progressColor} h-1.5 rounded-full`} style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  );
};

export default StatsCard;
