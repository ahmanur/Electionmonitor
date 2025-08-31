import React, { useState, useEffect } from 'react';
import { FaSave, FaTimes, FaUsers, FaUserCheck } from 'react-icons/fa';
import Modal from './Modal';
import ValidatedInput from './ValidatedInput';
import { validateNumber } from '../utils/validation';

interface VoteRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (registered: number, accredited: number) => void;
}

const VoteRegistrationModal: React.FC<VoteRegistrationModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({ registered: '', accredited: '' });
  const [touched, setTouched] = useState({ registered: false, accredited: false });
  const [errors, setErrors] = useState({ registered: null as string | null, accredited: null as string | null });
  const [formError, setFormError] = useState<string | null>(null);
  const titleId = "vote-reg-modal-title";

  useEffect(() => {
    if (isOpen) {
        setFormData({ registered: '', accredited: '' });
        setTouched({ registered: false, accredited: false });
        setErrors({ registered: null, accredited: null });
        setFormError(null);
    }
  }, [isOpen]);

  const validate = (field: keyof typeof formData, value: string) => {
    if (field === 'registered') return validateNumber(value, 'Registered Voters');
    if (field === 'accredited') return validateNumber(value, 'Accredited Voters');
    return null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target as { name: keyof typeof formData, value: string };
    if (value === '' || /^\d+$/.test(value)) {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (touched[name]) {
            setErrors(prev => ({ ...prev, [name]: validate(name, value) }));
        }
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target as { name: keyof typeof formData, value: string };
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validate(name, value) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const newErrors = {
        registered: validate('registered', formData.registered),
        accredited: validate('accredited', formData.accredited),
    };
    setErrors(newErrors);
    setTouched({ registered: true, accredited: true });

    if (newErrors.registered || newErrors.accredited) return;

    const registeredNum = parseInt(formData.registered, 10);
    const accreditedNum = parseInt(formData.accredited, 10);

    if (accreditedNum > registeredNum) {
      setFormError('Accredited voters cannot exceed registered voters.');
      setErrors(prev => ({ ...prev, accredited: 'Must be less than or equal to registered voters.'}));
      return;
    }
    
    onSubmit(registeredNum, accreditedNum);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Voter Registration & Accreditation">
        <div className="sticky top-0 bg-primary-green text-white px-6 py-4 flex justify-between items-center z-10 rounded-t-lg">
          <h5 id={titleId} className="text-lg font-semibold">Voter Registration & Accreditation</h5>
          <button onClick={onClose} className="text-white text-2xl hover:text-gray-200" aria-label="Close modal"><FaTimes /></button>
        </div>
        <form onSubmit={handleSubmit} noValidate className="overflow-y-auto">
          <div className="p-6 space-y-4">
            {formError && <div className="p-3 text-sm text-red-700 bg-red-100 dark:bg-red-900/50 dark:text-red-300 rounded-md" role="alert">{formError}</div>}
            
            <ValidatedInput
                id="registered"
                label="Total Registered Voters"
                value={formData.registered}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.registered}
                touched={touched.registered}
                placeholder="e.g., 850"
                Icon={FaUsers}
            />
            
            <ValidatedInput
                id="accredited"
                label="Total Accredited Voters"
                value={formData.accredited}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.accredited}
                touched={touched.accredited}
                placeholder="e.g., 610"
                Icon={FaUserCheck}
            />
          </div>

          <div className="sticky bottom-0 bg-gray-100 dark:bg-gray-900/50 px-6 py-4 flex justify-end items-center space-x-3 border-t dark:border-gray-700 rounded-b-lg">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-600 border dark:border-gray-500 rounded-md hover:bg-gray-100 dark:hover:bg-gray-500">Cancel</button>
            <button type="submit" className="flex items-center px-4 py-2 text-sm text-white bg-primary-green rounded-md hover:bg-green-700">
              <FaSave className="mr-2" /> Submit Numbers
            </button>
          </div>
        </form>
    </Modal>
  );
};

export default VoteRegistrationModal;