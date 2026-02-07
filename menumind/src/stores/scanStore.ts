import { create } from 'zustand';
import { createScan, readImageAsBase64, analyzeMenu, fetchScanHistory, fetchScanDetail } from '../services/scans';
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
  debugLogs: string[];
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
  debugLogs: [],
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

    const log = (msg: string) => {
      set((state) => ({
        currentScan: {
          ...state.currentScan,
          debugLogs: [...state.currentScan.debugLogs, `${new Date().toLocaleTimeString()} ${msg}`],
        },
      }));
    };

    try {
      log(`Image URI: ${imageUri.substring(0, 60)}...`);

      // Create scan record
      set((state) => ({
        currentScan: { ...state.currentScan, status: 'uploading', uploadProgress: 10 },
      }));

      log('Creating scan record...');
      const scan = await createScan(imageUri);
      log(`Scan created: ${scan.id}`);
      set((state) => ({
        currentScan: { ...state.currentScan, scanId: scan.id, uploadProgress: 30 },
      }));

      // Read image as base64 directly (skip storage upload)
      log('Reading image as base64...');
      const imageBase64 = await readImageAsBase64(imageUri);
      const sizeKB = Math.round(imageBase64.length * 0.75 / 1024);
      log(`Base64 ready: ${imageBase64.length} chars (~${sizeKB} KB)`);
      set((state) => ({
        currentScan: { ...state.currentScan, status: 'analyzing', uploadProgress: 60 },
      }));

      // Analyze via Edge Function with base64 image inline
      log('Calling Edge Function...');
      const results = await analyzeMenu(scan.id, imageBase64, dietaryProfile);
      log(`Analysis complete: ${results.dishes?.length ?? 0} dishes found`);

      // Fetch the saved items from database
      log('Fetching saved items...');
      const { items } = await fetchScanDetail(scan.id);
      log(`Got ${items.length} items from DB`);

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
      log(`ERROR: ${message}`);
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
