import React from 'react';
import { FaUsers, FaUserCheck, FaVoteYea } from 'react-icons/fa';
import type { VoteStats } from '../types';

interface KeyStatsBarProps {
  voteStats: VoteStats;
}

const StatItem: React.FC<{ icon: React.ElementType, title: string, value: string, colorClass: string }> = ({ icon: Icon, title, value, colorClass }) => (
    <div className="flex items-center space-x-3 flex-1 justify-center p-2">
        <div className={`p-3 rounded-full ${colorClass}`}>
            <Icon className="text-white text-xl" />
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const KeyStatsBar: React.FC<KeyStatsBarProps> = ({ voteStats }) => {
    const isOverVoting = voteStats.cast > voteStats.accredited;

    return (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <div className="flex flex-col sm:flex-row justify-around items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <StatItem
                    icon={FaUsers}
                    title="Registered Voters"
                    value={new Intl.NumberFormat().format(voteStats.registered)}
                    colorClass="bg-blue-500"
                />
                <div className="h-12 w-px bg-gray-200 hidden sm:block"></div>
                <StatItem
                    icon={FaUserCheck}
                    title="Accredited Voters"
                    value={new Intl.NumberFormat().format(voteStats.accredited)}
                    colorClass="bg-primary-green"
                />
                <div className="h-12 w-px bg-gray-200 hidden sm:block"></div>
                <StatItem
                    icon={FaVoteYea}
                    title="Votes Cast"
                    value={new Intl.NumberFormat().format(voteStats.cast)}
                    colorClass={isOverVoting ? 'bg-red-500' : 'bg-yellow-500'}
                />
            </div>
        </div>
    );
};

export default KeyStatsBar;