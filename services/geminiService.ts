import { GoogleGenerativeAI } from "@google/generative-ai";
import { CaseData } from "../types";

// Vite menggunakan import.meta.env, bukan process.env
// Nama variabel harus sama dengan yang di setting Vercel: VITE_GEMINI_API_KEY
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(API_KEY || '');

export const generateCaseSummary = async (caseData: CaseData): Promise<string> => {
  // Cek apakah API Key sudah terbaca
  if (!API_KEY) {
    console.error("API Key tidak terbaca! Pastikan VITE_GEMINI_API_KEY sudah diset di Vercel.");
    return "API Key belum dikonfigurasi. Hubungi Admin.";
  }

  try {
    // Menggunakan model gemini-1.5-flash yang stabil untuk deployment
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Bertindaklah sebagai asisten panitera pengadilan yang profesional. 
      Buatkan ringkasan sangat singkat (maksimal 3-4 kalimat) untuk label arsip minutasi berdasarkan data perkara berikut.
      Gunakan Bahasa Indonesia formal.
      
      Data Perkara:
      - Nomor: ${caseData.caseNumber}
      - Jenis: ${caseData.type}
      - Klasifikasi: ${caseData.classification}
      - Pihak: ${caseData.parties || 'N/A'}
      - Tanggal Putus: ${caseData.dateDecision}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();

  } catch (error) {
    console.error("Gemini Error:", error);
    return "Terjadi kesalahan saat menghubungi layanan AI.";
  }
};
