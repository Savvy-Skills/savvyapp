import { useCourseStore } from "@/store/courseStore";
import styles from "@/styles/styles";
import {
  Text,
  View,
  /* @tutinfo Import <CODE>StyleSheet</CODE> to define styles. */ StyleSheet,
} from "react-native";

export default function LastSlide() {
  const { currentLesson, completedSlides, submittedAssessments } =
    useCourseStore();
  const currentSlides = currentLesson?.slides;

  const totalSlides = currentSlides?.length || 0;
  const totalAssessments =
    currentSlides?.filter((slide) => slide.type === "Assessment").length || 0;

  const activitiesIndexes: number[] = currentSlides
    ? currentSlides
        .map((slide, index) => (slide.type === "Activity" ? index : -1))
        .filter((index) => index !== -1)
    : [];
  //   To check if activity has been completed, check te idexes of the activities on the completedSlides array(boolean array)
  const activities = activitiesIndexes.map((index) => completedSlides[index]);
  const completedActivities = activities.filter((bool) => bool === true);

  const totalCompletedSlides = completedSlides.filter(
    (bool) => bool === true
  ).length;
  const correctSubmissions = submittedAssessments.filter(
    (submission) => submission.correct
  ).length;
  return (
    <View style={[styles.container, styles.centeredContainer]}>
      <Text style={styles.sectionTitle}>Stats!</Text>
      <Text>Here is your progress:</Text>
      <View>
        <Text>
          {totalCompletedSlides}/{totalSlides} slides completed
        </Text>
        <Text>
          {correctSubmissions}/{totalAssessments} assessments correct
        </Text>
        <Text>
          {completedActivities?.length}/{activities?.length} activities
          completed
        </Text>
      </View>
    </View>
  );
}
