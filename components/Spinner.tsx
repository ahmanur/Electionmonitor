import React from 'react';

const Spinner: React.FC<{ fullPage?: boolean }> = ({ fullPage = false }) => {
  const wrapperClasses = fullPage 
    ? "fixed inset-0 bg-gray-100 dark:bg-gray-900 flex flex-col justify-center items-center z-[100]" 
    : "flex justify-center items-center p-4";

  return (
    <div className={wrapperClasses}>
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary-green"></div>
      {fullPage && <p className="mt-4 text-lg text-gray-700 dark:text-gray-200">Loading Dashboard...</p>}
    </div>
  );
};

export default Spinner;
