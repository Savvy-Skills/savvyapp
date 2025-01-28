import {create} from 'zustand';
import { TFInstance } from '../utils/TFInstance';
import { Column } from '@/types/table';

interface TFStore {
  tfInstance: TFInstance | null;
  tfReady: boolean;
  initializeTF: () => Promise<void>;
  currentState: {
	model: {
		training: boolean;
		completed: boolean;
		paused: boolean;
		prediction: string | null;
	}
	training: {
		transcurredEpochs: number;
		loss: number;
		accuracy: number;
		modelHistory: any[];
	}
	data: {
		testData: any[];	
		columns: Column[];
	}
  }
  setCurrentState: (state: TFStore["currentState"]) => void;
  setModelState: (state: TFStore["currentState"]["model"]) => void;
  setTrainingState: (state: TFStore["currentState"]["training"]) => void;
  setDataState: (state: TFStore["currentState"]["data"]) => void;
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
	instance.registerStateCallback((newState) => {
		set((state) => ({
			...state,
			currentState: {
				...state.currentState,
				...newState
			}
		}));
	});
    set({ tfInstance: instance, tfReady: true });
  },
  currentState:{
	model: {
		training: false,
		completed: false,
		paused: false,
		prediction: null,
	},
	training: {
		transcurredEpochs: 0,
		loss: 0,
		accuracy: 0,
		modelHistory: [],
	},
	data: {
		testData: [],
		columns: [],
	}
  },
  setCurrentState: (state: TFStore["currentState"]) => {
	set({ currentState: state });
  },
  setModelState: (state: TFStore["currentState"]["model"]) => {
	set({ currentState: { ...get().currentState, model: state } });
  },
  setTrainingState: (state: TFStore["currentState"]["training"]) => {
	set({ currentState: { ...get().currentState, training: state } });
  },
  setDataState: (state: TFStore["currentState"]["data"]) => {
	set({ currentState: { ...get().currentState, data: state } });
  }
}));