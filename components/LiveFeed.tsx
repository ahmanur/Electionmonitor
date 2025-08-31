import React from 'react';
import type { LiveFeedEvent } from '../types';

interface LiveFeedProps {
  events: LiveFeedEvent[];
}

const LiveFeed: React.FC<LiveFeedProps> = ({ events }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex flex-col">
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Live Feed</h3>
      <div className="flex-grow overflow-y-auto pr-2 -mr-2 h-96">
        <ul className="space-y-4">
          {events.map((event, index) => (
            <li key={index} className="flex items-start">
              <div className={`p-2 rounded-full mr-3 mt-1 ${event.color}`}>
                <event.icon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-grow">
                <p className="text-sm text-gray-800 dark:text-gray-200">{event.message}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{event.time}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default LiveFeed;