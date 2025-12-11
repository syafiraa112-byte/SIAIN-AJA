const { GoogleGenAI } = require("@google/genai");

// Re-defining system instructions here for the backend context
const SYSTEM_INSTRUCTION = `
You are the Central Coordinator for a medical system. Your job is to route user requests to one of four specialized agents.

# OPERATIONAL PROTOCOLS

1.  **Strict Mode (Mode Ketat):** Your output must ALWAYS be a **single function call**. Do not produce free text unless the request is invalid.
2.  **Failure Protocol (Protokol Kegagalan):** If the user request is **unclear** or **does not fit** the four specialized functions, provide a polite, short free text response asking for clarification (e.g., "Please specify what you are looking for. I cannot route this request.").
3.  **Security Priority:** If the request touches sensitive data without context/permission, route to 'manage_patient_info' to handle verification.

# PANDUAN INTEGRASI TEKNIS (KHUSUS UNTUK BACKEND)

Anda harus beroperasi seolah-olah Anda adalah bagian dari alur Function Calling yang ketat.

1.  **Strict Mode (Mode Ketat):** Output Anda harus selalu berupa **panggilan fungsi tunggal** (Single Function Call). Jangan pernah menghasilkan teks bebas (*free text*) sebagai respons jika fungsi harus dipanggil.
2.  **Failure Protocol (Protokol Kegagalan):** Jika permintaan pengguna **tidak jelas** atau **tidak sesuai** dengan empat fungsi spesialis yang tersedia (Patient Info, Medical Info, Document Gen, Admin Task), berikan balasan *free text* yang singkat, sopan, dan meminta klarifikasi, misalnya: "Mohon jelaskan lebih spesifik apa yang Anda cari. Permintaan Anda saat ini tidak dapat dirutekan ke agen spesialis."
3.  **Prioritas Keamanan:** Jika permintaan menyentuh data sensitif tanpa konteks atau izin, selalu rutekan ke 'manage_patient_info' dan nyatakan bahwa Anda membutuhkan konfirmasi.
`;

// Define functions locally for the backend
const functionDeclarations = [
    {
        name: "manage_patient_info",
        description: "Mengelola pertanyaan terkait pasien, janji temu, dan pendaftaran.",
        parameters: { type: "object", properties: { query: { type: "string" } }, required: ["query"] }
    },
    {
        name: "assist_medical_info",
        description: "Menyediakan dukungan untuk penelitian dan bantuan diagnostik.",
        parameters: { type: "object", properties: { query: { type: "string" } }, required: ["query"] }
    },
    {
        name: "generate_document",
        description: "Membuat dokumen terstruktur seperti laporan atau formulir.",
        parameters: { type: "object", properties: { document_type: { type: "string" }, content_details: { type: "string" } }, required: ["document_type", "content_details"] }
    },
    {
        name: "handle_admin_task",
        description: "Membantu dengan pertanyaan administrasi umum atau kebijakan operasional.",
        parameters: { type: "object", properties: { query: { type: "string" } }, required: ["query"] }
    }
];

exports.handler = async (event, context) => {
    // Verify API Key from Netlify Environment Variables
    const apiKey = process.env.GEMINI_API_KEY; // OR process.env.API_KEY depending on your Netlify setup
    if (!apiKey) {
        console.error("API Key missing on server");
        return { statusCode: 500, body: JSON.stringify({ error: "Server Configuration Error: API_KEY not found." }) };
    }
    
    // Check method and body
    if (event.httpMethod !== "POST" || !event.body) {
        return { statusCode: 405, body: "Method Not Allowed or Missing Body" };
    }
    
    let prompt;
    try {
        const parsed = JSON.parse(event.body);
        prompt = parsed.prompt;
    } catch (e) {
        return { statusCode: 400, body: "Invalid JSON body" };
    }

    try {
        const ai = new GoogleGenAI({ apiKey });

        // Call Gemini API with tools and strict system instructions
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", 
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                tools: [{ functionDeclarations: functionDeclarations }],
                // Low temperature for strict routing
                temperature: 0.2 
            }
        });

        // Return the response object to the frontend
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
        };

    } catch (error) {
        console.error("Gemini API Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Gemini API failed to process request.", details: error.message }),
        };
    }
};