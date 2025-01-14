import {create} from 'zustand';
import { TFInstance } from '../utils/TFInstance';

interface TFStore {
  tfInstance: TFInstance | null;
  tfReady: boolean;
  initializeTF: () => Promise<void>;
}

export const useTFStore = create<TFStore>((set) => ({
  tfInstance: null,
  tfReady: false,
  initializeTF: async () => {
    const instance = TFInstance.getInstance();
    await instance.initialize();
    set({ tfInstance: instance, tfReady: true });
  },
}));