
import React from 'react';
import { FaUsers, FaUserCheck, FaVoteYea } from 'react-icons/fa';
import type { IconType } from 'react-icons';
import type { VoteStats } from '../types';

interface KeyStatsSummaryProps {
  voteStats: VoteStats;
}

const StatItem: React.FC<{ icon: IconType, title: string, value: string, color: string }> = ({ icon: Icon, title, value, color }) => (
    <div className="bg-gray-50 p-4 rounded-lg shadow-inner flex items-center space-x-4 transition-transform duration-200 hover:scale-105">
        <div className={`p-3 rounded-full ${color}`}>
            <Icon className="text-white text-2xl" />
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const KeyStatsSummary: React.FC<KeyStatsSummaryProps> = ({ voteStats }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Key Vote Summary</h3>
      <div className="space-y-4">
        <StatItem 
            icon={FaUsers} 
            title="Total Registered Voters" 
            value={new Intl.NumberFormat().format(voteStats.registered)} 
            color="bg-blue-500"
        />
        <StatItem 
            icon={FaUserCheck} 
            title="Total Accredited Voters" 
            value={new Intl.NumberFormat().format(voteStats.accredited)}
            color="bg-primary-green"
        />
        <StatItem 
            icon={FaVoteYea} 
            title="Total Votes Cast" 
            value={new Intl.NumberFormat().format(voteStats.cast)}
            color={voteStats.cast > voteStats.accredited ? 'bg-red-500' : 'bg-yellow-500'}
        />
      </div>
    </div>
  );
};

export default KeyStatsSummary;
