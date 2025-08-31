import React, { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaTimes, FaCamera } from 'react-icons/fa';
import type { Message } from '../types';
import Modal from './Modal';

interface MessagingModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  onSendMessage: (text: string, imageUrl?: string) => void;
  agentName: string;
}

const MessagingModal: React.FC<MessagingModalProps> = ({ isOpen, onClose, messages, onSendMessage, agentName }) => {
  const [newMessage, setNewMessage] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const titleId = "messaging-modal-title";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, imagePreview]);
  
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() || imagePreview) {
      onSendMessage(newMessage.trim(), imagePreview || undefined);
      setNewMessage('');
      removeImage();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Messages with Admin" containerClasses="max-w-lg h-[70vh] max-h-[600px]">
        <div className="sticky top-0 bg-primary-green text-white px-6 py-4 flex justify-between items-center z-10 rounded-t-lg">
          <h5 id={titleId} className="text-lg font-semibold">Messages with Admin</h5>
          <button onClick={onClose} className="text-white text-2xl hover:text-gray-200" aria-label="Close modal"><FaTimes /></button>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === agentName ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex flex-col max-w-xs lg:max-w-md ${msg.sender === agentName ? 'items-end' : 'items-start'}`}>
                  <div className={`px-4 py-2 ${msg.sender === agentName ? 'bg-primary-green text-white rounded-t-xl rounded-bl-xl' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-t-xl rounded-br-xl'}`}>
                    {msg.imageUrl && (
                        <a href={msg.imageUrl} target="_blank" rel="noopener noreferrer">
                            <img src={msg.imageUrl} alt="attachment" className="rounded-md mb-2 max-h-48 cursor-pointer" />
                        </a>
                    )}
                    {msg.text && <p className="text-sm" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{msg.text}</p>}
                  </div>
                  <p className="text-xs mt-1 text-gray-400 dark:text-gray-500 px-1">
                    {msg.sender} - {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-100 dark:bg-gray-700 p-4 border-t dark:border-gray-600 rounded-b-lg">
          {imagePreview && (
            <div className="mb-2 p-2 bg-gray-200 dark:bg-gray-600 rounded-lg relative w-fit">
              <img src={imagePreview} alt="Preview" className="max-h-24 rounded-md" />
              <button onClick={removeImage} className="absolute -top-2 -right-2 bg-black bg-opacity-60 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs" aria-label="Remove image">&times;</button>
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" id="agent-image-upload" />
            <button type="button" onClick={() => fileInputRef.current?.click()} className="flex-shrink-0 flex items-center justify-center p-2.5 w-10 h-10 text-gray-500 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-full hover:bg-gray-300 dark:hover:bg-gray-500" aria-label="Attach image">
                <FaCamera />
            </button>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-2 border rounded-md text-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white"
              autoComplete="off"
            />
            <button
              type="submit"
              className="flex-shrink-0 flex items-center justify-center p-2.5 w-10 h-10 text-white bg-primary-green rounded-full hover:bg-green-700 disabled:bg-gray-400"
              disabled={!newMessage.trim() && !imagePreview}
              aria-label="Send message"
            >
              <FaPaperPlane />
            </button>
          </form>
        </div>
    </Modal>
  );
};

export default MessagingModal;