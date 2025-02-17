import { TrainConfig } from "@/types/neuralnetwork";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-wasm";
import { setWasmPaths } from "@tensorflow/tfjs-backend-wasm";

interface DataPreparationConfig {
	targetConfig: {
		field: string;
		encoding?: string;
		normalization?: string;
	};
	featureConfig: Array<{
		field: string;
		encoding?: string;
		normalization?: string;
		ordinalConfig?: any[];
	}>;
	testSize: number;
	stratify?: boolean;
}

interface CreateTrainParams {
	data: any[];
	columns: any[];
	modelConfig: ModelConfig;
	trainConfig: TrainConfig;
}

interface ModelConfig {
	problemType: 'classification' | 'regression';
	lastLayerSize: number;
	neuronsPerLayer: number[];
	inputSize: number;
	activationFunction: string;
	kernelInitializer?: string;
	regularization?: string;
	regularizationRate?: number;
	compileOptions?: {
		optimizer: string;
		learningRate: number;
		lossFunction: string;
		metrics: string;
	};
}

interface TrainModelParams {
	model: tf.LayersModel;
	originalData: any[];
	preparedData: {
		trainFeatures: tf.Tensor;
		trainTarget: tf.Tensor;
		testFeatures: tf.Tensor;
	};
	trainConfig: {
		epochs: number;
		shuffle: boolean;
		batchSize: number;
		validationSplit: number;
		dataPreparationConfig: DataPreparationConfig;
	};
	modelConfig: ModelConfig;
	columns: Column[];
}

interface Column {
	accessor: string;
	Header: string;
	dtype: string;
	width: number;
}

interface PreprocessorState {
	featureColumns: string[];
	targetColumn: string | null;
	encoders: any[];
	scalers: any[];
	trainIndices: number[] | null;
	testIndices: number[] | null;
	targetEncoder: any | null;
	targetScaler: any | null;
}

interface PredictionResult {
	predictions: number[];
	originalData: any[];
	modelConfig: ModelConfig;
	columns: Column[];
}

interface CreatePredictionData {
	originalData: any[];
	predictions: tf.Tensor<tf.Rank.R1 | tf.Rank.R2>;
	modelConfig: ModelConfig;
	columns: Column[];
}

class TFInstance {
	private MESSAGE_TYPE_TRAIN_UPDATE = "train_update";
	private MESSAGE_TYPE_TRAIN_END = "train_end";
	private MESSAGE_TYPE_PREDICTION_RESULT = "prediction_result";

	private initialized = false;
	private currentModel: tf.LayersModel | null = null;
	private currentModelMetrics: any[] = [];
	private currentTotalLoss = 0;
	private currentTotalAccuracy = 0;
	private transcurredEpochs = 0;
	private currentDataPreparationConfig: any = null;
	private currentModelConfig: any = null;
	private currentModelId: string | null = null;
	private trainingStop = false;

	private preprocessorState: PreprocessorState = {
		featureColumns: [],
		targetColumn: null,
		encoders: [],
		scalers: [],
		trainIndices: null,
		testIndices: null,
		targetEncoder: null,
		targetScaler: null,
	};

	private eventHandlers: { [key: string]: Function[] } = {};

	constructor() {
		this.init();
	}

	private createScaler(column: any, data: any[]): any {
		let scaler = null;
		const columnData = data.map((row) => row[column.field]);
		if (column.normalization === "minmax") {
			tf.tidy(() => {
				// min and max are numbers, so we need to convert them to numbers
				const min = tf.min(columnData).arraySync() as number;
				const max = tf.max(columnData).arraySync() as number;
				scaler = {
					type: "minmax",
					field: column.field,
					min,
					max,
					decode: (value: number) => value * (max - min) + min,
				};
			});
		} else if (column.normalization === "zscore") {
			tf.tidy(() => {
				const mean = tf.mean(columnData, 0).arraySync() as number;
				const std = tf
					.sqrt(tf.mean(tf.square(tf.sub(columnData, mean)), 0))
					.arraySync() as number;
				scaler = {
					type: "zscore",
					field: column.field,
					mean,
					std,
					decode: (value: number) => value * std + mean,
				};
			});
		}
		return scaler;
	}

