import {create} from 'zustand';
import { TFInstance } from '../utils/TFInstance';

interface TFStore {
  tfInstance: TFInstance | null;
  tfReady: boolean;
  initializeTF: () => Promise<void>;
  currentState: {
	model: {
		training: boolean;
		completed: boolean;
		paused: boolean;
	}
	training: {
		transcurredEpochs: number;
		loss: number;
		accuracy: number;
		modelHistory: any[];
	}
  }
  setCurrentState: (state: TFStore["currentState"]) => void;
}

export const useTFStore = create<TFStore>((set, get) => ({
  tfInstance: null,
  tfReady: false,
  initializeTF: async () => {
    const instance = TFInstance.getInstance();
    await instance.initialize();
	if (!instance){
		setTimeout(() => {
			get().initializeTF();
		}, 1000);
	}
    set({ tfInstance: instance, tfReady: true });
  },
  currentState:{
	model: {
		training: false,
		completed: false,
		paused: false,
	},
	training: {
		transcurredEpochs: 0,
		loss: 0,
		accuracy: 0,
		modelHistory: [],
	},
  },
  setCurrentState: (state: TFStore["currentState"]) => {
	set({ currentState: state });
  }
}));
