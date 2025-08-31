import React from 'react';
import type { IconType } from 'react-icons';
import { FaChartPie, FaUsers, FaUserCheck, FaVoteYea, FaDownload } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { lgaTurnoutData, votingProgressData } from '../constants';
import type { VoteStats } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import Modal from './Modal';

interface VoteStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  voteStats: VoteStats;
}

const VoteStatsModal: React.FC<VoteStatsModalProps> = ({ isOpen, onClose, voteStats }) => {
  const { theme } = useTheme();
  const accreditedPercentage = voteStats.registered > 0 ? Math.round((voteStats.accredited / voteStats.registered) * 100) : 0;
  const castPercentage = voteStats.accredited > 0 ? Math.round((voteStats.cast / voteStats.accredited) * 100) : 0;
  const tickColor = theme === 'dark' ? '#9CA3AF' : '#374151';
  const titleId = "vote-stats-modal-title";

  const ModalStatCard = ({ icon: Icon, title, value, subtext, progress, progressColor }: { icon: IconType, title: string, value: string, subtext: string, progress: number, progressColor: string }) => (
    <div className="border-l-4 border-primary-green bg-white dark:bg-gray-700 p-4 rounded-r-lg shadow-sm text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <div className="text-4xl text-primary-green mb-2 mx-auto">
            <Icon />
        </div>
        <h4 className="text-2xl font-bold text-primary-green">{value}</h4>
        <p className="text-gray-500 dark:text-gray-300 mb-1 text-sm">{title}</p>
        <div className="bg-gray-200 dark:bg-gray-600 rounded-full h-2 w-full">
            <div className={`h-2 rounded-full ${progressColor}`} style={{ width: `${progress > 100 ? 100 : progress}%` }}></div>
        </div>
        {subtext && <small className="text-gray-400 dark:text-gray-400 mt-1 block">{subtext}</small>}
    </div>
  );
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Vote Statistics Overview" containerClasses="max-w-4xl">
      <div className="sticky top-0 bg-primary-green text-white px-6 py-4 flex justify-between items-center z-10 rounded-t-lg">
        <h5 id={titleId} className="text-lg font-semibold flex items-center">
          <FaChartPie className="mr-2" /> Vote Statistics Overview
        </h5>
        <button onClick={onClose} className="text-white text-2xl hover:text-gray-200" aria-label="Close modal">&times;</button>
      </div>
      
      <div className="p-6 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <ModalStatCard icon={FaUsers} title="Total Registered Votes" value={new Intl.NumberFormat().format(voteStats.registered)} subtext="" progress={100} progressColor="bg-green-500" />
          <ModalStatCard icon={FaUserCheck} title="Total Accredited Votes" value={new Intl.NumberFormat().format(voteStats.accredited)} subtext={`${accreditedPercentage}% of registered`} progress={accreditedPercentage} progressColor="bg-blue-500" />
          <ModalStatCard icon={FaVoteYea} title="Total Votes Cast" value={new Intl.NumberFormat().format(voteStats.cast)} subtext={`${castPercentage}% of accredited`} progress={castPercentage} progressColor={voteStats.cast > voteStats.accredited ? 'bg-red-500' : 'bg-primary-green'} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
              <h6 className="font-semibold mb-3 text-gray-700 dark:text-gray-200">Voter Turnout by LGA</h6>
              {lgaTurnoutData.map(lga => (
                  <div key={lga.name} className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600 dark:text-gray-300">{lga.name}</span>
                          <span className="font-medium text-primary-green">{lga.turnout}%</span>
                      </div>
                      <div className="bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div className="bg-primary-green h-2 rounded-full" style={{ width: `${lga.turnout}%` }}></div>
                      </div>
                  </div>
              ))}
          </div>
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
              <h6 className="font-semibold mb-3 text-gray-700 dark:text-gray-200">Voting Progress</h6>
              <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={votingProgressData} margin={{ top: 5, right: 20, left: -15, bottom: 5 }}>
                          <XAxis dataKey="time" tick={{ fontSize: 12, fill: tickColor }} />
                          <YAxis tickFormatter={(value) => new Intl.NumberFormat('en-US', { notation: 'compact' }).format(value as number)} tick={{ fontSize: 12, fill: tickColor }} />
                          <Tooltip 
                            cursor={{ fill: 'rgba(107, 114, 128, 0.2)' }}
                            contentStyle={{
                              backgroundColor: theme === 'dark' ? '#1F2937' : 'white',
                              border: `1px solid ${theme === 'dark' ? '#4B5563' : '#ccc'}`,
                              borderRadius: '5px'
                            }}
                          />
                          <Bar dataKey="votes" fill="#008753" />
                      </BarChart>
                  </ResponsiveContainer>
              </div>
          </div>
        </div>
        
        <div>
          <h6 className="font-semibold mb-3 text-gray-700 dark:text-gray-200">Summary</h6>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <ul className="space-y-2">
                  <li className="bg-white dark:bg-gray-700 p-3 rounded-md flex justify-between items-center shadow-sm"><span>Invalid/Cancelled Votes</span><span className="font-bold text-red-500">{new Intl.NumberFormat().format(voteStats.cancelled)}</span></li>
                  <li className="bg-white dark:bg-gray-700 p-3 rounded-md flex justify-between items-center shadow-sm"><span>Valid Votes</span><span className="font-bold text-green-600">{new Intl.NumberFormat().format(voteStats.cast - voteStats.cancelled)}</span></li>
              </ul>
              <ul className="space-y-2">
                  <li className="bg-white dark:bg-gray-700 p-3 rounded-md flex justify-between items-center shadow-sm"><span>Vote Casting Rate</span><span className="font-bold text-blue-600">{castPercentage}%</span></li>
                  <li className="bg-white dark:bg-gray-700 p-3 rounded-md flex justify-between items-center shadow-sm"><span>Overall Turnout</span><span className="font-bold text-primary-green">{accreditedPercentage}%</span></li>
              </ul>
          </div>
        </div>

      </div>
      
      <div className="sticky bottom-0 bg-gray-100 dark:bg-gray-900/50 px-6 py-4 flex justify-end items-center space-x-3 border-t dark:border-gray-700 rounded-b-lg">
        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-600 border dark:border-gray-500 rounded-md hover:bg-gray-100 dark:hover:bg-gray-500">Close</button>
        <button className="flex items-center px-4 py-2 text-sm text-white bg-primary-green rounded-md hover:bg-green-700">
          <FaDownload className="mr-2" /> Export Report
        </button>
      </div>
    </Modal>
  );
};

export default VoteStatsModal;
