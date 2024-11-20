import React, { useState, useEffect } from "react";
import { View, Image, StyleSheet } from "react-native";
import {
  Button,
  Text,
  ProgressBar,
  Snackbar,
  Icon,
  Checkbox,
} from "react-native-paper";
import { useCourseStore } from "@/store/courseStore";
import { useThemeStore } from "@/store/themeStore";
import ThemedTitle from "../themed/ThemedTitle";
import { useAudioStore } from "@/store/audioStore";

const employeeImages = {
  employee1: require("@/assets/images/activities/facerecognition/employee1.png"),
  employee1Camera: require("@/assets/images/activities/facerecognition/employee1-camera.png"),
  employee2: require("@/assets/images/activities/facerecognition/employee2.png"),
  employee2Camera: require("@/assets/images/activities/facerecognition/employee2-camera.png"),
  employee3: require("@/assets/images/activities/facerecognition/employee3.png"),
  employee3Camera: require("@/assets/images/activities/facerecognition/employee3-camera.png"),
  employee4: require("@/assets/images/activities/facerecognition/employee4.png"),
  employee4Camera: require("@/assets/images/activities/facerecognition/employee4-camera.png"),
  employee5: require("@/assets/images/activities/facerecognition/employee5.png"),
  employee5Camera: require("@/assets/images/activities/facerecognition/employee5-camera.png"),
  employee6: require("@/assets/images/activities/facerecognition/employee6.png"),
  employee6Camera: require("@/assets/images/activities/facerecognition/employee6-camera.png"),
};

type Employee = {
  id: number;
  name: string;
  savedPhoto: keyof typeof employeeImages;
  cameraPhoto: keyof typeof employeeImages;
  shouldGrantAccess: boolean;
};

type ActivityProps = {
  systemRecognitionTime: number;
};

const employees: Employee[] = [
  {
    id: 1,
    name: "Employee 1",
    savedPhoto: "employee1",
    cameraPhoto: "employee1Camera",
    shouldGrantAccess: true,
  },
  {
    id: 2,
    name: "Employee 2",
    savedPhoto: "employee2",
    cameraPhoto: "employee2Camera",
    shouldGrantAccess: false,
  },
  {
    id: 3,
    name: "Employee 3",
    savedPhoto: "employee3",
    cameraPhoto: "employee3Camera",
    shouldGrantAccess: true,
  },
  {
    id: 4,
    name: "Employee 4",
    savedPhoto: "employee4",
    cameraPhoto: "employee4Camera",
    shouldGrantAccess: true,
  },
  {
    id: 5,
    name: "Employee 5",
    savedPhoto: "employee5",
    cameraPhoto: "employee5Camera",
    shouldGrantAccess: false,
  },
  {
    id: 6,
    name: "Employee 6",
    savedPhoto: "employee6",
    cameraPhoto: "employee6Camera",
    shouldGrantAccess: false,
  },
];

const Introduction: React.FC<{ onStart: () => void }> = ({ onStart }) => (
  <View style={styles.container}>
    <ThemedTitle>Face Recognition Challenge</ThemedTitle>
    <Text style={styles.introText}>
      Welcome to the Face Recognition Challenge! In this activity, you'll play
      the role of a face recognition system. Your task is to compare the camera
      photo with the saved photo and decide whether to grant or deny access to
      each employee.
    </Text>
    <Text style={styles.introText}>
      Try to be as accurate and fast as possible. Your performance will be
      compared to an automated system.
    </Text>
    <Text style={styles.introText}>
      To complete the challenge successfully, you need to achieve at least 80%
      accuracy and finish within 60 seconds of the system's time.
    </Text>
    <Button mode="contained" onPress={onStart} style={styles.startButton}>
      Start Challenge
    </Button>
  </View>
);

const Timer: React.FC<{ elapsedTime: number }> = ({ elapsedTime }) => (
  <View style={styles.timer}>
    <Icon size={24} source={"timer"} />
    <Text style={styles.timerText}>{`${elapsedTime}s`}</Text>
  </View>
);

