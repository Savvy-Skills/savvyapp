import { useMemo } from "react";
import { useAudioStore } from "@/store/audioStore";
import { useModuleStore } from "@/store/moduleStore";
import styles from "@/styles/styles";
import { Submission } from "@/types";
import { View } from "react-native";
import { Button, IconButton, useTheme } from "react-native-paper";

function createSubmission(
  question_id: any,
  correct: any,
  value: any[]
): Submission {
  return {
    question_id,
    correct,
    answer: value,
  };
}

const BottomBarNav = () => {
  const {
    previousSlide,
    currentModule,
    currentSlideIndex,
    nextSlide,
    submittableStates,
    correctnessStates,
    submittedAssessments,
    setSubmittedAssessments,
    checkSlideCompletion,
  } = useModuleStore();

  const { playSound } = useAudioStore();

  const isLastSlide = useMemo(
    () =>
      currentModule && currentSlideIndex === currentModule.slides.length - 1,
    [currentModule, currentSlideIndex]
  );

  const isCurrentSlideCorrect = correctnessStates[currentSlideIndex] || false;

  const currentAssessmentID = useMemo(
    () =>
      currentModule?.slides[currentSlideIndex].type === "Assessment"
        ? currentModule.slides[currentSlideIndex].question_id
        : -1,
    [currentModule, currentSlideIndex]
  );

  const submission = useMemo(
    () =>
      submittedAssessments.find(
        (submission) => submission.question_id === currentAssessmentID
      ),
    [submittedAssessments, currentAssessmentID]
  );

  const isCurrentSlideSubmittable =
    submittableStates[currentSlideIndex] &&
    (!submission || !submission.correct);

  const handleCheck = () => {
    const newSubmission = createSubmission(
      currentAssessmentID,
      isCurrentSlideCorrect,
      []
    );

    const newSubmissions = submission
      ? submittedAssessments.map((sub) =>
          sub.question_id === currentAssessmentID ? newSubmission : sub
        )
      : [...submittedAssessments, newSubmission];

    setSubmittedAssessments(newSubmissions);

    playSound(isCurrentSlideCorrect ? "success" : "failure");
    if (isCurrentSlideCorrect) {
      checkSlideCompletion();
    }
  };

  const handleMenu = () => {
    console.log("Menu pressed");
  };

  return (
    <View style={styles.bottomNavigation}>
      <IconButton
        icon="chevron-left"
        size={18}
        onPress={previousSlide}
        disabled={currentSlideIndex === 0}
        style={styles.navButton}
        mode="contained"
        iconColor="#000"
        theme={{
          colors: {
            surfaceVariant: "rgb(244, 187, 98)",
            surfaceDisabled: "rgba(244, 187, 98, 0.3)",
          },
        }}
      />
      <VerticalSeparator />
      <IconButton
        icon="dots-vertical"
        size={18}
        onPress={handleMenu}
        mode="contained"
        iconColor="#000"
        containerColor="rgb(244, 187, 98)"
        style={styles.navButton}
      />
      <Button
        icon="check"
        mode="contained"
        disabled={!isCurrentSlideSubmittable}
        onPress={handleCheck}
        style={[styles.checkButton]}
        dark={false}
        contentStyle={{ height: 28 }}
        theme={{
          colors: {
            primary: "rgb(217, 240, 251)",
            surfaceDisabled: "rgba(217, 240, 251, 0.3)",
          },
        }}
      >
        Check
      </Button>
      <VerticalSeparator />
      <IconButton
        icon="chevron-right"
        size={18}
        onPress={nextSlide}
        disabled={isLastSlide}
        style={styles.navButton}
        iconColor="#000"
        mode="contained"
        theme={{
          colors: {
            surfaceVariant: "rgb(244, 187, 98)",
            surfaceDisabled: "rgba(244, 187, 98, 0.3)",
          },
        }}
      />
    </View>
  );
};

export default BottomBarNav;

function VerticalSeparator() {
  return <View style={styles.verticalSeparator} />;
}
