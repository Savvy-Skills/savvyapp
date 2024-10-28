import { useMemo } from "react";
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

	const isLastSlide = useMemo(
		() => currentModule && currentSlideIndex === currentModule.slides.length - 1,
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

	const isCurrentSlideSubmittable = submittableStates[currentSlideIndex] && (!submission || !submission.correct);

	const handleCheck = () => {
		const newSubmission: Submission = {
			question_id: currentAssessmentID,
			correct: isCurrentSlideCorrect,
		};

		const newSubmissions = submission
			? submittedAssessments.map((sub) =>
					sub.question_id === currentAssessmentID ? newSubmission : sub
				)
			: [...submittedAssessments, newSubmission];

		setSubmittedAssessments(newSubmissions);

		playSound(isCurrentSlideCorrect ? "success" : "failure");
		console.log(isCurrentSlideCorrect ? "Correct!" : "Incorrect!");
	};

	return (
		<View style={styles.bottomNavigation}>
			<IconButton
				icon="chevron-left"
				size={24}
				onPress={previousSlide}
				disabled={currentSlideIndex === 0}
				style={styles.navButton}
				mode="contained"
				theme={{ colors: { primary: "#000", surfaceVariant:"#f4bb62" } }}
			/>
			<VerticalSeparator />
			<Button
				icon="check"
				mode="contained"
				disabled={!isCurrentSlideSubmittable}
				onPress={handleCheck}
			>
				Check
			</Button>
			<VerticalSeparator />
			<IconButton
				icon="chevron-right"
				size={24}
				onPress={nextSlide}
				disabled={isLastSlide}
				style={styles.navButton}
				containerColor="#f4bb62"
				iconColor="#000"
			/>
		</View>
	);
};

export default BottomBarNav;

function VerticalSeparator() {
	return <View style={styles.verticalSeparator} />;
}
