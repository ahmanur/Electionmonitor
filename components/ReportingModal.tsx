import React, { useState, useMemo } from 'react';
import { FaFileAlt, FaPrint, FaUsers, FaUserCheck, FaPoll, FaFilter, FaTimesCircle, FaEdit, FaTrash } from 'react-icons/fa';
import type { ElectionReportData, Result, Incidence, Candidate, VoteDistributionData, CancelledVote, PollingUnit } from '../types';
import VoteDistributionChart from './VoteDistributionChart';
import LgaVoteDistributionChart from './LgaVoteDistributionChart';
import { lgaVoteData } from '../constants';
import EditResultModal from './EditResultModal';
import ConfirmationModal from './ConfirmationModal';

interface ReportingProps {
  reportData: ElectionReportData | null;
  results: Result[];
  onUpdateResult: (updatedResult: Result) => void;
  onDeleteResult: (resultId: string) => void;
  incidents: Incidence[];
  candidates: Candidate[];
  cancelledVotes: CancelledVote[];
  allPollingUnits: PollingUnit[];
}

// FIX: Added style for 'Cancelled' status to resolve TypeScript error and ensure cancelled results are styled correctly.
const resultStatusStyles: Record<Result['status'], string> = {
  Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  Verified: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  Disputed: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  Cancelled: 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200',
};

