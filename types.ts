export enum CaseType {
  GUGATAN = 'Gugatan',
  PERMOHONAN = 'Permohonan',
}

export enum MinutationStatus {
  BELUM = 'Belum Minutasi',
  SUDAH = 'Sudah Minutasi',
}

export interface PhysicalLocation {
  ruang: string;
  rak: string;
  laci: string;
  box: string;
}

export interface CaseData {
  id: string;
  caseNumber: string; // No. Perkara
  year: number;
  type: CaseType;
  classification: string; // e.g., "Wanprestasi", "Perceraian"
  
  // Specific to Gugatan
  parties?: string; // Para Pihak (Penggugat vs Tergugat)
  dateBHT?: string; // Berkekuatan Hukum Tetap

  dateDecision: string; // Tgl. Putus
  
  status: MinutationStatus;
  location?: PhysicalLocation; // Only if status === SUDAH
  pdfUrl?: string; // URL to the stored PDF
}

export interface SearchFilters {
  caseNumber: string;
  type: CaseType | '';
  year: string;
}