const EmployeeImages: React.FC<{ employee: Employee }> = ({ employee }) => {
  const { theme } = useThemeStore();
  return (
    <View style={styles.imageContainer}>
      <View style={styles.imageWrapper}>
        <Image
          source={employeeImages[employee.cameraPhoto]}
          style={[styles.image, { borderColor: theme.dark ? "#fff" : "#000" }]}
        />
        <View style={styles.imageLabel}>
          <Icon source={"camera"} size={24} />
          <Text>Camera Photo</Text>
        </View>
      </View>
      <View style={styles.imageWrapper}>
        <Image
          source={employeeImages[employee.savedPhoto]}
          style={[styles.image, { borderColor: theme.dark ? "#fff" : "#000" }]}
        />
        <View style={styles.imageLabel}>
          <Icon source={"floppy"} size={24} />
          <Text>Saved Photo</Text>
        </View>
      </View>
    </View>
  );
};

const DecisionButtons: React.FC<{
  onDecision: (grantAccess: boolean) => void;
  isTransitioning: boolean;
}> = ({ onDecision, isTransitioning }) => (
  <View style={[styles.buttonContainer, isTransitioning && { opacity: 0.7 }]}>
    <Button
      mode="contained"
      onPress={() => !isTransitioning && onDecision(true)}
      style={[styles.button, styles.grantButton]}
      labelStyle={styles.buttonLabel}
    >
      Grant Access
    </Button>
    <Button
      mode="contained"
      onPress={() => !isTransitioning && onDecision(false)}
      style={[styles.button, styles.denyButton]}
      labelStyle={styles.buttonLabel}
    >
      Deny Access
    </Button>
  </View>
);

const Results: React.FC<{
  studentTime: number;
  systemRecognitionTime: number;
  correctDecisions: number;
  totalEmployees: number;
  onReset: (showIntroduction: boolean) => void;
}> = ({
  studentTime,
  systemRecognitionTime,
  correctDecisions,
  totalEmployees,
  onReset,
}) => {
  const [showIntroduction, setShowIntroduction] = useState(false);
  const accuracy = (correctDecisions / totalEmployees) * 100;
  const timeDifference = Math.abs(studentTime - systemRecognitionTime) / 1000;
  const isSuccessful = accuracy >= 80 && timeDifference <= 60;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Activity Complete!</Text>
      <Text style={styles.resultText}>
        Your time: {(studentTime / 1000).toFixed(2)} seconds
      </Text>
      <Text style={styles.resultText}>
        Face recognition system time:{" "}
        {(systemRecognitionTime / 1000).toFixed(2)} seconds
      </Text>
      <Text style={styles.resultText}>
        Your accuracy: {accuracy.toFixed(2)}%
      </Text>
      <Text style={styles.comparisonText}>
        {isSuccessful
          ? "Congratulations! You've successfully completed the challenge!"
          : "You didn't meet the completion criteria. Keep practicing!"}
      </Text>
      <Text style={styles.comparisonText}>
        {accuracy >= 80
          ? "Great job on your accuracy!"
          : "Try to improve your accuracy to at least 80%."}
      </Text>
      <Text style={styles.comparisonText}>
        {timeDifference <= 60
          ? "Your timing was excellent!"
          : "Try to complete the challenge within 60 seconds of the system's time."}
      </Text>
      <View style={styles.checkboxContainer}>
        <Checkbox
          status={showIntroduction ? "checked" : "unchecked"}
          onPress={() => setShowIntroduction(!showIntroduction)}
        />
        <Text style={styles.checkboxLabel}>Show introduction</Text>
      </View>
      <Button
        mode="contained"
        onPress={() => onReset(showIntroduction)}
        style={styles.button}
      >
        Try Again
      </Button>
    </View>
  );
};

