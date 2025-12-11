import React, { useState, useCallback } from 'react';
import { Icons } from './constants';
import { AgentType, Message } from './types';
import AgentCard from './components/AgentCard';
import ChatInterface from './components/ChatInterface';
import { routeUserRequest } from './services/geminiService';

const App: React.FC = () => {
  const [activeAgent, setActiveAgent] = useState<AgentType>(AgentType.COORDINATOR);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);
    setActiveAgent(AgentType.COORDINATOR); // Reset to coordinator processing

    try {
      // 1. Send request to Gemini Router
      const response = await routeUserRequest(userMsg.text || '');
      
      const functionCall = response.candidates?.[0]?.content?.parts?.find(p => p.functionCall)?.functionCall;
      const textResponse = response.text;

      if (functionCall) {
        // STRICT MODE: We got a function call, meaning successful routing
        const agentName = functionCall.name;
        
        // Map function name to AgentType enum for UI highlighting
        let routedAgent = AgentType.COORDINATOR;
        if (agentName === 'manage_patient_info') routedAgent = AgentType.PATIENT_INFO;
        if (agentName === 'assist_medical_info') routedAgent = AgentType.MEDICAL_INFO;
        if (agentName === 'generate_document') routedAgent = AgentType.DOCUMENT_GEN;
        if (agentName === 'handle_admin_task') routedAgent = AgentType.ADMIN_TASK;

        setActiveAgent(routedAgent);

        // Add a "Routing" message
        const routingMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: `Routing request to specialized agent: ${agentName}...`,
          isRouting: true,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, routingMsg]);

        // Simulate Agent Execution (Since we don't have the real backend APIs connected in this demo)
        setTimeout(() => {
          const successMsg: Message = {
            id: (Date.now() + 2).toString(),
            role: 'model',
            functionCall: {
              name: agentName,
              args: functionCall.args as Record<string, any>
            },
            text: "Agent successfully received the structured command.",
            timestamp: new Date()
          };
          setMessages(prev => [...prev, successMsg]);
          setIsLoading(false);
        }, 1500); // Fake delay for dramatic effect

      } else {
        // FAILURE PROTOCOL: The model returned text (likely asking for clarification)
        setActiveAgent(AgentType.COORDINATOR);
        const errorMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: textResponse || "I could not process that request. Please try again.",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMsg]);
        setIsLoading(false);
      }

    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'system',
        text: "System Error: Unable to route request. Please check API Key configuration.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
      setIsLoading(false);
    }
  }, [inputValue, isLoading]);

  return (
    <div className="flex h-screen w-full bg-[#f3f4f6] text-gray-800 font-sans">
      
      {/* Sidebar: Agents Overview */}
      <div className="w-96 p-6 flex flex-col border-r border-gray-200 bg-white shadow-sm z-10 hidden md:flex">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-blue-600">{Icons.Coordinator}</span>
            MediRouter
          </h1>
          <p className="text-sm text-gray-500 mt-2">Centralized AI Coordinator</p>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto scrollbar-hide pr-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Active Agents</p>
          
          <AgentCard 
            type={AgentType.PATIENT_INFO} 
            isActive={activeAgent === AgentType.PATIENT_INFO}
            name="Patient Services"
            description="Manage registration, appointments & sensitive data."
            icon={Icons.Patient}
          />
           <AgentCard 
            type={AgentType.MEDICAL_INFO} 
            isActive={activeAgent === AgentType.MEDICAL_INFO}
            name="Medical Assistant"
            description="Diagnostic support & medical research."
            icon={Icons.Medical}
          />
           <AgentCard 
            type={AgentType.DOCUMENT_GEN} 
            isActive={activeAgent === AgentType.DOCUMENT_GEN}
            name="Doc Generator"
            description="Create structured reports & forms."
            icon={Icons.Document}
          />
           <AgentCard 
            type={AgentType.ADMIN_TASK} 
            isActive={activeAgent === AgentType.ADMIN_TASK}
            name="Admin Operations"
            description="Policy questions & general admin."
            icon={Icons.Admin}
          />
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="bg-blue-50 p-4 rounded-xl text-xs text-blue-800 leading-relaxed">
                <strong>System Status:</strong> <span className="text-green-600 font-bold">● Online</span><br/>
                Strict Routing Protocol Active.<br/>
                All interactions are logged for audit.
            </div>
        </div>
      </div>

      {/* Main Area: Chat */}
      <div className="flex-1 flex flex-col h-full max-w-5xl mx-auto">
        {/* Header (Mobile Only) */}
        <div className="md:hidden bg-white p-4 border-b border-gray-200 flex items-center justify-between">
            <h1 className="font-bold text-gray-800">MediRouter</h1>
            <div className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                {activeAgent === AgentType.COORDINATOR ? 'Routing...' : activeAgent.replace(/_/g, ' ')}
            </div>
        </div>

        <div className="flex-1 p-4 md:p-8 flex flex-col h-full">
            <ChatInterface messages={messages} isLoading={isLoading} />

            {/* Input Area */}
            <div className="mt-6">
                <div className="relative flex items-center bg-white rounded-xl shadow-lg border border-gray-100 p-2">
                    <input
                        type="text"
                        className="flex-1 bg-transparent px-4 py-3 outline-none text-gray-700 placeholder-gray-400"
                        placeholder="Ex: Schedule a checkup for John Doe..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        disabled={isLoading}
                        autoFocus
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={isLoading || !inputValue.trim()}
                        className={`
                            p-3 rounded-lg transition-all duration-200 flex items-center justify-center
                            ${isLoading || !inputValue.trim() 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md transform active:scale-95'}
                        `}
                    >
                        {isLoading ? (
                             <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                             </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0 1 21.485 12 59.77 59.77 0 0 1 3.27 20.876L5.999 12Zm0 0h7.5" />
                            </svg>
                        )}
                    </button>
                </div>
                <p className="text-center text-xs text-gray-400 mt-3">
                    MediRouter uses Gemini 2.5 Flash for strict function routing.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default App;