const ReportingPage: React.FC<ReportingProps> = ({ reportData, results, onUpdateResult, onDeleteResult, incidents, candidates, cancelledVotes, allPollingUnits }) => {
    
    const [lgaFilter, setLgaFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState<Result['status'] | 'All'>('All');
    const [dateFilter, setDateFilter] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedResult, setSelectedResult] = useState<Result | null>(null);
    const [resultToDelete, setResultToDelete] = useState<string | null>(null);
    
    const handleDeleteResult = (resultId: string) => {
        setResultToDelete(resultId);
    };

    const confirmDelete = () => {
        if (resultToDelete) {
            onDeleteResult(resultToDelete);
            setResultToDelete(null);
        }
    };

    const handleEditResult = (result: Result) => {
        setSelectedResult(result);
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = (updatedResult: Result) => {
        onUpdateResult(updatedResult);
        setIsEditModalOpen(false);
        setSelectedResult(null);
    };

    const enrichedResults = useMemo(() => {
        return results.map(result => {
            const pollingUnitInfo = allPollingUnits.find(pu => pu.name === result.pollingUnit);
            return {
                ...result,
                lga: pollingUnitInfo?.lga || result.lga,
                ward: pollingUnitInfo?.ward || result.ward,
            };
        });
    }, [results, allPollingUnits]);

    const enrichedCancelledVotes = useMemo(() => {
        return cancelledVotes.map(vote => {
            const pollingUnitInfo = allPollingUnits.find(pu => pu.name === vote.pollingUnit);
            return {
                ...vote,
                lga: pollingUnitInfo?.lga,
            };
        });
    }, [cancelledVotes, allPollingUnits]);

    const filteredData = useMemo(() => {
        if (!reportData) {
            return null;
        }
        let filteredResults = [...enrichedResults];
        let filteredCancelledVotes = [...enrichedCancelledVotes];

        if (lgaFilter !== 'All') {
            filteredResults = filteredResults.filter(r => r.lga === lgaFilter);
            filteredCancelledVotes = filteredCancelledVotes.filter(cv => cv.lga === lgaFilter);
        }

        if (statusFilter !== 'All') {
            filteredResults = filteredResults.filter(r => r.status === statusFilter);
        }

        if (dateFilter) {
            const filterDate = new Date(dateFilter).toLocaleDateString('en-CA');
            filteredResults = filteredResults.filter(r => r.timestamp.startsWith(filterDate));
            filteredCancelledVotes = filteredCancelledVotes.filter(cv => cv.timestamp.startsWith(filterDate));
        }

        const candidateTotals = candidates.reduce((acc, candidate) => {
            acc[candidate.id] = 0;
            return acc;
        }, {} as Record<string, number>);

        let totalCast = 0;
        filteredResults.forEach(result => {
            result.candidateScores.forEach(score => {
                if (candidateTotals[score.candidateId] !== undefined) {
                    candidateTotals[score.candidateId] += score.score;
                }
            });
        });
        totalCast = Object.values(candidateTotals).reduce((sum, current) => sum + current, 0);

        const lgaTotals = lgaVoteData.reduce((acc, lga) => {
            acc[lga.name] = 0;
            return acc;
        }, {} as Record<string, number>);

        filteredResults.forEach(result => {
            if (lgaTotals.hasOwnProperty(result.lga)) {
                const resultTotal = result.candidateScores.reduce((sum, s) => sum + s.score, 0);
                lgaTotals[result.lga] += resultTotal;
            }
        });
        
        const totalPollingUnitsCard = reportData.pollingStats.find(s => s.title === 'Total Polling Units');
        const totalPollingUnits = totalPollingUnitsCard ? parseInt(totalPollingUnitsCard.value.replace(/,/g, ''), 10) : 0;

        const reportedPollingUnits = new Set(filteredResults.map(r => r.pollingUnit)).size;
        
        const notReportedPollingUnits = Math.max(0, totalPollingUnits - reportedPollingUnits);
        
        const cancelledPollingUnits = new Set(filteredCancelledVotes.map(cv => cv.pollingUnit)).size;

        const pollingUnitSummary = {
            total: totalPollingUnits,
            reported: reportedPollingUnits,
            notReported: notReportedPollingUnits,
            cancelled: cancelledPollingUnits,
        };

        const totalCancelled = filteredCancelledVotes.reduce((sum, vote) => sum + vote.votesCancelled, 0);

        const voteStats = {
            ...reportData.voteStats,
            cast: totalCast,
            cancelled: totalCancelled,
        };

        return {
            filteredResults,
            pollingUnitSummary,
            voteStats,
        };
    }, [enrichedResults, enrichedCancelledVotes, candidates, lgaFilter, statusFilter, dateFilter, reportData]);

    const handlePrint = () => {
        const content = document.getElementById('report-content');
        if (content) {
            const printWindow = window.open('', '', 'height=800,width=800');
            printWindow?.document.write('<html><head><title>Election Report</title>');
            printWindow?.document.write('<script src="https://cdn.tailwindcss.com"></script>');
            printWindow?.document.write('<style>body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } #report-filters, #report-actions, .no-print { display: none; } .printable-table-container { max-height: none !important; }</style>');
            printWindow?.document.write('</head><body class="p-8">');
            printWindow?.document.write(content.innerHTML);
            printWindow?.document.write('</body></html>');
            printWindow?.document.close();
            printWindow?.focus();
            setTimeout(() => {
                printWindow?.print();
                printWindow?.close();
            }, 250);
        }
    };
    
    if (!filteredData) {
        return <div className="text-center p-10 text-gray-500 dark:text-gray-400">Loading report data...</div>;
    }

    return (
        <>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md h-full">
                <div id="report-actions" className="flex justify-between items-center mb-6">
                     <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
                        <FaFileAlt className="mr-3 text-primary-green" /> Election Summary Report
                    </h2>
                    <button onClick={handlePrint} className="flex items-center px-4 py-2 text-sm text-white bg-primary-green rounded-md hover:bg-green-700">
                        <FaPrint className="mr-2" /> Print Report
                    </button>
                </div>

                <div id="report-content">
                    <div id="report-filters" className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg flex flex-wrap items-center gap-4">
                        <FaFilter className="text-gray-600 dark:text-gray-300" />
                        <div>
                            <label htmlFor="lga-filter" className="text-sm font-medium text-gray-700 dark:text-gray-200 mr-2">LGA:</label>
                            <select id="lga-filter" value={lgaFilter} onChange={(e) => setLgaFilter(e.target.value)} className="p-2 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                <option value="All">All LGAs</option>
                                {lgaVoteData.map(lga => <option key={lga.name} value={lga.name}>{lga.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="status-filter" className="text-sm font-medium text-gray-700 dark:text-gray-200 mr-2">Status:</label>
                            <select id="status-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as Result['status'] | 'All')} className="p-2 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                <option value="All">All Statuses</option>
                                <option value="Verified">Verified</option>
                                <option value="Pending">Pending</option>
                                <option value="Disputed">Disputed</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="date-filter" className="text-sm font-medium text-gray-700 dark:text-gray-200 mr-2">Date:</label>
                            <input type="date" id="date-filter" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="p-1.5 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 text-center">Dutse Zone Election - {lgaFilter} Overview</h2>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3 border-b dark:border-gray-700 pb-2">Key Voting Metrics</h3>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="flex items-center space-x-3 p-2"><FaUsers className="text-blue-500 text-3xl" /><div><div className="text-sm text-gray-500 dark:text-gray-400">Registered</div><div className="font-bold text-xl">{filteredData.voteStats.registered.toLocaleString()}</div></div></div>
                            <div className="flex items-center space-x-3 p-2"><FaUserCheck className="text-primary-green text-3xl" /><div><div className="text-sm text-gray-500 dark:text-gray-400">Accredited</div><div className="font-bold text-xl">{filteredData.voteStats.accredited.toLocaleString()}</div></div></div>
                            <div className="flex items-center space-x-3 p-2"><FaPoll className={`text-3xl ${filteredData.voteStats.cast > filteredData.voteStats.accredited ? 'text-red-500' : 'text-yellow-500'}`} /><div><div className="text-sm text-gray-500 dark:text-gray-400">Votes Cast</div><div className="font-bold text-xl">{filteredData.voteStats.cast.toLocaleString()}</div></div></div>
                            <div className="flex items-center space-x-3 p-2"><FaTimesCircle className="text-orange-500 text-3xl" /><div><div className="text-sm text-gray-500 dark:text-gray-400">Cancelled</div><div className="font-bold text-xl">{filteredData.voteStats.cancelled.toLocaleString()}</div></div></div>
                          </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3 border-b dark:border-gray-700 pb-2">Polling Unit Summary Report</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-1 text-center">
                                <div><p className="font-bold text-xl text-blue-500">{filteredData.pollingUnitSummary.total.toLocaleString()}</p><p className="text-xs text-gray-600 dark:text-gray-300">Total Units</p></div>
                                <div><p className="font-bold text-xl text-green-500">{filteredData.pollingUnitSummary.reported.toLocaleString()}</p><p className="text-xs text-gray-600 dark:text-gray-300">Reported</p></div>
                                <div><p className="font-bold text-xl text-yellow-500">{filteredData.pollingUnitSummary.notReported.toLocaleString()}</p><p className="text-xs text-gray-600 dark:text-gray-300">Not Reported</p></div>
                                <div><p className="font-bold text-xl text-red-500">{filteredData.pollingUnitSummary.cancelled.toLocaleString()}</p><p className="text-xs text-gray-600 dark:text-gray-300">Cancelled</p></div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow h-[400px]">
                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Vote Distribution by Candidate</h3>
                            <VoteDistributionChart results={filteredData.filteredResults} candidates={candidates} />
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow h-[400px]">
                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Vote by Local Government</h3>
                            <LgaVoteDistributionChart results={filteredData.filteredResults} candidates={candidates} />
                        </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Detailed Results ({filteredData.filteredResults.length} entries)</h3>
                        <div className="overflow-auto max-h-96 printable-table-container">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Polling Unit</th>
                                        {candidates.map(c => <th key={c.id} className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{c.name}</th>)}
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase no-print">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredData.filteredResults.length > 0 ? filteredData.filteredResults.map(result => (
                                        <tr key={result.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{result.pollingUnit}</td>
                                            {candidates.map(c => {
                                                const score = result.candidateScores.find(s => s.candidateId === c.id)?.score || 0;
                                                return <td key={c.id} className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 text-right font-mono">{score.toLocaleString()}</td>
                                            })}
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${resultStatusStyles[result.status]}`}>
                                                    {result.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4 no-print">
                                                <button type="button" onClick={() => handleEditResult(result)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300" title="Edit Result" aria-label={`Edit result for ${result.pollingUnit}`}><FaEdit /></button>
                                                <button type="button" onClick={() => handleDeleteResult(result.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" title="Delete Result" aria-label={`Delete result for ${result.pollingUnit}`}><FaTrash /></button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={candidates.length + 4} className="text-center py-8 text-gray-500 dark:text-gray-400">No results match the current filters.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            {isEditModalOpen && selectedResult && (
                <EditResultModal
                  isOpen={isEditModalOpen}
                  onClose={() => setIsEditModalOpen(false)}
                  result={selectedResult}
                  candidates={candidates}
                  onSave={handleSaveEdit}
                />
            )}
            <ConfirmationModal
                isOpen={!!resultToDelete}
                onClose={() => setResultToDelete(null)}
                onConfirm={confirmDelete}
                title="Confirm Deletion"
                message="Are you sure you want to permanently delete this result entry? This action cannot be undone."
            />
        </>
    );
};

export default ReportingPage;