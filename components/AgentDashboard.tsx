import React, { useState, useMemo } from 'react';
import { FaSignOutAlt, FaUserEdit, FaPoll, FaExclamationTriangle, FaComments } from 'react-icons/fa';
import type { Agent, Candidate, Message } from '../types';
import VoteRegistrationModal from './VoteRegistrationModal';
import SubmitResultModal from './SubmitResultModal';
import ReportIncidenceModal from './ReportIncidenceModal';
import MessagingModal from './MessagingModal';
import { useTheme } from '../contexts/ThemeContext';
import ConfirmationModal from './ConfirmationModal';
import { useToast } from '../contexts/ToastContext';

interface AgentDashboardProps {
  agent: Agent;
  onLogout: () => void;
  candidates: Candidate[];
  messages: Message[];
  onUpdateRegistration: (registered: number, accredited: number) => void;
  onSubmitResult: (scores: { candidateId: string; score: number }[], cancelled: number, url: string) => void;
  onReportIncidence: (type: string, url?: string) => void;
  onSendMessage: (text: string, imageUrl?: string) => void;
  onMarkMessagesAsRead: () => void;
}

type ModalType = 'register' | 'results' | 'incident' | 'messages';

const AgentDashboard: React.FC<AgentDashboardProps> = ({
  agent,
  onLogout,
  candidates,
  messages,
  onUpdateRegistration,
  onSubmitResult,
  onReportIncidence,
  onSendMessage,
  onMarkMessagesAsRead,
}) => {
  const { theme } = useTheme();
  const { addToast } = useToast();
  const [activeModal, setActiveModal] = useState<ModalType | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'register' | 'result' | 'incident';
    data: any;
    title: string;
    message: string;
  } | null>(null);

  const unreadCount = useMemo(() => {
    return messages.filter(m => m.sender === 'Admin' && !m.read).length;
  }, [messages]);

  const handleOpenMessages = () => {
    onMarkMessagesAsRead();
    setActiveModal('messages');
  };

  const handleRegistrationSubmit = (registered: number, accredited: number) => {
    setConfirmAction({
      type: 'register',
      data: { registered, accredited },
      title: 'Confirm Accreditation Data',
      message: `Are you sure you want to submit ${accredited.toLocaleString()} accredited voters out of ${registered.toLocaleString()} registered voters?`,
    });
  };

  const handleResultSubmit = (scores: { candidateId: string; score: number }[], cancelled: number, url: string) => {
    setConfirmAction({
      type: 'result',
      data: { scores, cancelled, url },
      title: 'Confirm Result Submission',
      message: 'Are you sure you want to submit these election results? This action cannot be undone.',
    });
  };

  const handleIncidenceSubmit = (type: string, url?: string) => {
    setConfirmAction({
      type: 'incident',
      data: { type, url },
      title: 'Confirm Incident Report',
      message: `Are you sure you want to report an incident of type "${type}"?`,
    });
  };

  const handleConfirm = () => {
    if (!confirmAction) return;

    switch (confirmAction.type) {
      case 'register':
        onUpdateRegistration(confirmAction.data.registered, confirmAction.data.accredited);
        addToast('Voter accreditation submitted successfully!', 'success');
        break;
      case 'result':
        onSubmitResult(confirmAction.data.scores, confirmAction.data.cancelled, confirmAction.data.url);
        addToast('Election results submitted successfully!', 'success');
        break;
      case 'incident':
        onReportIncidence(confirmAction.data.type, confirmAction.data.url);
        addToast('Incident reported successfully!', 'success');
        break;
    }
    
    setActiveModal(null); // Close the data entry modal
    setConfirmAction(null); // Close the confirmation modal
  };

  const ActionCard = ({ icon: Icon, title, description, onClick, unreadCount }: { icon: React.ElementType, title: string, description: string, onClick: () => void, unreadCount?: number }) => (
    <button
      onClick={onClick}
      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-left w-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 border-l-4 border-primary-green relative"
    >
      <div className="flex items-center space-x-4">
        <div className="bg-primary-green/10 dark:bg-primary-green/20 p-4 rounded-full">
          <Icon className="w-8 h-8 text-primary-green" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
        </div>
      </div>
      {unreadCount && unreadCount > 0 && (
          <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
              {unreadCount}
          </div>
      )}
    </button>
  );

  return (
    <>
      <div className={`min-h-screen font-sans ${theme === 'dark' ? 'dark' : ''} bg-gray-100 dark:bg-gray-900`}>
        <header className="bg-primary-green text-white shadow-md">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div>
                <h1 className="text-xl font-bold">Agent Portal</h1>
              </div>
              <div className="flex items-center">
                <div className="text-right mr-4">
                  <span className="text-sm font-semibold block">{agent.name}</span>
                  <span className="text-xs opacity-80 block">{agent.pollingUnit}</span>
                </div>
                <button
                  onClick={onLogout}
                  className="flex items-center text-sm px-3 py-2 border border-white rounded-md hover:bg-white hover:text-primary-green transition-colors duration-200"
                >
                  <FaSignOutAlt className="mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>
        <main className="container mx-auto p-4 md:p-6 lg:p-8">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Welcome, {agent.name.split(' ')[0]}</h2>
                <p className="text-gray-600 dark:text-gray-400">Select an action to proceed.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ActionCard 
                    icon={FaUserEdit} 
                    title="Voter Accreditation" 
                    description="Submit the number of registered and accredited voters."
                    onClick={() => setActiveModal('register')}
                />
                <ActionCard 
                    icon={FaPoll} 
                    title="Submit Results"
                    description="Enter candidate scores, cancelled votes, and upload result sheet."
                    onClick={() => setActiveModal('results')}
                />
                <ActionCard 
                    icon={FaExclamationTriangle}
                    title="Report Incident"
                    description="File a report for any issues observed at your polling unit."
                    onClick={() => setActiveModal('incident')}
                />
                <ActionCard 
                    icon={FaComments} 
                    title="Messages"
                    description="Communicate directly with the admin control room."
                    onClick={handleOpenMessages}
                    unreadCount={unreadCount}
                />
            </div>
        </main>
      </div>

      {activeModal === 'register' && (
        <VoteRegistrationModal 
            isOpen={true} 
            onClose={() => setActiveModal(null)} 
            onSubmit={handleRegistrationSubmit} 
        />
      )}
      {activeModal === 'results' && (
        <SubmitResultModal
            isOpen={true}
            onClose={() => setActiveModal(null)}
            onSubmit={handleResultSubmit}
            candidates={candidates}
        />
      )}
      {activeModal === 'incident' && (
        <ReportIncidenceModal
            isOpen={true}
            onClose={() => setActiveModal(null)}
            onSubmit={handleIncidenceSubmit}
        />
      )}
      {activeModal === 'messages' && (
        <MessagingModal
            isOpen={true}
            onClose={() => setActiveModal(null)}
            messages={messages}
            onSendMessage={onSendMessage}
            agentName={agent.name}
        />
      )}
      <ConfirmationModal
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleConfirm}
        title={confirmAction?.title || 'Confirm Action'}
        message={confirmAction?.message || 'Are you sure you want to proceed?'}
      />
    </>
  );
};

export default AgentDashboard;