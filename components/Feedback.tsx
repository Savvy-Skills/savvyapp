import { SLIDE_MAX_WIDTH } from "@/constants/Utils";
import styles from "@/styles/styles";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Dialog, Icon, Portal, Text } from "react-native-paper";
import ConfirmationDialog from "./ConfirmationDialog";

function FeedbackComponent({
  correctness,
  revealed,
  onTryAgain,
  onRevealAnswer,
  onShowExplanation,
  quizMode,
  showExplanation,
}: {
  correctness: boolean;
  revealed: boolean;
  onTryAgain: () => void;
  onRevealAnswer: () => void;
  onShowExplanation: () => void;
  quizMode: boolean;
  showExplanation: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);

  const handleShowReveal = () => {
    showDialog();
  };

  const handleReveal = () => {
    onRevealAnswer();
    hideDialog();
  };
  if (revealed) {
    return (
      <View
        style={[localStyles.feedbackContainer, localStyles.revealedFeedback]}
      >
        <View style={localStyles.feedbackHeader}>
          <Icon source="check" size={20} color="#666666" />
          <Text style={[localStyles.feedbackTitle, localStyles.revealedTitle]}>
            Here's the correct answer
          </Text>
        </View>
        <View style={localStyles.buttonContainer}>
          <Button
            mode="text"
            onPress={onShowExplanation}
            textColor="#321A5F"
            buttonColor="#E5E3FF"
            labelStyle={{ fontWeight: 600 }}
          >
            {showExplanation ? "Go back to question" : "See explanation"}
          </Button>
        </View>
      </View>
    );
  }

  if (correctness) {
    return (
      <View
        style={[localStyles.feedbackContainer, localStyles.correctFeedback]}
      >
        <View style={localStyles.feedbackHeader}>
          <Icon source="star" size={20} color="#3bc2f5" />
          <Text style={[localStyles.feedbackTitle, localStyles.correctTitle]}>
            Positive feedback
          </Text>
        </View>
        <View style={localStyles.buttonContainer}>
          <Button
            mode="text"
            onPress={onShowExplanation}
            textColor="#321A5F"
            buttonColor="#E5E3FF"
            labelStyle={{ fontWeight: 600 }}
          >
            {showExplanation ? "Go back to question" : "See explanation"}
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[localStyles.feedbackContainer, localStyles.incorrectFeedback]}
    >
      <View style={localStyles.feedbackHeader}>
        <Icon source="alert" size={20} color="#ff861d" />
        <Text style={[localStyles.feedbackTitle, localStyles.incorrectTitle]}>
          Negative feedback text
        </Text>
      </View>
      <View style={localStyles.buttonContainer}>
        {!quizMode ? (
          <>
            <Button
              mode="contained"
              onPress={onTryAgain}
              buttonColor="#321A5F"
              textColor="white"
              labelStyle={{ fontWeight: 600 }}
            >
              Try again
            </Button>

            <Button
              mode="text"
              onPress={handleShowReveal}
              textColor="#321A5F"
              buttonColor="#E5E3FF"
              labelStyle={{ fontWeight: 600 }}
            >
              See answer
            </Button>
          </>
        ) : (
          <Button
            mode="text"
            onPress={onShowExplanation}
            textColor="#321A5F"
            buttonColor="#E5E3FF"
            labelStyle={{ fontWeight: 600 }}
          >
            {showExplanation ? "Go back to question" : "See explanation"}
          </Button>
        )}
      </View>
      <ConfirmationDialog
        visible={visible}
        onDismiss={hideDialog}
        onConfirm={handleReveal}
        title="Are you sure?"
        content="This will give you no points for this question."
      />
    </View>
  );
}

export default FeedbackComponent;

const localStyles = StyleSheet.create({
  wrapperContainer: {
    flex: 1,
    flexDirection: "column",
    maxWidth: SLIDE_MAX_WIDTH,
    marginHorizontal: "auto",
    gap: 16,
  },
  container: {
    flex: 1,
    gap: 16,
    padding: 30,
    paddingTop: 16,
  },
  feedbackContainer: {
    padding: 16,
    borderWidth: 1,
    gap: 10,

  },
  feedbackHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 16,
    padding: 10,
  },
  correctFeedback: {
    backgroundColor: "#daedf5",
    borderColor: "#3bc2f5",
  },
  incorrectFeedback: {
    backgroundColor: "#ffe7cc",
    borderColor: "#ff861d",
  },
  revealedFeedback: {
    backgroundColor: "#f4f4f4",
    borderColor: "#e0e0e0",
  },
  correctTitle: {
    color: "#3bc2f5",
  },
  incorrectTitle: {
    color: "#ff861d",
  },
  revealedTitle: {
    color: "#666666",
  },
});
