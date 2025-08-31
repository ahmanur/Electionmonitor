import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

interface OverVotingAlertProps {
  pollingUnit: string;
  votesCast: number;
  accreditedVoters: number;
  onClose: () => void;
  onReview: () => void;
}

const OverVotingAlert: React.FC<OverVotingAlertProps> = ({ pollingUnit, votesCast, accreditedVoters, onClose, onReview }) => {
  return (
    <div className="bg-status-urgent-bg dark:bg-red-900/50 border-l-4 border-status-urgent-text dark:border-red-500 text-status-urgent-text dark:text-red-300 p-4 rounded-md shadow-md mb-6 flex items-start" role="alert">
      <div className="text-2xl mr-4">
        <FaExclamationTriangle />
      </div>
      <div className="flex-grow">
        <p className="font-bold text-lg">Over Voting Alert!</p>
        <p className="text-sm">
          Over-voting detected at <strong>{pollingUnit}</strong>. 
          Votes Cast: <span className="font-semibold">{votesCast.toLocaleString()}</span>, 
          Accredited Voters: <span className="font-semibold">{accreditedVoters.toLocaleString()}</span>.
          Immediate review is required.
        </p>
        <button onClick={onReview} className="mt-2 text-sm font-semibold text-status-urgent-text dark:text-red-300 hover:underline focus:outline-none">
          Review Details &rarr;
        </button>
      </div>
      <button onClick={onClose} className="text-xl font-semibold hover:text-red-800 dark:hover:text-red-200" aria-label="Close alert">
        &times;
      </button>
    </div>
  );
};

export default OverVotingAlert;