	private scaleColumn(columnData: any, scaler: any): tf.Tensor {
		if (scaler.type === "minmax") {
			return tf.tidy(() => {
				return tf
					.div(tf.sub(columnData, scaler.min), tf.sub(scaler.max, scaler.min))
					.expandDims(1);
			});
		} else if (scaler.type === "zscore") {
			return tf.tidy(() => {
				return tf
					.div(tf.sub(columnData, scaler.mean), scaler.std)
					.expandDims(1);
			});
		}
		return tf.tensor2d([]);
	}

	private createEncoder(column: any, data: any[]): any {
		let encoder = {
			field: column.field,
			type: column.encoding,
			map: new Map(),
			inverseMap: new Map(),
			encode: (value: string) => encoder.map.get(value),
			decode: (index: number) => encoder.inverseMap.get(index),
		};

		if (column.ordinalConfig) {
			// If column ordinalConfig, this mean this columns is type ordinal and ordinalConfig are the unique values in order from lowest to highest indexes.
			column.ordinalConfig.forEach((value: string, index: number) => {
				encoder.map.set(value, index);
				encoder.inverseMap.set(index, value);
			});
		} else {
			const uniqueValues = [...new Set(data.map((row) => row[column.field]))];
			// TensorflowJs doesn't have a encoder, so we need to create one, encoder will be an object with a map of value to index, an inverse map of index to value, and a method to encode and decode
			// And the type of the encoder.

			uniqueValues.forEach((value, index) => {
				encoder.map.set(value, index);
				encoder.inverseMap.set(index, value);
			});
		}
		// Create a label encoder for the column, using the unique values as labels
		return encoder;
	}

	private encodeColumn(columnData: any[], encoder: any, target = false): tf.Tensor {
		if (encoder.type === "label") {
			if (target) {
				return tf.tensor1d(columnData.map((value: string) => encoder.encode(value)));
			} else {
				return tf
					.tensor(columnData.map((value: string) => encoder.encode(value)))
					.expandDims(1);
			}
		} else if (encoder.type === "oneHot") {
			// From encoder, we have a map of value to index, so we can create a one-hot encoded column for each value
			// Create array with index values
			const labelEncoded = columnData.map((value: string) => encoder.encode(value));
			// Use tf.oneHot to create the one-hot encoded column, convert back to array
			const oneHotEncoded = tf.oneHot(labelEncoded, encoder.map.size);
			return oneHotEncoded;
		}
		return tf.tensor2d([]);
	}

	private cleanData(data: any[], dataPreparationConfig: DataPreparationConfig): any[] {
		// Check target column for null or undefined, get indices, remove from data.
		const targetColumn = dataPreparationConfig.targetConfig.field;
		const targetColumnIndices = data
			.map((row, index) =>
				!row[targetColumn] ||
					row[targetColumn] === null ||
					row[targetColumn] === undefined ||
					row[targetColumn] === ""
					? index
					: null
			)
			.filter(Boolean);
		data = data.filter((_, index) => !targetColumnIndices.includes(index));
		return data;
	}

