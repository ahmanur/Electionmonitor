// FIX: Import 'useMemo' from react to resolve 'Cannot find name' error.
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ManageAgentsModal from './components/ManageAgentsModal';
import ResultsModal from './components/ResultsModal';
import AnalyticsModal from './components/AnalyticsModal';
import IncidenceReportsModal from './components/IncidenceReportsModal';
import NotificationsCenterModal from './components/NotificationsCenterModal';
import SettingsModal from './components/SettingsModal';
import { agentsData, resultsData, incidences as incidencesData, candidatesData, cancelledVotesData, adminsData, allPollingUnits, initialMessages, initialLiveFeedEvents } from './constants';
import type { ElectionReportData, NotificationData, Agent, Result, Incidence, Candidate, CancelledVote, AdminUser, VoteStats, Message, PollingUnit, LiveFeedEvent, OverVotingIncident } from './types';
import ReportingModal from './components/ReportingModal';
import LoginPage from './components/LoginPage';
import KeyStatsModal from './components/KeyStatsModal';
import CancelledVotesModal from './components/CancelledVotesModal';
import AgentDashboard from './components/AgentDashboard';
import Spinner from './components/Spinner';
import { useToast } from './contexts/ToastContext';
import { useSettings } from './contexts/SettingsContext';
import { FaVoteYea, FaExclamationTriangle } from 'react-icons/fa';

