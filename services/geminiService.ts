import { GoogleGenAI } from "@google/genai";
import { CaseData } from "../types";

// Note: In a real app, API Key should be in process.env.API_KEY
// For this environment, we assume process.env.API_KEY is available.

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateCaseSummary = async (caseData: CaseData): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API Key not configured. Unable to generate AI summary.";
  }

  try {
    const prompt = `
      Bertindaklah sebagai asisten panitera pengadilan yang profesional. 
      Buatkan ringkasan singkat (maksimal 2 paragraf) untuk keperluan label arsip minutasi berdasarkan data perkara berikut.
      Gunakan Bahasa Indonesia yang formal.
      
      Data Perkara:
      - Nomor: ${caseData.caseNumber}
      - Jenis: ${caseData.type}
      - Klasifikasi: ${caseData.classification}
      - Tahun: ${caseData.year}
      - Pihak: ${caseData.parties || 'N/A'}
      - Tanggal Putus: ${caseData.dateDecision}
      - Status BHT: ${caseData.dateBHT || 'Belum BHT'}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Gagal membuat ringkasan.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Terjadi kesalahan saat menghubungi layanan AI.";
  }
};