	/**
	 * Preprocesses data for machine learning model training by:
	 * 1. Cleaning data
	 * 2. Splitting into train/test sets
	 * 3. Processing features (normalization, encoding)
	 * 4. Processing target variable
	 * 5. Returning formatted tensors for model training
	 */
	private preprocessData(
		data: any[],
		columns: Column[],
		dataPreparationConfig: DataPreparationConfig
	): {
		trainFeatures: tf.Tensor;
		trainTarget: tf.Tensor;
		testFeatures: tf.Tensor;
	} {
		let processedData: tf.Tensor<tf.Rank.R2>;
		// Target can be tensor r2 or tensor1d
		let targetData: tf.Tensor<tf.Rank.R2 | tf.Rank.R1>;

		try {
			// 1. Data Cleaning: Remove rows with invalid target values
			const cleanedData = this.cleanData(data, dataPreparationConfig);
			// 2. Train-Test Split: Get indices for data splitting
			const { trainIndices, testIndices } = this.trainTestSplit(
				cleanedData,
				columns,
				dataPreparationConfig
			);
			// Store split indices for later use in predictions
			this.preprocessorState.trainIndices = trainIndices;
			this.preprocessorState.testIndices = testIndices;

			// 3. Extract Target Column: Get the values we're trying to predict
			const target = cleanedData.map(
				(row) => row[dataPreparationConfig.targetConfig.field]
			);
			// 4. Extract Feature Columns: Create feature objects from raw data
			const features = cleanedData.map((row) => {
				const featureRow = {} as Record<string, any>;
				dataPreparationConfig.featureConfig.forEach((column) => {
					featureRow[column.field] = row[column.field];
				});
				return featureRow;
			});
			// Identify columns that need no transformation
			const featureColumns = Object.keys(features[0]);
			this.preprocessorState.featureColumns = featureColumns;

			// 5. Handle Untransformed Features: Process columns that don't need encoding/normalization
			const nonEncodedNonNormalizedColumns = dataPreparationConfig.featureConfig
				.filter(
					(column) =>
						(!column.encoding || column.encoding === "none") &&
						(!column.normalization || column.normalization === "none")
				)
				.map((column) => column.field);

				
			// Create tensor from raw values of untransformed columns
			const nonEncodedNonNormalizedFeatures = features.map((obj) =>
				nonEncodedNonNormalizedColumns.reduce((acc, key) => {
					acc[key] = obj[key];
					return acc;
				}, {} as Record<string, any>)
			);

			const values = nonEncodedNonNormalizedFeatures.map((feature) => Object.values(feature));
			console.error({ values });


			const nonEncodedNonNormalizedFeaturesTensor = tf.tensor(values, [values.length, values[0].length]);
			console.error({ nonEncodedNonNormalizedFeaturesTensor });

			processedData = nonEncodedNonNormalizedFeaturesTensor as tf.Tensor2D;
			console.error({ processedData });

			// 6. Feature Scaling: Apply normalization to specified columns
			const scaledColumns = dataPreparationConfig.featureConfig.filter(
				(column) => column.normalization && column.normalization !== "none"
			);
			if (scaledColumns.length > 0) {
				// Create and store scalers for each column
				const scalers = scaledColumns.map((column) => this.createScaler(column, data));
				this.preprocessorState.scalers = scalers;

				// Scale features and merge with existing processed data
				const scaledFeatures = scaledColumns.map((column) => {
					const columnData = features.map((row) => row[column.field]);
					return this.scaleColumn(
						columnData,
						scalers.find((scaler) => scaler.field === column.field)
					);
				});
				const mergedScaledFeatures = tf.concat([...scaledFeatures], 1) as tf.Tensor2D;
				processedData = tf.concat([processedData, mergedScaledFeatures], 1) as tf.Tensor2D;
			}

			// 7. Feature Encoding: Convert categorical data to numerical representations
			const encodedColumns = dataPreparationConfig.featureConfig.filter(
				(column) => column.encoding && column.encoding !== "none"
			);
			if (encodedColumns.length > 0) {
				// Create and store encoders for each column
				const encoders = encodedColumns.map((column) =>
					this.createEncoder(column, data)
				);
				this.preprocessorState.encoders = encoders;

				// Encode features and merge with existing processed data
				let encodedFeatures = encodedColumns.map((column) => {
					const encoder = encoders.find(
						(encoder) => encoder.field === column.field
					);
					const columnData = features.map((row) => row[column.field]);
					return {
						field: column.field,
						type: column.encoding,
						data: this.encodeColumn(columnData, encoder),
					};
				});
				const featuresData = encodedFeatures.map((feature) => feature.data);
				const mergedFeatures = tf.concat([...featuresData], 1) as tf.Tensor2D;
				processedData = tf.concat([processedData, mergedFeatures], 1) as tf.Tensor2D;
			}

			// 8. Target Variable Processing: Handle encoding/scaling of prediction target
			if (
				dataPreparationConfig.targetConfig.encoding &&
				dataPreparationConfig.targetConfig.encoding !== "none"
			) {
				// Label encode target variable
				const encoder = this.createEncoder(dataPreparationConfig.targetConfig, data);
				const encodedTarget = this.encodeColumn(target, encoder, true);
				this.preprocessorState.targetEncoder = encoder;
				targetData = encodedTarget as tf.Tensor<tf.Rank.R1 | tf.Rank.R2>;
			} else if (
				dataPreparationConfig.targetConfig.normalization &&
				dataPreparationConfig.targetConfig.normalization !== "none"
			) {
				// Scale target variable
				const scaler = this.createScaler(dataPreparationConfig.targetConfig, data);
				const scaledTarget = this.scaleColumn(target, scaler);
				this.preprocessorState.targetScaler = scaler;
				targetData = scaledTarget as tf.Tensor<tf.Rank.R1 | tf.Rank.R2>;
			} else {
				// Use raw target values
				targetData = tf.tensor2d(target, [target.length, 1]);
			}

			// 9. Create Final Datasets: Split processed data into train/test sets
			const trainFeatures = tf.gather(processedData, trainIndices);
			const testFeatures = tf.gather(processedData, testIndices);
			const trainTarget = tf.gather(targetData, trainIndices);

			// Dispose of tensors to free memory
			processedData.dispose();
			targetData.dispose();

			return {
				trainFeatures,
				trainTarget,
				testFeatures,
			};
		} catch (error) {
			console.error("Error in preprocessData:", error);
			// Clean up tensors if they exist
			throw error;
		}
	}

