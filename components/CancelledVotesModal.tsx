import React, { useState, useMemo } from 'react';
import { FaTimesCircle, FaTimes } from 'react-icons/fa';
import type { CancelledVote } from '../types';
import Modal from './Modal';

interface CancelledVotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  cancelledVotes: CancelledVote[];
}

const reasonStyles: Record<CancelledVote['reason'], string> = {
    'Over-voting': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    'Ballot Snatching': 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
    'Violence': 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
    'Invalid Markings': 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200',
    'Admin Action': 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200',
};

const CancelledVotesModal: React.FC<CancelledVotesModalProps> = ({ isOpen, onClose, cancelledVotes }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const titleId = "cancelled-votes-modal-title";

    const filteredVotes = useMemo(() => {
        if (!searchQuery) return cancelledVotes;
        const lowercasedQuery = searchQuery.toLowerCase();
        return cancelledVotes.filter(vote =>
            vote.pollingUnit.toLowerCase().includes(lowercasedQuery) ||
            vote.reason.toLowerCase().includes(lowercasedQuery)
        );
    }, [cancelledVotes, searchQuery]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Cancelled Votes Report" containerClasses="max-w-4xl">
            <div className="sticky top-0 bg-primary-green text-white px-6 py-4 flex justify-between items-center z-10 rounded-t-lg">
                <h5 id={titleId} className="text-lg font-semibold flex items-center">
                    <FaTimesCircle className="mr-3" /> Cancelled Votes Report
                </h5>
                <button onClick={onClose} className="text-white text-2xl hover:text-gray-200" aria-label="Close modal"><FaTimes /></button>
            </div>
            
            <div className="p-6 overflow-y-auto">
                <div className="mb-4">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by polling unit or reason..."
                        className="w-full max-w-lg p-2 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        aria-label="Search cancelled votes"
                    />
                </div>
                <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0 z-10">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Polling Unit</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Reason for Cancellation</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Votes Cancelled</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredVotes.length > 0 ? (
                                filteredVotes.map(vote => (
                                    <tr key={vote.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{vote.pollingUnit}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${reasonStyles[vote.reason]}`}>
                                                {vote.reason}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200 text-right font-mono">{vote.votesCancelled.toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{vote.timestamp}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="text-center py-8 text-gray-500 dark:text-gray-400">
                                        No records found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div className="sticky bottom-0 bg-gray-100 dark:bg-gray-900/50 px-6 py-4 flex justify-end items-center border-t dark:border-gray-700 rounded-b-lg">
                <button onClick={onClose} className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-600 border dark:border-gray-500 rounded-md hover:bg-gray-100 dark:hover:bg-gray-500">Close</button>
            </div>
        </Modal>
    );
};

export default CancelledVotesModal;