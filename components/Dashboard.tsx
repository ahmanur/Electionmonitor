import React, { useEffect, useMemo, useState, useRef } from 'react';
import { FaDownload, FaFileExcel, FaUsers, FaUserCheck, FaPoll, FaTimesCircle, FaVoteYea, FaCheckCircle, FaExclamationCircle, FaBan, FaFilePdf } from 'react-icons/fa';
import StatsCard from './StatsCard';
import VoteDistributionChart from './VoteDistributionChart';
import CancelledPollingUnitsTable from './IncidenceTable'; // Renamed for clarity, file is the same
import SubmissionsTable from './SubmissionsTable';
import LiveFeed from './LiveFeed';
import type { StatsCardData, ElectionReportData, VoteStats, CancelledVote, Result, Candidate, PollingUnit, LiveFeedEvent, OverVotingIncident } from '../types';
import LgaVoteDistributionChart from './LgaVoteDistributionChart';
import { useSettings } from '../contexts/SettingsContext';
import OverVotingAlert from './OverVotingAlert';
import { useToast } from '../contexts/ToastContext';

interface DashboardProps {
    setElectionData: (data: ElectionReportData) => void;
    agentsCount: number;
    cancelledVotes: CancelledVote[];
    currentVoteStats: VoteStats;
    openKeyStatsModal: () => void;
    openCancelledVotesModal: () => void;
    results: Result[];
    candidates: Candidate[];
    allPollingUnits: PollingUnit[];
    navigateToResults: () => void;
    setResultsPreFilter: (filter: string) => void;
    liveFeedEvents: LiveFeedEvent[];
    overVotingIncidents: OverVotingIncident[];
    onReviewOverVoting: (pollingUnit: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
    setElectionData, agentsCount, cancelledVotes, currentVoteStats, 
    openKeyStatsModal, openCancelledVotesModal, results, candidates, 
    allPollingUnits, navigateToResults, setResultsPreFilter, liveFeedEvents,
    overVotingIncidents, onReviewOverVoting
}) => {
  const { settings } = useSettings();
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();

  const activeOverVotingAlerts = useMemo(() => {
    return overVotingIncidents.filter(
      incident => !dismissedAlerts.includes(incident.pollingUnit)
    );
  }, [overVotingIncidents, dismissedAlerts]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [exportMenuRef]);

  const handleExport = (format: 'PDF' | 'Excel') => {
    addToast(`Exporting as ${format}... (feature coming soon)`, 'info');
    setIsExportMenuOpen(false);
  };

  const handleDismissAlert = (pollingUnit: string) => {
    setDismissedAlerts(prev => [...prev, pollingUnit]);
  };

  const isGlobalOverVoting = currentVoteStats.cast > currentVoteStats.accredited;
  const voteStatCards: StatsCardData[] = [
    {
      title: 'Registered Voters',
      value: currentVoteStats.registered.toLocaleString(),
      icon: FaUsers,
      progress: 100,
      progressColor: 'bg-blue-500',
      onClick: openKeyStatsModal,
    },
    {
      title: 'Accredited Voters',
      value: currentVoteStats.accredited.toLocaleString(),
      icon: FaUserCheck,
      progress: currentVoteStats.registered > 0 ? Math.round((currentVoteStats.accredited / currentVoteStats.registered) * 100) : 0,
      progressColor: 'bg-primary-green',
      onClick: openKeyStatsModal,
    },
    {
      title: 'Votes Cast',
      value: currentVoteStats.cast.toLocaleString(),
      icon: FaPoll,
      progress: currentVoteStats.accredited > 0 ? Math.round((currentVoteStats.cast / currentVoteStats.accredited) * 100) : 0,
      progressColor: isGlobalOverVoting ? 'bg-red-500' : 'bg-yellow-500',
      onClick: openKeyStatsModal,
    },
    {
      title: 'Cancelled Votes',
      value: currentVoteStats.cancelled.toLocaleString(),
      icon: FaTimesCircle,
      progress: currentVoteStats.cast > 0 ? Math.round((currentVoteStats.cancelled / currentVoteStats.cast) * 100) : 0,
      progressColor: 'bg-orange-500',
      onClick: openCancelledVotesModal,
    },
  ];
  
  const pollingStatsCards = useMemo(() => {
    const totalUnits = allPollingUnits.length;
    const reportedUnitsCount = new Set(results.map(r => r.pollingUnit)).size;
    const cancelledUnitsCount = new Set(cancelledVotes.map(v => v.pollingUnit)).size;
    // Ensure not reported isn't negative if data is inconsistent
    const notReportedUnitsCount = Math.max(0, totalUnits - reportedUnitsCount - cancelledUnitsCount);

    return [
      { 
        title: 'Total Polling Units', 
        value: totalUnits.toLocaleString(), 
        icon: FaVoteYea, 
        progress: 100, 
        progressColor: 'bg-blue-500' 
      },
      { 
        title: 'Reported', 
        value: reportedUnitsCount.toLocaleString(), 
        icon: FaCheckCircle, 
        progress: totalUnits > 0 ? Math.round((reportedUnitsCount / totalUnits) * 100) : 0, 
        progressColor: 'bg-green-500' 
      },
      { 
        title: 'Not Reported', 
        value: notReportedUnitsCount.toLocaleString(), 
        icon: FaExclamationCircle, 
        progress: totalUnits > 0 ? Math.round((notReportedUnitsCount / totalUnits) * 100) : 0, 
        progressColor: 'bg-yellow-500' 
      },
      { 
        title: 'Cancelled PUs', 
        value: cancelledUnitsCount.toLocaleString(), 
        icon: FaBan, 
        progress: totalUnits > 0 ? Math.round((cancelledUnitsCount / totalUnits) * 100) : 0, 
        progressColor: 'bg-red-500',
        onClick: openCancelledVotesModal
      },
    ];
  }, [results, cancelledVotes, allPollingUnits, openCancelledVotesModal]);

  useEffect(() => {
    const reportData: ElectionReportData = {
        voteStats: currentVoteStats,
        pollingStats: pollingStatsCards,
        totalIncidents: 0, // This is now deprecated on the dashboard
        totalSubmissions: parseInt(pollingStatsCards.find(c => c.title === 'Reported')?.value.replace(/,/g, '') || '0', 10)
    };
    setElectionData(reportData);
  }, [currentVoteStats, pollingStatsCards, setElectionData]);


  return (
    <>
      {settings.showOverVotingAlert && activeOverVotingAlerts.map(incident => (
        <OverVotingAlert
          key={incident.pollingUnit}
          pollingUnit={incident.pollingUnit}
          votesCast={incident.votesCast}
          accreditedVoters={incident.accreditedVoters}
          onClose={() => handleDismissAlert(incident.pollingUnit)}
          onReview={() => onReviewOverVoting(incident.pollingUnit)}
        />
      ))}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2 sm:mb-0">Election Overview - Dutse Zone</h2>
        <div className="relative" ref={exportMenuRef}>
           <button 
             onClick={() => setIsExportMenuOpen(prev => !prev)}
             className="flex items-center px-4 py-2 text-sm text-primary-green border border-primary-green rounded-md hover:bg-primary-green hover:text-white transition-colors duration-200"
           >
             <FaDownload className="mr-2" /> Export Data
           </button>
           {isExportMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg z-20 border dark:border-gray-600">
                <button onClick={() => handleExport('PDF')} className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">
                    <FaFilePdf className="mr-3 text-red-500" /> Export PDF
                </button>
                <button onClick={() => handleExport('Excel')} className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">
                    <FaFileExcel className="mr-3 text-green-500" /> Export Excel
                </button>
            </div>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {voteStatCards.map((card, index) => (
          <StatsCard key={`vote-stat-${index}`} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {pollingStatsCards.map((card, index) => (
          <StatsCard key={`poll-stat-${index}`} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Vote Distribution by Candidate</h3>
                <div className="h-64 sm:h-80 lg:h-96">
                    <VoteDistributionChart results={results} candidates={candidates} />
                </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Candidate Votes by LGA</h3>
                <div className="h-64 sm:h-80 lg:h-96">
                    <LgaVoteDistributionChart results={results} candidates={candidates} />
                </div>
            </div>
        </div>
        <div className="lg:col-span-1">
            <LiveFeed events={liveFeedEvents} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <CancelledPollingUnitsTable cancelledVotes={cancelledVotes} openModal={openCancelledVotesModal} />
        <SubmissionsTable 
          results={results} 
          navigateToResults={navigateToResults}
          setPreFilter={setResultsPreFilter}
        />
      </div>
    </>
  );
};

export default Dashboard;