	private createPredictionData({
		originalData,
		predictions,
		modelConfig,
		columns,
	}: CreatePredictionData): PredictionResult {
		const { testIndices, targetEncoder, targetScaler } = this.preprocessorState;
		const targetColumn = this.currentDataPreparationConfig.targetConfig.field;
		const testData = testIndices ? originalData.filter((_, index) => testIndices.includes(index)) : [];
		// TODO: Handle classification and regression predictions
		let result = {} as PredictionResult;
		if (modelConfig.problemType === "classification") {
			// TODO: Handle classification predictions
			// Check lastLayerSize, if its 1, then its a binary classification, otherwise its a multi-class classification
			const lastLayerSize = modelConfig.lastLayerSize;
			result["columns"] = [
				...columns,
				{
					accessor: "prediction",
					Header: "prediction",
					dtype: "string",
					width: 100,
				},
			];

			if (lastLayerSize === 1) {
				// Binary classification
				const predictionsToBinary = predictions
					.arraySync()
					.map((prediction: number | number[]) => (Array.isArray(prediction) ? (prediction[0] > 0.5 ? 1 : 0) : (prediction > 0.5 ? 1 : 0)));
				const predictionsData = testData.map((data, index) => ({
					...data,
					prediction: targetEncoder.decode(predictionsToBinary[index]),
				}));
				result["predictions"] = predictionsData;
			} else {
				// Multi-class classification, predictions is one-hot tensor, so we need to convert it to an index
				const predictionsToIndex = predictions.argMax(1).arraySync() as number[];
				const predictionsData = testData.map((data, index) => ({
					...data,
					prediction: targetEncoder.decode(predictionsToIndex[index]),
				}));
				result["predictions"] = predictionsData;
			}
		} else if (modelConfig.problemType === "regression") {
			// TODO: Handle regression predictions
			// Check if target is scaled, if it is, then we need to unscale it
			result["columns"] = [
				...columns,
				{
					accessor: "prediction",
					Header: "prediction",
					dtype: "number",
					width: 100,
				},
				{
					accessor: "difference",
					Header: "difference",
					dtype: "number",
					width: 100,
				},
			];
			if (targetScaler) {
				const predictionsArray = predictions.arraySync();
				console.log({ predictionsArray, targetScaler });
				const predictionsData = testData.map((data, index) => {
					const prediction = parseFloat(targetScaler.decode(predictionsArray[index]).toFixed(2));
					const difference = parseFloat((Math.abs(prediction - data[targetColumn])).toFixed(2));
					return {
						...data,
						prediction,
						difference,
					};
				});
				console.log({ predictionsData });
				result["predictions"] = predictionsData;
			} else {
				const predictionsArray = predictions.arraySync() as number[];
				const predictionsData = testData.map((data, index) => ({
					...data,
					prediction: parseFloat(predictionsArray[index].toFixed(2)),
					difference: parseFloat((Math.abs(predictionsArray[index] - data[targetColumn])).toFixed(2)),
				}));
				result["predictions"] = predictionsData;
			}
		}
		// Dispose of tensors to free memory
		predictions.dispose();
		return result;
	}

