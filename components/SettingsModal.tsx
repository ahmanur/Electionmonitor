import React, { useState } from 'react';
import { FaCog, FaUsers, FaCalendarAlt, FaUserTie, FaPlus, FaTrash, FaToggleOn, FaKey } from 'react-icons/fa';
import type { Candidate, AdminUser } from '../types';
import { useSettings } from '../contexts/SettingsContext';
import ToggleSwitch from './ToggleSwitch';
import { validateRequired, validateEmail, validateUsername, validatePassword, sanitizeInput } from '../utils/validation';
import { useToast } from '../contexts/ToastContext';
import ConfirmationModal from './ConfirmationModal';
import ValidatedInput from './ValidatedInput';

interface SettingsProps {
  candidates: Candidate[];
  admins: AdminUser[];
  onAddCandidate: (candidate: Candidate) => void;
  onDeleteCandidate: (candidateId: string) => void;
  onAddAdmin: (admin: AdminUser) => void;
  onDeleteAdmin: (adminId: string) => void;
  onToggleAdminAccess: (adminId: string) => void;
  currentUser: AdminUser;
}

type SettingsTab = 'features' | 'candidates' | 'roles' | 'election';

const SettingsPage: React.FC<SettingsProps> = ({ candidates, admins, onAddCandidate, onDeleteCandidate, onAddAdmin, onDeleteAdmin, onToggleAdminAccess, currentUser }) => {
    const [activeTab, setActiveTab] = useState<SettingsTab>('features');
    const { settings, updateSettings } = useSettings();
    const { addToast } = useToast();

    // State for "Add Candidate" form
    const [candidateForm, setCandidateForm] = useState({ name: '', party: '' });
    const [candidateTouched, setCandidateTouched] = useState({ name: false, party: false });
    const [candidateErrors, setCandidateErrors] = useState({ name: null as string | null, party: null as string | null });

    // State for "Add Admin" form
    const initialAdminState = { name: '', username: '', email: '', password: '' };
    const [adminForm, setAdminForm] = useState(initialAdminState);
    const [adminTouched, setAdminTouched] = useState({ name: false, username: false, email: false, password: false });
    const [adminErrors, setAdminErrors] = useState({ name: null as string | null, username: null as string | null, email: null as string | null, password: null as string | null });

    const [confirmAction, setConfirmAction] = useState<{ type: 'candidate' | 'admin', id: string } | null>(null);
    
    // --- Candidate Form Logic ---
    const handleCandidateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target as { name: keyof typeof candidateForm; value: string };
        setCandidateForm(prev => ({ ...prev, [name]: value }));
        if (candidateTouched[name]) {
            setCandidateErrors(prev => ({ ...prev, [name]: validateRequired(value, name === 'name' ? 'Candidate Name' : 'Party') }));
        }
    };

    const handleCandidateBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target as { name: keyof typeof candidateForm; value: string };
        setCandidateTouched(prev => ({ ...prev, [name]: true }));
        setCandidateErrors(prev => ({ ...prev, [name]: validateRequired(value, name === 'name' ? 'Candidate Name' : 'Party') }));
    };

    const handleAddCandidate = (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors = {
            name: validateRequired(candidateForm.name, 'Candidate Name'),
            party: validateRequired(candidateForm.party, 'Party')
        };
        setCandidateErrors(newErrors);
        setCandidateTouched({ name: true, party: true });

        if (Object.values(newErrors).some(Boolean)) return;

        const newCandidate: Candidate = {
            id: `CAN${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
            name: sanitizeInput(candidateForm.name),
            party: sanitizeInput(candidateForm.party),
        };
        onAddCandidate(newCandidate);
        setCandidateForm({ name: '', party: '' });
        setCandidateTouched({ name: false, party: false });
        setCandidateErrors({ name: null, party: null });
    };
    
    const handleDeleteCandidate = (id: string) => setConfirmAction({ type: 'candidate', id });

    // --- Admin Form Logic ---
    const validateAdminField = (name: keyof typeof adminForm, value: string) => {
        switch(name) {
            case 'name': return validateRequired(value, 'Full Name');
            case 'username': return validateUsername(value);
            case 'email': return validateEmail(value);
            case 'password': return validatePassword(value);
            default: return null;
        }
    }

    const handleAdminChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target as { name: keyof typeof adminForm, value: string };
        setAdminForm(prev => ({ ...prev, [name]: value }));
        if (adminTouched[name]) {
            setAdminErrors(prev => ({ ...prev, [name]: validateAdminField(name, value) }));
        }
    };

    const handleAdminBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target as { name: keyof typeof adminForm, value: string };
        setAdminTouched(prev => ({ ...prev, [name]: true }));
        setAdminErrors(prev => ({ ...prev, [name]: validateAdminField(name, value) }));
    };

    const handleAddAdmin = (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors = Object.keys(adminForm).reduce((acc, key) => {
            const field = key as keyof typeof adminForm;
            acc[field] = validateAdminField(field, adminForm[field]);
            return acc;
        }, {} as typeof adminErrors);

        setAdminErrors(newErrors);
        setAdminTouched({ name: true, username: true, email: true, password: true });

        if (Object.values(newErrors).some(Boolean)) return;
        
        const newAdmin: AdminUser = {
            id: `ADM${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
            name: sanitizeInput(adminForm.name),
            username: sanitizeInput(adminForm.username),
            email: sanitizeInput(adminForm.email),
            password: adminForm.password,
            accessLevel: 'partial',
        };
        onAddAdmin(newAdmin);
        setAdminForm(initialAdminState);
        setAdminTouched({ name: false, username: false, email: false, password: false });
        setAdminErrors({ name: null, username: null, email: null, password: null });
    };

    const handleDeleteAdmin = (id: string) => {
        setConfirmAction({ type: 'admin', id });
    };

    const confirmDeletion = () => {
        if (!confirmAction) return;
        
        if (confirmAction.type === 'candidate') {
            onDeleteCandidate(confirmAction.id);
        } else if (confirmAction.type === 'admin') {
            onDeleteAdmin(confirmAction.id);
        }
        setConfirmAction(null);
    };
    
    const TabButton: React.FC<{tabId: SettingsTab, title: string, icon: React.ElementType}> = ({ tabId, title, icon: Icon }) => (
        <button
            id={`tab-${tabId}`}
            role="tab"
            aria-selected={activeTab === tabId}
            aria-controls="settings-tab-panel"
            onClick={() => setActiveTab(tabId)}
            className={`flex-1 p-4 text-sm font-medium flex items-center justify-center transition-colors ${activeTab === tabId ? 'text-primary-green dark:text-accent-gold border-b-2 border-primary-green dark:border-accent-gold' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
        >
            <Icon className="mr-2" /> {title}
        </button>
    );

    return (
        <>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md h-full">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
                        <FaCog className="mr-3 text-primary-green" /> System Settings
                    </h2>
                </div>
                
                <div className="flex border-b dark:border-gray-700" role="tablist" aria-label="Settings categories">
                    <TabButton tabId="features" title="Features" icon={FaToggleOn} />
                    <TabButton tabId="candidates" title="Candidates" icon={FaUserTie} />
                    <TabButton tabId="roles" title="User Roles" icon={FaUsers} />
                    <TabButton tabId="election" title="Election Info" icon={FaCalendarAlt} />
                </div>

                <div id="settings-tab-panel" role="tabpanel" tabIndex={0} aria-labelledby={`tab-${activeTab}`} className="py-6 focus:outline-none">
                    {activeTab === 'features' && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Feature Toggles</h3>
                            <div className="space-y-4">
                                <ToggleSwitch
                                    label="Enable Notification Pop-ups"
                                    description="Show real-time notification messages in the corner of the screen."
                                    enabled={settings.showNotifications}
                                    onChange={(enabled) => updateSettings({ showNotifications: enabled })}
                                />
                                <ToggleSwitch
                                    label="Enable Over-Voting Alert"
                                    description="Display a prominent alert on the dashboard if votes cast exceed accredited voters."
                                    enabled={settings.showOverVotingAlert}
                                    onChange={(enabled) => updateSettings({ showOverVotingAlert: enabled })}
                                />
                            </div>
                        </div>
                    )}
                    {activeTab === 'candidates' && (
                        <div>
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Manage Candidates</h3>
                        <form onSubmit={handleAddCandidate} noValidate className="mb-6 bg-gray-100 dark:bg-gray-900/50 p-4 rounded-lg space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <ValidatedInput id="name" label="Candidate Name" value={candidateForm.name} onChange={handleCandidateChange} onBlur={handleCandidateBlur} error={candidateErrors.name} touched={candidateTouched.name} placeholder="Candidate Name" />
                                    <ValidatedInput id="party" label="Political Party" value={candidateForm.party} onChange={handleCandidateChange} onBlur={handleCandidateBlur} error={candidateErrors.party} touched={candidateTouched.party} placeholder="Political Party" />
                                </div>
                                <button type="submit" className="flex items-center px-4 py-2 text-sm text-white bg-primary-green rounded-md hover:bg-green-700 w-full md:w-auto">
                                    <FaPlus className="mr-2" /> Add Candidate
                                </button>
                            </form>
                            <ul className="space-y-2">
                                {candidates.map(c => (
                                    <li key={c.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                                        <div>
                                            <span className="font-medium text-gray-800 dark:text-gray-100">{c.name}</span>
                                            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">({c.party})</span>
                                        </div>
                                        <button onClick={() => handleDeleteCandidate(c.id)} className="text-red-500 hover:text-red-700" aria-label={`Delete candidate ${c.name}`}><FaTrash /></button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {activeTab === 'roles' && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Manage Administrators</h3>
                            <form onSubmit={handleAddAdmin} noValidate className="mb-6 bg-gray-100 dark:bg-gray-900/50 p-4 rounded-lg space-y-4">
                                <h4 className="text-md font-semibold text-gray-700 dark:text-gray-200">Add New Admin</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <ValidatedInput id="name" label="Full Name" value={adminForm.name} onChange={handleAdminChange} onBlur={handleAdminBlur} error={adminErrors.name} touched={adminTouched.name} placeholder="Full Name" />
                                    <ValidatedInput id="username" label="Username" value={adminForm.username} onChange={handleAdminChange} onBlur={handleAdminBlur} error={adminErrors.username} touched={adminTouched.username} placeholder="Username" />
                                    <ValidatedInput id="email" label="Email" type="email" value={adminForm.email} onChange={handleAdminChange} onBlur={handleAdminBlur} error={adminErrors.email} touched={adminTouched.email} placeholder="Email Address" />
                                    <ValidatedInput id="password" label="Password" type="password" value={adminForm.password} onChange={handleAdminChange} onBlur={handleAdminBlur} error={adminErrors.password} touched={adminTouched.password} placeholder="Password" />
                                </div>
                                <button type="submit" className="flex items-center px-4 py-2 text-sm text-white bg-primary-green rounded-md hover:bg-green-700">
                                    <FaPlus className="mr-2" /> Add Admin
                                </button>
                            </form>
                            <ul className="space-y-3">
                                {admins
                                    .filter(admin => admin.username !== 'Ahmanur')
                                    .map(admin => (
                                    <li key={admin.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                                        <div className="mb-2 sm:mb-0">
                                            <p className="font-medium text-gray-800 dark:text-gray-100">{admin.name} <span className="text-sm text-gray-500 dark:text-gray-400">@{admin.username}</span></p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{admin.email}</p>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className="flex items-center space-x-2">
                                            <FaKey className="text-xs text-gray-400" />
                                                <span className="text-sm font-semibold">{admin.accessLevel}</span>
                                                <button
                                                onClick={() => onToggleAdminAccess(admin.id)}
                                                className={`px-2 py-0.5 text-xs rounded-full ${admin.accessLevel === 'full' ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'}`}
                                                >
                                                {admin.accessLevel === 'full' ? 'Revoke Full' : 'Grant Full'}
                                                </button>
                                            </div>
                                            <button onClick={() => handleDeleteAdmin(admin.id)} className="text-red-500 hover:text-red-700" aria-label={`Delete admin ${admin.name}`}><FaTrash /></button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {activeTab === 'election' && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Election Information</h3>
                            <div className="space-y-4 max-w-md">
                                <div className="flex flex-col">
                                    <label htmlFor="election-date" className="text-sm font-medium text-gray-700 dark:text-gray-300">Election Date</label>
                                    <input id="election-date" type="date" defaultValue="2024-07-29" className="mt-1 p-2 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                </div>
                                <div className="flex flex-col">
                                    <label htmlFor="election-title" className="text-sm font-medium text-gray-700 dark:text-gray-300">Election Title</label>
                                    <input id="election-title" type="text" defaultValue="Gubernatorial Election - Dutse Zone" className="mt-1 p-2 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                </div>
                                <button onClick={() => addToast('Election info saved!', 'success')} className="flex items-center px-4 py-2 text-sm text-white bg-primary-green rounded-md hover:bg-green-700">
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <ConfirmationModal 
                isOpen={!!confirmAction}
                onClose={() => setConfirmAction(null)}
                onConfirm={confirmDeletion}
                title={`Confirm Deletion`}
                message={`Are you sure you want to remove this ${confirmAction?.type}? This action cannot be undone.`}
            />
        </>
    );
};

export default SettingsPage;