import { SLIDE_MAX_WIDTH } from "@/constants/Utils";
import { useSnackbarStore } from "@/store/snackbarStore";
import styles from "@/styles/styles";
import React, { useCallback, useState } from "react";
import { View, StyleSheet } from "react-native";
import {
  Modal,
  Portal,
  Text,
  TextInput,
  Button,
} from "react-native-paper";
import CustomRadioButton from "../common/SavvyRadioButton";
import { BaseFeedback } from "@/types";
import { postFeedback } from "@/services/coursesApi";
import { Colors } from "@/constants/Colors";

type FeedbackType = "bug" | "suggestion";

interface FeedbackModalProps {
  visible: boolean;
  onDismiss: () => void;
  currentViewInfo: {
    viewId: number;
    currentIndex: number;
    viewTitle: string;
  };
  onSubmitFeedback: () => void;
}

const renderTextOption = (
  option: "bug" | "suggestion",
  onPress: (name: "bug" | "suggestion") => void,
  selected?: boolean
) => {
  const label = option === "bug" ? "Report a bug" : "Suggest an idea";
  return (
    <View style={styles.optionContainer}>
      <CustomRadioButton
        label={label}
        value={option}
        status={selected ? "checked" : "unchecked"}
        onPress={() => onPress(option)}
        style={[styles.option, selected && styles.selectedOption]}
        disabledTouchable={selected}
      />
    </View>
  );
};
export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  visible,
  onDismiss,
  currentViewInfo,
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

  const handleSubmit = useCallback(async () => {
    // Here you would typically send this data to your backend
    const feedbackData: BaseFeedback = {
      type: feedbackType,
      text: description,
      extra_info: {
        viewInfo: currentViewInfo,
      },
    };

    await postFeedback(feedbackData);

    resetStates();
    onDismiss();
    showNack();
    onSubmitFeedback();
  }, [feedbackType, description, currentViewInfo]);

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[
          styles.feedbackModalContainer,
          styles.centeredMaxWidth,
          styles.slideWidth,
        ]}
      >
        <Text style={localStyles.title}>Send Feedback</Text>
        <View style={localStyles.optionsContainer}>
          {renderTextOption("bug", setFeedbackType, feedbackType === "bug")}
          {renderTextOption(
            "suggestion",
            setFeedbackType,
            feedbackType === "suggestion"
          )}
        </View>
        <TextInput
          label="Description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          style={localStyles.input}
        />
        <Text style={localStyles.infoText}>
          View: {currentViewInfo.viewTitle} (Slide{" "}
          {currentViewInfo.currentIndex + 1})
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
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  optionsContainer: {
    gap: 4,
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  infoText: {
    fontSize: 12,
    color: Colors.mutedText,
    marginBottom: 15,
  },
  submitButton: {
    marginTop: 10,
  },
});
