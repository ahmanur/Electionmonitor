import React from 'react';
import type { CancelledVote } from '../types';

const reasonStyles: Record<CancelledVote['reason'], string> = {
    'Over-voting': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    'Ballot Snatching': 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
    'Violence': 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
    'Invalid Markings': 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200',
    'Admin Action': 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200',
};

interface CancelledPollingUnitsTableProps {
  cancelledVotes: CancelledVote[];
  openModal: () => void;
}

const CancelledPollingUnitsTable: React.FC<CancelledPollingUnitsTableProps> = ({ cancelledVotes, openModal }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Cancelled Polling Units</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-white uppercase bg-primary-green sticky top-0 z-10">
            <tr>
              <th scope="col" className="px-6 py-3">Polling Unit</th>
              <th scope="col" className="px-6 py-3">Reason</th>
              <th scope="col" className="px-6 py-3 text-right">Votes Cancelled</th>
            </tr>
          </thead>
          <tbody>
            {cancelledVotes.slice(0, 5).map((item) => (
              <tr key={item.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.pollingUnit}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${reasonStyles[item.reason]}`}>
                    {item.reason}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-mono">{item.votesCancelled.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center mt-4 text-sm text-gray-600 dark:text-gray-400">
        <span>Showing {Math.min(5, cancelledVotes.length)} of {cancelledVotes.length} entries</span>
        <button onClick={openModal} className="text-primary-green font-medium hover:underline">View All</button>
      </div>
    </div>
  );
};

export default CancelledPollingUnitsTable;