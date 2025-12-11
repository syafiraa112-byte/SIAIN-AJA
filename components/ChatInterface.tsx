import React, { useEffect, useRef } from 'react';
import { Message } from '../types';

interface ChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, isLoading }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-white rounded-2xl shadow-sm border border-gray-100">
      {messages.length === 0 && (
        <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 opacity-20">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
          </svg>
          <p className="text-center">How can the MediRouter help you today?</p>
        </div>
      )}

      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[80%] rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-sm
              ${msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : msg.isRouting 
                  ? 'bg-yellow-50 border border-yellow-200 text-yellow-800 animate-pulse' 
                  : 'bg-gray-100 text-gray-800 rounded-bl-none'
              }
            `}
          >
            {msg.text && <p>{msg.text}</p>}
            
            {/* Display structured function calls nicely */}
            {msg.functionCall && (
              <div className="mt-2 pt-2 border-t border-gray-200/20 text-xs font-mono opacity-90">
                <div className="flex items-center gap-1 mb-1 font-bold">
                  <span className="w-2 h-2 rounded-full bg-green-400"></span>
                  ROUTING CONFIRMED: {msg.functionCall.name}
                </div>
                <pre className="overflow-x-auto">
                  {JSON.stringify(msg.functionCall.args, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-gray-100 rounded-2xl rounded-bl-none px-5 py-3 flex items-center space-x-2">
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></span>
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></span>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatInterface;