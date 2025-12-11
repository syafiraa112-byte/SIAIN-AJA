import { Tool, FunctionDeclaration, Type } from "@google/genai";
import React from 'react';

// Icons for the UI
export const Icons = {
  Coordinator: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Zm.75-12h9v9h-9v-9Z" />
    </svg>
  ),
  Patient: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  ),
  Medical: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  ),
  Document: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  ),
  Admin: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
    </svg>
  )
};

// System Instruction based on user request
export const SYSTEM_INSTRUCTION = `
You are the Central Coordinator for a medical system. Your job is to route user requests to one of four specialized agents.

# OPERATIONAL PROTOCOLS

1.  **Strict Mode (Mode Ketat):** Your output must ALWAYS be a **single function call**. Do not produce free text unless the request is invalid.
2.  **Failure Protocol (Protokol Kegagalan):** If the user request is **unclear** or **does not fit** the four specialized functions, provide a polite, short free text response asking for clarification (e.g., "Please specify what you are looking for. I cannot route this request.").
3.  **Security Priority:** If the request touches sensitive data without context/permission, route to 'manage_patient_info' to handle verification.

# AVAILABLE AGENTS (FUNCTIONS)

- **manage_patient_info**: Handles patient queries, appointments, registration, and sensitive data checks.
- **assist_medical_info**: Support for research, diagnostic help, and medical queries.
- **generate_document**: Creates structured docs like reports or forms.
- **handle_admin_task**: General admin, operational policies, scheduling.

# PANDUAN INTEGRASI TEKNIS (KHUSUS UNTUK BACKEND)

Anda harus beroperasi seolah-olah Anda adalah bagian dari alur Function Calling yang ketat.

1.  **Strict Mode (Mode Ketat):** Output Anda harus selalu berupa **panggilan fungsi tunggal** (Single Function Call). Jangan pernah menghasilkan teks bebas (*free text*) sebagai respons jika fungsi harus dipanggil.
2.  **Failure Protocol (Protokol Kegagalan):** Jika permintaan pengguna **tidak jelas** atau **tidak sesuai** dengan empat fungsi spesialis yang tersedia (Patient Info, Medical Info, Document Gen, Admin Task), berikan balasan *free text* yang singkat, sopan, dan meminta klarifikasi, misalnya: "Mohon jelaskan lebih spesifik apa yang Anda cari. Permintaan Anda saat ini tidak dapat dirutekan ke agen spesialis."
3.  **Prioritas Keamanan:** Jika permintaan menyentuh data sensitif tanpa konteks atau izin, selalu rutekan ke \`manage_patient_info\` dan nyatakan bahwa Anda membutuhkan konfirmasi.
`;

// Tool Definitions mapped to @google/genai types
const managePatientInfo: FunctionDeclaration = {
  name: "manage_patient_info",
  description: "Mengelola pertanyaan terkait pasien, janji temu, dan pendaftaran.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: { type: Type.STRING, description: "The specific patient-related query" }
    },
    required: ["query"]
  }
};

const assistMedicalInfo: FunctionDeclaration = {
  name: "assist_medical_info",
  description: "Menyediakan dukungan untuk penelitian dan bantuan diagnostik.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: { type: Type.STRING, description: "The medical question or research topic" }
    },
    required: ["query"]
  }
};

const generateDocument: FunctionDeclaration = {
  name: "generate_document",
  description: "Membuat dokumen terstruktur seperti laporan atau formulir.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      document_type: { type: Type.STRING, description: "Type of document (e.g., referral, prescription)" },
      content_details: { type: Type.STRING, description: "Details to include in the document" }
    },
    required: ["document_type", "content_details"]
  }
};

const handleAdminTask: FunctionDeclaration = {
  name: "handle_admin_task",
  description: "Membantu dengan pertanyaan administrasi umum atau kebijakan operasional.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: { type: Type.STRING, description: "The admin task or policy question" }
    },
    required: ["query"]
  }
};

export const COORDINATOR_TOOLS: Tool[] = [
  {
    functionDeclarations: [
      managePatientInfo,
      assistMedicalInfo,
      generateDocument,
      handleAdminTask
    ]
  }
];