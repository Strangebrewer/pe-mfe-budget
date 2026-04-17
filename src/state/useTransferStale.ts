import { create } from 'zustand';

type TransferStaleStore = {
  isTransferStale: boolean;
  markTransferStale: () => void;
  clearTransferStale: () => void;
}

export const useTransferStaleStore = create<TransferStaleStore>((set) => ({
  isTransferStale: true,
  markTransferStale: () => set({ isTransferStale: true }),
  clearTransferStale: () => set({ isTransferStale: false }),
}));
