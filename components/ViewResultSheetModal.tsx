import React, { useState, useEffect } from 'react';
import { FaTimes, FaFileImage, FaSearchPlus, FaSearchMinus, FaExpandArrowsAlt } from 'react-icons/fa';
import type { Result } from '../types';
import Modal from './Modal';

interface ViewResultSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: Result;
}

const ViewResultSheetModal: React.FC<ViewResultSheetModalProps> = ({ isOpen, onClose, result }) => {
  const titleId = "view-result-sheet-modal-title";
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };
  
  // Reset view state whenever the modal is opened or the result changes
  useEffect(() => {
    if (isOpen) {
        handleReset();
    }
  }, [isOpen, result.id]);

  const handleZoomIn = () => setScale(s => Math.min(s + 0.15, 3));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.15, 0.5));

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (scale <= 1) return;
    e.preventDefault();
    setIsPanning(true);
    setStartPan({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPanning || scale <= 1) return;
    e.preventDefault();
    setPosition({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y
    });
  };

  const handleMouseUpOrLeave = () => {
    setIsPanning(false);
  };
  
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Result Sheet for ${result.pollingUnit}`} containerClasses="max-w-5xl h-[90vh]">
      <div className="sticky top-0 bg-primary-green text-white px-6 py-4 flex justify-between items-center z-10 rounded-t-lg">
        <h5 id={titleId} className="text-lg font-semibold flex items-center">
          <FaFileImage className="mr-3" /> Result Sheet for {result.pollingUnit}
        </h5>
        <button onClick={onClose} className="text-white text-2xl hover:text-gray-200" aria-label="Close modal"><FaTimes /></button>
      </div>
      
      <div 
        className="flex-grow flex items-center justify-center bg-gray-200 dark:bg-gray-900 relative overflow-hidden select-none"
        onWheel={handleWheel}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
      >
        {result.resultSheetUrl ? (
            <div
                onMouseDown={handleMouseDown}
                style={{
                    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                    transition: isPanning ? 'none' : 'transform 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)',
                    cursor: scale > 1 ? (isPanning ? 'grabbing' : 'grab') : 'zoom-in',
                }}
            >
                <img 
                    src={result.resultSheetUrl} 
                    alt={`Result sheet for ${result.pollingUnit}`} 
                    className="touch-none shadow-lg max-w-full max-h-full object-contain"
                    onDragStart={(e) => e.preventDefault()}
                />
            </div>
        ) : (
          <div className="text-center py-20 text-gray-500 dark:text-gray-400">
            <p>No result sheet image available for this entry.</p>
          </div>
        )}

        <div className="absolute bottom-4 right-4 z-10 flex items-center space-x-1 bg-black bg-opacity-50 text-white p-2 rounded-full shadow-lg">
            <button onClick={handleZoomOut} className="p-2 hover:bg-white/20 rounded-full" title="Zoom Out" aria-label="Zoom Out"><FaSearchMinus /></button>
            <button onClick={handleReset} className="p-2 hover:bg-white/20 rounded-full" title="Reset Zoom" aria-label="Reset Zoom"><FaExpandArrowsAlt /></button>
            <button onClick={handleZoomIn} className="p-2 hover:bg-white/20 rounded-full" title="Zoom In" aria-label="Zoom In"><FaSearchPlus /></button>
        </div>
      </div>
      
      <div className="sticky bottom-0 bg-gray-100 dark:bg-gray-900/50 px-6 py-4 flex justify-end items-center border-t dark:border-gray-700 rounded-b-lg">
        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-600 border dark:border-gray-500 rounded-md hover:bg-gray-100 dark:hover:bg-gray-500">Close</button>
      </div>
    </Modal>
  );
};

export default ViewResultSheetModal;