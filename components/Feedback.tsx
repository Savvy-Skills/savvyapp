import { SLIDE_MAX_WIDTH } from "@/constants/Utils";
import styles from "@/styles/styles";
import { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Dialog, Icon, Portal, Text } from "react-native-paper";
import ConfirmationDialog from "./ConfirmationDialog";
import { Colors } from "@/constants/Colors";

function FeedbackComponent({
  correctness,
  revealed,
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

  const handleShowReveal = useCallback(() => {
    showDialog();
  }, [showDialog]);

  const handleReveal = useCallback(() => {
    onRevealAnswer();
    hideDialog();
  }, [onRevealAnswer, hideDialog]);

  if (revealed) {
    return (
      <View
        style={[styles.feedbackContainer, styles.revealedFeedback]}
      >
        <View style={styles.feedbackHeader}>
          <Icon source="check" size={20} color={Colors.revealedText} />
          <Text style={[styles.feedbackTitle, styles.revealedTitle]}>
            Here's the correct answer
          </Text>
        </View>
        <View style={styles.buttonContainer}>
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
        style={[styles.feedbackContainer, styles.correctFeedback]}
      >
        <View style={styles.feedbackHeader}>
          <Icon source="star" size={20} color={Colors.success} />
          <Text style={[styles.feedbackTitle, styles.correctTitle]}>
            Positive feedback
          </Text>
        </View>
        <View style={styles.buttonContainer}>
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
      style={[styles.feedbackContainer, styles.incorrectFeedback]}
    >
      <View style={styles.feedbackHeader}>
        <Icon source="alert" size={20} color={Colors.error} />
        <Text style={[styles.feedbackTitle, styles.incorrectTitle]}>
          Negative feedback text
        </Text>
      </View>
      <View style={styles.buttonContainer}>
        {!quizMode ? (
          <>
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
