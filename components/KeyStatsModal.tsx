import React from 'react';
import { FaUsers, FaUserCheck, FaVoteYea, FaClipboardList } from 'react-icons/fa';
import type { IconType } from 'react-icons';
import type { VoteStats } from '../types';
import Modal from './Modal';

interface KeyStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  voteStats: VoteStats;
}

const StatItem: React.FC<{ icon: IconType, title: string, value: string, color: string, description: string }> = ({ icon: Icon, title, value, color, description }) => (
    <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg shadow-inner flex items-center space-x-4 transition-transform duration-200 hover:scale-105">
        <div className={`p-4 rounded-full ${color}`}>
            <Icon className="text-white text-3xl" />
        </div>
        <div className="flex-grow">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
            <p className="text-xs text-gray-400 dark:text-gray-400">{description}</p>
        </div>
    </div>
);

const KeyStatsModal: React.FC<KeyStatsModalProps> = ({ isOpen, onClose, voteStats }) => {
  const isOverVoting = voteStats.cast > voteStats.accredited;
  const titleId = "key-stats-modal-title";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Key Vote Summary">
        <div className="bg-primary-green text-white px-6 py-4 flex justify-between items-center rounded-t-lg">
          <h5 id={titleId} className="text-lg font-semibold flex items-center">
            <FaClipboardList className="mr-3" /> Key Vote Summary
          </h5>
          <button onClick={onClose} className="text-white text-2xl hover:text-gray-200" aria-label="Close modal">&times;</button>
        </div>
        
        <div className="p-8 overflow-y-auto">
            <div className="space-y-6">
                <StatItem 
                    icon={FaUsers} 
                    title="Total Registered Voters" 
                    value={new Intl.NumberFormat().format(voteStats.registered)} 
                    description="The total number of citizens eligible to vote."
                    color="bg-blue-500"
                />
                <StatItem 
                    icon={FaUserCheck} 
                    title="Total Accredited Voters" 
                    value={new Intl.NumberFormat().format(voteStats.accredited)}
                    description="Voters who have been verified on election day."
                    color="bg-primary-green"
                />
                <StatItem 
                    icon={FaVoteYea} 
                    title="Total Votes Cast" 
                    value={new Intl.NumberFormat().format(voteStats.cast)}
                    description="The total number of ballots cast."
                    color={isOverVoting ? 'bg-red-500' : 'bg-yellow-500'}
                />
            </div>
            {isOverVoting && (
                <div className="mt-6 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded-md text-sm" role="alert">
                    <strong>Alert:</strong> Over-voting has been detected. The number of votes cast exceeds the number of accredited voters.
                </div>
            )}
        </div>
        
        <div className="bg-gray-100 dark:bg-gray-900/50 px-6 py-4 flex justify-end items-center rounded-b-lg border-t dark:border-gray-700">
          <button onClick={onClose} className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-600 border dark:border-gray-500 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-green">
            Close
          </button>
        </div>
    </Modal>
  );
};

export default KeyStatsModal;