	private handleInference(inputData: any[]) {
		const { encoders, scalers, targetEncoder, targetScaler } =
			this.preprocessorState;

		const dataPreparationConfig = this.currentDataPreparationConfig;
		let processedData: tf.Tensor<tf.Rank.R2> = tf.tensor2d([]);

		// Extract features from input data based on data preparation config
		const features = inputData.map((row) => {
			const featureRow = {} as Record<string, any>;
			dataPreparationConfig.featureConfig.forEach((column: any) => {
				featureRow[column.field] = row[column.field];
			});
			return featureRow;
		});
		const inputColumns = Object.keys(features[0]);

		// 1. Process raw numerical columns (no encoding/scaling needed)
		const nonEncodedNonScaledColumns = inputColumns.filter(
			(column) =>
				!encoders.map(encoder => encoder.field).includes(column) &&
				!scalers.map(scaler => scaler.field).includes(column)
		);

		if (nonEncodedNonScaledColumns.length > 0) {
			const nonEncodedNonScaledData = nonEncodedNonScaledColumns.map(
				column => features[0][column]
			);
			processedData = tf.tensor2d([nonEncodedNonScaledData]);
		}

		// 2. Process scaled numerical columns
		const scaledColumns = scalers.filter(scaler =>
			inputColumns.includes(scaler.field)
		);

		if (scaledColumns.length > 0) {
			const scaledData = scaledColumns.map((column) => {
				const scaler = scalers.find(scaler => scaler.field === column.field);
				const scaled = this.scaleColumn([Number(features[0][column.field])], scaler);
				return scaled;
			});
			processedData = processedData.shape[0] > 0
				? tf.concat([processedData, tf.stack(scaledData) as tf.Tensor<tf.Rank.R2>], 1)
				: tf.expandDims(scaledData[0], 0);
		}

		// 3. Process encoded categorical columns
		const encodedColumns = encoders.filter(encoder =>
			inputColumns.includes(encoder.field)
		);

		if (encodedColumns.length > 0) {
			const encodedData = encodedColumns.map((column) => {
				const encoder = encoders.find(encoder => encoder.field === column.field);
				return this.encodeColumn([features[0][column.field]], encoder);
			});
			processedData = processedData.shape[0] > 0
				? tf.concat([processedData, tf.stack(encodedData) as tf.Tensor<tf.Rank.R2>], 1)
				: tf.expandDims(encodedData[0], 0);
		}

		// Make prediction using processed input tensor
		const predictions = this.currentModel?.predict(processedData) as tf.Tensor<tf.Rank.R1 | tf.Rank.R2>;
		let predictionResult = null;

		// Process prediction based on problem type
		if (this.currentModelConfig.problemType === "classification") {
			if (this.currentModelConfig.lastLayerSize === 1) {
				// Binary classification: convert probability to 0/1 using 0.5 threshold
				const predictionsToBinary = predictions.arraySync()
					.map(prediction => (Array.isArray(prediction) ? (prediction[0] > 0.5 ? 1 : 0) : (prediction > 0.5 ? 1 : 0)));
				predictionResult = targetEncoder.decode(predictionsToBinary[0]);
			} else {
				// Multi-class classification: take argmax of predictions
				const predictionsToIndex = predictions.argMax(1).arraySync() as number[];
				predictionResult = targetEncoder.decode(predictionsToIndex[0]);
			}
		} else if (this.currentModelConfig.problemType === "regression") {
			// Reverse scaling if target was scaled during preprocessing
			if (targetScaler) {
				const predictionsArray = predictions.arraySync();
				predictionResult = targetScaler.decode(predictionsArray[0]);
			} else {
				predictionResult = predictions.arraySync()[0];
			}
		}

		// Send prediction result back to main thread
		this.emit(this.MESSAGE_TYPE_PREDICTION_RESULT, {
			modelId: this.currentModelId,
			data: { predictionResult },
		});

		// Dispose of tensors to free memory
		processedData.dispose();
		predictions.dispose();
	}

