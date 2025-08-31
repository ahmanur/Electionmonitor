import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
    FaClipboardList, FaCheck, FaTrashAlt, FaEdit, FaTable, FaChartBar, 
    FaExclamationTriangle, FaCheckCircle, FaHourglassHalf, FaTrash,
    FaExpand, FaCompress, FaDownload, FaFilePdf, FaFileExcel, FaEye,
    FaEllipsisV, FaBan
} from 'react-icons/fa';
import type { Result, Candidate, VoteDistributionData, CancelledVote, PollingUnit } from '../types';
import EditResultModal from './EditResultModal';
import VoteDistributionChart from './VoteDistributionChart';
import LgaVoteDistributionChart from './LgaVoteDistributionChart';
import ConfirmationModal from './ConfirmationModal';
import { useToast } from '../contexts/ToastContext';
import ViewResultSheetModal from './ViewResultSheetModal';


interface ResultsProps {
  results: Result[];
  onUpdateResult: (result: Result) => void;
  onDeleteResult: (resultId: string) => void;
  onBulkUpdateResultsStatus: (resultIds: string[], status: Result['status']) => void;
  onBulkDeleteResults: (resultIds: string[]) => void;
  candidates: Candidate[];
  cancelledVotes: CancelledVote[];
  allPollingUnits: PollingUnit[];
  isMaximized: boolean;
  onToggleMaximize: () => void;
  preFilter: string;
  onClearPreFilter: () => void;
}

const statusStyles: Record<Result['status'], string> = {
  Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  Verified: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  Disputed: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  Cancelled: 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200',
};

