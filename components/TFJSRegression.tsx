import React, { useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import { View, StyleSheet } from "react-native";
import { ActivityIndicator, Button, Text } from "react-native-paper";
import { fetch } from "@tensorflow/tfjs-react-native";

async function initializeTf() {
  await tf.ready();
  try {
    await fetch("");
  } catch (err) {
    // console.log({ err });
  }
}

export default function TfjsRegression() {
  const [model, setModel] = useState<tf.Sequential | null>(null);
  const [trained, setTrained] = useState(false);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [modelCreated, setModelCreated] = useState(false);

  const [tfReady, setTfReady] = useState(false);

  useEffect(() => {
    initializeTf();
    setTfReady(true);
  }, []);

  if (!tfReady) {
    return (
      <View>
        <ActivityIndicator></ActivityIndicator>
        <Text>Loading Tensorflow</Text>
      </View>
    );
  }

  const createModel = () => {
    const newModel = tf.sequential();
    newModel.add(tf.layers.dense({ units: 1, inputShape: [1] }));
    newModel.compile({ loss: "meanSquaredError", optimizer: "sgd" });
    newModel.summary();
    setModel(newModel);
    setModelCreated(true);
  };

  const trainModel = async () => {
    if (!model) return;

    try {
      // Generate some synthetic data for training
      const xs = tf.tensor2d([-1, 0, 1, 2, 3, 4], [6, 1]);
      const ys = tf.tensor2d([-3, -1, 1, 3, 5, 7], [6, 1]);
      // Train the model
      await model.fit(xs, ys, { epochs: 250 });
      setTrained(true);
    } catch (err) {
      console.log({ err });
    }
  };

  const makePrediction = async () => {
    if (!model || !trained) return;

    // Make a prediction
    const inputValue = 5;
    const inputTensor = tf.tensor2d([inputValue], [1, 1]);
    const predictionTensor = model.predict(inputTensor) as tf.Tensor;
    const predictionValue = await predictionTensor.data();
    setPrediction(predictionValue[0]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>TensorFlow.js Linear Regression</Text>
      <Button
        mode="contained"
        onPress={createModel}
        style={styles.button}
        disabled={modelCreated}
      >
        {modelCreated ? "Model Created" : "Create Model"}
      </Button>
      <Button
        mode="contained"
        onPress={trainModel}
        style={styles.button}
        disabled={!modelCreated || trained}
      >
        {trained ? "Model Trained" : "Train Model"}
      </Button>
      <Button
        mode="contained"
        onPress={makePrediction}
        style={styles.button}
        disabled={!trained}
      >
        Make Prediction
      </Button>
      {prediction !== null && (
        <Text style={styles.result}>
          Prediction for input 5: {prediction.toFixed(2)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  button: {
    marginVertical: 10,
  },
  result: {
    marginTop: 20,
    fontSize: 18,
  },
});
