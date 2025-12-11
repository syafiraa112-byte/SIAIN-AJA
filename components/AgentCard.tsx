import React from 'react';
import { AgentCardProps } from '../types';

const AgentCard: React.FC<AgentCardProps> = ({ isActive, name, description, icon }) => {
  return (
    <div 
      className={`
        relative overflow-hidden rounded-xl p-4 transition-all duration-500 ease-in-out border
        ${isActive 
          ? 'bg-white border-blue-500 shadow-lg scale-105 ring-2 ring-blue-200' 
          : 'bg-gray-50 border-gray-200 opacity-60 hover:opacity-100 hover:scale-[1.02]'
        }
      `}
    >
      <div className="flex items-start space-x-3">
        <div className={`p-2 rounded-lg ${isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'}`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className={`font-semibold text-sm ${isActive ? 'text-gray-900' : 'text-gray-700'}`}>
            {name}
          </h3>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
      
      {/* Active Indicator Pulse */}
      {isActive && (
        <div className="absolute top-2 right-2 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
        </div>
      )}
    </div>
  );
};

export default AgentCard;