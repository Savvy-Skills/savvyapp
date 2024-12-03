import { useSnackbarStore } from "@/store/snackbarStore";
import styles from "@/styles/styles";
import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import {
  Modal,
  Portal,
  Text,
  TextInput,
  Button,
  RadioButton,
} from "react-native-paper";

type FeedbackType = "bug" | "suggestion";

interface FeedbackModalProps {
  visible: boolean;
  onDismiss: () => void;
  currentLessonInfo: {
    lessonId: number;
    currentIndex: number;
    lessonTitle: string;
  };
  onSubmitFeedback: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  visible,
  onDismiss,
  currentLessonInfo,
  onSubmitFeedback,
}) => {
  const [feedbackType, setFeedbackType] = useState<FeedbackType>("bug");
  const [description, setDescription] = useState("");
  const { showSnackbar } = useSnackbarStore();

  const showNack = () => {
    showSnackbar({
      message: "Thanks for your submission!",
      type: "success",
      duration: 4000,
    });
  };

  const resetStates = () => {
    setFeedbackType("bug");
    setDescription("");
  };

  const handleSubmit = () => {
    // Here you would typically send this data to your backend
    const feedbackData = {
      type: feedbackType,
      description,
      lessonInfo: currentLessonInfo,
      timestamp: new Date().toISOString(),
    };
    console.log("Submitting feedback:", feedbackData);
    // TODO: Implement actual submission logic
    resetStates();
    onDismiss();
	showNack();
	onSubmitFeedback();
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[localStyles.containerStyle, styles.centeredMaxWidth]}
      >
        <Text style={localStyles.title}>Send Feedback</Text>
        <RadioButton.Group
          onValueChange={(value) => setFeedbackType(value as FeedbackType)}
          value={feedbackType}
        >
          <View style={localStyles.radioGroup}>
            <RadioButton.Item label="Report a bug" value="bug" />
            <RadioButton.Item label="Suggest an idea" value="suggestion" />
          </View>
        </RadioButton.Group>
        <TextInput
          label="Description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          style={localStyles.input}
        />
        <Text style={localStyles.infoText}>
          Lesson: {currentLessonInfo.lessonTitle} (Slide{" "}
          {currentLessonInfo.currentIndex + 1})
        </Text>
        <Button
          mode="contained"
          onPress={handleSubmit}
          style={localStyles.submitButton}
        >
          Submit Feedback
        </Button>
      </Modal>
    </Portal>
  );
};

const localStyles = StyleSheet.create({
  containerStyle: {
    backgroundColor: "white",
    padding: 20,
    margin: 20,
    borderRadius: 8,
	maxWidth: 600,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  radioGroup: {
    marginBottom: 15,
  },
  input: {
    marginBottom: 15,
  },
  infoText: {
    fontSize: 12,
    color: "gray",
    marginBottom: 15,
  },
  submitButton: {
    marginTop: 10,
  },
});