	async trainModel({
		model,
		preparedData,
		originalData,
		trainConfig,
		modelConfig,
		columns,
	}: TrainModelParams) {
		const { trainFeatures, trainTarget, testFeatures } = preparedData;

		await model.fit(trainFeatures, trainTarget, {
			epochs: trainConfig.epochs,
			shuffle: trainConfig.shuffle,
			batchSize: trainConfig.batchSize,
			validationSplit: trainConfig.validationSplit,
			callbacks: {
				onEpochEnd: (epoch, logs) => {
					if (this.trainingStop) {
						model.stopTraining = true;
						this.trainingStop = false;
						return;
					}
					console.log({
						epoch,
						logs,
					});
					this.transcurredEpochs = epoch;
					this.currentTotalLoss += logs?.loss || 0;
					if (logs?.acc) {
						this.currentTotalAccuracy += logs.acc;
					}
					this.currentModelMetrics.push({
						epoch,
						loss: logs?.loss,
						accuracy: logs?.acc ? logs.acc : null,
						val_loss: logs?.val_loss,
						val_accuracy: logs?.val_acc ? logs.val_acc : null,
					});
					const predictions = model.predict(testFeatures) as tf.Tensor<tf.Rank.R1 | tf.Rank.R2>;
					const { columns: columnsData, predictions: predictionsData } =
						this.createPredictionData({
							originalData,
							predictions,
							modelConfig,
							columns,
						});
						console.log()
					this.emit(this.MESSAGE_TYPE_TRAIN_UPDATE, {
						transcurredEpochs: epoch,
						loss: this.currentTotalLoss,
						accuracy: this.currentTotalAccuracy,
						modelHistory: this.currentModelMetrics,
						testData: {
							data: predictionsData,
							columns: columnsData,
						},
					});
				},
				onTrainEnd: () => {
					const predictions = model.predict(testFeatures) as tf.Tensor<tf.Rank.R1 | tf.Rank.R2>;
					const { columns: columnsData, predictions: predictionsData } =
						this.createPredictionData({
							originalData,
							predictions,
							modelConfig,
							columns,
						});
					this.emit(this.MESSAGE_TYPE_TRAIN_END, {
						transcurredEpochs: this.transcurredEpochs,
						loss: this.currentTotalLoss,
						accuracy: this.currentTotalAccuracy,
						modelHistory: this.currentModelMetrics,
						testData: {
							data: predictionsData,
							columns: columnsData,
						},
					});
					trainFeatures.dispose();
					trainTarget.dispose();
					testFeatures.dispose();
					predictions.dispose();
				},
			},
		});
	}


	async createTrain({ data, columns, modelConfig, trainConfig }: CreateTrainParams) {
		if (!this.initialized) {
			await this.init();
		}

		try {
			this.currentDataPreparationConfig = trainConfig.dataPreparationConfig;
			this.currentModelConfig = modelConfig;

			const preparedData = this.preprocessData(data, columns, trainConfig.dataPreparationConfig);
			const model = this.createModel(modelConfig);

		await this.trainModel({
			model,
			preparedData,
			originalData: data,
				trainConfig,
				modelConfig,
				columns
			});
		} catch (error) {
			console.error("Error creating train:", error);
			throw error;
		}
	}

	async init() {
		try {
			// setWasmPaths(
			// 	"https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm/wasm-out/"
			// );
			await tf.ready();
			// await tf.setBackend("wasm")
			this.initialized = true;
			this.emit('init', { message: "TFInstance initialized" });
		} catch (err) {
			console.error("Error initializing TFInstance:", err);
			this.emit('error', { message: "Initialization failed" });
		}
	}

	async predict(inputs: any) {
		if (!this.initialized || !this.currentModel) {
			throw new Error("Model not initialized");
		}
		return this.handleInference([inputs]);
	}

	stopTraining() {
		this.trainingStop = true;
	}

	private emit(type: string, data: any) {
		if (this.eventHandlers[type]) {
			this.eventHandlers[type].forEach(handler => handler(data));
		}
	}

	private getKernelRegularizer(regularization: string, rate: number) {
		if (!regularization) {
			return null;
		}
		regularization = regularization.toLowerCase();
		if (regularization === "l1") {
			return tf.regularizers.l1({ l1: rate });
		} else if (regularization === "l2") {
			return tf.regularizers.l2({ l2: rate });
		} else if (regularization === "l1l2") {
			return tf.regularizers.l1l2({ l1: rate, l2: rate });
		}
		return null;
	}

