import {create} from 'zustand';

type SnackbarType = 'info' | 'success' | 'error';

interface SnackbarMessage {
  message: string;
  type: SnackbarType;
  duration?: number;
}

interface SnackbarStore {
  visible: boolean;
  message: string;
  type: SnackbarType;
  duration: number;
  showSnackbar: (snackbar: SnackbarMessage) => void;
  hideSnackbar: () => void;
}

export const useSnackbarStore = create<SnackbarStore>((set) => ({
  visible: false,
  message: '',
  type: 'info',
  duration: 3000,
  showSnackbar: ({ message, type = 'info', duration = 3000 }: SnackbarMessage) =>
    set({ visible: true, message, type, duration }),
  hideSnackbar: () => set({ visible: false }),
}));

