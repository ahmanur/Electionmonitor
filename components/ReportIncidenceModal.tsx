import React, { useState } from 'react';
import { FaPaperPlane, FaTimes, FaCamera } from 'react-icons/fa';
import Modal from './Modal';

interface ReportIncidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (type: string, url?: string) => void;
}

const incidentTypes = [
  'Ballot Box Issue',
  'Voter Intimidation',
  'Security Concern',
  'Logistics Problem',
  'BVAS Malfunction',
  'Over-voting',
  'Violence',
  'Other',
];

const ReportIncidenceModal: React.FC<ReportIncidenceModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [type, setType] = useState(incidentTypes[0]);
  const [image, setImage] = useState<string | undefined>(undefined);
  const [error, setError] = useState('');
  const titleId = "report-incident-modal-title";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!type) {
      setError('Please select an incident type.');
      return;
    }
    setError('');
    onSubmit(type, image);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Report an Incident">
        <div className="sticky top-0 bg-primary-green text-white px-6 py-4 flex justify-between items-center z-10 rounded-t-lg">
          <h5 id={titleId} className="text-lg font-semibold">Report an Incident</h5>
          <button onClick={onClose} className="text-white text-2xl hover:text-gray-200" aria-label="Close modal"><FaTimes /></button>
        </div>
        <form onSubmit={handleSubmit} className="overflow-y-auto">
          <div className="p-6 space-y-4">
            {error && <div className="p-3 text-sm text-red-700 bg-red-100 dark:bg-red-900/50 dark:text-red-300 rounded-md" role="alert">{error}</div>}
            
            <div>
              <label htmlFor="incidentType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type of Incident</label>
              <select
                id="incidentType"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="mt-1 block w-full p-2 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {incidentTypes.map(it => <option key={it} value={it}>{it}</option>)}
              </select>
            </div>
            
            <div>
              <label htmlFor="incidentPhoto" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center"><FaCamera className="mr-2" /> Attach Photo (Optional)</label>
              <input
                type="file"
                id="incidentPhoto"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-green/10 file:text-primary-green hover:file:bg-primary-green/20"
              />
              {image && <img src={image} alt="Incident preview" className="mt-4 rounded-md max-h-40 object-contain border dark:border-gray-600" />}
            </div>
          </div>
          <div className="sticky bottom-0 bg-gray-100 dark:bg-gray-900/50 px-6 py-4 flex justify-end items-center space-x-3 border-t dark:border-gray-700 rounded-b-lg">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-600 border dark:border-gray-500 rounded-md hover:bg-gray-100 dark:hover:bg-gray-500">Cancel</button>
            <button type="submit" className="flex items-center px-4 py-2 text-sm text-white bg-primary-green rounded-md hover:bg-green-700">
              <FaPaperPlane className="mr-2" /> Submit Report
            </button>
          </div>
        </form>
    </Modal>
  );
};

export default ReportIncidenceModal;