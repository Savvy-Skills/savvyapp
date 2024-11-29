import { useCourseStore } from "@/store/courseStore";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  Text,
  ProgressBar,
  Card,
  IconButton,
  Surface,
} from "react-native-paper";
import { useTheme } from "react-native-paper";

export default function LastSlide() {
  const theme = useTheme();
  const { currentLesson, completedSlides, submittedAssessments } =
    useCourseStore();
  const currentSlides = currentLesson?.slides;

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

  const totalCompletedSlides = completedSlides.filter(
    (bool) => bool === true
  ).length;
  const correctSubmissions = submittedAssessments.filter(
    (submission) => submission.correct
  ).length;

  // Calculate percentages for progress bars
  const slideProgress = totalCompletedSlides / totalSlides;
  const assessmentProgress = correctSubmissions / totalAssessments;
  const activityProgress =
    completedActivities.length / (activities.length || 1);

  return (
    <ScrollView>
      <Surface style={styles.container} elevation={0}>
        <Card style={styles.card}>
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
          <Card.Content style={styles.statsContainer}>
            {/* Slides Progress */}
            <View style={styles.statItem}>
              <View style={styles.statHeader}>
                <IconButton icon="book-open-variant" size={24} />
                <Text variant="titleMedium">Slides Progress</Text>
              </View>
              <Text variant="bodyMedium" style={styles.statText}>
                {totalCompletedSlides}/{totalSlides} slides completed
              </Text>
              <ProgressBar
                progress={slideProgress}
                style={styles.progressBar}
                color={theme.colors.primary}
              />
            </View>

            {/* Assessments Progress */}
            <View style={styles.statItem}>
              <View style={styles.statHeader}>
                <IconButton icon="pencil-box-multiple" size={24} />
                <Text variant="titleMedium">Assessments</Text>
              </View>
              <Text variant="bodyMedium" style={styles.statText}>
                {correctSubmissions}/{totalAssessments} correct answers
              </Text>
              <ProgressBar
                progress={assessmentProgress}
                style={styles.progressBar}
                color={theme.colors.secondary}
              />
            </View>

            {/* Activities Progress */}
            <View style={styles.statItem}>
              <View style={styles.statHeader}>
                <IconButton icon="puzzle" size={24} />
                <Text variant="titleMedium">Activities</Text>
              </View>
              <Text variant="bodyMedium" style={styles.statText}>
                {completedActivities.length}/{activities.length} activities
                completed
              </Text>
              <ProgressBar
                progress={activityProgress}
                style={styles.progressBar}
                color={theme.colors.tertiary}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Motivational message based on progress */}
        <Card style={[styles.messageCard, styles.marginTop]}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.messageText}>
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

const styles = StyleSheet.create({
  container: {
    maxHeight: "100%",
    maxWidth: 600,
	width: "100%",
    flex: 1,
    padding: 16,
    justifyContent: "center",
    alignSelf: "center",
  },
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
