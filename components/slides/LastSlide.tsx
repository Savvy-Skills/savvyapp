import { useCourseStore } from "@/store/courseStore";
import styles from "@/styles/styles";
import { Image } from "expo-image";
import { useEffect, useRef } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
	Text,
	ProgressBar,
	Card,
	IconButton,
	Surface,
	Button,
} from "react-native-paper";
import { useTheme } from "react-native-paper";

export default function LastSlide() {
	const theme = useTheme();
	const { currentView, completedSlides, submittedAssessments, currentSlideIndex, setCurrentSlideIndex } =
		useCourseStore();
	const currentSlides = currentView?.slides;
	const imageRef = useRef<Image>(null);

	const totalSlides = currentSlides?.length || 0;
	const totalAssessments =
		currentSlides?.filter((slide) => slide.type === "Assessment").length || 0;

	const activitiesIndexes = currentSlides
		? currentSlides
			.map((slide, index) => (slide.type === "Activity" ? index : -1))
			.filter((index) => index !== -1)
		: [];

	const activities = activitiesIndexes.map((index) => completedSlides[index]);
	const completedActivities = activities.filter((bool) => bool === true);

	// Completed slides is an array of booleans, where each index corresponds with the currentSlideIndex
	// So we need to find the first index of the completedSlides array that is false
	const firstIncompleteSlide = completedSlides.findIndex((bool) => bool === false);

	const totalCompletedSlides = completedSlides.filter(
		(bool) => bool === true
	).length;
	const correctSubmissions = submittedAssessments.filter(
		(submission) => submission.isCorrect
	).length;

	// Calculate percentages for progress bars
	const slideProgress = totalCompletedSlides / totalSlides;
	const assessmentProgress = correctSubmissions / totalAssessments;
	const activityProgress =
		completedActivities.length / (activities.length || 1);


	return (
		<ScrollView>
			{slideProgress === 1 && (
				<View style={{ alignItems: "center" }}>
					<Image ref={imageRef} source={require("@/assets/animations/completed-once.gif")} style={{ width: 60, height: 60, alignSelf: "center" }} />
					<Text> Congratulations! </Text>
				</View>
			)}
			{/* TODO: If the progress is not 1, show button to go to the first incomplete slide */}
			{slideProgress !== 1 && (
				<Button onPress={() => {
					if (firstIncompleteSlide !== -1) {
						setCurrentSlideIndex(firstIncompleteSlide!);
					}
				}}>Go to first incomplete slide</Button>
			)}
			<Surface style={[styles.container, styles.centeredMaxWidth, styles.slideWidth]} elevation={0}>
				<Card style={localStyles.card}>
					<Card.Title
						title="Your Progress Stats"
						subtitle="Keep up the great work!"
						left={(props) => (
							<IconButton
								{...props}
								icon="chart-bar"
								size={30}
								iconColor={theme.colors.primary}
							/>
						)}
					/>
					<Card.Content style={localStyles.statsContainer}>
						{/* Slides Progress */}
						<View style={localStyles.statItem}>
							<View style={localStyles.statHeader}>
								<IconButton icon="book-open-variant" size={24} />
								<Text variant="titleMedium">Slides Progress</Text>
							</View>
							<Text variant="bodyMedium" style={localStyles.statText}>
								{totalCompletedSlides}/{totalSlides} slides completed
							</Text>
							<ProgressBar
								progress={slideProgress}
								style={localStyles.progressBar}
								color={theme.colors.primary}
							/>
						</View>

						{/* Assessments Progress */}
						<View style={localStyles.statItem}>
							<View style={localStyles.statHeader}>
								<IconButton icon="pencil-box-multiple" size={24} />
								<Text variant="titleMedium">Assessments</Text>
							</View>
							<Text variant="bodyMedium" style={localStyles.statText}>
								{correctSubmissions}/{totalAssessments} correct answers
							</Text>
							<ProgressBar
								progress={assessmentProgress}
								style={localStyles.progressBar}
								color={theme.colors.secondary}
							/>
						</View>

						{/* Activities Progress */}
						{activities.length > 0 && (
							<View style={localStyles.statItem}>
								<View style={localStyles.statHeader}>
									<IconButton icon="puzzle" size={24} />
									<Text variant="titleMedium">Activities</Text>
								</View>
								<Text variant="bodyMedium" style={localStyles.statText}>
									{completedActivities.length}/{activities.length} activities
									completed
								</Text>
								<ProgressBar
									progress={activityProgress}
									style={localStyles.progressBar}
									color={theme.colors.tertiary}
								/>
							</View>
						)}
					</Card.Content>
				</Card>
				{/* Motivational message based on progress */}
				<Card style={[localStyles.messageCard, localStyles.marginTop]}>
					<Card.Content>
						<Text variant="titleMedium" style={localStyles.messageText}>
							{slideProgress === 1
								? "🎉 Amazing! You've completed all slides!"
								: "Keep going! You're making great progress! 💪"}
						</Text>
					</Card.Content>
				</Card>
			</Surface>
		</ScrollView>
	);
}

const localStyles = StyleSheet.create({
	content: {
		width: "100%",
	},
	card: {
		paddingVertical: 16,
		marginBottom: 16,
	},
	statsContainer: {
		gap: 24,
		paddingVertical: 8,
	},
	statItem: {
		gap: 8,
	},
	statHeader: {
		flexDirection: "row",
		alignItems: "center",
	},
	progressBar: {
		height: 8,
		borderRadius: 4,
	},
	statText: {
		textAlign: "center",
	},
	messageCard: {
		backgroundColor: "#f0f8ff",
	},
	messageText: {
		textAlign: "center",
	},
	marginTop: {
		marginTop: 16,
	},
});
