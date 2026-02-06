import React, { useState, useEffect, useRef } from 'react';
import { 
  CaseType, 
  MinutationStatus, 
  CaseData, 
  SearchFilters, 
  PhysicalLocation 
} from './types';
import { INITIAL_CASES } from './services/mockData';
import { generateCaseSummary } from './services/geminiService';
import { 
  SearchIcon, 
  QrCodeIcon, 
  FileTextIcon, 
  ArchiveIcon, 
  CheckCircleIcon,
  XIcon,
  SparklesIcon,
  UploadCloudIcon
} from './components/Icons';

const App: React.FC = () => {
  // State
  const [cases, setCases] = useState<CaseData[]>(INITIAL_CASES);
  const [filters, setFilters] = useState<SearchFilters>({
    caseNumber: '',
    type: '',
    year: '',
  });
  const [isScanning, setIsScanning] = useState(false);
  const [selectedCase, setSelectedCase] = useState<CaseData | null>(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editLocation, setEditLocation] = useState<PhysicalLocation>({
    ruang: '', rak: '', laci: '', box: ''
  });
  const [editStatus, setEditStatus] = useState<MinutationStatus>(MinutationStatus.BELUM);
  const [tempFile, setTempFile] = useState<File | null>(null);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Handlers
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const startScan = () => {
    setIsScanning(true);
    // Simulate a successful scan after 2 seconds
    setTimeout(() => {
      setFilters({
        caseNumber: '120/Pdt.G/2023/PN.Jkt.Pst',
        type: CaseType.GUGATAN,
        year: '2023'
      });
      setIsScanning(false);
      alert('QR Code Terdeteksi: Data formulir telah diisi otomatis.');
    }, 2000);
  };

  const openDetail = (item: CaseData) => {
    setSelectedCase(item);
    setEditStatus(item.status);
    setEditLocation(item.location || { ruang: '', rak: '', laci: '', box: '' });
    setTempFile(null);
    setAiSummary('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCase(null);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEditStatus(e.target.value as MinutationStatus);
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditLocation(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setTempFile(e.target.files[0]);
    }
  };

  const saveMinutation = () => {
    if (!selectedCase) return;

    const updatedCases = cases.map(c => {
      if (c.id === selectedCase.id) {
        return {
          ...c,
          status: editStatus,
          location: editStatus === MinutationStatus.SUDAH ? editLocation : undefined,
          pdfUrl: tempFile ? URL.createObjectURL(tempFile) : c.pdfUrl
        };
      }
      return c;
    });

    setCases(updatedCases);
    closeModal();
    // Simulate DB update
    console.log("Saving to Firestore...", {
      id: selectedCase.id,
      status: editStatus,
      location: editLocation
    });
  };

  const handleGenerateSummary = async () => {
    if (!selectedCase) return;
    setIsAiLoading(true);
    const summary = await generateCaseSummary(selectedCase);
    setAiSummary(summary);
    setIsAiLoading(false);
  };

  // Filter Logic
  const filteredCases = cases.filter(item => {
    const matchNo = item.caseNumber.toLowerCase().includes(filters.caseNumber.toLowerCase());
    const matchType = filters.type ? item.type === filters.type : true;
    const matchYear = filters.year ? item.year.toString() === filters.year : true;
    return matchNo && matchType && matchYear;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-blue-900 text-white shadow-lg sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ArchiveIcon className="w-8 h-8 text-blue-300" />
            <div>
              <h1 className="text-xl font-bold tracking-tight">E-Minutasi</h1>
              <p className="text-xs text-blue-200">Arsip Digital Pengadilan Negeri</p>
            </div>
          </div>
          <div className="text-sm font-medium bg-blue-800 px-3 py-1 rounded-full">
            Petugas: Admin
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-5xl">
        
        {/* Search Section */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-800">Pencarian & Scan Berkas</h2>
            <button 
              onClick={startScan}
              disabled={isScanning}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isScanning 
                ? 'bg-blue-100 text-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
              }`}
            >
              <QrCodeIcon className="w-5 h-5" />
              <span>{isScanning ? 'Memindai...' : 'Scan QR Code'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">No. Perkara</label>
              <div className="relative">
                <input 
                  type="text" 
                  name="caseNumber"
                  value={filters.caseNumber}
                  onChange={handleFilterChange}
                  placeholder="Contoh: 120/Pdt.G..."
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                />
                <SearchIcon className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Jenis Perkara</label>
              <select 
                name="type" 
                value={filters.type}
                onChange={handleFilterChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all outline-none"
              >
                <option value="">Semua Jenis</option>
                <option value={CaseType.GUGATAN}>{CaseType.GUGATAN}</option>
                <option value={CaseType.PERMOHONAN}>{CaseType.PERMOHONAN}</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Tahun</label>
              <input 
                type="number" 
                name="year"
                value={filters.year}
                onChange={handleFilterChange}
                placeholder="2024"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              />
            </div>
          </div>
        </section>

        {/* Results Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-600 font-medium">Hasil Pencarian ({filteredCases.length})</h3>
          </div>

          <div className="grid gap-4">
            {filteredCases.map((item) => (
              <div 
                key={item.id}
                className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => openDetail(item)}
              >
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                  
                  {/* Left Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                        item.type === CaseType.GUGATAN ? 'bg-orange-100 text-orange-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {item.type}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">{item.year}</span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {item.caseNumber}
                    </h4>
                    <p className="text-sm text-slate-600 mb-1">{item.classification}</p>
                    
                    {/* Conditional Fields based on Type */}
                    {item.type === CaseType.GUGATAN && (
                      <div className="text-sm text-slate-500 mt-2 p-2 bg-slate-50 rounded">
                        <span className="font-semibold text-slate-700">Para Pihak:</span> {item.parties}
                      </div>
                    )}
                  </div>

                  {/* Right Info / Status */}
                  <div className="flex flex-col md:items-end gap-2 md:w-1/3">
                    <div className="flex flex-col md:items-end text-sm text-slate-500">
                      <span>Putus: <span className="font-medium text-slate-800">{item.dateDecision}</span></span>
                      {item.type === CaseType.GUGATAN && (
                        <span>BHT: <span className="font-medium text-slate-800">{item.dateBHT || '-'}</span></span>
                      )}
                    </div>
                    
                    <div className={`mt-2 flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${
                      item.status === MinutationStatus.SUDAH
                      ? 'bg-green-50 border-green-200 text-green-700'
                      : 'bg-gray-100 border-gray-200 text-gray-600'
                    }`}>
                      {item.status === MinutationStatus.SUDAH ? (
                         <CheckCircleIcon className="w-4 h-4 mr-2" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-gray-400 mr-2 border-t-transparent animate-spin-slow" />
                      )}
                      {item.status}
                    </div>
                  </div>

                </div>
              </div>
            ))}
            
            {filteredCases.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                <FileTextIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">Data perkara tidak ditemukan.</p>
                <p className="text-sm text-slate-400">Silakan gunakan kata kunci lain atau scan QR Code.</p>
              </div>
            )}
          </div>
        </section>

        {/* Mock Camera View if Scanning */}
        {isScanning && (
          <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md aspect-square bg-slate-900 rounded-3xl overflow-hidden relative border-2 border-blue-500 shadow-2xl animate-pulse">
               <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-white text-sm font-medium bg-black/50 px-4 py-2 rounded-full">Mencari QR Code...</p>
               </div>
               <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,1)] animate-scan"></div>
            </div>
            <p className="text-white mt-8 font-medium">Arahkan kamera ke QR Code pada berkas</p>
            <button 
              onClick={() => setIsScanning(false)}
              className="mt-8 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-sm transition-all"
            >
              Batal
            </button>
          </div>
        )}

      </main>

      {/* Detail Modal */}
      {isModalOpen && selectedCase && (
        <div className="fixed inset-0 z-40 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={closeModal} />

            <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
              
              {/* Modal Header */}
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 leading-6">Detail Minutasi</h3>
                  <p className="text-sm text-slate-500 mt-1">{selectedCase.caseNumber}</p>
                </div>
                <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-200 transition-colors">
                  <XIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
                
                {/* AI Summary Section */}
                <div className="mb-6 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4 border border-blue-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center text-indigo-700 gap-2">
                       <SparklesIcon className="w-5 h-5" />
                       <span className="font-semibold text-sm">AI Smart Summary</span>
                    </div>
                    {!aiSummary && (
                      <button 
                        onClick={handleGenerateSummary}
                        disabled={isAiLoading}
                        className="text-xs bg-white text-indigo-600 px-3 py-1.5 rounded-md border border-indigo-200 shadow-sm hover:shadow hover:bg-indigo-50 transition-all font-medium disabled:opacity-50"
                      >
                        {isAiLoading ? 'Memproses...' : 'Buat Ringkasan'}
                      </button>
                    )}
                  </div>
                  {isAiLoading ? (
                    <div className="space-y-2 animate-pulse">
                      <div className="h-2 bg-indigo-200 rounded w-3/4"></div>
                      <div className="h-2 bg-indigo-200 rounded w-1/2"></div>
                    </div>
                  ) : aiSummary ? (
                    <p className="text-sm text-slate-700 leading-relaxed italic border-l-2 border-indigo-300 pl-3">
                      "{aiSummary}"
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500">Klik tombol untuk membuat ringkasan otomatis data perkara ini menggunakan Gemini AI.</p>
                  )}
                </div>

                {/* Status Toggle */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Status Minutasi</label>
                  <select 
                    value={editStatus}
                    onChange={handleStatusChange}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 bg-white"
                  >
                    <option value={MinutationStatus.BELUM}>{MinutationStatus.BELUM}</option>
                    <option value={MinutationStatus.SUDAH}>{MinutationStatus.SUDAH}</option>
                  </select>
                </div>

                {/* Location Inputs (Conditional) */}
                {editStatus === MinutationStatus.SUDAH && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6 animate-fadeIn">
                    <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center">
                      <ArchiveIcon className="w-4 h-4 mr-2" />
                      Lokasi Penyimpanan Fisik
                    </h4>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                       <div>
                         <label className="text-xs text-slate-500 font-semibold uppercase mb-1 block">Ruangan</label>
                         <input 
                            name="ruang" 
                            value={editLocation.ruang} 
                            onChange={handleLocationChange}
                            placeholder="Contoh: R. Arsip 1"
                            className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                          />
                       </div>
                       <div>
                         <label className="text-xs text-slate-500 font-semibold uppercase mb-1 block">Lemari / Rak</label>
                         <input 
                            name="rak" 
                            value={editLocation.rak} 
                            onChange={handleLocationChange}
                            placeholder="A-05"
                            className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                          />
                       </div>
                       <div>
                         <label className="text-xs text-slate-500 font-semibold uppercase mb-1 block">Tingkat / Laci</label>
                         <input 
                            name="laci" 
                            value={editLocation.laci} 
                            onChange={handleLocationChange}
                            placeholder="2"
                            className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                          />
                       </div>
                       <div>
                         <label className="text-xs text-slate-500 font-semibold uppercase mb-1 block">No. Box</label>
                         <input 
                            name="box" 
                            value={editLocation.box} 
                            onChange={handleLocationChange}
                            placeholder="112"
                            className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                          />
                       </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200">
                      <label className="text-sm font-bold text-slate-700 mb-2 block">File Digital (Scan PDF)</label>
                      <div className="flex items-center gap-4">
                        <label className="cursor-pointer bg-white border border-blue-300 text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors flex items-center shadow-sm">
                          <UploadCloudIcon className="w-4 h-4 mr-2" />
                          Upload Berkas
                          <input type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
                        </label>
                        {tempFile && <span className="text-sm text-green-600 font-medium truncate">{tempFile.name}</span>}
                        {selectedCase.pdfUrl && !tempFile && (
                          <a 
                            href={selectedCase.pdfUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-sm text-blue-600 hover:underline flex items-center"
                          >
                            <FileTextIcon className="w-4 h-4 mr-1" />
                            Lihat File Tersimpan
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex flex-row-reverse gap-3">
                <button 
                  onClick={saveMinutation}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors"
                >
                  Simpan Perubahan
                </button>
                <button 
                  onClick={closeModal}
                  className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-5 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Batal
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;