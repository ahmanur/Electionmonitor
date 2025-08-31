import React, { useMemo } from 'react';
import type { Result, SubmissionStatus } from '../types';

interface SubmissionsTableProps {
  results: Result[];
  navigateToResults: () => void;
  setPreFilter: (filter: string) => void;
}

// FIX: Added 'Cancelled' status to map to 'Issue' to resolve TypeScript error and handle cancelled results.
const statusMap: Record<Result['status'], SubmissionStatus> = {
    Verified: 'Approved',
    Pending: 'Pending',
    Disputed: 'Issue',
    Cancelled: 'Issue',
};

const statusStyles: Record<SubmissionStatus, string> = {
  Approved: 'bg-status-approved-bg text-status-approved-text dark:bg-green-900/50 dark:text-green-300',
  Pending: 'bg-status-pending-bg text-status-pending-text dark:bg-yellow-900/50 dark:text-yellow-300',
  Issue: 'bg-status-issue-bg text-status-issue-text dark:bg-red-900/50 dark:text-red-300',
};

const actionText: Record<SubmissionStatus, string> = {
  Approved: 'View',
  Pending: 'Review',
  Issue: 'Resolve',
};

const SubmissionsTable: React.FC<SubmissionsTableProps> = ({ results, navigateToResults, setPreFilter }) => {
    const recentSubmissions = useMemo(() => {
        return [...results]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 5);
    }, [results]);
    
    const handleViewAll = () => {
        setPreFilter('');
        navigateToResults();
    };

    const handleActionClick = (pollingUnit: string) => {
        setPreFilter(pollingUnit);
        navigateToResults();
    };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Recent Submissions</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-white uppercase bg-primary-green sticky top-0 z-10">
            <tr>
              <th scope="col" className="px-6 py-3">Polling Unit</th>
              <th scope="col" className="px-6 py-3">Agent</th>
              <th scope="col" className="px-6 py-3">Time</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {recentSubmissions.length > 0 ? (
              recentSubmissions.map((item) => {
                const submissionStatus = statusMap[item.status];
                return (
                  <tr key={item.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.pollingUnit}</td>
                    <td className="px-6 py-4">{item.agentName}</td>
                    <td className="px-6 py-4">{item.timestamp}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusStyles[submissionStatus]}`}>
                        {submissionStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleActionClick(item.pollingUnit)} className="text-primary-green font-medium hover:underline">{actionText[submissionStatus]}</button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No submissions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center mt-4 text-sm text-gray-600 dark:text-gray-400">
        <span>Showing {Math.min(5, results.length)} of {results.length} submissions</span>
        <button onClick={handleViewAll} className="text-primary-green font-medium hover:underline">View All</button>
      </div>
    </div>
  );
};

export default SubmissionsTable;