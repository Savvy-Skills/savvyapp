import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Animated } from "react-native";
import {
  Button,
  ProgressBar,
  Text,
  TextInput,
  Switch,
  RadioButton,
  Checkbox,
  ActivityIndicator,
} from "react-native-paper";
import ScreenWrapper from "./screens/ScreenWrapper";

export default function HeavyTaskTest() {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [textInput, setTextInput] = useState("");
  const [switchValue, setSwitchValue] = useState(false);
  const [radioValue, setRadioValue] = useState("option1");
  const [checkboxValue, setCheckboxValue] = useState(false);
  const [heavyTaskResult, setHeavyTaskResult] = useState(0);

  const spinValue = new Animated.Value(0);

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const runHeavyTask = () => {
    setIsRunning(true);
    setProgress(0);
    setHeavyTaskResult(0);

    const totalIterations = 100;
    let currentIteration = 0;

    const iterate = () => {
      if (currentIteration < totalIterations) {
        // Simulate heavier work
        let result = 0;
        for (let i = 0; i < 5000000; i++) {
          result += Math.random();
        }

        currentIteration++;
        setProgress(currentIteration / totalIterations);
        setHeavyTaskResult((prev) => prev + result); // Force re-render on each iteration

        // Schedule the next iteration
        setTimeout(iterate, 0);
      } else {
        setIsRunning(false);
      }
    };

    // Start the iterations
    setTimeout(iterate, 0);
  };

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Heavy Task Test</Text>

        <ActivityIndicator animating={isRunning} style={styles.spinner} />

        <Button
          mode="contained"
          onPress={runHeavyTask}
          disabled={isRunning}
          style={styles.button}
        >
          {isRunning ? "Running..." : "Start Heavy Task"}
        </Button>

        {isRunning && (
          <View style={styles.progressContainer}>
            <ProgressBar progress={progress} style={styles.progressBar} />
            <Text>{`Progress: ${Math.round(progress * 100)}%`}</Text>
            <Text>{`Heavy Task Result: ${heavyTaskResult.toFixed(2)}`}</Text>
          </View>
        )}

        <View style={styles.formContainer}>
          <TextInput
            label="Text Input"
            value={textInput}
            onChangeText={setTextInput}
            style={styles.input}
          />

          <View style={styles.switchContainer}>
            <Text>Switch</Text>
            <Switch value={switchValue} onValueChange={setSwitchValue} />
          </View>

          <RadioButton.Group
            onValueChange={(value) => setRadioValue(value)}
            value={radioValue}
          >
            <View style={styles.radioContainer}>
              <RadioButton.Item label="Option 1" value="option1" />
              <RadioButton.Item label="Option 2" value="option2" />
            </View>
          </RadioButton.Group>

          <Checkbox.Item
            label="Checkbox"
            status={checkboxValue ? "checked" : "unchecked"}
            onPress={() => setCheckboxValue(!checkboxValue)}
          />

          <Button
            mode="outlined"
            onPress={() => console.log("Button pressed")}
            style={styles.button}
          >
            Pressable Button 1
          </Button>

          <Button
            mode="outlined"
            onPress={() => console.log("Button pressed")}
            style={styles.button}
          >
            Pressable Button 2
          </Button>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  button: {
    marginBottom: 16,
  },
  progressContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 16,
  },
  progressBar: {
    width: "100%",
    height: 8,
    marginBottom: 8,
  },
  formContainer: {
    width: "100%",
    maxWidth: 300,
  },
  input: {
    marginBottom: 16,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  radioContainer: {
    marginBottom: 16,
  },
  spinner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 4,
    borderColor: "#3498db",
    borderTopColor: "#9b59b6",
    marginBottom: 20,
  },
});
