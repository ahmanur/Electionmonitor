import React, { useState, useEffect, useMemo } from 'react';
import { FaSave, FaTimes, FaUserFriends, FaTimesCircle, FaCamera, FaPoll } from 'react-icons/fa';
import type { Candidate } from '../types';
import Modal from './Modal';
import ValidatedInput from './ValidatedInput';
import { validateNumber } from '../utils/validation';

interface SubmitResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (scores: { candidateId: string; score: number }[], cancelled: number, url: string) => void;
  candidates: Candidate[];
}

const SubmitResultModal: React.FC<SubmitResultModalProps> = ({ isOpen, onClose, onSubmit, candidates }) => {
  const initialScores = useMemo(() => candidates.reduce((acc, c) => ({...acc, [c.id]: ''}), {}), [candidates]);
  const [scores, setScores] = useState<Record<string, string>>(initialScores);
  const [totalVotesCast, setTotalVotesCast] = useState('');
  const [invalidVotes, setInvalidVotes] = useState('');
  const [resultSheet, setResultSheet] = useState<string | null>(null);
  
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [formError, setFormError] = useState('');
  
  const titleId = "submit-result-modal-title";

  useEffect(() => {
    if (isOpen) {
        setScores(initialScores);
        setTotalVotesCast('');
        setInvalidVotes('');
        setResultSheet(null);
        setTouched({});
        setErrors({});
        setFormError('');
    }
  }, [isOpen, initialScores]);

  const sumOfScores = useMemo(() => {
    return Object.values(scores).reduce((sum, current) => sum + (parseInt(current, 10) || 0), 0);
  }, [scores]);
  
  const handleScoreChange = (candidateId: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setScores(prev => ({ ...prev, [candidateId]: value }));
      if (touched[candidateId]) {
          setErrors(prev => ({ ...prev, [candidateId]: validateNumber(value, 'Score') }));
      }
    }
  };
  
  const handleScoreBlur = (candidateId: string) => (e: React.FocusEvent<HTMLInputElement>) => {
      setTouched(prev => ({...prev, [candidateId]: true}));
      setErrors(prev => ({ ...prev, [candidateId]: validateNumber(e.target.value, 'Score') }));
  };

  const handleTotalVotesCastChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (value === '' || /^\d+$/.test(value)) {
        setTotalVotesCast(value);
        if(touched.totalVotesCast) {
            setErrors(prev => ({...prev, totalVotesCast: validateNumber(value, 'Total Votes Cast')}))
        }
      }
  };

  const handleTotalVotesCastBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setTouched(prev => ({...prev, totalVotesCast: true}));
      setErrors(prev => ({...prev, totalVotesCast: validateNumber(e.target.value, 'Total Votes Cast')}))
  };
  
  const handleInvalidVotesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setInvalidVotes(value);
      if(touched.invalidVotes) {
          setErrors(prev => ({...prev, invalidVotes: validateNumber(value, 'Invalid Votes')}))
      }
    }
  };
  
  const handleInvalidVotesBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setTouched(prev => ({...prev, invalidVotes: true}));
      setErrors(prev => ({...prev, invalidVotes: validateNumber(e.target.value, 'Invalid Votes')}))
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setResultSheet(reader.result as string);
        if (touched.resultSheet) {
            setErrors(prev => ({...prev, resultSheet: null}));
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleFileBlur = () => {
      setTouched(prev => ({...prev, resultSheet: true}));
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const newTouched = candidates.reduce((acc, c) => ({...acc, [c.id]: true}), { totalVotesCast: true, invalidVotes: true, resultSheet: true });
    setTouched(newTouched);
    
    let newErrors = candidates.reduce((acc, c) => ({
        ...acc,
        [c.id]: validateNumber(scores[c.id] || '', `${c.name} score`)
    }), {
        totalVotesCast: validateNumber(totalVotesCast, 'Total Votes Cast'),
        invalidVotes: validateNumber(invalidVotes, 'Invalid Votes'),
        resultSheet: !resultSheet ? 'Result sheet photo is required.' : null
    } as Record<string, string | null>);

    const parsedTotalVotes = parseInt(totalVotesCast, 10) || 0;
    if (!newErrors.totalVotesCast && sumOfScores !== parsedTotalVotes) {
        newErrors.totalVotesCast = `Does not match sum of scores (${sumOfScores.toLocaleString()}).`;
        setFormError("The total votes cast must equal the sum of all candidate scores.");
    }

    setErrors(newErrors);

    if (Object.values(newErrors).some(Boolean)) {
        return;
    }

    const parsedScores = candidates.map(c => ({
      candidateId: c.id,
      score: parseInt(scores[c.id] || '0', 10)
    }));
    
    const parsedInvalidVotes = parseInt(invalidVotes || '0', 10);

    onSubmit(parsedScores, parsedInvalidVotes, resultSheet!);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Submit Polling Unit Results" containerClasses="max-w-2xl">
        <div className="sticky top-0 bg-primary-green text-white px-6 py-4 flex justify-between items-center z-10 rounded-t-lg">
          <h5 id={titleId} className="text-lg font-semibold">Submit Polling Unit Results</h5>
          <button onClick={onClose} className="text-white text-2xl hover:text-gray-200" aria-label="Close modal"><FaTimes /></button>
        </div>
        <form onSubmit={handleSubmit} noValidate className="overflow-y-auto">
          <div className="p-6 space-y-6">
            {formError && <div className="p-3 text-sm text-red-700 bg-red-100 dark:bg-red-900/50 dark:text-red-300 rounded-md" role="alert">{formError}</div>}
            
            <div>
              <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center"><FaUserFriends className="mr-2" /> Candidate Scores</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {candidates.map(candidate => (
                  <ValidatedInput
                    key={candidate.id}
                    id={`score-${candidate.id}`}
                    label={`${candidate.name} (${candidate.party})`}
                    value={scores[candidate.id] || ''}
                    onChange={handleScoreChange(candidate.id)}
                    onBlur={handleScoreBlur(candidate.id)}
                    error={errors[candidate.id]}
                    touched={touched[candidate.id] || false}
                    placeholder="0"
                  />
                ))}
              </div>
            </div>
            
            <hr className="dark:border-gray-600" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ValidatedInput
                    id="totalVotesCast"
                    label="Total Votes Cast"
                    value={totalVotesCast}
                    onChange={handleTotalVotesCastChange}
                    onBlur={handleTotalVotesCastBlur}
                    error={errors.totalVotesCast}
                    touched={touched.totalVotesCast || false}
                    placeholder="0"
                    Icon={FaPoll}
                />
                <ValidatedInput
                    id="invalidVotes"
                    label="Invalid Votes"
                    value={invalidVotes}
                    onChange={handleInvalidVotesChange}
                    onBlur={handleInvalidVotesBlur}
                    error={errors.invalidVotes}
                    touched={touched.invalidVotes || false}
                    placeholder="0"
                    Icon={FaTimesCircle}
                />
                <div>
                  <label htmlFor="resultSheet" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center"><FaCamera className="mr-2" /> Result Sheet Photo</label>
                  <input
                    type="file"
                    id="resultSheet"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                    onBlur={handleFileBlur}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-green/10 file:text-primary-green hover:file:bg-primary-green/20"
                  />
                  {errors.resultSheet && touched.resultSheet && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.resultSheet}</p>}
                  {resultSheet && <img src={resultSheet} alt="Result preview" className="mt-4 rounded-md max-h-40 object-contain border dark:border-gray-600" />}
                </div>
            </div>
          </div>

          <div className="sticky bottom-0 bg-gray-100 dark:bg-gray-900/50 px-6 py-4 flex justify-end items-center space-x-3 border-t dark:border-gray-700 rounded-b-lg">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-600 border dark:border-gray-500 rounded-md hover:bg-gray-100 dark:hover:bg-gray-500">Cancel</button>
            <button type="submit" className="flex items-center px-4 py-2 text-sm text-white bg-primary-green rounded-md hover:bg-green-700">
              <FaSave className="mr-2" /> Submit Results
            </button>
          </div>
        </form>
    </Modal>
  );
};

export default SubmitResultModal;