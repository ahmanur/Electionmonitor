import React, { useState, useMemo, useEffect, useRef } from 'react';
import { FaUsersCog, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import type { Agent } from '../types';
import AgentFormModal from './AgentFormModal';
import ConfirmationModal from './ConfirmationModal';

interface ManageAgentsProps {
  agents: Agent[];
  onSaveAgent: (agent: Agent) => void;
  onDeleteAgents: (agentIds: string | string[]) => void;
}

const ManageAgentsPage: React.FC<ManageAgentsProps> = ({ agents, onSaveAgent, onDeleteAgents }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
    const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([]);
    const headerCheckboxRef = useRef<HTMLInputElement>(null);
    const [confirmAction, setConfirmAction] = useState<{ action: 'deleteSingle' | 'deleteBulk', payload: string | string[] } | null>(null);


    const filteredAgents = useMemo(() => {
        if (!searchQuery) return agents;
        const lowercasedQuery = searchQuery.toLowerCase();
        return agents.filter(agent =>
            agent.name.toLowerCase().includes(lowercasedQuery) ||
            agent.username.toLowerCase().includes(lowercasedQuery) ||
            agent.pollingUnit.toLowerCase().includes(lowercasedQuery) ||
            agent.phone.toLowerCase().includes(lowercasedQuery)
        );
    }, [agents, searchQuery]);

    useEffect(() => {
        // Clear selection when filters change
        setSelectedAgentIds([]);
    }, [searchQuery]);

    useEffect(() => {
        // Handle indeterminate state for the header checkbox
        if (headerCheckboxRef.current) {
            const numSelected = selectedAgentIds.length;
            const numVisible = filteredAgents.length;
            headerCheckboxRef.current.checked = numSelected === numVisible && numVisible > 0;
            headerCheckboxRef.current.indeterminate = numSelected > 0 && numSelected < numVisible;
        }
    }, [selectedAgentIds, filteredAgents]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedAgentIds(filteredAgents.map(a => a.id));
        } else {
            setSelectedAgentIds([]);
        }
    };

    const handleSelectOne = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
        if (e.target.checked) {
            setSelectedAgentIds(prev => [...prev, id]);
        } else {
            setSelectedAgentIds(prev => prev.filter(agentId => agentId !== id));
        }
    };

    const handleBulkDelete = () => {
        setConfirmAction({ action: 'deleteBulk', payload: selectedAgentIds });
    };

    const handleRegisterClick = () => {
        setSelectedAgent(null); // Clear any selected agent for "add" mode
        setIsFormModalOpen(true);
    };
    
    const handleEditClick = (agent: Agent) => {
        setSelectedAgent(agent);
        setIsFormModalOpen(true);
    };
    
    const handleDeleteAgent = (agentId: string) => {
        setConfirmAction({ action: 'deleteSingle', payload: agentId });
    };

    const confirmDeletion = () => {
        if (!confirmAction) return;
        onDeleteAgents(confirmAction.payload);
        if (confirmAction.action === 'deleteBulk') {
            setSelectedAgentIds([]);
        }
        setConfirmAction(null);
    };
    
    const handleSaveAgent = (savedAgent: Agent) => {
        onSaveAgent(savedAgent);
        setIsFormModalOpen(false);
        setSelectedAgent(null);
    };

    return (
        <>
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md h-full">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center mb-2 sm:mb-0">
                        <FaUsersCog className="mr-3 text-primary-green" /> Manage Agents
                    </h2>
                    <button onClick={handleRegisterClick} className="flex items-center px-4 py-2 text-sm text-white bg-primary-green rounded-md hover:bg-green-700">
                        <FaPlus className="mr-2" /> Register New Agent
                    </button>
                </div>
                
                <div className="mb-4">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name, username, polling unit, or phone..."
                        className="w-full max-w-lg p-2 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                </div>

                {selectedAgentIds.length > 0 && (
                    <div className="bg-blue-50 dark:bg-blue-900/50 p-3 rounded-md mb-4 flex items-center justify-between transition-all duration-300">
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">{selectedAgentIds.length} agent(s) selected</span>
                        <button onClick={handleBulkDelete} className="flex items-center px-3 py-1 text-sm text-white bg-red-600 rounded-md hover:bg-red-700">
                            <FaTrash className="mr-2" /> Delete Selected
                        </button>
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Polling Unit</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Last Login</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Submissions</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredAgents.length > 0 ? (
                                    filteredAgents.map(agent => (
                                        <tr key={agent.id} className={`transition-colors duration-200 ${selectedAgentIds.includes(agent.id) ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                                            <td className="p-4">
                                                <input
                                                    type="checkbox"
                                                    className="form-checkbox h-4 w-4 text-primary-green bg-gray-100 border-gray-300 rounded focus:ring-primary-green dark:bg-gray-600 dark:border-gray-500"
                                                    checked={selectedAgentIds.includes(agent.id)}
                                                    onChange={(e) => handleSelectOne(e, agent.id)}
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{agent.name}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">@{agent.username}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{agent.pollingUnit}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{agent.lastLogin}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{agent.submissions}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                                <button onClick={() => handleEditClick(agent)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300" title="Edit Agent"><FaEdit /></button>
                                                <button onClick={() => handleDeleteAgent(agent.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" title="Delete Agent"><FaTrash /></button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                                            No agents found matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                    {filteredAgents.length > 0 ? (
                        filteredAgents.map(agent => (
                            <div key={agent.id} className={`p-3 rounded-lg border-l-4 ${selectedAgentIds.includes(agent.id) ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow'}`}>
                                <div className="flex items-start">
                                    <input
                                        type="checkbox"
                                        className="form-checkbox h-5 w-5 mt-1 text-primary-green bg-gray-100 border-gray-300 rounded focus:ring-primary-green dark:bg-gray-600 dark:border-gray-500"
                                        checked={selectedAgentIds.includes(agent.id)}
                                        onChange={(e) => handleSelectOne(e, agent.id)}
                                        aria-label={`Select agent ${agent.name}`}
                                    />
                                    <div className="ml-4 flex-1">
                                        <p className="font-bold text-gray-900 dark:text-gray-100">{agent.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">@{agent.username}</p>
                                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-300 space-y-1">
                                            <p><strong className="font-medium text-gray-700 dark:text-gray-200">PU:</strong> {agent.pollingUnit}</p>
                                            <p><strong className="font-medium text-gray-700 dark:text-gray-200">Last Login:</strong> {agent.lastLogin}</p>
                                            <p><strong className="font-medium text-gray-700 dark:text-gray-200">Submissions:</strong> {agent.submissions}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col space-y-3 ml-2">
                                        <button onClick={() => handleEditClick(agent)} className="text-blue-600 dark:text-blue-400" aria-label={`Edit ${agent.name}`}><FaEdit size={18} /></button>
                                        <button onClick={() => handleDeleteAgent(agent.id)} className="text-red-600 dark:text-red-400" aria-label={`Delete ${agent.name}`}><FaTrash size={18} /></button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            No agents found matching your search.
                        </div>
                    )}
                </div>

            </div>
            <AgentFormModal 
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSave={handleSaveAgent}
                agent={selectedAgent}
            />
            <ConfirmationModal
                isOpen={!!confirmAction}
                onClose={() => setConfirmAction(null)}
                onConfirm={confirmDeletion}
                title="Confirm Deletion"
                message={
                    confirmAction?.action === 'deleteBulk' && Array.isArray(confirmAction.payload)
                    ? `Are you sure you want to delete ${confirmAction.payload.length} agent(s)? This action cannot be undone.`
                    : "Are you sure you want to delete this agent? This action cannot be undone."
                }
            />
        </>
    );
};

export default ManageAgentsPage;