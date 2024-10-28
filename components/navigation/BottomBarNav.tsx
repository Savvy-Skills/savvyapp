import { useAudioStore } from "@/store/audioStore";
import { useModuleStore } from "@/store/moduleStore";
import styles from "@/styles/styles";
import { Submission } from "@/types";
import { View } from "react-native";
import { Button, IconButton } from "react-native-paper";

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
  } = useModuleStore();

  const { playSound } = useAudioStore();

  const isLastSlide =
    currentModule && currentSlideIndex === currentModule.slides.length - 1;
  const isCurrentSlideCorrect = correctnessStates[currentSlideIndex] || false;
  const currentAssessmentID =
    currentModule?.slides[currentSlideIndex].type === "Assessment"
      ? currentModule.slides[currentSlideIndex].question_id
      : -1;

  //   const isSubmitted: boolean = submittedAssessments.find((submission)=>submission.question_id === currentAssessmentID) !== undefined;
  const submission: Submission | undefined = submittedAssessments.find(
    (submission) => submission.question_id === currentAssessmentID
  );

  const isCurrentSlideSubmittable = submittableStates[currentSlideIndex] && (!submission || !submission.correct);

  const handleCheck = () => {
	if (!submission){
		setSubmittedAssessments([...submittedAssessments, {question_id: currentAssessmentID, correct: isCurrentSlideCorrect}]);
	} else {
		const newSubmissions = submittedAssessments.map((submission) => {
			if (submission.question_id === currentAssessmentID){
				return {question_id: currentAssessmentID, correct: isCurrentSlideCorrect};
			}
			return submission;
		});
		setSubmittedAssessments(newSubmissions);
	}
    if (isCurrentSlideCorrect) {
      console.log("Correct!");
      playSound("success");
    } else {
      playSound("failure");
      console.log("Incorrect!");
    }
  };

  return (
    <View style={styles.bottomNavigation}>
      <IconButton
        icon="chevron-left"
        size={24}
        onPress={previousSlide}
        disabled={currentSlideIndex === 0}
        style={styles.navButton}
      />
      <Button
        icon="check"
        mode="contained"
        disabled={!isCurrentSlideSubmittable}
        onPress={handleCheck}
      >
        Check
      </Button>
      <IconButton
        icon="chevron-right"
        size={24}
        onPress={nextSlide}
        disabled={isLastSlide}
        style={styles.navButton}
      />
    </View>
  );
};

export default BottomBarNav;