const ResultsPage: React.FC<ResultsProps> = ({ 
    results, onUpdateResult, onDeleteResult, onBulkUpdateResultsStatus, onBulkDeleteResults, 
    candidates, cancelledVotes, allPollingUnits, isMaximized, onToggleMaximize,
    preFilter, onClearPreFilter
}) => {
    const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [lgaFilter, setLgaFilter] = useState('');
    const [wardFilter, setWardFilter] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedResult, setSelectedResult] = useState<Result | null>(null);
    const [selectedResultIds, setSelectedResultIds] = useState<string[]>([]);
    const headerCheckboxRef = useRef<HTMLInputElement>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [confirmCancel, setConfirmCancel] = useState<{ single?: string; bulk?: string[] } | null>(null);
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
    const exportMenuRef = useRef<HTMLDivElement>(null);
    const { addToast } = useToast();
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [resultToView, setResultToView] = useState<Result | null>(null);
    const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
    const actionMenuRef = useRef<HTMLDivElement>(null);
    
    const lgas = useMemo(() => [...new Set(allPollingUnits.map(pu => pu.lga))].sort(), [allPollingUnits]);
    const wards = useMemo(() => {
        if (!lgaFilter) return [];
        return [...new Set(allPollingUnits.filter(pu => pu.lga === lgaFilter).map(pu => pu.ward))].sort();
    }, [allPollingUnits, lgaFilter]);

    const isFilterActive = !!(dateFilter || lgaFilter || wardFilter || searchQuery);

    useEffect(() => {
        if (preFilter) {
            setSearchQuery(preFilter);
            onClearPreFilter();
        }
    }, [preFilter, onClearPreFilter]);

    // Enrich results with canonical location data before any filtering
    const enrichedResults = useMemo(() => {
        return results.map(result => {
            const pollingUnitInfo = allPollingUnits.find(pu => pu.name === result.pollingUnit);
            if (pollingUnitInfo) {
                return {
                    ...result,
                    lga: pollingUnitInfo.lga,
                    ward: pollingUnitInfo.ward,
                };
            }
            return result; // Fallback to original data if no match found
        });
    }, [results, allPollingUnits]);

    // Memoization for the main election results table
    const filteredResults = useMemo(() => {
        const lowercasedQuery = searchQuery.toLowerCase();
        return enrichedResults.filter(result => {
            const dateMatch = !dateFilter || result.timestamp.startsWith(dateFilter);
            const lgaMatch = !lgaFilter || result.lga === lgaFilter;
            const wardMatch = !wardFilter || result.ward === wardFilter;
            const searchMatch = !searchQuery || (
                result.pollingUnit.toLowerCase().includes(lowercasedQuery) ||
                result.ward.toLowerCase().includes(lowercasedQuery) ||
                result.lga.toLowerCase().includes(lowercasedQuery) ||
                result.agentName.toLowerCase().includes(lowercasedQuery)
            );
            return dateMatch && lgaMatch && wardMatch && searchMatch;
        });
    }, [enrichedResults, searchQuery, dateFilter, lgaFilter, wardFilter]);

    // Memoization for chart data, derived from the main table's filtered results
    const chartData = useMemo(() => {
        if (filteredResults.length === 0) {
            return null;
        }
        const candidateVoteDistribution: VoteDistributionData[] = candidates.map(c => ({
            name: c.name,
            votes: filteredResults.reduce((sum, r) => sum + (r.candidateScores.find(s => s.candidateId === c.id)?.score || 0), 0)
        }));
        return { candidateVoteDistribution };
    }, [filteredResults, candidates]);

    const totals = useMemo(() => {
        const initialTotals = {
            registeredVoters: 0,
            accreditedVoters: 0,
            votesCast: 0,
            votesCancelled: 0,
            candidateScores: candidates.reduce((acc, candidate) => {
                acc[candidate.id] = 0;
                return acc;
            }, {} as Record<string, number>)
        };
    
        return filteredResults.reduce((acc, result) => {
            acc.registeredVoters += result.registeredVoters;
            acc.accreditedVoters += result.accreditedVoters;
            acc.votesCast += result.votesCast;
            acc.votesCancelled += result.votesCancelled;
    
            result.candidateScores.forEach(score => {
                if (acc.candidateScores.hasOwnProperty(score.candidateId)) {
                    acc.candidateScores[score.candidateId] += score.score;
                }
            });
    
            return acc;
        }, initialTotals);
    }, [filteredResults, candidates]);


    useEffect(() => {
        // Clear selection when filters change
        setSelectedResultIds([]);
    }, [dateFilter, lgaFilter, wardFilter, searchQuery]);

    useEffect(() => {
        if (headerCheckboxRef.current) {
            const numSelected = selectedResultIds.length;
            const numVisible = filteredResults.length;
            headerCheckboxRef.current.checked = numSelected === numVisible && numVisible > 0;
            headerCheckboxRef.current.indeterminate = numSelected > 0 && numSelected < numVisible;
        }
    }, [selectedResultIds, filteredResults]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
          if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
            setIsExportMenuOpen(false);
          }
          if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
            setOpenActionMenu(null);
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

    const handleLgaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLgaFilter(e.target.value);
        setWardFilter(''); // Reset ward filter when LGA changes
    };

    const handleClearFilters = () => {
        setDateFilter('');
        setLgaFilter('');
        setWardFilter('');
        setSearchQuery('');
    };

    const handleVerify = (resultId: string) => {
        const result = results.find(r => r.id === resultId);
        if (result) {
            onUpdateResult({ ...result, status: 'Verified' });
        }
    };

    const handleDelete = (resultId: string) => {
        setConfirmDeleteId(resultId);
    };
    
    const confirmDelete = () => {
        if (confirmDeleteId && confirmDeleteId !== 'bulk') {
            onDeleteResult(confirmDeleteId);
        } else if (confirmDeleteId === 'bulk' && selectedResultIds.length > 0) {
             onBulkDeleteResults(selectedResultIds);
             setSelectedResultIds([]);
        }
        setConfirmDeleteId(null);
    };

    const handleEdit = (result: Result) => {
        setSelectedResult(result);
        setIsEditModalOpen(true);
    };
    
    const handleView = (result: Result) => {
        if (result.resultSheetUrl) {
            setResultToView(result);
            setIsViewModalOpen(true);
        } else {
            addToast('No result sheet image is available for this entry.', 'info');
        }
    };

    const handleSaveEdit = (updatedResult: Result) => {
        onUpdateResult(updatedResult);
        setIsEditModalOpen(false);
        setSelectedResult(null);
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedResultIds(filteredResults.map(r => r.id));
        } else {
            setSelectedResultIds([]);
        }
    };

    const handleSelectOne = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
        if (e.target.checked) {
            setSelectedResultIds(prev => [...prev, id]);
        } else {
            setSelectedResultIds(prev => prev.filter(resultId => resultId !== id));
        }
    };

    const handleBulkDelete = () => {
        setConfirmDeleteId('bulk'); // Use a special string to indicate bulk action
    };
    
    const handleBulkStatusUpdate = (newStatus: Result['status']) => {
        if (selectedResultIds.length === 0) return;
        onBulkUpdateResultsStatus(selectedResultIds, newStatus);
        setSelectedResultIds([]);
    };

    const containerClasses = isMaximized
    ? "bg-white dark:bg-gray-800 p-4 sm:p-6 h-screen flex flex-col"
    : "bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md h-full flex flex-col";
    

    return (
        <>
            <div className={containerClasses}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 flex-shrink-0">
                     <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center mb-2 sm:mb-0">
                        <FaClipboardList className="mr-3 text-primary-green" /> Election Results
                    </h2>
                    <div className="flex items-center space-x-2">
                        <div className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
                            <button onClick={() => setViewMode('table')} className={`px-4 py-1.5 text-sm font-medium rounded-md flex items-center transition-colors ${viewMode === 'table' ? 'bg-white dark:bg-gray-800 text-primary-green shadow' : 'text-gray-600 dark:text-gray-300'}`}>
                                <FaTable className="mr-2" /> Table View
                            </button>
                            <button onClick={() => setViewMode('chart')} className={`px-4 py-1.5 text-sm font-medium rounded-md flex items-center transition-colors ${viewMode === 'chart' ? 'bg-white dark:bg-gray-800 text-primary-green shadow' : 'text-gray-600 dark:text-gray-300'}`}>
                                <FaChartBar className="mr-2" /> Chart View
                            </button>
                        </div>
                        <div className="relative" ref={exportMenuRef}>
                           <button 
                             onClick={() => setIsExportMenuOpen(prev => !prev)}
                             className="flex items-center px-4 py-2 text-sm text-primary-green border border-primary-green rounded-md hover:bg-primary-green hover:text-white transition-colors duration-200"
                           >
                             <FaDownload className="mr-2" /> Export
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
                        <button
                          onClick={onToggleMaximize}
                          className="p-2.5 rounded-md text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                          aria-label={isMaximized ? 'Minimize view' : 'Maximize view'}
                        >
                          {isMaximized ? <FaCompress className="h-5 w-5" /> : <FaExpand className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
                
               <div className="mb-4 flex flex-wrap items-center gap-4 bg-gray-50 dark:bg-gray-900 p-3 rounded-md flex-shrink-0">
                   <div className="flex items-center space-x-2">
                       <label htmlFor="lga-filter" className="text-sm font-medium text-gray-700 dark:text-gray-200">LGA:</label>
                       <select id="lga-filter" value={lgaFilter} onChange={handleLgaChange} className="p-2 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                           <option value="">All LGAs</option>
                           {lgas.map(lga => <option key={lga} value={lga}>{lga}</option>)}
                       </select>
                   </div>
                   <div className="flex items-center space-x-2">
                       <label htmlFor="ward-filter" className="text-sm font-medium text-gray-700 dark:text-gray-200">Ward:</label>
                       <select id="ward-filter" value={wardFilter} onChange={(e) => setWardFilter(e.target.value)} disabled={!lgaFilter} className="p-2 border rounded-md text-sm disabled:bg-gray-200 dark:disabled:bg-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                           <option value="">All Wards</option>
                           {wards.map(ward => <option key={ward} value={ward}>{ward}</option>)}
                       </select>
                   </div>
                   <div className="flex items-center space-x-2">
                       <label htmlFor="date-filter" className="text-sm font-medium text-gray-700 dark:text-gray-200">Date:</label>
                       <input type="date" id="date-filter" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="p-1.5 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                   </div>
                    <div className="flex items-center space-x-2 flex-grow">
                       <label htmlFor="search-filter" className="text-sm font-medium text-gray-700 dark:text-gray-200 sr-only">Search:</label>
                       <input type="text" id="search-filter" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search location or agent..." className="p-2 border rounded-md text-sm w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                   </div>
                   {isFilterActive && (
                       <button onClick={handleClearFilters} className="text-sm text-red-500 hover:underline">
                           Clear Filters
                       </button>
                   )}
               </div>

                <div className="flex-grow overflow-auto">
                    {viewMode === 'table' && selectedResultIds.length > 0 && (
                        <div className="bg-blue-50 dark:bg-blue-900/50 p-3 rounded-md mb-4 flex items-center justify-between flex-wrap gap-2 transition-all duration-300">
                            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">{selectedResultIds.length} result(s) selected</span>
                            <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                                <button onClick={() => handleBulkStatusUpdate('Verified')} className="flex items-center px-3 py-1 text-xs text-white bg-green-600 rounded-md hover:bg-green-700"><FaCheckCircle className="mr-1.5" /> Verify</button>
                                <button onClick={() => handleBulkStatusUpdate('Disputed')} className="flex items-center px-3 py-1 text-xs text-white bg-orange-500 rounded-md hover:bg-orange-600"><FaExclamationTriangle className="mr-1.5" /> Dispute</button>
                                <button onClick={() => handleBulkStatusUpdate('Pending')} className="flex items-center px-3 py-1 text-xs text-yellow-800 bg-yellow-300 rounded-md hover:bg-yellow-400"><FaHourglassHalf className="mr-1.5" /> Mark Pending</button>
                                <button onClick={() => setConfirmCancel({ bulk: selectedResultIds })} className="flex items-center px-3 py-1 text-xs text-white bg-orange-600 rounded-md hover:bg-orange-700"><FaBan className="mr-1.5" /> Mark as Cancelled</button>
                                <button onClick={handleBulkDelete} className="flex items-center px-3 py-1 text-xs text-white bg-red-600 rounded-md hover:bg-red-700"><FaTrash className="mr-1.5" /> Delete</button>
                            </div>
                        </div>
                    )}


                    {viewMode === 'table' ? (
                        <>
                            {/* Desktop Table View */}
                            <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0 z-10">
                                        <tr>
                                            <th scope="col" className="p-4">
                                                <input
                                                    type="checkbox"
                                                    ref={headerCheckboxRef}
                                                    className="form-checkbox h-4 w-4 text-primary-green bg-gray-100 border-gray-300 rounded focus:ring-primary-green dark:bg-gray-600 dark:border-gray-500"
                                                    onChange={handleSelectAll}
                                                />
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">S/N</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Polling Unit</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Ward</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">LGA</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Registered</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Accredited</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Total Votes</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Cancelled</th>
                                            {candidates.map(candidate => (
                                                <th key={candidate.id} className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{candidate.name}</th>
                                            ))}
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {filteredResults.length > 0 ? filteredResults.map((result, index) => (
                                            <tr key={result.id} className={`transition-colors duration-200 ${selectedResultIds.includes(result.id) ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                                                <td className="p-4">
                                                    <input
                                                        type="checkbox"
                                                        className="form-checkbox h-4 w-4 text-primary-green bg-gray-100 border-gray-300 rounded focus:ring-primary-green dark:bg-gray-600 dark:border-gray-500"
                                                        checked={selectedResultIds.includes(result.id)}
                                                        onChange={(e) => handleSelectOne(e, result.id)}
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{index + 1}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{result.pollingUnit}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{result.ward}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{result.lga}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 text-right font-mono">{result.registeredVoters.toLocaleString()}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 text-right font-mono">{result.accreditedVoters.toLocaleString()}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 text-right font-mono">{result.votesCast.toLocaleString()}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500 text-right font-mono">{result.votesCancelled.toLocaleString()}</td>
                                                {candidates.map(candidate => {
                                                    const score = result.candidateScores.find(s => s.candidateId === candidate.id)?.score || 0;
                                                    return (
                                                        <td key={candidate.id} className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 text-right font-mono">{score.toLocaleString()}</td>
                                                    );
                                                })}
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[result.status]}`}>
                                                        {result.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                                                    <button onClick={() => setOpenActionMenu(openActionMenu === result.id ? null : result.id)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-green" aria-haspopup="true" aria-expanded={openActionMenu === result.id}>
                                                        <FaEllipsisV />
                                                    </button>
                                                    {openActionMenu === result.id && (
                                                        <div ref={actionMenuRef} className="absolute right-0 top-10 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg z-20 border dark:border-gray-600">
                                                            <ul className="py-1">
                                                                <li><button onClick={() => { handleView(result); setOpenActionMenu(null); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"><FaEye className="mr-3" /> View Sheet</button></li>
                                                                {result.status !== 'Cancelled' && result.status === 'Pending' && (
                                                                    <li><button onClick={() => { handleVerify(result.id); setOpenActionMenu(null); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-green-600 dark:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-600"><FaCheck className="mr-3" /> Verify</button></li>
                                                                )}
                                                                {result.status !== 'Cancelled' && (
                                                                    <>
                                                                        <li><button onClick={() => { handleEdit(result); setOpenActionMenu(null); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-600"><FaEdit className="mr-3" /> Edit</button></li>
                                                                        <li><button onClick={() => { setConfirmCancel({ single: result.id }); setOpenActionMenu(null); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-orange-600 dark:text-orange-400 hover:bg-gray-100 dark:hover:bg-gray-600"><FaBan className="mr-3" /> Cancel PU</button></li>
                                                                    </>
                                                                )}
                                                                <li><button onClick={() => { handleDelete(result.id); setOpenActionMenu(null); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600"><FaTrashAlt className="mr-3" /> Delete</button></li>
                                                            </ul>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={candidates.length + 11} className="text-center py-8 text-gray-500 dark:text-gray-400">
                                                    No results match the current filters.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                    {filteredResults.length > 0 && (
                                        <tfoot className="bg-gray-200 dark:bg-gray-900 border-t-2 border-gray-300 dark:border-gray-600 sticky bottom-0 z-10">
                                            <tr className="font-bold text-gray-800 dark:text-gray-100">
                                                <td colSpan={5} className="px-6 py-4 text-left text-sm uppercase">Grand Total</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono">{totals.registeredVoters.toLocaleString()}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono">{totals.accreditedVoters.toLocaleString()}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono">{totals.votesCast.toLocaleString()}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono">{totals.votesCancelled.toLocaleString()}</td>
                                                {candidates.map(candidate => {
                                                    const totalScore = totals.candidateScores[candidate.id] || 0;
                                                    return (
                                                        <td key={candidate.id} className="px-4 py-4 whitespace-nowrap text-sm text-right font-mono">{totalScore.toLocaleString()}</td>
                                                    );
                                                })}
                                                <td colSpan={2} className="px-6 py-4"></td>
                                            </tr>
                                        </tfoot>
                                    )}
                                </table>
                            </div>
                            
                            {/* Mobile Card View */}
                            <div className="md:hidden space-y-3">
                                {filteredResults.length > 0 ? filteredResults.map((result, index) => (
                                    <div key={result.id} className={`p-3 rounded-lg border-l-4 ${selectedResultIds.includes(result.id) ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow'}`}>
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start">
                                                <input
                                                    type="checkbox"
                                                    className="form-checkbox h-5 w-5 mt-1 text-primary-green bg-gray-100 border-gray-300 rounded focus:ring-primary-green dark:bg-gray-600 dark:border-gray-500"
                                                    checked={selectedResultIds.includes(result.id)}
                                                    onChange={(e) => handleSelectOne(e, result.id)}
                                                />
                                                <div className="ml-3">
                                                    <p className="font-bold text-gray-900 dark:text-gray-100">{index + 1}. {result.pollingUnit}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{result.ward}, {result.lga}</p>
                                                    <span className={`mt-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[result.status]}`}>
                                                        {result.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="relative">
                                                <button onClick={() => setOpenActionMenu(openActionMenu === result.id ? null : result.id)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-full">
                                                    <FaEllipsisV size={18} />
                                                </button>
                                                {openActionMenu === result.id && (
                                                    <div ref={actionMenuRef} className="absolute right-0 top-10 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg z-20 border dark:border-gray-600">
                                                        <ul className="py-1">
                                                            <li><button onClick={() => { handleView(result); setOpenActionMenu(null); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"><FaEye className="mr-3" /> View Sheet</button></li>
                                                            {result.status !== 'Cancelled' && result.status === 'Pending' && (
                                                                <li><button onClick={() => { handleVerify(result.id); setOpenActionMenu(null); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-green-600 dark:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-600"><FaCheck className="mr-3" /> Verify</button></li>
                                                            )}
                                                            {result.status !== 'Cancelled' && (
                                                                <>
                                                                    <li><button onClick={() => { handleEdit(result); setOpenActionMenu(null); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-600"><FaEdit className="mr-3" /> Edit</button></li>
                                                                    <li><button onClick={() => { setConfirmCancel({ single: result.id }); setOpenActionMenu(null); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-orange-600 dark:text-orange-400 hover:bg-gray-100 dark:hover:bg-gray-600"><FaBan className="mr-3" /> Cancel PU</button></li>
                                                                </>
                                                            )}
                                                            <li><button onClick={() => { handleDelete(result.id); setOpenActionMenu(null); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600"><FaTrashAlt className="mr-3" /> Delete</button></li>
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-3 pt-3 border-t dark:border-gray-700 grid grid-cols-2 gap-2 text-sm">
                                            <p><strong>Registered:</strong> {result.registeredVoters.toLocaleString()}</p>
                                            <p><strong>Accredited:</strong> {result.accreditedVoters.toLocaleString()}</p>
                                            <p><strong>Total Votes:</strong> {result.votesCast.toLocaleString()}</p>
                                            <p><strong>Cancelled:</strong> {result.votesCancelled.toLocaleString()}</p>
                                        </div>
                                        <div className="mt-3 pt-3 border-t dark:border-gray-700">
                                            <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200">Scores</h4>
                                            <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mt-1">
                                                {candidates.map(c => {
                                                    const score = result.candidateScores.find(s => s.candidateId === c.id)?.score || 0;
                                                    return <li key={c.id} className="text-gray-600 dark:text-gray-300"><span className="font-medium text-gray-700 dark:text-gray-200">{c.name.split(' ').pop()}:</span> {score.toLocaleString()}</li>
                                                })}
                                            </ul>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                        No results match the current filters.
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        chartData ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 h-[500px]">
                                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Vote Distribution by Candidate</h3>
                                    <VoteDistributionChart results={filteredResults} candidates={candidates} />
                                </div>
                                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Vote Distribution by LGA</h3>
                                    <LgaVoteDistributionChart results={filteredResults} candidates={candidates} />
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-20 text-gray-500 dark:text-gray-400">
                                <p>No data available for the selected filters to display charts.</p>
                            </div>
                        )
                    )}
                </div>

            </div>
            {isViewModalOpen && resultToView && (
                <ViewResultSheetModal
                    isOpen={isViewModalOpen}
                    onClose={() => setIsViewModalOpen(false)}
                    result={resultToView}
                />
            )}
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
                isOpen={!!confirmDeleteId}
                onClose={() => setConfirmDeleteId(null)}
                onConfirm={confirmDelete}
                title="Confirm Deletion"
                message={
                    confirmDeleteId === 'bulk'
                    ? `Are you sure you want to delete ${selectedResultIds.length} result(s)? This action cannot be undone.`
                    : 'Are you sure you want to delete this result submission? This action cannot be undone.'
                }
            />
            <ConfirmationModal
                isOpen={!!confirmCancel}
                onClose={() => setConfirmCancel(null)}
                onConfirm={() => {
                    if (confirmCancel?.single) {
                        onBulkUpdateResultsStatus([confirmCancel.single], 'Cancelled');
                    } else if (confirmCancel?.bulk) {
                        onBulkUpdateResultsStatus(confirmCancel.bulk, 'Cancelled');
                        setSelectedResultIds([]);
                    }
                    setConfirmCancel(null);
                }}
                title="Confirm Cancellation"
                message={
                    confirmCancel?.bulk
                    ? `Are you sure you want to mark ${confirmCancel.bulk.length} result(s) as cancelled? This will exclude their votes from the main totals.`
                    : 'Are you sure you want to mark this polling unit as cancelled? Its votes will be excluded from the main totals.'
                }
            />
        </>
    );
};

export default ResultsPage;