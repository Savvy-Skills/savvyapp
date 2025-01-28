const workerFunction = function () {
  const MESSAGE_TYPE_CREATE_TRAIN = "create_train";
  const MESSAGE_TYPE_REMOVE = "remove";
  const MESSAGE_TYPE_STOP = "stop_training";
  const MESSAGE_TYPE_ERROR = "error";
  const MESSAGE_TYPE_TRAIN_UPDATE = "train_update";
  const MESSAGE_TYPE_TRAIN_END = "train_end";
  const MESSAGE_TYPE_INIT = "init";

  let initialized = false;

  let currentModel = null;
  let currentModelMetrics = [];
  let currentTotalLoss = 0;
  let currentTotalAccuracy = 0;
  let transcurredEpochs = 0;

  let trainingStop = false;

  let broadcastChannel = null;

  async function init() {
    const scripts = {
      tfjs: "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs/dist/tf.min.js",
      wasm: "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm/dist/tf-backend-wasm.js",
    };
    try {
      await loadScriptWithRetry(scripts.tfjs, "tfjs");
      await loadScriptWithRetry(scripts.wasm, "wasm");

      broadcastChannel = new BroadcastChannel("tensorflow-worker");

      tf.wasm.setWasmPaths(
        "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm/wasm-out/"
      );

	  tf.ready().then(() => {
		tf.setBackend("wasm");
		console.log(tf.getBackend());
	  });

      initialized = true;
      broadcastChannel.postMessage({
        type: MESSAGE_TYPE_INIT,
        data: {
          message: "Worker initialized",
        },
      });
    } catch (err) {
      console.error("Error:", err);
    }
  }

  self.onmessage = async function (event) {
    console.log("Message received:", event.data);
    switch (event.data.type) {
      case MESSAGE_TYPE_CREATE_TRAIN:
        const { data, columns, modelConfig, trainConfig } = event.data.data;
        await debug(data, columns, modelConfig, trainConfig);
        break;
      case MESSAGE_TYPE_REMOVE:
        break;
      case MESSAGE_TYPE_STOP:
        trainingStop = true;
        break;
      default:
        self.postMessage({
          type: MESSAGE_TYPE_ERROR,
          message: "Unknown message type!",
        });
        break;
    }
  };


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

  async function debug(data, columns, modelConfig, trainConfig) {
    const model = createModel(modelConfig);
    const layers = getLayers(model);
    const lastLayerShape = model.layers[model.layers.length - 1].outputShape[1];
    const preparedData = prepareData(
      data,
      columns,
      trainConfig.dataPreparationConfig,
      lastLayerShape
    );
    dataPreparationMetadata = preparedData.dataPreparationMetadata || {};
    await trainModel(model, preparedData, trainConfig, data, columns);
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

  function predict(inputs) {
    if (!currentModel) {
      throw new Error("Model not trained");
    }
    let predictionsArray = [];
    const inputsTensor = tf.tensor2d(inputs);
    const predictions = currentModel.predict(inputsTensor);
    const lastLayerShape =
      currentModel.layers[currentModel.layers.length - 1].outputShape[1];
    const isBinaryClassification = lastLayerShape === 1;
    if (!isBinaryClassification) {
      predictionsArray = predictions.argMax(1).arraySync();
    } else {
      const predArray = predictions.arraySync();
      predictionsArray = predArray.map((prediction) =>
        prediction[0] > 0.5 ? 1 : 0
      );
    }
    inputsTensor.dispose();
    predictions.dispose();

    return {
      predictionsArray,
      mappedOutputs: dataPreparationMetadata.mappedOutputs,
    };
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
        (column) => column.accessor === dataPreparationConfig.targetColumn
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

  async function trainModel(model, preparedData, trainConfig, data, columns) {
    const { batchSize, epochs, shuffle, validationSplit } = trainConfig;
    const { features, target, outputsNumber } = preparedData;

    const lastLayerShape = model.layers[model.layers.length - 1].outputShape[1];
    if (outputsNumber !== lastLayerShape) {
      console.log("Output shape doesn't match!");
      if (outputsNumber === 2 && lastLayerShape === 1) {
        console.log("Binary classification case, outputs are 0 or 1");
      } else {
        let message =
          "Output shape missmatch! Expected Neurons: " +
          outputsNumber +
          " Provided: " +
          lastLayerShape;
        throw new Error(message);
      }
    }
    await model.fit(features, target, {
      batchSize,
      epochs,
      shuffle,
      validationSplit,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (trainingStop) {
            model.stopTraining = true;
            trainingStop = false;
            return;
          }
          transcurredEpochs = epoch;
          currentTotalLoss += logs?.loss || 0;
          currentTotalAccuracy += logs?.acc || 0;
          currentModelMetrics.push({
            epoch,
            loss: logs?.loss,
            accuracy: logs?.acc,
          });
          const { testData, newColumns } = getTestData(
            data,
            preparedData.testIndices ?? [],
            columns,
            trainConfig
          );
          broadcastChannel.postMessage({
            type: MESSAGE_TYPE_TRAIN_UPDATE,
            data: {
              transcurredEpochs: epoch,
              loss: currentTotalLoss,
              accuracy: currentTotalAccuracy,
              modelHistory: currentModelMetrics,
              testData: {
                data: testData,
                columns: newColumns,
              },
            },
          });
        },
        onTrainEnd: () => {
          const layers = getLayers(model);
          // Dispose Tensors
          features.dispose();
          target.dispose();

          const { testData, newColumns } = getTestData(
            data,
            preparedData.testIndices ?? [],
            columns,
            trainConfig
          );

          broadcastChannel.postMessage({
            type: MESSAGE_TYPE_TRAIN_END,
            data: {
              transcurredEpochs: transcurredEpochs,
              loss: currentTotalLoss,
              accuracy: currentTotalAccuracy,
              modelHistory: currentModelMetrics,
              testData: {
                data: testData,
                columns: newColumns,
              },
            },
          });
        },
      },
    });
  }

  function getTestData(data, testIndices, columns, trainConfig) {
    // Create deep copy of data to avoid mutations
    const copyData = JSON.parse(JSON.stringify(data));

    // Get test data subset based on indices
    const testData = copyData.filter((_, index) =>
      testIndices?.includes(index)
    );
    const targetColumn = trainConfig.dataPreparationConfig.targetColumn;

    // Extract test outputs and remove target column from test data
    const testInputs = testData.map((row) => {
      const rowCopy = { ...row };
      delete rowCopy[targetColumn];
      return Object.values(rowCopy);
    });

    // Get predictions
    const { predictionsArray, mappedOutputs } = predict(testInputs);
    const predictionsToLabels = predictionsArray.map(
      (prediction) => mappedOutputs?.[prediction]
    );

    // Add predictions column to data
    const newTestData = testData.map((row, index) => ({
      ...row,
      prediction: predictionsToLabels[index],
    }));

    // Add prediction column definition
    const newColumns = [
      ...columns,
      {
        accessor: "prediction",
        Header: "prediction",
        dtype: "string",
        width: 100,
      },
    ];

    return { testData: newTestData, newColumns };
  }

  function transformToTensor(inputs, outputs, outputsNumber, lastLayerShape) {
    return tf.tidy(() => {
      let result = {};
      // Step 1. Shuffle the data
      tf.util.shuffleCombo(inputs, outputs);
      // Step 2. Convert data to Tensor
      const inputsTensor = tf.tensor2d(inputs);

      if (outputsNumber === 1) {
        const outputTensor = tf.tensor2d(outputs, [outputs.length, 1]);
        result = {
          inputsTensor: inputsTensor,
          outputsTensor: outputTensor,
        };
      } else if (outputsNumber === 2 && lastLayerShape === 1) {
        // Binary classification case, outputs are 0 or 1
        const outputsTensor = tf.tensor1d(outputs, "int32");
        result = { inputsTensor, outputsTensor };
      } else {
        const outputsTensor = tf.tensor2d(outputs, [
          outputs.length,
          outputsNumber,
        ]);
        result = { inputsTensor, outputsTensor };
      }
      return result;
    });
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
          ? config.neuronsPerLayer[config.neuronsPerLayer.length - 1] === 1
            ? "sigmoid"
            : "softmax"
          : null;
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

  function prepareData(data, columns, dataPreparationConfig, lastLayerShape) {
    const targetColumn = columns.find(
      (column) => column.accessor === dataPreparationConfig.targetColumn
    );
    // Features are all columns except the target column and disabled columns
    const dataPreparationMetadata = {};
    const featuresColumns = columns.filter(
      (column) =>
        column.accessor !== dataPreparationConfig.targetColumn &&
        !dataPreparationConfig.disabledColumns.includes(column.accessor)
    );
    const { testIndices, trainIndices } = trainTestSplit(
      data,
      columns,
      dataPreparationConfig
    );
    const trainData = data.filter((_, index) => trainIndices.includes(index));
    // Separate data into inputs and outputs, inputs are all columns except the target column
    const inputs = [];
    trainData.forEach((row) => {
      const input = featuresColumns.map((column) => row[column.accessor]);
      inputs.push(input);
    });
    let outputs = [];
    trainData.forEach((row) => {
      const output = targetColumn?.accessor ? row[targetColumn.accessor] : null;
      outputs.push(output);
    });
    const mappedOutputs = {};
    // Encode target if target is a string
    if (dataPreparationConfig.uniqueTargetValues.length > 0) {
      // Map target values to indices
      dataPreparationConfig.uniqueTargetValues.forEach((value, index) => {
        mappedOutputs[index] = value;
      });
      outputs = outputs.map((output) =>
        Object.keys(mappedOutputs).find((key) => mappedOutputs[+key] === output)
      );
      dataPreparationMetadata.mappedOutputs = mappedOutputs;
    }
    const { inputsTensor, outputsTensor } = transformToTensor(
      inputs,
      outputs,
      dataPreparationConfig.outputsNumber,
      lastLayerShape
    );

    // Normalize inputs with min max scaler
    // const normalizedInputs = tf.tidy(() => {
    // 	const min = tf.min(inputsTensor);
    // 	const max = tf.max(inputsTensor);
    // 	return tf.tidy(() => tf.div(tf.sub(inputsTensor, min), tf.sub(max, min)));
    // });
    // Normalize inputs with z-score
    // const normalizedInputs = tf.tidy(() => {
    // 	const mean = tf.mean(inputsTensor);
    // 	// Calculate standard deviation, tf.std does not exist
    // 	const std = tf.tidy(() => tf.sqrt(tf.mean(tf.square(tf.sub(inputsTensor, mean)))));
    // 	return tf.tidy(() => tf.div(tf.sub(inputsTensor, mean), std));
    // });

    // Show first 10 rows of normalized inputs and first 10 rows of inputs as numbers not tensors
    // console.log({ normalizedInputs: normalizedInputs.slice(0, 10).arraySync(), inputs: inputsTensor.slice(0, 10).arraySync() })

    return {
      features: inputsTensor,
      target: outputsTensor,
      outputsNumber: dataPreparationConfig.outputsNumber,
      testIndices,
      trainIndices,
      dataPreparationMetadata,
    };
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