type View = 'dashboard' | 'manageAgents' | 'results' | 'analytics' | 'report' | 'incidenceReports' | 'notifications' | 'settings';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();
  const { settings } = useSettings();
  // Authentication State
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
  const [admins, setAdmins] = useState<AdminUser[]>(adminsData);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  // Data states
  const [agents, setAgents] = useState<Agent[]>(agentsData);
  const [results, setResults] = useState<Result[]>(resultsData);
  const [incidents, setIncidents] = useState<Incidence[]>(incidencesData);
  const [candidates, setCandidates] = useState<Candidate[]>(candidatesData);
  const [cancelledVotes, setCancelledVotes] = useState<CancelledVote[]>(cancelledVotesData);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [resultsPreFilter, setResultsPreFilter] = useState('');
  const [liveFeedEvents, setLiveFeedEvents] = useState<LiveFeedEvent[]>(initialLiveFeedEvents);
  
  // Simulate initial data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // Simulate a 1.5 second load time
    return () => clearTimeout(timer);
  }, []);

  // Check for login status on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user: AdminUser = JSON.parse(storedUser);
        if (admins.some(admin => admin.id === user.id)) {
          setCurrentUser(user);
        }
      } catch (e) {
        console.error("Failed to parse stored admin user", e);
      }
    }
    
    const storedAgent = localStorage.getItem('currentAgent');
    if(storedAgent) {
        try {
            const agent: Agent = JSON.parse(storedAgent);
            if(agents.some(a => a.id === agent.id)) {
                setCurrentAgent(agent);
            }
        } catch(e) {
            console.error("Failed to parse stored agent", e);
        }
    }
  }, []);

  const handleAdminLogin = (username: string, password: string): boolean => {
    const admin = admins.find(a => a.username === username && a.password === password);
    if (admin) {
      localStorage.setItem('currentUser', JSON.stringify(admin));
      setCurrentUser(admin);
      return true;
    }
    return false;
  };

  const handleAgentLogin = (username: string, password: string): boolean => {
    const agent = agents.find(a => a.username === username && a.password === password);
    if (agent) {
        localStorage.setItem('currentAgent', JSON.stringify(agent));
        setCurrentAgent(agent);
        return true;
    }
    return false;
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentAgent');
    setCurrentUser(null);
    setCurrentAgent(null);
  };

  const handleUpdateRegistration = (agent: Agent, registeredVoters: number, accreditedVoters: number) => {
    setResults(prevResults => {
        const existingResultIndex = prevResults.findIndex(r => r.pollingUnit === agent.pollingUnit);
        if (existingResultIndex !== -1) {
            const updatedResults = [...prevResults];
            updatedResults[existingResultIndex] = {
                ...updatedResults[existingResultIndex],
                registeredVoters,
                accreditedVoters,
                timestamp: new Date().toLocaleString(),
            };
            return updatedResults;
        } else {
            const newResult: Result = {
                id: `RES-${Date.now()}`,
                pollingUnit: agent.pollingUnit,
                ward: 'N/A',
                lga: agent.pollingUnit.split(', ')[1] || 'N/A',
                registeredVoters,
                accreditedVoters,
                votesCast: 0,
                votesCancelled: 0,
                agentName: agent.name,
                candidateScores: [],
                resultSheetUrl: '',
                status: 'Pending',
                timestamp: new Date().toLocaleString(),
            };
            return [...prevResults, newResult];
        }
    });
  };

  const handleSubmitResult = (agent: Agent, scores: { candidateId: string; score: number }[], votesCancelled: number, resultSheetUrl: string) => {
    setResults(prevResults => {
      const existingResultIndex = prevResults.findIndex(r => r.pollingUnit === agent.pollingUnit);
      const votesCast = scores.reduce((sum, s) => sum + s.score, 0);

      if (existingResultIndex !== -1) {
        const updatedResults = [...prevResults];
        const existingResult = updatedResults[existingResultIndex];
        
        let newStatus = existingResult.status;
        const accreditedVoters = existingResult.accreditedVoters;

        // Check for over-voting
        if (accreditedVoters > 0 && votesCast > accreditedVoters) {
          newStatus = 'Disputed';
          const message = `Over-voting detected at ${agent.pollingUnit}. Votes Cast: ${votesCast.toLocaleString()}, Accredited: ${accreditedVoters.toLocaleString()}.`;
          
          if (settings.showNotifications) {
            addToast(message, 'warning');
          }

          const newFeedEvent: LiveFeedEvent = {
            icon: FaExclamationTriangle,
            message: `OVER-VOTING ALERT: ${agent.pollingUnit} reported ${votesCast.toLocaleString()} votes with only ${accreditedVoters.toLocaleString()} accredited.`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'}),
            color: 'bg-red-500'
          };
          setLiveFeedEvents(prev => [newFeedEvent, ...prev]);

          const newNotification: NotificationData = {
            id: Date.now(),
            message,
            icon: FaExclamationTriangle,
            color: 'border-red-500',
            time: new Date().toLocaleString(),
          };
          setNotificationHistory(prev => [newNotification, ...prev]);
        } else if (existingResult.status === 'Disputed') {
          // If it was disputed, but now the numbers are correct, revert to Pending for re-verification
          newStatus = 'Pending';
        }

        updatedResults[existingResultIndex] = {
          ...existingResult,
          candidateScores: scores,
          votesCancelled,
          votesCast,
          resultSheetUrl,
          status: newStatus,
          timestamp: new Date().toLocaleString(),
        };
        return updatedResults;
      } else {
        // Agent submitted results before accreditation. Create a new entry.
        const newResult: Result = {
          id: `RES-${Date.now()}`,
          pollingUnit: agent.pollingUnit,
          ward: 'N/A', // Will be enriched later
          lga: agent.pollingUnit.split(', ')[1] || 'N/A', // Will be enriched later
          registeredVoters: 0,
          accreditedVoters: 0,
          votesCast,
          votesCancelled,
          agentName: agent.name,
          candidateScores: scores,
          resultSheetUrl,
          status: 'Pending',
          timestamp: new Date().toLocaleString(),
        };
        return [...prevResults, newResult];
      }
    });
  };

  const handleReportIncidence = (agent: Agent, type: string, imageUrl?: string) => {
      const newIncidence: Incidence = {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          type,
          pollingUnit: agent.pollingUnit,
          status: 'Pending',
          imageUrl,
      };
      setIncidents(prev => [newIncidence, ...prev]);
  };

  const handleSendMessage = (agent: Agent, text: string, imageUrl?: string) => {
      const newMessage: Message = {
          id: `MSG-${Date.now()}`,
          agentId: agent.id,
          sender: agent.name,
          text,
          imageUrl,
          timestamp: new Date().toLocaleString(),
          read: false,
      };
      setMessages(prev => [...prev, newMessage]);
  };

  const handleAdminReply = (agentId: string, text: string, imageUrl?: string) => {
    const agent = agents.find(a => a.id === agentId);
    if (!agent) {
        addToast(`Could not find agent with ID ${agentId}`, 'error');
        return;
    }
    const newMessage: Message = {
        id: `MSG-${Date.now()}`,
        agentId: agent.id,
        sender: 'Admin',
        text,
        imageUrl,
        timestamp: new Date().toLocaleString(),
        read: false,
    };
    setMessages(prev => [...prev, newMessage]);
  };
    
  const handleAdminBroadcast = (agentIds: string[], text: string) => {
      const newMessages: Message[] = agentIds.map(agentId => ({
          id: `MSG-${Date.now()}-${agentId}`,
          agentId: agentId,
          sender: 'Admin',
          text: `[BROADCAST] ${text}`,
          timestamp: new Date().toLocaleString(),
          read: false,
      }));
      setMessages(prev => [...prev, ...newMessages]);
      addToast(`Broadcast sent to ${agentIds.length} agent(s).`, 'success');
  };

  const handleMarkConversationAsRead = (agentId: string) => {
      setMessages(prev => prev.map(msg =>
          (msg.agentId === agentId && msg.sender !== 'Admin' && !msg.read)
              ? { ...msg, read: true }
              : msg
      ));
  };
    
  const handleAgentMarkMessagesAsRead = (agentId: string) => {
      setMessages(prev => prev.map(msg =>
          (msg.agentId === agentId && msg.sender === 'Admin' && !msg.read)
              ? { ...msg, read: true }
              : msg
      ));
  };
    
  // Data states
  const [currentVoteStats, setCurrentVoteStats] = useState<VoteStats>({
    registered: 0,
    accredited: 0,
    cast: 0,
    cancelled: 0,
  });
  
  const [electionData, setElectionData] = useState<ElectionReportData | null>(null);
  const [notificationHistory, setNotificationHistory] = useState<NotificationData[]>([]);

  // Modal States
  const [isKeyStatsModalOpen, setKeyStatsModalOpen] = useState(false);
  const [isCancelledVotesModalOpen, setCancelledVotesModalOpen] = useState(false);

  const openKeyStatsModal = useCallback(() => setKeyStatsModalOpen(true), []);
  const openCancelledVotesModal = useCallback(() => setCancelledVotesModalOpen(true), []);
  const toggleMaximize = useCallback(() => setIsMaximized(prev => !prev), []);

  // View state
  const [activeView, setActiveView] = useState<View>('dashboard');

  useEffect(() => {
    const validResults = results.filter(r => r.status !== 'Cancelled');
    const cancelledResults = results.filter(r => r.status === 'Cancelled');

    const newStats = validResults.reduce(
      (totals, currentResult) => {
        totals.registered += currentResult.registeredVoters;
        totals.accredited += currentResult.accreditedVoters;
        totals.cast += currentResult.votesCast;
        // This is for specific invalid votes within a valid submission
        totals.cancelled += currentResult.votesCancelled; 
        return totals;
      },
      { registered: 0, accredited: 0, cast: 0, cancelled: 0 }
    );

    // Add votes from entire cancelled PUs to the cancelled total
    const votesFromCancelledPUs = cancelledResults.reduce((sum, r) => sum + r.votesCast, 0);
    newStats.cancelled += votesFromCancelledPUs;

    setCurrentVoteStats(newStats);
}, [results]);

  const navigateTo = (view: View) => {
    setActiveView(view);
  };
  
  const handleReviewOverVoting = useCallback((pollingUnit: string) => {
    setResultsPreFilter(pollingUnit);
    setActiveView('results');
  }, []);

  const navigators = {
    dashboard: () => navigateTo('dashboard'),
    manageAgents: () => navigateTo('manageAgents'),
    results: () => navigateTo('results'),
    analytics: () => navigateTo('analytics'),
    report: () => navigateTo('report'),
    incidenceReports: () => navigateTo('incidenceReports'),
    notifications: () => navigateTo('notifications'),
    settings: () => navigateTo('settings'),
  };

  // --- Centralized State Handlers ---

  // AGENTS
  const handleSaveAgent = useCallback((savedAgent: Agent) => {
    const isEditing = agents.some(a => a.id === savedAgent.id);
    setAgents(prev => {
        if (isEditing) {
            return prev.map(a => a.id === savedAgent.id ? savedAgent : a);
        }
        return [...prev, savedAgent];
    });
    addToast(`Agent ${isEditing ? 'updated' : 'registered'} successfully!`, 'success');
  }, [agents, addToast]);

  const handleDeleteAgents = useCallback((agentIds: string | string[]) => {
      const idsToDelete = Array.isArray(agentIds) ? agentIds : [agentIds];
      setAgents(prev => prev.filter(a => !idsToDelete.includes(a.id)));
      addToast(`${idsToDelete.length} agent(s) deleted successfully.`, 'success');
  }, [addToast]);
    
  // RESULTS
  const handleUpdateResult = useCallback((updatedResult: Result) => {
    setResults(prev => prev.map(r => r.id === updatedResult.id ? updatedResult : r));
    addToast('Result updated successfully!', 'success');
  }, [addToast]);

  const handleDeleteResult = useCallback((resultId: string) => {
    setResults(prev => prev.filter(r => r.id !== resultId));
    addToast('Result entry deleted successfully.', 'success');
  }, [addToast]);

  const handleBulkUpdateResultsStatus = useCallback((resultIds: string[], status: Result['status']) => {
    setResults(prev => 
        prev.map(r => 
            resultIds.includes(r.id) ? { ...r, status } : r
        )
    );
    addToast(`${resultIds.length} result(s) updated to ${status}.`, 'info');
  }, [addToast]);

  const handleBulkDeleteResults = useCallback((resultIds: string[]) => {
    setResults(prev => prev.filter(r => !resultIds.includes(r.id)));
    addToast(`${resultIds.length} result(s) deleted successfully.`, 'success');
  }, [addToast]);
    
  // INCIDENTS
  const handleUpdateIncidentStatus = useCallback((incidentId: number, status: Incidence['status']) => {
    setIncidents(prev => prev.map(inc => inc.id === incidentId ? { ...inc, status } : inc));
    addToast(`Incident status updated to ${status}.`, 'info');
  }, [addToast]);

  const handleBulkUpdateIncidentsStatus = useCallback((incidentIds: number[], status: Incidence['status']) => {
    setIncidents(prev => 
        prev.map(inc => 
            incidentIds.includes(inc.id) ? { ...inc, status } : inc
        )
    );
    addToast(`${incidentIds.length} incident(s) updated to ${status}.`, 'info');
  }, [addToast]);

  const handleBulkDeleteIncidents = useCallback((incidentIds: number[]) => {
    setIncidents(prev => prev.filter(i => !incidentIds.includes(i.id)));
    addToast(`${incidentIds.length} incident(s) deleted successfully.`, 'success');
  }, [addToast]);
    
  // SETTINGS
  const handleAddCandidate = useCallback((candidate: Candidate) => {
    setCandidates(prev => [...prev, candidate]);
    addToast('Candidate added successfully!', 'success');
  }, [addToast]);

  const handleDeleteCandidate = useCallback((candidateId: string) => {
    setCandidates(prev => prev.filter(c => c.id !== candidateId));
    addToast('Candidate removed.', 'success');
  }, [addToast]);

  const handleAddAdmin = useCallback((admin: AdminUser) => {
    setAdmins(prev => [...prev, admin]);
    addToast('Administrator added successfully!', 'success');
  }, [addToast]);

  const handleDeleteAdmin = useCallback((adminId: string) => {
    if (currentUser?.id === adminId) {
        addToast("Action denied: You cannot delete your own account.", 'error');
        return;
    }
    setAdmins(prev => prev.filter(a => a.id !== adminId));
    addToast('Administrator removed.', 'success');
  }, [addToast, currentUser]);
    
  const handleToggleAdminAccess = useCallback((adminId: string) => {
    setAdmins(prev => 
        prev.map(admin => 
            admin.id === adminId 
            ? { ...admin, accessLevel: admin.accessLevel === 'full' ? 'partial' : 'full' }
            : admin
        )
    );
    addToast('Access level updated.', 'info');
  }, [addToast]);
  
  // FIX: Explicitly setting the return type to CancelledVote[] to prevent TypeScript from incorrectly widening the `reason` property to a generic `string`.
  const derivedCancelledVotes = useMemo((): CancelledVote[] => {
    const overVotingVotes = results
      .filter(r => r.votesCancelled > 0 && r.status !== 'Cancelled')
      .map(r => ({
        id: `CV-${r.id}`,
        pollingUnit: r.pollingUnit,
        reason: 'Over-voting' as const,
        votesCancelled: r.votesCancelled,
        timestamp: r.timestamp,
      }));
      
    const adminCancelledVotes = results
      .filter(r => r.status === 'Cancelled')
      .map(r => ({
        id: `CV-${r.id}`,
        pollingUnit: r.pollingUnit,
        reason: 'Admin Action' as const,
        votesCancelled: r.votesCast, // When PU is cancelled, all its votes are cancelled
        timestamp: r.timestamp,
      }));

    return [...overVotingVotes, ...adminCancelledVotes];
  }, [results]);
  
  const overVotingIncidents = useMemo((): OverVotingIncident[] => {
    return results
      .filter(r => r.accreditedVoters > 0 && r.votesCast > r.accreditedVoters)
      .map(r => ({
        pollingUnit: r.pollingUnit,
        votesCast: r.votesCast,
        accreditedVoters: r.accreditedVoters,
      }));
  }, [results]);


  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard 
                  setElectionData={setElectionData}
                  agentsCount={agents.length}
                  cancelledVotes={derivedCancelledVotes}
                  currentVoteStats={currentVoteStats}
                  openKeyStatsModal={openKeyStatsModal}
                  openCancelledVotesModal={openCancelledVotesModal}
                  results={results}
                  candidates={candidates}
                  allPollingUnits={allPollingUnits}
                  navigateToResults={navigators.results}
                  setResultsPreFilter={setResultsPreFilter}
                  liveFeedEvents={liveFeedEvents}
                  overVotingIncidents={overVotingIncidents}
                  onReviewOverVoting={handleReviewOverVoting}
                />;
      case 'manageAgents':
        return <ManageAgentsModal 
                  agents={agents} 
                  onSaveAgent={handleSaveAgent}
                  onDeleteAgents={handleDeleteAgents}
                />;
      case 'results':
        return <ResultsModal 
                  results={results} 
                  onUpdateResult={handleUpdateResult}
                  onDeleteResult={handleDeleteResult}
                  onBulkUpdateResultsStatus={handleBulkUpdateResultsStatus}
                  onBulkDeleteResults={handleBulkDeleteResults}
                  candidates={candidates}
                  cancelledVotes={derivedCancelledVotes}
                  allPollingUnits={allPollingUnits}
                  isMaximized={isMaximized}
                  onToggleMaximize={toggleMaximize}
                  preFilter={resultsPreFilter}
                  onClearPreFilter={() => setResultsPreFilter('')}
                />;
      case 'analytics':
        return <AnalyticsModal 
                  voteStats={currentVoteStats}
                />;
      case 'report':
        return <ReportingModal 
                  reportData={electionData}
                  results={results}
                  onUpdateResult={handleUpdateResult}
                  onDeleteResult={handleDeleteResult}
                  incidents={incidents}
                  candidates={candidates}
                  cancelledVotes={derivedCancelledVotes}
                  allPollingUnits={allPollingUnits}
                />;
      case 'incidenceReports':
        return <IncidenceReportsModal 
                  incidents={incidents} 
                  onUpdateIncidentStatus={handleUpdateIncidentStatus}
                  onBulkUpdateIncidentsStatus={handleBulkUpdateIncidentsStatus}
                  onBulkDeleteIncidents={handleBulkDeleteIncidents}
                />;
      case 'notifications':
        return <NotificationsCenterModal 
                  notifications={notificationHistory}
                  messages={messages}
                  agents={agents}
                  onAdminReply={handleAdminReply}
                  onAdminBroadcast={handleAdminBroadcast}
                  onMarkConversationAsRead={handleMarkConversationAsRead}
                />;
      case 'settings':
        return <SettingsModal 
                  candidates={candidates} 
                  admins={admins}
                  onAddCandidate={handleAddCandidate}
                  onDeleteCandidate={handleDeleteCandidate}
                  onAddAdmin={handleAddAdmin}
                  onDeleteAdmin={handleDeleteAdmin}
                  onToggleAdminAccess={handleToggleAdminAccess}
                  currentUser={currentUser!}
                />;
      default:
        return <Dashboard 
                  setElectionData={setElectionData}
                  agentsCount={agents.length}
                  cancelledVotes={derivedCancelledVotes}
                  currentVoteStats={currentVoteStats}
                  openKeyStatsModal={openKeyStatsModal}
                  openCancelledVotesModal={openCancelledVotesModal}
                  results={results}
                  candidates={candidates}
                  allPollingUnits={allPollingUnits}
                  navigateToResults={navigators.results}
                  setResultsPreFilter={setResultsPreFilter}
                  liveFeedEvents={liveFeedEvents}
                  overVotingIncidents={overVotingIncidents}
                  onReviewOverVoting={handleReviewOverVoting}
                />;
    }
  };

  if (isLoading) {
    return <Spinner fullPage />;
  }

  if (currentUser) {
      return (
        <div className="bg-gray-100 dark:bg-gray-900 min-h-screen font-sans">
          <div className={isMaximized && activeView === 'results' ? 'hidden' : ''}>
            <Header 
              onLogout={handleLogout} 
              currentUser={currentUser} 
              onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
            />
          </div>
          <div className="flex relative">
            <div className={isMaximized && activeView === 'results' ? 'hidden' : ''}>
              <Sidebar 
                onNavigate={navigators} 
                currentUser={currentUser} 
                activeView={activeView} 
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
              />
            </div>
            <main className={
              isMaximized && activeView === 'results' 
              ? "fixed inset-0 z-50 bg-white dark:bg-gray-800" 
              : "flex-1 p-4 md:p-6 lg:p-8 transition-all duration-300 min-w-0"
            }>
              {renderActiveView()}
            </main>
            {isSidebarOpen && !isMaximized && (
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" 
                onClick={() => setIsSidebarOpen(false)}
                aria-hidden="true"
              ></div>
            )}
          </div>
          <KeyStatsModal isOpen={isKeyStatsModalOpen} onClose={() => setKeyStatsModalOpen(false)} voteStats={currentVoteStats} />
          <CancelledVotesModal isOpen={isCancelledVotesModalOpen} onClose={() => setCancelledVotesModalOpen(false)} cancelledVotes={derivedCancelledVotes} />
        </div>
      );
  }

  if (currentAgent) {
      return (
        <AgentDashboard 
            agent={currentAgent}
            onLogout={handleLogout}
            candidates={candidates}
            messages={messages.filter(m => m.agentId === currentAgent.id)}
            onUpdateRegistration={(reg, acc) => handleUpdateRegistration(currentAgent, reg, acc)}
            onSubmitResult={(scores, cancelled, url) => handleSubmitResult(currentAgent, scores, cancelled, url)}
            onReportIncidence={(type, url) => handleReportIncidence(currentAgent, type, url)}
            onSendMessage={(text, imageUrl) => handleSendMessage(currentAgent, text, imageUrl)}
            onMarkMessagesAsRead={() => handleAgentMarkMessagesAsRead(currentAgent.id)}
        />
      );
  }

  return (
      <LoginPage onAdminLogin={handleAdminLogin} onAgentLogin={handleAgentLogin} />
  );
};

export default App;