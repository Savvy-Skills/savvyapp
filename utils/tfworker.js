const workerFunction = function () {
  const MESSAGE_TYPE_CREATE_TRAIN = "create_train";
  const MESSAGE_TYPE_REMOVE = "remove";
  const MESSAGE_TYPE_STOP = "stop_training";
  const MESSAGE_TYPE_ERROR = "error";
  const MESSAGE_TYPE_TRAIN_UPDATE = "train_update";
  const MESSAGE_TYPE_TRAIN_END = "train_end";
  const MESSAGE_TYPE_INIT = "init";
  const MESSAGE_TYPE_PREDICT = "predict";
  const MESSAGE_TYPE_PREDICTION_RESULT = "prediction_result";
  const MESSAGE_LOAD_REMOTE_MODEL = "load_remote_model";
  const MESSAGE_TYPE_IMAGE_PREDICTION_RESULT = "image_prediction_result";
  const MESSAGE_TYPE_IMAGE_PREDICT = "image_predict";
  const MESSAGE_TYPE_CREATE_TRAIN_CLASSIFIER = "create_train_classifier";
  const MESSAGE_LOAD_MOBILENET_MODEL = "load_mobilenet_model";

  const MNIST_MODEL_URL =
    "https://api.savvyskills.io/vault/JS-TssR_/Rq2zTYJqwmNe9nmcXbtyHdU8C8g/5IGPVw../modelfile.json";
  const MOBILENET_MODEL_URL =
    "https://tfhub.dev/google/tfjs-model/imagenet/mobilenet_v3_small_100_224/feature_vector/5/default/1";

  const MOBILENET_WIDTH = 224;
  const MOBILENET_HEIGHT = 224;

  let initialized = false;

  let mobilenetModel = null;
  let currentModel = null;
  let currentModelMetrics = [];
  let currentTotalLoss = 0;
  let currentTotalAccuracy = 0;
  let transcurredEpochs = 0;
  let currentDataPreparationConfig = null;
  let currentModelConfig = null;
  let currentModelId = null;
  let preprocessorState = {
    featureColumns: [],
    targetColumn: null,
    encoders: [],
    scalers: [],
    trainIndices: null,
    testIndices: null,
    targetEncoder: null,
    targetScaler: null,
  };

  let trainingStop = false;

  async function loadRemoteModel(type) {
    // TODO: Implement remote model loading
    let url = null;
    if (type === "mnist") {
      url = MNIST_MODEL_URL;
    } else {
      throw new Error("Invalid model type");
    }
    try {
      currentModel = await tf.loadLayersModel(url);
      currentModelId = type;
      await warmUpModel("mnist");
    } catch (err) {
      console.error("Error loading remote model:", err);
    }
  }

  async function warmUpModel(type = "mnist") {
    // TODO: Implement model warming up
    const dummyInput = tf.tidy(() => {
      if (type === "mnist") {
        // Create zeros with shape [1, 28, 28, 1]
        const input = tf.zeros([1, 28, 28, 1]);
        // Reshape to [1, 784] for MNIST model
        return input.reshape([1, 28*28]);
      } else if (type === "classifier") {
        return tf.zeros([1, MOBILENET_WIDTH, MOBILENET_HEIGHT, 3]);
      }
      return tf.zeros([1, 28, 28, 1]);
    });
    // Run a prediction to warm up the model
    try {
      await currentModel.predict(dummyInput).data();
      console.log("Model warmed up successfully");
      return true;
    } catch (error) {
      console.error("Error warming up model:", error);
      return false;
    } finally {
      // Clean up
      dummyInput.dispose();
    }
  }

  function createScaler(column, data) {
    let scaler = null;
    const columnData = data.map((row) => row[column.field]);
    if (column.normalization === "minmax") {
      tf.tidy(() => {
        const min = tf.min(columnData).arraySync();
        const max = tf.max(columnData).arraySync();
        scaler = {
          type: "minmax",
          field: column.field,
          min,
          max,
          decode: (value) => value * (max - min) + min,
        };
      });
    } else if (column.normalization === "zscore") {
      tf.tidy(() => {
        const mean = tf.mean(columnData, 0).arraySync();
        const std = tf
          .sqrt(tf.mean(tf.square(tf.sub(columnData, mean)), 0))
          .arraySync();
        scaler = {
          type: "zscore",
          field: column.field,
          mean,
          std,
          decode: (value) => value * std + mean,
        };
      });
    }
    return scaler;
  }

  function scaleColumn(columnData, scaler) {
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
  }

  function createEncoder(column, data) {
    let encoder = {
      field: column.field,
      type: column.encoding,
      map: new Map(),
      inverseMap: new Map(),
      encode: (value) => encoder.map.get(value),
      decode: (index) => encoder.inverseMap.get(index),
    };

    if (column.ordinalConfig) {
      // If column ordinalConfig, this mean this columns is type ordinal and ordinalConfig are the unique values in order from lowest to highest indexes.
      column.ordinalConfig.forEach((value, index) => {
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

  function encodeColumn(columnData, encoder, target = false) {
    if (encoder.type === "label") {
      if (target) {
        return tf.tensor1d(columnData.map((value) => encoder.encode(value)));
      } else {
        return tf
          .tensor(columnData.map((value) => encoder.encode(value)))
          .expandDims(1);
      }
    } else if (encoder.type.toLowerCase() === "onehot") {
      // From encoder, we have a map of value to index, so we can create a one-hot encoded column for each value
      // Create array with index values
      const labelEncoded = columnData.map((value) => encoder.encode(value));
      // Use tf.oneHot to create the one-hot encoded column, convert back to array
      const oneHotEncoded = tf.oneHot(labelEncoded, encoder.map.size);
      return oneHotEncoded;
    }
    return columnData;
  }

  function cleanData(data, dataPreparationConfig) {
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
  function preprocessData(data, columns, dataPreparationConfig) {
    let processedData = [];
    let targetData = [];

    // 1. Data Cleaning: Remove rows with invalid target values
    const cleanedData = cleanData(data, dataPreparationConfig);

    // 2. Train-Test Split: Get indices for data splitting
    const { trainIndices, testIndices } = trainTestSplit(
      cleanedData,
      columns,
      dataPreparationConfig
    );
    // Store split indices for later use in predictions
    preprocessorState.trainIndices = trainIndices;
    preprocessorState.testIndices = testIndices;

    // 3. Extract Target Column: Get the values we're trying to predict
    const target = cleanedData.map(
      (row) => row[dataPreparationConfig.targetConfig.field]
    );

    // 4. Extract Feature Columns: Create feature objects from raw data
    const features = cleanedData.map((row) => {
      const featureRow = {};
      dataPreparationConfig.featureConfig.forEach((column) => {
        featureRow[column.field] = row[column.field];
      });
      return featureRow;
    });

    // Identify columns that need no transformation
    const featureColumns = Object.keys(features[0]);
    preprocessorState.featureColumns = featureColumns;

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
      }, {})
    );
    const nonEncodedNonNormalizedFeaturesTensor = tf.tensor2d(
      nonEncodedNonNormalizedFeatures.map((feature) => Object.values(feature))
    );
    processedData = nonEncodedNonNormalizedFeaturesTensor;

    // 6. Feature Scaling: Apply normalization to specified columns
    const scaledColumns = dataPreparationConfig.featureConfig.filter(
      (column) => column.normalization && column.normalization !== "none"
    );
    if (scaledColumns.length > 0) {
      // Create and store scalers for each column
      const scalers = scaledColumns.map((column) => createScaler(column, data));
      preprocessorState.scalers = scalers;

      // Scale features and merge with existing processed data
      const scaledFeatures = scaledColumns.map((column) => {
        const columnData = features.map((row) => row[column.field]);
        return scaleColumn(
          columnData,
          scalers.find((scaler) => scaler.field === column.field)
        );
      });
      const mergedScaledFeatures = tf.concat([...scaledFeatures], 1);
      processedData = tf.concat([processedData, mergedScaledFeatures], 1);
    }

    // 7. Feature Encoding: Convert categorical data to numerical representations
    const encodedColumns = dataPreparationConfig.featureConfig.filter(
      (column) => column.encoding && column.encoding !== "none"
    );
    if (encodedColumns.length > 0) {
      // Create and store encoders for each column
      const encoders = encodedColumns.map((column) =>
        createEncoder(column, data)
      );
      preprocessorState.encoders = encoders;

      // Encode features and merge with existing processed data
      let encodedFeatures = encodedColumns.map((column) => {
        const encoder = encoders.find(
          (encoder) => encoder.field === column.field
        );
        const columnData = features.map((row) => row[column.field]);
        return {
          field: column.field,
          type: column.encoding,
          data: encodeColumn(columnData, encoder),
        };
      });
      const featuresData = encodedFeatures.map((feature) => feature.data);
      const mergedFeatures = tf.concat([...featuresData], 1);
      processedData = tf.concat([processedData, mergedFeatures], 1);
    }

    // 8. Target Variable Processing: Handle encoding/scaling of prediction target
    if (
      dataPreparationConfig.targetConfig.encoding &&
      dataPreparationConfig.targetConfig.encoding !== "none"
    ) {
      // Label encode target variable
      const encoder = createEncoder(dataPreparationConfig.targetConfig, data);
      const encodedTarget = encodeColumn(target, encoder, true);
      preprocessorState.targetEncoder = encoder;
      targetData = encodedTarget;
    } else if (
      dataPreparationConfig.targetConfig.normalization &&
      dataPreparationConfig.targetConfig.normalization !== "none"
    ) {
      // Scale target variable
      const scaler = createScaler(dataPreparationConfig.targetConfig, data);
      const scaledTarget = scaleColumn(target, scaler);
      preprocessorState.targetScaler = scaler;
      targetData = scaledTarget;
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
  }

  function createPredictionData({
    originalData,
    predictions,
    modelConfig,
    columns,
  }) {
    const { testIndices, targetEncoder, targetScaler } = preprocessorState;
    const targetColumn = currentDataPreparationConfig.targetConfig.field;
    const testData = testIndices.map((index) => originalData[index]);
    // TODO: Handle classification and regression predictions
    let result = {};
    if (modelConfig.problemType === "classification") {
      // TODO: Handle classification predictions
      // Check lastLayerSize, if its 1, then its a binary classification, otherwise its a multi-class classification
      const lastLayerSize = modelConfig.lastLayerSize;
      result["newColumns"] = [
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
          .map((prediction) => (prediction > 0.5 ? 1 : 0));
        const predictionsData = testData.map((data, index) => ({
          ...data,
          prediction: targetEncoder.decode(predictionsToBinary[index]),
        }));
        result["predictions"] = predictionsData;
      } else {
        // Multi-class classification, predictions is one-hot tensor, so we need to convert it to an index
        const predictionsToIndex = predictions.argMax(1).arraySync();
        const predictionsData = testData.map((data, index) => ({
          ...data,
          prediction: targetEncoder.decode(predictionsToIndex[index]),
        }));
        result["predictions"] = predictionsData;
      }
    } else if (modelConfig.problemType === "regression") {
      // TODO: Handle regression predictions
      // Check if target is scaled, if it is, then we need to unscale it
      result["newColumns"] = [
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
        const predictionsData = testData.map((data, index) => {
          const prediction = targetScaler.decode(predictionsArray[index]);
          return {
            ...data,
            prediction,
            difference: Math.abs(prediction - data[targetColumn]),
          };
        });
        result["predictions"] = predictionsData;
      } else {
        const predictionsArray = predictions.arraySync();
        const predictionsData = testData.map((data, index) => ({
          ...data,
          prediction: predictionsArray[index],
          difference: Math.abs(predictionsArray[index] - data[targetColumn]),
        }));
        result["predictions"] = predictionsData;
      }
    }
    // Dispose of tensors to free memory
    predictions.dispose();
    return result;
  }

  function handleInference(inputData) {
    const { encoders, scalers, targetEncoder, targetScaler } =
      preprocessorState;

    const dataPreparationConfig = currentDataPreparationConfig;
    let processedData = [];

    // Extract features from input data based on data preparation config
    const features = inputData.map((row) => {
      const featureRow = {};
      dataPreparationConfig.featureConfig.forEach((column) => {
        featureRow[column.field] = row[column.field];
      });
      return featureRow;
    });
    const inputColumns = Object.keys(features[0]);

    // 1. Process raw numerical columns (no encoding/scaling needed)
    const nonEncodedNonScaledColumns = inputColumns.filter(
      (column) =>
        !encoders.map((encoder) => encoder.field).includes(column) &&
        !scalers.map((scaler) => scaler.field).includes(column)
    );

    if (nonEncodedNonScaledColumns.length > 0) {
      const nonEncodedNonScaledData = nonEncodedNonScaledColumns.map(
        (column) => features[0][column]
      );
      processedData = tf.tensor2d([nonEncodedNonScaledData]);
    }

    // 2. Process scaled numerical columns
    const scaledColumns = scalers.filter((scaler) =>
      inputColumns.includes(scaler.field)
    );

    if (scaledColumns.length > 0) {
      // Create an array of scaled values
      const scaledFeatures = [];
      
      scaledColumns.forEach((column) => {
        const scaler = scalers.find((scaler) => scaler.field === column.field);
        const scaledValue = scaleColumn([Number(features[0][column.field])], scaler);
        // Extract the value from the tensor and add to our array
        scaledFeatures.push(scaledValue.dataSync()[0]);
      });
      
      // Create a tensor from the scaled features
      const scaledTensor = tf.tensor2d([scaledFeatures]);
      
      // Concatenate with existing processed data if needed
      processedData = processedData.length > 0
        ? tf.concat([processedData, scaledTensor], 1)
        : scaledTensor;
    }

    // 3. Process encoded categorical columns
    const encodedColumns = encoders.filter((encoder) =>
      inputColumns.includes(encoder.field)
    );

    if (encodedColumns.length > 0) {
      const encodedData = encodedColumns.map((column) => {
        const encoder = encoders.find(
          (encoder) => encoder.field === column.field
        );
        return encodeColumn([features[0][column.field]], encoder);
      });
      processedData =
        processedData.length > 0
          ? tf.concat([...processedData, ...encodedData], 1)
          : encodedData;
    }


    // Make prediction using processed input tensor
    const predictions = currentModel.predict(processedData);
    let predictionResult = null;
	let confidence = 0;

    // Process prediction based on problem type
    if (currentModelConfig.problemType === "classification") {
      if (currentModelConfig.lastLayerSize === 1) {
        // Binary classification: convert probability to 0/1 using 0.5 threshold
        const predictionsToBinary = predictions
          .arraySync()
          .map((prediction) => (prediction > 0.5 ? 1 : 0));
		// Get the confidence of the prediction by getting the value of the prediction
		confidence = predictionsToBinary[0];
        predictionResult = targetEncoder.decode(predictionsToBinary[0]);
      } else {
        // Multi-class classification: take argmax of predictions
        const predictionsToIndex = predictions.argMax(1).arraySync();
		// Get the confidence of the prediction by getting the value of the prediction
		const predictionProbabilities = predictions.arraySync();
		confidence = predictionProbabilities[0][predictionsToIndex[0]];

        predictionResult = targetEncoder.decode(predictionsToIndex[0]);
      }
    } else if (currentModelConfig.problemType === "regression") {
      // Reverse scaling if target was scaled during preprocessing
      if (targetScaler) {
        const predictionsArray = predictions.arraySync();
		// Get the confidence of the prediction by getting the value of the prediction
		confidence = predictionsArray[0];
        predictionResult = targetScaler.decode(predictionsArray[0]);
      } else {
        predictionResult = predictions.arraySync()[0];
      }
    }

    // Send prediction result back to main thread
    self.postMessage({
      from: "worker",
      type: MESSAGE_TYPE_PREDICTION_RESULT,
      modelId: currentModelId,
      data: { prediction: { predictedClass: predictionResult, confidence, probabilities: predictions.arraySync()[0] } },
    });

    // Dispose of tensors to free memory
    processedData.dispose();
    predictions.dispose();
  }

  async function trainModel({
    model,
    preparedData,
    originalData,
    trainConfig,
    modelConfig,
    columns,
  }) {
    const { trainFeatures, trainTarget, testFeatures } = preparedData;

    await model.fit(trainFeatures, trainTarget, {
      epochs: trainConfig.epochs,
      shuffle: trainConfig.shuffle,
      batchSize: trainConfig.batchSize,
      validationSplit: trainConfig.validationSplit,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (trainingStop) {
            model.stopTraining = true;
            trainingStop = false;
            return;
          }
          console.log({
            epoch,
            logs,
          });
          transcurredEpochs = epoch;
          currentTotalLoss += logs.loss || 0;
          if (logs.acc) {
            currentTotalAccuracy += logs.acc;
          }
          currentModelMetrics.push({
            epoch,
            loss: logs?.loss,
            accuracy: logs?.acc ? logs.acc : null,
            val_loss: logs?.val_loss,
            val_accuracy: logs?.val_acc ? logs.val_acc : null,
          });
          const predictions = model.predict(testFeatures);
          const { newColumns, predictions: predictionsData } =
            createPredictionData({
              originalData,
              predictions,
              testFeatures,
              modelConfig,
              columns,
            });
          self.postMessage({
            from: "worker",
            modelId: currentModelId,
            type: MESSAGE_TYPE_TRAIN_UPDATE,
            data: {
              transcurredEpochs: epoch,
              loss: currentTotalLoss,
              accuracy: currentTotalAccuracy,
              modelHistory: currentModelMetrics,
              testData: {
                data: predictionsData,
                columns: newColumns,
              },
            },
          });
        },
        onTrainEnd: () => {
          const predictions = model.predict(testFeatures);
          const { newColumns, predictions: predictionsData } =
            createPredictionData({
              originalData,
              predictions,
              testFeatures,
              modelConfig,
              columns,
            });
          self.postMessage({
            modelId: currentModelId,
            from: "worker",
            type: MESSAGE_TYPE_TRAIN_END,
            data: {
              transcurredEpochs: transcurredEpochs,
              loss: currentTotalLoss,
              accuracy: currentTotalAccuracy,
              modelHistory: currentModelMetrics,
              testData: {
                data: predictionsData,
                columns: newColumns,
              },
            },
          });
          if (trainFeatures) {
            trainFeatures.dispose();
          }
          if (trainTarget) {
            trainTarget.dispose();
          }
          if (testFeatures) {
            testFeatures.dispose();
          }
          if (predictions) {
            predictions.dispose();
          }
        },
      },
    });
  }

  function base64ToArrayBuffer(base64) {
    // Remove the data URL prefix if present
    const base64String = base64.replace(
      /^data:image\/(png|jpeg|jpg);base64,/,
      ""
    );

    // Decode base64
    const binaryString = atob(base64String);
    const bytes = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes.buffer;
  }

  function preprocessMnistImage(tensorImage, width, height) {
    return tf.tidy(() => {
      // Resize the image to the required dimensions
      const resized = tf.image.resizeBilinear(tensorImage, [width, height]);

      // Convert RGB to grayscale (if it's not already)
      // Formula: 0.299 * R + 0.587 * G + 0.114 * B
      const grayscale =
        tensorImage.shape[2] === 3
          ? resized.mul([0.299, 0.587, 0.114]).sum(-1).expandDims(-1)
          : resized;

      // Normalize pixel values (0-255 -> 0-1) and invert colors for MNIST
      const normalized = tf.scalar(1).sub(grayscale.div(tf.scalar(255)));

      // Add batch dimension
      const batched = normalized.expandDims(0);

      return batched;
    });
  }

  /**
   * Custom implementation of JPEG decoder similar to decodeJpeg from tfjs-react-native
   * @param {ArrayBuffer|string} jpegData - ArrayBuffer containing JPEG data or base64 string
   * @param {Object} options - Options for decoding
   * @param {number[]} options.channels - Number of color channels (defaults to 3)
   * @returns {Promise<tf.Tensor3D>} - Tensor representation of the image
   */
  async function decodeJpeg(jpegData, options = {}) {
    const channels = options.channels || 3;

    // Handle base64 input
    if (typeof jpegData === "string") {
      jpegData = base64ToArrayBuffer(jpegData);
    }

    // Create a blob from the binary data
    const blob = new Blob([jpegData], { type: "image/jpeg" });

    try {
      // Create an image bitmap from the blob
      const imageBitmap = await createImageBitmap(blob);

      // Create an OffscreenCanvas with the image dimensions
      const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
      const ctx = canvas.getContext("2d");

      // Draw the image to the canvas
      ctx.drawImage(imageBitmap, 0, 0);

      // Get the image data (RGBA format)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Convert to tensor
      let tensor = tf.browser.fromPixels(imageData, channels);

      // Clean up
      imageBitmap.close();

      return tensor;
    } catch (error) {
      console.error("Error decoding JPEG:", error);
      throw error;
    }
  }

  function createBaseClassifierModel(CLASS_COUNT = 2) {
    let model = tf.sequential();

    model.add(
      tf.layers.dense({ inputShape: [1024], units: 128, activation: "relu" })
    );
    model.add(tf.layers.dense({ units: CLASS_COUNT, activation: "softmax" }));
    model.compile({
      optimizer: "adam",
      loss:
        CLASS_COUNT === 2 ? "binaryCrossentropy" : "categoricalCrossentropy",
      metrics: ["accuracy"],
    });

    currentModelMetrics = [];
    currentTotalLoss = 0;
    currentTotalAccuracy = 0;
    transcurredEpochs = 0;
    currentModel = model;

    return model;
  }

  async function trainClassifierModel(model, trainingData, epochs = 10) {
    let loss = 0;
    let totalAccuracy = 0;

    let trainingDataInputs = trainingData.map((i) => i.imageFeatures);
    let trainingDataOutputs = trainingData.map((i) => i.classId);
    let distinctClassesCount = new Set(trainingDataOutputs).size;

    tf.util.shuffleCombo(trainingDataInputs, trainingDataOutputs);

    let outputsAsTensor = tf.tensor1d(trainingDataOutputs, "int32");
    let oneHotOutputs = tf.oneHot(outputsAsTensor, distinctClassesCount);
    let inputsAsTensor = tf.stack(trainingDataInputs);

    await model.fit(inputsAsTensor, oneHotOutputs, {
      shuffle: true,
      batchSize: 5,
      epochs: epochs,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (trainingStop) {
            model.stopTraining = true;
            trainingStop = false;
            return;
          }
          console.log({
            epoch,
            logs,
          });
          transcurredEpochs = epoch;
          currentTotalLoss += logs.loss || 0;
          if (logs.acc) {
            currentTotalAccuracy += logs.acc;
          }
          currentModelMetrics.push({
            epoch,
            loss: logs?.loss,
            accuracy: logs?.acc ? logs.acc : null,
            val_loss: logs?.val_loss,
            val_accuracy: logs?.val_acc ? logs.val_acc : null,
          });

          self.postMessage({
            from: "worker",
            modelId: currentModelId,
            type: MESSAGE_TYPE_TRAIN_UPDATE,
            data: {
              transcurredEpochs: epoch,
              loss: currentTotalLoss,
              accuracy: currentTotalAccuracy,
              modelHistory: currentModelMetrics,
            },
          });
        },
        onTrainEnd: () => {
          self.postMessage({
            modelId: currentModelId,
            from: "worker",
            type: MESSAGE_TYPE_TRAIN_END,
            data: {
              transcurredEpochs: transcurredEpochs,
              loss: currentTotalLoss,
              accuracy: currentTotalAccuracy,
              modelHistory: currentModelMetrics,
            },
          });
          inputsAsTensor.dispose();
          oneHotOutputs.dispose();
          outputsAsTensor.dispose();
        },
      },
    });

    outputsAsTensor.dispose();
    oneHotOutputs.dispose();
    inputsAsTensor.dispose();

    return { loss, accuracy: totalAccuracy };
  }

  function preprocessImage(imageTensor, width, height, type = "mnist", prediction = false) {
    if(type === "classifier" && !mobilenetModel) {
      throw new Error("Mobilenet model not loaded");
    }
    return tf.tidy(() => {
      let resized = tf.image.resizeBilinear(imageTensor, [width, height], true);
      let normalized = null;
      let result = null;
      if (type === "mnist") {
        grayscaled = resized.mul([0.299, 0.587, 0.114]).sum(-1).expandDims(-1);
        normalized = tf.scalar(1).sub(grayscaled.div(tf.scalar(255)));
        const batched = normalized.expandDims(0);
        return batched;
      } else if (type === "classifier") {
        normalized = resized.div(255);
        // Always add batch dimension for MobileNet
        normalized = normalized.expandDims(0);
        normalized = mobilenetModel.predict(normalized);
        if (!prediction) {
          // For training features, we don't need batch dimension
          result = normalized.squeeze();
        } else {
          // For prediction, keep the batch dimension
          result = normalized;
        }
      }
      return result;
    });
  }

  async function getTrainingData(inputs) {
    const trainingData = [];
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      const fieldName = Object.keys(input)[0];
      const fieldData = input[fieldName];
      for (const data of fieldData) {
        // Data is a base64 string, transform it to an image
        let image = await decodeJpeg(data);
        const imageFeatures = preprocessImage(image, MOBILENET_WIDTH, MOBILENET_HEIGHT, "classifier", false);
        trainingData.push({
          imageFeatures,
          classId: i,
        });
      }
    }
    return trainingData;
  }

  async function createTrainClassifierModel(data) {
    const { inputs, modelConfig } = data;
    const model = createBaseClassifierModel(inputs.length);
    const trainingData = await getTrainingData(inputs);
    const labels = inputs.map((input) => Object.keys(input)[0]);
    const { loss, accuracy } = await trainClassifierModel(
      model,
      trainingData,
      modelConfig.epochs
    );
  }

  // TODO: Make a general predict with image and model
  async function predictImage(image, type = "classifier") {
    // Image is base64 string
    let imageTensor = await decodeJpeg(image);
    let model = currentModel;
    return tf.tidy(() => {
      if (type === "classifier") {
        imageTensor = preprocessImage(imageTensor, MOBILENET_WIDTH, MOBILENET_HEIGHT, type, true);
      } else if (type === "mnist") {
        imageTensor = preprocessImage(imageTensor, 28, 28, type, true);
        
        // Add this: Flatten the image if using MNIST model
        // This converts from [1,28,28,1] to [1,784]
        imageTensor = imageTensor.reshape([1, 28*28]);
      }

      const prediction = model.predict(imageTensor);
      const probabilities = prediction.dataSync();
      const predictedClass = prediction.argMax(1).dataSync()[0];
      const confidence = probabilities[predictedClass];

      return { predictedClass, confidence, probabilities };
    });
  }

  async function createTrain(data, columns, modelConfig, trainConfig) {
    // 1. Preprocess data
    const preparedData = preprocessData(
      data,
      columns,
      trainConfig.dataPreparationConfig
    );

    // 2. Create model
    const model = createModel(modelConfig);

    // 3. Train model
    await trainModel({
      model,
      preparedData,
      originalData: data,
      trainConfig,
      modelConfig,
      columns,
    });
  }

  async function init() {
    const scripts = {
      tfjs: "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs/dist/tf.min.js",
      wasm: "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm/dist/tf-backend-wasm.js",
    };
    try {
      await loadScriptWithRetry(scripts.tfjs, "tfjs");
      await loadScriptWithRetry(scripts.wasm, "wasm");

      tf.wasm.setWasmPaths(
        "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm/wasm-out/"
      );

      tf.ready().then(async () => {
        tf.setBackend("wasm");
        console.log(tf.getBackend());

        // Preload MobileNet model
        await loadMobilenetModel();
      });
      self.onmessage = async function (event) {
        console.log("Message received:", event.data);
        if (event.data.from !== "main") {
          return;
        }
        switch (event.data.type) {
          case MESSAGE_TYPE_CREATE_TRAIN:
            const { data, columns, modelConfig, trainConfig } = event.data.data;
            currentDataPreparationConfig = trainConfig.dataPreparationConfig;
            currentModelConfig = modelConfig;
            currentModelId = event.data.modelId;
            await createTrain(data, columns, modelConfig, trainConfig);
            break;
          case MESSAGE_TYPE_CREATE_TRAIN_CLASSIFIER:
            currentModelId = event.data.modelId;
            currentModelMetrics = [];
            currentTotalLoss = 0;
            currentTotalAccuracy = 0;
            transcurredEpochs = 0;

            // Make sure MobileNet is loaded
            if (!mobilenetModel) {
              await loadMobilenetModel();
            }

            await createTrainClassifierModel(event.data.data);
            break;
          case MESSAGE_TYPE_REMOVE:
            break;
          case MESSAGE_TYPE_PREDICT:
            const { inputs: predictInputs } = event.data.data;
            handleInference([predictInputs]);
            break;
          case MESSAGE_TYPE_STOP:
            trainingStop = true;
            break;
          case MESSAGE_LOAD_MOBILENET_MODEL:
            const success = await loadMobilenetModel();
            self.postMessage({
              from: "worker",
              type: "mobilenet_loaded",
              modelId: event.data.modelId,
              data: { success },
            });
            break;
          case MESSAGE_LOAD_REMOTE_MODEL:
            const { type } = event.data.data;
            await loadRemoteModel(type);
            break;
          case MESSAGE_TYPE_IMAGE_PREDICT:
            const { image, type: predictionType } = event.data.data;
            const { predictedClass, confidence, probabilities } = await predictImage(image, predictionType);
            self.postMessage({
              from: "worker",
              type: MESSAGE_TYPE_IMAGE_PREDICTION_RESULT,
              modelId: currentModelId,
              data: {
                predictionResult: {
                  predictedClass,
                  confidence,
                  probabilities,
                },
              },
            });
            break;
          default:
            self.postMessage({
              from: "worker",
              type: MESSAGE_TYPE_ERROR,
              message: "Unknown message type!",
            });
            break;
        }
      };

      initialized = true;
      self.postMessage({
        from: "worker",
        type: MESSAGE_TYPE_INIT,
        data: {
          message: "Worker initialized",
        },
      });
    } catch (err) {
      console.error("Error:", err);
    }
  }

  async function loadScriptWithRetry(url, name, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
      try {
        importScripts(url);
        console.log("Successfully loaded: " + name);
        return;
      } catch (err) {
        console.error(
          "Failed to load: " + name + ", attempt " + (i + 1) + " of " + retries
        );
        if (i < retries - 1) {
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          throw new Error(
            "Failed to load script after " + retries + " attempts: " + name
          );
        }
      }
    }
  }

  function getKernelRegularizer(regularization, rate) {
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

  function trainTestSplit(data, columns, dataPreparationConfig) {
    // Split data into train and test
    const { testSize, stratify } = dataPreparationConfig;
    const totalSamples = data.length;
    const numTestSamples = Math.floor(totalSamples * testSize); // Calculate number of test samples
    console.log({ testSize, stratify, numTestSamples });

    let testIndices = [];
    let trainIndices = [];

    if (stratify) {
      const targetColumn = columns.find(
        (column) => column.accessor === dataPreparationConfig.targetConfig.field
      );
      const targetValues = data.map((row) => row[targetColumn?.accessor]);
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
        localTestIndices.forEach((index) => testIndices.push(index));
        localTrainIndices.forEach((index) => trainIndices.push(index));
      });
    } else {
      // Split data into train and test directly but shuffle randomly first
      const indices = data.map((_, index) => index);
      tf.util.shuffle(indices);
      const localTestIndices = indices.slice(0, numTestSamples);
      const localTrainIndices = indices.slice(numTestSamples);
      localTestIndices.forEach((index) => testIndices.push(index));
      localTrainIndices.forEach((index) => trainIndices.push(index));
    }
    return { testIndices, trainIndices };
  }

  function getLayers(model) {
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

  function createModel(config) {
    try {
      if (currentModel) {
        currentModel.dispose();
      }
      currentModelMetrics = [];
      currentTotalLoss = 0;
      currentTotalAccuracy = 0;
      transcurredEpochs = 0;

      const model = tf.sequential();
      const lastLayerActivation =
        config.problemType === "classification"
          ? config.lastLayerSize === 1
            ? "sigmoid"
            : "softmax"
          : null;

      config.neuronsPerLayer.push(config.lastLayerSize);
      config.neuronsPerLayer.forEach((neurons, index) => {
        const isLastLayer = index === config.neuronsPerLayer.length - 1;
        const isFirstLayer = index === 0;
        const layerConfig = {
          units: neurons,
          activation: isLastLayer
            ? config.problemType === "classification"
              ? lastLayerActivation
              : null
            : config.activationFunction,
          inputShape: isFirstLayer ? [config.inputSize] : null,
          kernelInitializer: config.kernelInitializer,
          name: `layer_${index}`,
          kernelRegularizer: !isLastLayer
            ? getKernelRegularizer(
                config.regularization,
                config.regularizationRate
              )
            : null,
        };
        model.add(tf.layers.dense(layerConfig));
      });
      console.log("Model structure created.");
      if (config.compileOptions) {
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
      currentModel = model;
      return model;
    } catch (error) {
      console.error("Error creating model:", error);
      throw error;
    }
  }

  async function loadMobilenetModel() {
    try {
      mobilenetModel = await tf.loadGraphModel(MOBILENET_MODEL_URL, {
        fromTFHub: true,
      });
      console.log("MobileNet model loaded successfully");
      return true;
    } catch (error) {
      console.error("Error loading MobileNet model:", error);
      return false;
    }
  }

  if (!initialized) {
    init();
  }
};

let code = workerFunction.toString();
code = code.substring(code.indexOf("{") + 1, code.lastIndexOf("}"));
const blob = new Blob([code], { type: "application/javascriptssky" });
const workerScript = URL.createObjectURL(blob);

export { workerScript };
