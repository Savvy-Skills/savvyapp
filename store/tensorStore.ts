import { create } from 'zustand';
import TFInstance from '../utils/TFInstance';
import { Column } from '@/types/table';
// import { workerScript } from '@/utils/tfworker';
import { Platform } from 'react-native';

const MESSAGE_TYPE_ERROR = "error";
const MESSAGE_TYPE_TRAIN_UPDATE = "train_update";
const MESSAGE_TYPE_TRAIN_END = "train_end";
const MESSAGE_TYPE_INIT = "init";
const MESSAGE_TYPE_PREDICTION_RESULT = "prediction_result";

// If Platform.OS is web, use the workerScript from the utils folder
const workerScript = Platform.OS === "web" ? require("@/utils/tfworker").workerScript : null;


interface TFStore {
	tfWorker: Worker | null;
	workerReady: boolean;
	initializeWorker: () => Promise<void>;
	tfInstance: TFInstance | null;
	setTfInstance: (tfInstance: TFInstance) => void;
	initializeInstance: () => Promise<void>;
	error: string | null;
	currentModelId: string | null;
	currentState: {
		[key: string]: {
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
	}
	setCurrentState: (modelId: string, state: TFStore["currentState"][string]) => void;
	setModelState: (modelId: string, state: TFStore["currentState"][string]["model"]) => void;
	setTrainingState: (modelId: string, state: TFStore["currentState"][string]["training"]) => void;
	setDataState: (modelId: string, state: TFStore["currentState"][string]["data"]) => void;
	setCurrentModelId: (modelId: string) => void;
	instanceReady: boolean;
}

interface WorkerMessage {
	from: "worker" | "main";
	type: typeof MESSAGE_TYPE_INIT | typeof MESSAGE_TYPE_ERROR | typeof MESSAGE_TYPE_TRAIN_UPDATE | typeof MESSAGE_TYPE_TRAIN_END | typeof MESSAGE_TYPE_PREDICTION_RESULT;
	modelId: string;
	data?: any;
}

export const useTFStore = create<TFStore>((set, get) => ({
	tfWorker: null,
	workerReady: false,
	error: null,
	currentModelId: null,
	tfInstance: null,
	instanceReady: false,
	setTfInstance: (tfInstance: TFInstance | null) => {
		if (tfInstance) {
			// Setup event handlers for mobile instance
			console.log("Setting up event handlers for mobile instance");
			tfInstance.on('init', () => set({ instanceReady: true }));
			tfInstance.on('error', (error: any) => set({ error }));
			tfInstance.on('train_update', (data: any) => {
				const { transcurredEpochs, loss, accuracy, modelHistory, testData } = data;
				console.log("Training update", testData);
				const modelId = get().currentModelId;
				if (modelId) {
					set({
						currentState: {
							...get().currentState,
							[modelId]: {
								...get().currentState[modelId],
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
						}
					});
				}
			});
			tfInstance.on('train_end', (data: any) => {
				const modelId = get().currentModelId;
				if (modelId) {
					set({
						currentState: {
							...get().currentState,
							[modelId]: {
								...get().currentState[modelId],
								model: {
									...get().currentState[modelId]?.model,
									training: false,
									completed: true,
								}
							}
						}
					});
				}
			});
			tfInstance.on('prediction_result', (data: any) => {
				const modelId = get().currentModelId;
				if (modelId) {
					set({
						currentState: {
							...get().currentState,
							[modelId]: {
								...get().currentState[modelId],
								model: {
									...get().currentState[modelId]?.model,
									prediction: data.predictionResult,
								},
							}
						}
					});
				}
			});
		}
		set({ tfInstance });
	},
	initializeInstance: async () => {
		const tfInstance = new TFInstance();
		get().setTfInstance(tfInstance);
	},
	setCurrentModelId: (modelId: string) => {
		set({ currentModelId: modelId });
	},
	initializeWorker: async () => {
		if (Platform.OS === "web") {
			// Existing web worker initialization
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
								const modelId = message.modelId;
								set({
									currentState: {
										...get().currentState,
										[modelId]: {
											...get().currentState[modelId],
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
									}
								})
								break;
							case MESSAGE_TYPE_TRAIN_END:
								set({
									currentState: {
										...get().currentState,
										[message.modelId]: {
											...get().currentState[message.modelId],
											model: {
												...get().currentState[message.modelId]?.model,
												training: false,
												completed: true,
											}
										}
									}
								})
								break;
							case MESSAGE_TYPE_PREDICTION_RESULT:
								console.log({message})
								set({
									currentState: {
										...get().currentState,
										[message.modelId]: {
											...get().currentState[message.modelId],
											model: {
												...get().currentState[message.modelId]?.model,
												prediction: message.data.predictionResult,
											},
										}
									}
								})
								break;
						}
					}
				};
				set({ tfWorker: worker });
			}
		} else {
			// Initialize mobile instance
			await get().initializeInstance();
		}
	},
	currentState: {},
	setCurrentState: (modelId: string, state: TFStore["currentState"][string]) => {
		set({ 
			currentState: {
				...get().currentState,
				[modelId]: state
			}
		});
	},
	setModelState: (modelId: string, state: TFStore["currentState"][string]["model"]) => {
		set({ 
			currentState: {
				...get().currentState,
				[modelId]: {
					...get().currentState[modelId],
					model: state
				}
			}
		});
	},
	setTrainingState: (modelId: string, state: TFStore["currentState"][string]["training"]) => {
		set({ 
			currentState: {
				...get().currentState,
				[modelId]: {
					...get().currentState[modelId],
					training: state
				}
			}
		});
	},
	setDataState: (modelId: string, state: TFStore["currentState"][string]["data"]) => {
		set({ 
			currentState: {
				...get().currentState,
				[modelId]: {
					...get().currentState[modelId],
					data: state
				}
			}
		});
	}
}));