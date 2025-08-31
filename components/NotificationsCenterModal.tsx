import React, { useState, useMemo, useRef, useEffect } from 'react';
import { FaComments, FaPaperPlane, FaBroadcastTower, FaInbox, FaHistory, FaBell, FaCamera } from 'react-icons/fa';
import type { Message, Agent, NotificationData } from '../types';

interface CommunicationCenterProps {
  notifications: NotificationData[];
  messages: Message[];
  agents: Agent[];
  onAdminReply: (agentId: string, text: string, imageUrl?: string) => void;
  onAdminBroadcast: (agentIds: string[], text: string) => void;
  onMarkConversationAsRead: (agentId: string) => void;
}

const CommunicationCenterPage: React.FC<CommunicationCenterProps> = ({
  notifications,
  messages,
  agents,
  onAdminReply,
  onAdminBroadcast,
  onMarkConversationAsRead,
}) => {
  const [activeTab, setActiveTab] = useState<'inbox' | 'broadcast' | 'history'>('inbox');
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // State for Inbox Search
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for Broadcast
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [selectedBroadcastAgents, setSelectedBroadcastAgents] = useState<string[]>([]);
  const [broadcastTarget, setBroadcastTarget] = useState<'all' | 'specific'>('all');

  const conversations = useMemo(() => {
    const grouped = messages.reduce((acc, msg) => {
      acc[msg.agentId] = acc[msg.agentId] || [];
      acc[msg.agentId].push(msg);
      return acc;
    }, {} as Record<string, Message[]>);

    const initialConversations = Object.entries(grouped)
      .map(([agentId, msgs]) => {
        const agent = agents.find(a => a.id === agentId);
        const lastMessage = msgs.slice().sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()).pop();
        const unreadCount = msgs.filter(m => m.sender !== 'Admin' && !m.read).length;
        return {
          agentId,
          agentName: agent?.name || 'Unknown Agent',
          lastMessageText: lastMessage?.text || 'No messages yet.',
          lastMessageTimestamp: lastMessage ? new Date(lastMessage.timestamp) : new Date(0),
          unreadCount,
          messages: msgs,
        };
      })
      .sort((a, b) => b.lastMessageTimestamp.getTime() - a.lastMessageTimestamp.getTime());

      if (!searchQuery) {
        return initialConversations;
      }
      
      return initialConversations.filter(convo =>
        convo.agentName.toLowerCase().includes(searchQuery.toLowerCase())
      );

  }, [messages, agents, searchQuery]);


  const selectedConversation = useMemo(() => {
    return conversations.find(c => c.agentId === selectedAgentId);
  }, [conversations, selectedAgentId]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (selectedConversation) {
      scrollToBottom();
    }
  }, [selectedConversation, imagePreview]);
  
  const handleSelectConversation = (agentId: string) => {
    setSelectedAgentId(agentId);
    const convo = conversations.find(c => c.agentId === agentId);
    if (convo && convo.unreadCount > 0) {
        onMarkConversationAsRead(agentId);
    }
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((replyText.trim() || imagePreview) && selectedAgentId) {
      onAdminReply(selectedAgentId, replyText.trim(), imagePreview || undefined);
      setReplyText('');
      removeImage();
    }
  };

  const handleBroadcastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    
    let targetAgentIds: string[] = [];
    if (broadcastTarget === 'all') {
        targetAgentIds = agents.map(a => a.id);
    } else {
        targetAgentIds = selectedBroadcastAgents;
    }

    if (targetAgentIds.length > 0) {
        onAdminBroadcast(targetAgentIds, broadcastMessage.trim());
        setBroadcastMessage('');
        setSelectedBroadcastAgents([]);
    }
  };

  const TabButton = ({ tabId, title, icon: Icon }: { tabId: 'inbox' | 'broadcast' | 'history', title: string, icon: React.ElementType }) => (
    <button
      onClick={() => setActiveTab(tabId)}
      className={`flex-1 p-4 text-sm font-medium flex items-center justify-center transition-colors ${activeTab === tabId ? 'text-primary-green dark:text-accent-gold border-b-2 border-primary-green dark:border-accent-gold bg-gray-50 dark:bg-gray-800' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
    >
      <Icon className="mr-2" /> {title}
    </button>
  );

  const getConvoClasses = (convo: typeof conversations[0]) => {
    const isSelected = selectedAgentId === convo.agentId;
    const isUnread = convo.unreadCount > 0;
    
    let classes = 'w-full text-left p-3 border-l-4 transition-colors ';
    
    if (isSelected) {
        classes += 'bg-primary-green/10 border-primary-green';
    } else if (isUnread) {
        classes += 'bg-green-50 dark:bg-primary-green/10 border-transparent hover:bg-green-100 dark:hover:bg-primary-green/20';
    } else {
        classes += 'border-transparent hover:bg-gray-100 dark:hover:bg-gray-700';
    }
    
    return classes;
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md h-full flex flex-col">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center mb-4 flex-shrink-0">
        <FaComments className="mr-3 text-primary-green" /> Communications Center
      </h2>
      <div className="flex-shrink-0 flex border-b dark:border-gray-700">
        <TabButton tabId="inbox" title="Inbox" icon={FaInbox} />
        <TabButton tabId="broadcast" title="Broadcast" icon={FaBroadcastTower} />
        <TabButton tabId="history" title="System Alerts" icon={FaHistory} />
      </div>

      <div className="flex-grow overflow-hidden">
        {activeTab === 'inbox' && (
          <div className="flex-grow h-full flex border border-t-0 dark:border-gray-700 rounded-b-lg overflow-hidden">
            <div className="w-1/3 border-r dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex flex-col">
              <div className="p-3 border-b dark:border-gray-700 flex-shrink-0">
                <h3 className="text-md font-semibold text-gray-700 dark:text-gray-200 mb-2">Conversations</h3>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by agent name..."
                  className="w-full p-2 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-primary-green focus:border-primary-green"
                />
              </div>
              <ul className="overflow-y-auto flex-grow">
                {conversations.map(convo => (
                  <li key={convo.agentId}>
                    <button
                      onClick={() => handleSelectConversation(convo.agentId)}
                      className={getConvoClasses(convo)}
                    >
                      <div className="flex justify-between items-center">
                        <p className={`font-semibold text-sm text-gray-800 dark:text-gray-100 ${convo.unreadCount > 0 ? 'font-bold' : ''}`}>{convo.agentName}</p>
                        {convo.unreadCount > 0 && (
                          <span className="bg-primary-green text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{convo.unreadCount}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{convo.lastMessageText}</p>
                    </button>
                  </li>
                ))}
                {conversations.length === 0 && (
                    <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        {searchQuery ? 'No agents found.' : 'No messages yet.'}
                    </div>
                )}
              </ul>
            </div>
            <div className="w-2/3 flex flex-col">
              {selectedConversation ? (
                <>
                  <div className="p-3 border-b dark:border-gray-700 flex-shrink-0">
                      <h3 className="font-semibold text-gray-800 dark:text-gray-100">{selectedConversation.agentName}</h3>
                  </div>
                  <div className="flex-grow p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900/50">
                    <div className="space-y-4">
                      {selectedConversation.messages.map(msg => (
                        <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === 'Admin' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`flex flex-col max-w-xs lg:max-w-md ${msg.sender === 'Admin' ? 'items-end' : 'items-start'}`}>
                            <div className={`px-4 py-2 ${msg.sender === 'Admin' ? 'bg-primary-green text-white rounded-t-xl rounded-bl-xl' : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-sm rounded-t-xl rounded-br-xl'}`}>
                                {msg.imageUrl && (
                                    <a href={msg.imageUrl} target="_blank" rel="noopener noreferrer">
                                        <img src={msg.imageUrl} alt="attachment" className="rounded-md mb-2 max-h-48 cursor-pointer" />
                                    </a>
                                )}
                                {msg.text && <p className="text-sm" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{msg.text}</p>}
                            </div>
                            <p className="text-xs mt-1 text-gray-400 dark:text-gray-500 px-1">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </div>
                  <div className="p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700 flex-shrink-0">
                    {imagePreview && (
                        <div className="mb-2 p-2 bg-gray-200 dark:bg-gray-600 rounded-lg relative w-fit">
                            <img src={imagePreview} alt="Preview" className="max-h-24 rounded-md" />
                            <button onClick={removeImage} className="absolute -top-2 -right-2 bg-black bg-opacity-60 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs" aria-label="Remove image">&times;</button>
                        </div>
                    )}
                    <form onSubmit={handleReplySubmit} className="flex items-center space-x-2">
                        <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" id="admin-image-upload" />
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="flex-shrink-0 flex items-center justify-center p-2.5 w-10 h-10 text-gray-500 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-full hover:bg-gray-300 dark:hover:bg-gray-500" aria-label="Attach image">
                            <FaCamera />
                        </button>
                        <input
                            type="text"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Type your reply..."
                            className="flex-1 p-2 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            autoComplete="off"
                        />
                        <button
                            type="submit"
                            className="flex-shrink-0 flex items-center justify-center p-2.5 w-10 h-10 text-white bg-primary-green rounded-full hover:bg-green-700 disabled:bg-gray-400"
                            disabled={!replyText.trim() && !imagePreview}
                            aria-label="Send reply"
                        >
                            <FaPaperPlane />
                        </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 text-center p-4">
                  <FaInbox className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600" />
                  <h3 className="text-lg font-semibold">Welcome to your Inbox</h3>
                  <p>Select a conversation from the list on the left to view messages.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'broadcast' && (
            <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t-0 dark:border-gray-700 rounded-b-lg overflow-y-auto h-full">
                <div className="max-w-2xl mx-auto">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">Send Broadcast Message</h3>
                    <form onSubmit={handleBroadcastSubmit} className="space-y-6">
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
                            <label className="block text-md font-semibold text-gray-800 dark:text-gray-200 mb-3">Recipients</label>
                            <div className="flex space-x-6">
                                <label className="flex items-center">
                                    <input type="radio" name="broadcastTarget" value="all" checked={broadcastTarget === 'all'} onChange={() => setBroadcastTarget('all')} className="form-radio text-primary-green focus:ring-primary-green" />
                                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">All Agents</span>
                                </label>
                                <label className="flex items-center">
                                    <input type="radio" name="broadcastTarget" value="specific" checked={broadcastTarget === 'specific'} onChange={() => setBroadcastTarget('specific')} className="form-radio text-primary-green focus:ring-primary-green" />
                                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">Specific Agents</span>
                                </label>
                            </div>
                        </div>

                        {broadcastTarget === 'specific' && (
                            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
                                <label htmlFor="agent-select" className="block text-md font-semibold text-gray-800 dark:text-gray-200">Select Agents</label>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 mb-3">Hold Ctrl (or Cmd on Mac) to select multiple agents.</p>
                                <select
                                    id="agent-select"
                                    multiple
                                    value={selectedBroadcastAgents}
                                    onChange={(e) => setSelectedBroadcastAgents(Array.from(e.target.selectedOptions, option => option.value))}
                                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-primary-green focus:border-primary-green sm:text-sm rounded-md h-60"
                                >
                                    {agents.map(agent => (
                                        <option key={agent.id} value={agent.id}>{agent.name} - {agent.pollingUnit}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
                            <label htmlFor="broadcast-message" className="block text-md font-semibold text-gray-800 dark:text-gray-200 mb-2">Message</label>
                            <textarea 
                                id="broadcast-message" 
                                rows={8}
                                value={broadcastMessage}
                                onChange={(e) => setBroadcastMessage(e.target.value)}
                                className="block w-full shadow-sm sm:text-sm border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-md focus:ring-primary-green focus:border-primary-green"
                                placeholder="Type your broadcast message here..."
                            ></textarea>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="flex items-center px-4 py-2 text-sm text-white bg-primary-green rounded-md hover:bg-green-700 disabled:opacity-50"
                                disabled={!broadcastMessage.trim() || (broadcastTarget === 'specific' && selectedBroadcastAgents.length === 0)}
                            >
                                <FaPaperPlane className="mr-2" /> Send Broadcast
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
        
        {activeTab === 'history' && (
            <div className="p-6 border border-t-0 dark:border-gray-700 rounded-b-lg overflow-y-auto">
                 {notifications.length > 0 ? (
                    <ul className="space-y-4">
                        {notifications.map(notification => (
                            <li key={notification.id} className={`flex items-start p-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm border-l-4 ${notification.color}`}>
                                <div className="mr-4 mt-1">
                                    <div className={`p-2 rounded-full ${notification.color.replace('border', 'bg')}`}>
                                        <notification.icon className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                                <div className="flex-grow">
                                    <p className="text-sm text-gray-800 dark:text-gray-200">{notification.message}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{notification.time}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-20 text-gray-500 dark:text-gray-400">
                        <FaBell className="mx-auto text-5xl mb-4 opacity-50" />
                        <p className="text-lg">No system alerts yet.</p>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default CommunicationCenterPage;