import React, { useState, useEffect } from 'react';
import { FaSave, FaTimes, FaUser, FaPhone, FaMapMarkerAlt, FaUserShield, FaKey } from 'react-icons/fa';
import type { Agent } from '../types';
import { validateRequired, validateUsername, validatePasswordStrength, validatePhone, sanitizeInput } from '../utils/validation';
import Modal from './Modal';
import ValidatedInput from './ValidatedInput';

interface AgentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (agent: Agent) => void;
  agent: Agent | null; // null for adding, Agent object for editing
}

const AgentFormModal: React.FC<AgentFormModalProps> = ({ isOpen, onClose, onSave, agent }) => {
  const initialFormState = {
    name: '',
    username: '',
    password: '',
    phone: '',
    pollingUnit: '',
  };
  const [formData, setFormData] = useState(initialFormState);
  const [touched, setTouched] = useState<Record<keyof typeof initialFormState, boolean>>({
    name: false, username: false, password: false, phone: false, pollingUnit: false
  });
  const [errors, setErrors] = useState<Record<keyof typeof initialFormState, string | null>>({
    name: null, username: null, password: null, phone: null, pollingUnit: null
  });
  const titleId = "agent-form-modal-title";

  useEffect(() => {
    if (isOpen) {
        if (agent) {
            setFormData({
                name: agent.name,
                username: agent.username,
                password: agent.password,
                phone: agent.phone,
                pollingUnit: agent.pollingUnit,
            });
        } else {
            setFormData(initialFormState);
        }
        setTouched({ name: false, username: false, password: false, phone: false, pollingUnit: false });
        setErrors({ name: null, username: null, password: null, phone: null, pollingUnit: null });
    }
  }, [agent, isOpen]);

  const validate = (field: keyof typeof formData, value: string) => {
    switch(field) {
        case 'name': return validateRequired(value, 'Full Name');
        case 'username': return validateUsername(value);
        case 'password': return (agent && value === agent.password) ? null : validatePasswordStrength(value);
        case 'phone': return validatePhone(value);
        case 'pollingUnit': return validateRequired(value, 'Polling Unit');
        default: return null;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target as { name: keyof typeof formData, value: string };
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
        setErrors(prev => ({ ...prev, [name]: validate(name, value) }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target as { name: keyof typeof formData, value: string };
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validate(name, value) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors = Object.keys(formData).reduce((acc, key) => {
        const field = key as keyof typeof formData;
        acc[field] = validate(field, formData[field]);
        return acc;
    }, {} as typeof errors);

    setErrors(newErrors);
    setTouched({ name: true, username: true, password: true, phone: true, pollingUnit: true });

    if (Object.values(newErrors).some(err => err !== null)) {
        return;
    }

    const sanitizedData = {
        name: sanitizeInput(formData.name),
        username: sanitizeInput(formData.username),
        password: formData.password, // Don't trim password
        phone: sanitizeInput(formData.phone),
        pollingUnit: sanitizeInput(formData.pollingUnit),
    };

    const savedAgent: Agent = {
      id: agent ? agent.id : `AGT${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      lastLogin: agent ? agent.lastLogin : 'Never',
      submissions: agent ? agent.submissions : 0,
      ...sanitizedData,
    };
    
    onSave(savedAgent);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={agent ? 'Edit Agent' : 'Register New Agent'}>
      <div className="sticky top-0 bg-primary-green text-white px-6 py-4 flex justify-between items-center z-10 rounded-t-lg">
        <h5 id={titleId} className="text-lg font-semibold">{agent ? 'Edit Agent' : 'Register New Agent'}</h5>
        <button onClick={onClose} className="text-white text-2xl hover:text-gray-200" aria-label="Close modal"><FaTimes /></button>
      </div>
      
      <form onSubmit={handleSubmit} noValidate className="overflow-y-auto">
        <div className="p-6 space-y-4">
          <ValidatedInput
            id="name"
            label="Full Name"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.name}
            touched={touched.name}
            placeholder="John Doe"
            Icon={FaUser}
          />
          <ValidatedInput
            id="username"
            label="Username"
            value={formData.username}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.username}
            touched={touched.username}
            placeholder="agent_username"
            Icon={FaUserShield}
          />
          <ValidatedInput
            id="password"
            label="Password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.password}
            touched={touched.password}
            placeholder="********"
            Icon={FaKey}
          />
          <ValidatedInput
            id="phone"
            label="Phone Number"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.phone}
            touched={touched.phone}
            placeholder="08012345678"
            Icon={FaPhone}
          />
          <ValidatedInput
            id="pollingUnit"
            label="Polling Unit"
            value={formData.pollingUnit}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.pollingUnit}
            touched={touched.pollingUnit}
            placeholder="PU 012, Kachi"
            Icon={FaMapMarkerAlt}
          />
        </div>

        <div className="sticky bottom-0 bg-gray-100 dark:bg-gray-900/50 px-6 py-4 flex justify-end items-center space-x-3 border-t dark:border-gray-700 rounded-b-lg">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-600 border dark:border-gray-500 rounded-md hover:bg-gray-100 dark:hover:bg-gray-500">Cancel</button>
          <button type="submit" className="flex items-center px-4 py-2 text-sm text-white bg-primary-green rounded-md hover:bg-green-700">
            <FaSave className="mr-2" /> Save Changes
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AgentFormModal;