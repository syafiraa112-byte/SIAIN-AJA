import React from 'react';

export enum AgentType {
  COORDINATOR = 'COORDINATOR',
  PATIENT_INFO = 'manage_patient_info',
  MEDICAL_INFO = 'assist_medical_info',
  DOCUMENT_GEN = 'generate_document',
  ADMIN_TASK = 'handle_admin_task',
}

export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  text?: string;
  functionCall?: {
    name: string;
    args: Record<string, any>;
  };
  timestamp: Date;
  isRouting?: boolean; // To visualize the routing process
}

export interface AgentCardProps {
  type: AgentType;
  isActive: boolean;
  name: string;
  description: string;
  icon: React.ReactNode;
}