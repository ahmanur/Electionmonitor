import React, { useState, useEffect } from 'react';
import { FaSave, FaTimes } from 'react-icons/fa';
import type { Result, Candidate } from '../types';
import { sanitizeInput } from '../utils/validation';
import Modal from './Modal';

interface EditResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: Result;
  candidates: Candidate[];
  onSave: (updatedResult: Result) => void;
}

// Local state type to handle string inputs for number fields
type EditFormData = Omit<Result, 'candidateScores' | 'registeredVoters' | 'accreditedVoters' | 'votesCast' | 'votesCancelled'> & {
    registeredVoters: string;
    accreditedVoters: string;
    votesCast: string;
    votesCancelled: string;
    candidateScores: { candidateId: string; score: string }[];
};

const EditResultModal: React.FC<EditResultModalProps> = ({ isOpen, onClose, result, candidates, onSave }) => {
  const [formData, setFormData] = useState<EditFormData>({
    ...result,
    registeredVoters: String(result.registeredVoters),
    accreditedVoters: String(result.accreditedVoters),
    votesCast: String(result.votesCast),
    votesCancelled: String(result.votesCancelled),
    candidateScores: result.candidateScores.map(cs => ({ ...cs, score: String(cs.score) }))
  });
  const titleId = "edit-result-modal-title";

  useEffect(() => {
    setFormData({
        ...result,
        registeredVoters: String(result.registeredVoters),
        accreditedVoters: String(result.accreditedVoters),
        votesCast: String(result.votesCast),
        votesCancelled: String(result.votesCancelled),
        candidateScores: result.candidateScores.map(cs => ({ ...cs, score: String(cs.score) }))
    });
  }, [result, isOpen]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (['registeredVoters', 'accreditedVoters', 'votesCast', 'votesCancelled'].includes(name)) {
        if (value === '' || /^\d+$/.test(value)) {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleScoreChange = (candidateId: string, score: string) => {
    if (score === '' || /^\d+$/.test(score)) {
        setFormData(prev => ({
          ...prev,
          candidateScores: prev.candidateScores.map(cs =>
            cs.candidateId === candidateId ? { ...cs, score: score } : cs
          ),
        }));
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalResult: Result = {
        ...formData,
        pollingUnit: sanitizeInput(formData.pollingUnit),
        registeredVoters: Math.max(0, parseInt(formData.registeredVoters, 10) || 0),
        accreditedVoters: Math.max(0, parseInt(formData.accreditedVoters, 10) || 0),
        votesCast: Math.max(0, parseInt(formData.votesCast, 10) || 0),
        votesCancelled: Math.max(0, parseInt(formData.votesCancelled, 10) || 0),
        candidateScores: formData.candidateScores.map(cs => ({
            ...cs,
            score: Math.max(0, parseInt(cs.score, 10) || 0),
        }))
    };
    onSave(finalResult);
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit Result for ${result.pollingUnit}`} containerClasses="max-w-2xl">
      <div className="sticky top-0 bg-primary-green text-white px-6 py-4 flex justify-between items-center z-10 rounded-t-lg">
        <h5 id={titleId} className="text-lg font-semibold">Edit Result for {result.pollingUnit}</h5>
        <button onClick={onClose} className="text-white text-2xl hover:text-gray-200" aria-label="Close modal"><FaTimes /></button>
      </div>
      
      <form onSubmit={handleSubmit} className="overflow-y-auto">
        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="pollingUnit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Polling Unit Name</label>
            <input type="text" name="pollingUnit" id="pollingUnit" value={formData.pollingUnit} onChange={handleInputChange} className="mt-1 block w-full p-2 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <label htmlFor="registeredVoters" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Registered Voters</label>
               <input type="text" pattern="\d*" name="registeredVoters" id="registeredVoters" value={formData.registeredVoters} onChange={handleInputChange} className="mt-1 block w-full p-2 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
             </div>
             <div>
               <label htmlFor="accreditedVoters" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Accredited Voters</label>
               <input type="text" pattern="\d*" name="accreditedVoters" id="accreditedVoters" value={formData.accreditedVoters} onChange={handleInputChange} className="mt-1 block w-full p-2 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
             </div>
             <div>
               <label htmlFor="votesCast" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Votes Cast</label>
               <input type="text" pattern="\d*" name="votesCast" id="votesCast" value={formData.votesCast} onChange={handleInputChange} className="mt-1 block w-full p-2 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
             </div>
             <div>
               <label htmlFor="votesCancelled" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cancelled Votes</label>
               <input type="text" pattern="\d*" name="votesCancelled" id="votesCancelled" value={formData.votesCancelled} onChange={handleInputChange} className="mt-1 block w-full p-2 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
             </div>
          </div>
          
          <hr className="dark:border-gray-600" />
          
          <div>
              <h6 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-2">Candidate Scores</h6>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {candidates.map(candidate => {
                      const score = formData.candidateScores.find(cs => cs.candidateId === candidate.id)?.score ?? '';
                      return (
                          <div key={candidate.id}>
                              <label htmlFor={`score-${candidate.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{candidate.name}</label>
                              <input
                                  type="text"
                                  pattern="\d*"
                                  id={`score-${candidate.id}`}
                                  value={score}
                                  onChange={(e) => handleScoreChange(candidate.id, e.target.value)}
                                  className="mt-1 block w-full p-2 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              />
                          </div>
                      );
                  })}
              </div>
          </div>
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

export default EditResultModal;