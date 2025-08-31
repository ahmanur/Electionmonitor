import React from 'react';
import { FaChartBar, FaUsers, FaUserCheck, FaVoteYea } from 'react-icons/fa';
import type { IconType } from 'react-icons';
import { lgaTurnoutData } from '../constants';
import type { VoteStats } from '../types';
import VotingProgressChart from './VotingProgressChart';

interface AnalyticsProps {
    voteStats: VoteStats;
}

const StatCard = ({ icon: Icon, title, value, subtext, progress, progressColor }: { icon: IconType, title: string, value: string, subtext: string, progress: number, progressColor: string }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border-l-4 border-primary-green">
        <div className="flex justify-between items-center mb-2">
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
            </div>
            <div className="text-4xl text-primary-green">
                <Icon />
            </div>
        </div>
        <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 w-full">
            <div className={`h-2 rounded-full ${progressColor}`} style={{ width: `${progress > 100 ? 100 : progress}%` }}></div>
        </div>
        {subtext && <small className="text-gray-400 dark:text-gray-400 mt-1 block">{subtext}</small>}
    </div>
);

const AnalyticsPage: React.FC<AnalyticsProps> = ({ voteStats }) => {
    const accreditedPercentage = voteStats.registered > 0 ? Math.round((voteStats.accredited / voteStats.registered) * 100) : 0;
    const castPercentage = voteStats.accredited > 0 ? Math.round((voteStats.cast / voteStats.accredited) * 100) : 0;

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md h-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
                    <FaChartBar className="mr-3 text-primary-green" /> Vote Statistics Overview
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <StatCard 
                    icon={FaUsers} 
                    title="Total Registered Votes" 
                    value={new Intl.NumberFormat().format(voteStats.registered)} 
                    subtext="" 
                    progress={100} 
                    progressColor="bg-green-500" 
                />
                <StatCard 
                    icon={FaUserCheck} 
                    title="Total Accredited Votes" 
                    value={new Intl.NumberFormat().format(voteStats.accredited)} 
                    subtext={`${accreditedPercentage}% of registered`} 
                    progress={accreditedPercentage} 
                    progressColor="bg-blue-500" 
                />
                <StatCard 
                    icon={FaVoteYea} 
                    title="Total Votes Cast" 
                    value={new Intl.NumberFormat().format(voteStats.cast)} 
                    subtext={`${castPercentage}% of accredited`} 
                    progress={castPercentage} 
                    progressColor={voteStats.cast > voteStats.accredited ? 'bg-red-500' : 'bg-primary-green'} 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                    <h3 className="font-semibold mb-3 text-lg text-gray-700 dark:text-gray-200">Voter Turnout by LGA</h3>
                    <div className="space-y-4">
                        {lgaTurnoutData.map(lga => (
                            <div key={lga.name}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600 dark:text-gray-300">{lga.name}</span>
                                    <span className="font-medium text-primary-green">{lga.turnout}%</span>
                                </div>
                                <div className="bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                                    <div className="bg-primary-green h-2.5 rounded-full" style={{ width: `${lga.turnout}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                    <h3 className="font-semibold mb-3 text-lg text-gray-700 dark:text-gray-200">Voting Progress</h3>
                    <div className="h-64">
                        <VotingProgressChart />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;
