import React, { useState, useMemo, useRef, useEffect } from 'react';
import { FaExclamationCircle, FaTrash } from 'react-icons/fa';
import type { Incidence, IncidenceStatus } from '../types';
import ConfirmationModal from './ConfirmationModal';

interface IncidenceReportsProps {
  incidents: Incidence[];
  onUpdateIncidentStatus: (incidentId: number, newStatus: IncidenceStatus) => void;
  onBulkUpdateIncidentsStatus: (incidentIds: number[], newStatus: IncidenceStatus) => void;
  onBulkDeleteIncidents: (incidentIds: number[]) => void;
}

const statusStyles: Record<IncidenceStatus, string> = {
  Pending: 'bg-status-pending-bg text-status-pending-text dark:bg-yellow-900/50 dark:text-yellow-300',
  Resolved: 'bg-status-resolved-bg text-status-resolved-text dark:bg-green-900/50 dark:text-green-300',
  Urgent: 'bg-status-urgent-bg text-status-urgent-text dark:bg-red-900/50 dark:text-red-300',
  Escalated: 'bg-status-escalated-bg text-status-escalated-text dark:bg-purple-900/50 dark:text-purple-300',
};

const statuses: IncidenceStatus[] = ['Pending', 'Resolved', 'Urgent', 'Escalated'];

const IncidenceReportsPage: React.FC<IncidenceReportsProps> = ({ incidents, onUpdateIncidentStatus, onBulkUpdateIncidentsStatus, onBulkDeleteIncidents }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIncidentIds, setSelectedIncidentIds] = useState<number[]>([]);
    const [bulkStatus, setBulkStatus] = useState<IncidenceStatus>('Pending');
    const headerCheckboxRef = useRef<HTMLInputElement>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const filteredIncidents = useMemo(() => {
        if (!searchQuery) return incidents;
        const lowercasedQuery = searchQuery.toLowerCase();
        return incidents.filter(incident =>
            incident.type.toLowerCase().includes(lowercasedQuery) ||
            incident.pollingUnit.toLowerCase().includes(lowercasedQuery)
        );
    }, [incidents, searchQuery]);
    
    useEffect(() => {
        setSelectedIncidentIds([]);
    }, [searchQuery]);

    useEffect(() => {
        if (headerCheckboxRef.current) {
            const numSelected = selectedIncidentIds.length;
            const numVisible = filteredIncidents.length;
            headerCheckboxRef.current.checked = numSelected === numVisible && numVisible > 0;
            headerCheckboxRef.current.indeterminate = numSelected > 0 && numSelected < numVisible;
        }
    }, [selectedIncidentIds, filteredIncidents]);
    
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIncidentIds(filteredIncidents.map(i => i.id));
        } else {
            setSelectedIncidentIds([]);
        }
    };

    const handleSelectOne = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
        if (e.target.checked) {
            setSelectedIncidentIds(prev => [...prev, id]);
        } else {
            setSelectedIncidentIds(prev => prev.filter(incidentId => incidentId !== id));
        }
    };

    const handleBulkStatusUpdate = () => {
        if (selectedIncidentIds.length === 0) return;
        onBulkUpdateIncidentsStatus(selectedIncidentIds, bulkStatus);
        setSelectedIncidentIds([]);
    };

    const handleBulkDelete = () => {
        if (selectedIncidentIds.length > 0) {
            setIsConfirmOpen(true);
        }
    };

    const confirmBulkDelete = () => {
        onBulkDeleteIncidents(selectedIncidentIds);
        setSelectedIncidentIds([]);
        setIsConfirmOpen(false);
    };

    const handleStatusChange = (incidentId: number, newStatus: IncidenceStatus) => {
        onUpdateIncidentStatus(incidentId, newStatus);
    };

    return (
        <>
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md h-full">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
                        <FaExclamationCircle className="mr-3 text-primary-green" /> Incidence Reports
                    </h2>
                </div>

                <div className="mb-4">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by type or polling unit..."
                        className="w-full max-w-lg p-2 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                </div>

                {selectedIncidentIds.length > 0 && (
                    <div className="bg-blue-50 dark:bg-blue-900/50 p-3 rounded-md mb-4 flex items-center justify-between flex-wrap gap-2 transition-all duration-300">
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">{selectedIncidentIds.length} incident(s) selected</span>
                        <div className="flex items-center space-x-2">
                            <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value as IncidenceStatus)} className="p-1.5 border rounded-md text-xs dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <button onClick={handleBulkStatusUpdate} className="px-3 py-1 text-xs text-white bg-blue-600 rounded-md hover:bg-blue-700">Apply Status</button>
                            <button onClick={handleBulkDelete} className="px-3 py-1 text-xs text-white bg-red-600 rounded-md hover:bg-red-700 flex items-center"><FaTrash className="mr-1.5" /> Delete</button>
                        </div>
                    </div>
                )}

                {/* Desktop Table View */}
                <div className="hidden md:block bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Time</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Polling Unit</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredIncidents.length > 0 ? (
                                    filteredIncidents.map(incident => (
                                        <tr key={incident.id} className={`transition-colors duration-200 ${selectedIncidentIds.includes(incident.id) ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                                            <td className="p-4">
                                                <input
                                                    type="checkbox"
                                                    className="form-checkbox h-4 w-4 text-primary-green bg-gray-100 border-gray-300 rounded focus:ring-primary-green dark:bg-gray-600 dark:border-gray-500"
                                                    checked={selectedIncidentIds.includes(incident.id)}
                                                    onChange={(e) => handleSelectOne(e, incident.id)}
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{incident.time}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{incident.type}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{incident.pollingUnit}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <select
                                                    value={incident.status}
                                                    onChange={(e) => handleStatusChange(incident.id, e.target.value as IncidenceStatus)}
                                                    className={`p-1 text-xs font-semibold rounded-md border-0 focus:ring-0 ${statusStyles[incident.status]}`}
                                                >
                                                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                                            No incidents found matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                    {filteredIncidents.length > 0 ? (
                        filteredIncidents.map(incident => (
                            <div key={incident.id} className={`p-3 rounded-lg border-l-4 ${selectedIncidentIds.includes(incident.id) ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow'}`}>
                                <div className="flex items-start">
                                    <input
                                        type="checkbox"
                                        className="form-checkbox h-5 w-5 mt-1 text-primary-green bg-gray-100 border-gray-300 rounded focus:ring-primary-green dark:bg-gray-600 dark:border-gray-500"
                                        checked={selectedIncidentIds.includes(incident.id)}
                                        onChange={(e) => handleSelectOne(e, incident.id)}
                                    />
                                    <div className="ml-4 flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-gray-100">{incident.type}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{incident.pollingUnit}</p>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{incident.time}</p>
                                        </div>
                                        <div className="mt-2">
                                            <select
                                                value={incident.status}
                                                onChange={(e) => handleStatusChange(incident.id, e.target.value as IncidenceStatus)}
                                                className={`p-1 w-full text-xs font-semibold rounded-md border-0 focus:ring-0 ${statusStyles[incident.status]}`}
                                            >
                                                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            No incidents found.
                        </div>
                    )}
                </div>
            </div>
            <ConfirmationModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={confirmBulkDelete}
                title="Confirm Bulk Deletion"
                message={`Are you sure you want to delete ${selectedIncidentIds.length} incident(s)? This action cannot be undone.`}
            />
        </>
    );
};

export default IncidenceReportsPage;