	private trainTestSplit(data: any[], columns: Column[], dataPreparationConfig: DataPreparationConfig) {
		// Split data into train and test
		const { testSize, stratify } = dataPreparationConfig;
		const totalSamples = data.length;
		const numTestSamples = Math.floor(totalSamples * testSize); // Calculate number of test samples
		console.log({ testSize, stratify, numTestSamples });

		let testIndices: number[] = [];
		let trainIndices: number[] = [];

		if (stratify) {
			const targetColumn = columns.find(
				(column) => column.accessor === dataPreparationConfig.targetConfig.field
			);
			const targetValues = data.map((row) => row[targetColumn?.accessor as string]);
			const uniqueTargetValues = [...new Set(targetValues)];
			uniqueTargetValues.forEach((value) => {
				const indices = data
					.map((_, index) => (targetValues[index] === value ? index : null))
					.filter(Boolean);
				// Shuffle indices
				tf.util.shuffle(indices);
				const localTestIndices = indices.slice(
					0,
					Math.floor(indices.length * testSize)
				);
				const localTrainIndices = indices.slice(
					Math.floor(indices.length * testSize)
				);
				localTestIndices.forEach((index) => testIndices.push(index as number));
				localTrainIndices.forEach((index) => trainIndices.push(index as number));
			});
		} else {
			// Split data into train and test directly but shuffle randomly first
			const indices = data.map((_, index) => index);
			tf.util.shuffle(indices);
			const localTestIndices = indices.slice(0, numTestSamples);
			const localTrainIndices = indices.slice(numTestSamples);
			localTestIndices.forEach((index) => testIndices.push(index as number));
			localTrainIndices.forEach((index) => trainIndices.push(index as number));
		}
		return { testIndices, trainIndices };
	}

	private getLayers(model: tf.LayersModel) {
		let layers = [];
		// Iterate through each layer to get the weights and biases
		for (let i = 0; i < model.layers.length; i++) {
			const layer = model.layers[i];
			const weightsTensors = layer.getWeights();
			let weights = null;
			let biases = null;

			if (weightsTensors.length > 0) {
				weights = weightsTensors[0].arraySync(); // Get the weights
			}
			if (weightsTensors.length > 1) {
				biases = weightsTensors[1].arraySync(); // Get the biases
			}

			// Structure to store layer information
			let currentLayer = {
				layer: i + 1,
				config: layer.getConfig(),
				weights: weights,
				biases: biases,
			};
			layers.push(currentLayer);
		}
		return layers;
	}

	private createModel(config: ModelConfig) {
		try {
			if (this.currentModel) {
				this.currentModel.dispose();
			}
			this.currentModelMetrics = [];
			this.currentTotalLoss = 0;
			this.currentTotalAccuracy = 0;
			this.transcurredEpochs = 0;

			const model = tf.sequential();
			const lastLayerActivation =
				config.problemType === "classification"
					? config.lastLayerSize === 1
						? "sigmoid"
						: "softmax"
					: undefined;

			config.neuronsPerLayer.push(config.lastLayerSize);
			config.neuronsPerLayer.forEach((neurons: number, index: number) => {
				const isLastLayer = index === config.neuronsPerLayer.length - 1;
				const isFirstLayer = index === 0;
				const layerConfig = {
					units: neurons,
					activation: isLastLayer
						? config.problemType === "classification"
							? lastLayerActivation
							: undefined
						: config.activationFunction,
					inputShape: isFirstLayer ? [config.inputSize] : null,
					kernelInitializer: config.kernelInitializer,
					name: `layer_${index}`,
					kernelRegularizer: !isLastLayer
						? this.getKernelRegularizer(
							config.regularization as string,
							config.regularizationRate as number
						)
						: undefined,
				};
				// @ts-ignore
				model.add(tf.layers.dense(layerConfig));
			});
			console.log("Model structure created.");
			if (config.compileOptions) {
				// @ts-ignore
				const opt = tf.train[config.compileOptions.optimizer](
					config.compileOptions.learningRate
				);
				model.compile({
					optimizer: opt,
					loss: config.compileOptions.lossFunction,
					metrics: config.compileOptions.metrics,
				});
			}
			model.summary();

			this.currentModel = model;
			return model;
		} catch (error) {
			console.error("Error creating model:", error);
			throw error;
		}
	}

	on(event: string, handler: Function) {
		if (!this.eventHandlers[event]) {
			this.eventHandlers[event] = [];
		}
		this.eventHandlers[event].push(handler);
	}
}

export default TFInstance;
