import { create } from 'zustand';
import { createScan, uploadMenuPhoto, analyzeMenu, fetchScanHistory, fetchScanDetail } from '../services/scans';
import type { ScanItem, ScanSummary, ScanStatus, DietaryProfile } from '../types';
import type { AnalysisResponse } from '../types/analysis';

interface CurrentScan {
  imageUri: string | null;
  compressedUri: string | null;
  uploadProgress: number;
  status: ScanStatus | 'idle' | 'compressing';
  scanId: string | null;
  results: AnalysisResponse | null;
  items: ScanItem[];
  error: string | null;
}

interface ScanStore {
  currentScan: CurrentScan;
  history: ScanSummary[];
  historyLoading: boolean;

  // Current scan actions
  setImage: (uri: string) => void;
  setCompressedImage: (uri: string) => void;
  startAnalysis: (dietaryProfile: DietaryProfile) => Promise<void>;
  cancelScan: () => void;
  resetCurrentScan: () => void;

  // History actions
  fetchHistory: () => Promise<void>;
  fetchScanItems: (scanId: string) => Promise<ScanItem[]>;
}

const initialScan: CurrentScan = {
  imageUri: null,
  compressedUri: null,
  uploadProgress: 0,
  status: 'idle',
  scanId: null,
  results: null,
  items: [],
  error: null,
};

export const useScanStore = create<ScanStore>((set, get) => ({
  currentScan: { ...initialScan },
  history: [],
  historyLoading: false,

  setImage: (uri) =>
    set({ currentScan: { ...initialScan, imageUri: uri } }),

  setCompressedImage: (uri) =>
    set((state) => ({
      currentScan: { ...state.currentScan, compressedUri: uri },
    })),

  startAnalysis: async (dietaryProfile) => {
    const { currentScan } = get();
    const imageUri = currentScan.compressedUri || currentScan.imageUri;
    if (!imageUri) throw new Error('No image selected');

    try {
      // Create scan record
      set((state) => ({
        currentScan: { ...state.currentScan, status: 'uploading', uploadProgress: 10 },
      }));

      const scan = await createScan(imageUri);
      set((state) => ({
        currentScan: { ...state.currentScan, scanId: scan.id, uploadProgress: 30 },
      }));

      // Upload photo
      const imagePath = await uploadMenuPhoto(imageUri, scan.id);
      set((state) => ({
        currentScan: { ...state.currentScan, status: 'analyzing', uploadProgress: 60 },
      }));

      // Analyze via Edge Function
      const results = await analyzeMenu(scan.id, imagePath, dietaryProfile);

      // Fetch the saved items from database
      const { items } = await fetchScanDetail(scan.id);

      set((state) => ({
        currentScan: {
          ...state.currentScan,
          status: 'complete',
          uploadProgress: 100,
          results,
          items,
        },
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Analysis failed';
      set((state) => ({
        currentScan: { ...state.currentScan, status: 'error', error: message },
      }));
      throw err;
    }
  },

  cancelScan: () => set({ currentScan: { ...initialScan } }),
  resetCurrentScan: () => set({ currentScan: { ...initialScan } }),

  fetchHistory: async () => {
    set({ historyLoading: true });
    try {
      const history = await fetchScanHistory();
      set({ history });
    } finally {
      set({ historyLoading: false });
    }
  },

  fetchScanItems: async (scanId) => {
    const { items } = await fetchScanDetail(scanId);
    return items;
  },
}));
