import { create } from 'zustand';
import { TFInstance } from '../utils/TFInstance';
import { Column } from '@/types/table';
import { workerScript } from '@/utils/tfworker';

const MESSAGE_TYPE_ERROR = "error";
const MESSAGE_TYPE_TRAIN_UPDATE = "train_update";
const MESSAGE_TYPE_TRAIN_END = "train_end";
const MESSAGE_TYPE_INIT = "init";
const MESSAGE_TYPE_PREDICTION_RESULT = "prediction_result";


interface TFStore {
	//   tfInstance: TFInstance | null;
	tfWorker: Worker | null;
	workerReady: boolean;
	initializeWorker: () => Promise<void>;
	error: string | null;
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

interface WorkerMessage {
	from: "worker" | "main";
	type: typeof MESSAGE_TYPE_INIT | typeof MESSAGE_TYPE_ERROR | typeof MESSAGE_TYPE_TRAIN_UPDATE | typeof MESSAGE_TYPE_TRAIN_END | typeof MESSAGE_TYPE_PREDICTION_RESULT;
	data?: any;
}

export const useTFStore = create<TFStore>((set, get) => ({
	tfWorker: null,
	workerReady: false,
	error: null,
	initializeWorker: async () => {
		if (!get().tfWorker) {
			const worker = new Worker(workerScript);
			worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
				const message = event.data as WorkerMessage;
				if (message.from === "worker") {
					switch (message.type) {
						case MESSAGE_TYPE_INIT:
							set({ workerReady: true });
							break;
						case MESSAGE_TYPE_ERROR:
							set({ error: message.data });
							break;
						case MESSAGE_TYPE_TRAIN_UPDATE:
							const { transcurredEpochs, loss, accuracy, modelHistory, testData } = message.data;
							set({
								currentState: {
									...get().currentState,
									training: {
										transcurredEpochs,
										loss,
										accuracy,
										modelHistory,
									},
									data: {
										testData: testData.data,
										columns: testData.columns,
									}
								}
							})
							break;
						case MESSAGE_TYPE_TRAIN_END:
							set({
								currentState: {
									...get().currentState,
									model: {
										...get().currentState.model,
										training: false,
										completed: true,
									},
									training: {
										...get().currentState.training,
									},
									data: {
										...get().currentState.data,
									}
								}
							})
							break;
						case MESSAGE_TYPE_PREDICTION_RESULT:
							set({
								currentState: {
									...get().currentState,
									model: {
										...get().currentState.model,
										prediction: message.data.predictionResult,
									},
									training: {
										...get().currentState.training,
									},
									data: {
										...get().currentState.data,
									}
								}
							})
							break;
					}
				}
			};
			set({ tfWorker: worker });
		}
	},
	currentState: {
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