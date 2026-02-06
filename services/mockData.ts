import { CaseData, CaseType, MinutationStatus } from '../types';

export const INITIAL_CASES: CaseData[] = [
  {
    id: '1',
    caseNumber: '120/Pdt.G/2023/PN.Jkt.Pst',
    year: 2023,
    type: CaseType.GUGATAN,
    classification: 'Wanprestasi',
    parties: 'PT. Maju Mundur vs CV. Abadi Jaya',
    dateDecision: '2023-11-15',
    dateBHT: '2023-12-01',
    status: MinutationStatus.BELUM,
  },
  {
    id: '2',
    caseNumber: '45/Pdt.P/2024/PN.Jkt.Pst',
    year: 2024,
    type: CaseType.PERMOHONAN,
    classification: 'Ganti Nama',
    dateDecision: '2024-01-20',
    status: MinutationStatus.SUDAH,
    location: {
      ruang: 'R. Arsip 1',
      rak: 'A-04',
      laci: '2',
      box: '115'
    },
    pdfUrl: '#'
  },
  {
    id: '3',
    caseNumber: '88/Pdt.G/2023/PN.Jkt.Pst',
    year: 2023,
    type: CaseType.GUGATAN,
    classification: 'Perbuatan Melawan Hukum',
    parties: 'Budi Santoso vs Ahmad Dani',
    dateDecision: '2023-10-10',
    dateBHT: '2023-10-25',
    status: MinutationStatus.BELUM,
  }
];