export default function FaceRecognitionActivity({
  systemRecognitionTime = 5000,
}: ActivityProps) {
  const [currentEmployeeIndex, setCurrentEmployeeIndex] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState(0);
  const [isActivityComplete, setIsActivityComplete] = useState(false);
  const [correctDecisions, setCorrectDecisions] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isIntroductionComplete, setIsIntroductionComplete] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { checkSlideCompletion } = useCourseStore();
  const {playSound} = useAudioStore()
  const timeLimit = 60000;

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (startTime !== null && !isActivityComplete) {
      intervalId = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [startTime, isActivityComplete]);

  const handleDecision = (grantAccess: boolean) => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    if (startTime === null) {
      setStartTime(Date.now());
    }

    const isCorrect =
      grantAccess === employees[currentEmployeeIndex].shouldGrantAccess;

    if (isCorrect) {
      setCorrectDecisions(correctDecisions + 1);
      setFeedbackMessage("Correct decision!");
    } else {
      setFeedbackMessage(
        "Incorrect decision. Try to look more closely next time."
      );
    }
    setShowFeedback(true);
	playSound(isCorrect?"success":"failVariant", 0.6)

    if (currentEmployeeIndex < employees.length - 1) {
      setTimeout(() => {
        setCurrentEmployeeIndex(currentEmployeeIndex + 1);
        setShowFeedback(false);
        setIsTransitioning(false);
      }, 2000);
    } else {
      setTimeout(() => {
        setEndTime(Date.now());
        setIsActivityComplete(true);
        const accuracy = ((correctDecisions + 1) / employees.length) * 100;
        const studentTime = Date.now() - (startTime || 0);
        const timeDifference =
          Math.abs(studentTime - systemRecognitionTime) / 1000;
        const isSuccessful =
          accuracy >= 80 && timeDifference <= timeLimit / 1000;
        checkSlideCompletion({ completed: isSuccessful });
      }, 2000);
    }
  };

  const resetActivity = (showIntroduction: boolean) => {
    setCurrentEmployeeIndex(0);
    setStartTime(null);
    setEndTime(0);
    setIsActivityComplete(false);
    setCorrectDecisions(0);
    setShowFeedback(false);
    setElapsedTime(0);
    setIsIntroductionComplete(!showIntroduction);
    setIsTransitioning(false); // Reset the transitioning state
  };

  const startActivity = () => {
    setIsIntroductionComplete(true);
  };

  if (!isIntroductionComplete) {
    return <Introduction onStart={startActivity} />;
  }

  if (isActivityComplete) {
    return (
      <Results
        studentTime={endTime - (startTime || 0)}
        systemRecognitionTime={systemRecognitionTime}
        correctDecisions={correctDecisions}
        totalEmployees={employees.length}
        onReset={resetActivity}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedTitle>Face Recognition Simulation</ThemedTitle>
        <Timer elapsedTime={elapsedTime} />
      </View>
      <View style={styles.progressBarContainer}>
        <ProgressBar
          progress={(currentEmployeeIndex + 1) / employees.length}
          style={styles.progressBar}
        />
      </View>
      <EmployeeImages employee={employees[currentEmployeeIndex]} />
      <Text style={styles.question}>
        Should this employee be granted access?
      </Text>
      <DecisionButtons
        onDecision={handleDecision}
        isTransitioning={isTransitioning}
      />
      <Snackbar
        visible={showFeedback}
        onDismiss={() => setShowFeedback(false)}
        duration={2000}
      >
        {feedbackMessage}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    alignSelf: "center",
    justifyContent: "center",
    padding: 20,
    maxWidth: 600,
  },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  timer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    padding: 8,
    borderRadius: 8,
  },
  timerText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  progressBarContainer: {
    width: "100%",
    height: 10,
    marginBottom: 20,
    marginTop: 20,
  },
  progressBar: {
    height: 10,
  },
  imageContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 20,
  },
  imageWrapper: {
    alignItems: "center",
  },
  image: {
    width: 150,
    height: 150,
    resizeMode: "contain",
    marginBottom: 8,
    borderWidth: 1,
    borderRadius: 4,
  },
  imageLabel: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    paddingVertical: 4,
    width: "100%",
    justifyContent: "center",
    borderRadius: 4,
    gap: 4,
  },
  question: {
    fontSize: 18,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  button: {
    minWidth: 120,
  },
  grantButton: {
    backgroundColor: "#22c55e",
  },
  denyButton: {
    backgroundColor: "#ef4444",
  },
  buttonLabel: {
    fontSize: 16,
    paddingVertical: 4,
  },
  resultText: {
    fontSize: 18,
    marginBottom: 10,
  },
  comparisonText: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
    textAlign: "center",
  },
  introText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  startButton: {
    marginTop: 20,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
  },
});
