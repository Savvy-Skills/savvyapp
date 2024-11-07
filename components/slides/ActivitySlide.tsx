import {
  Text,
  View,
  /* @tutinfo Import <CODE>StyleSheet</CODE> to define styles. */ StyleSheet,
} from "react-native";
import { ActivitySlide as ActivitySlideType } from "@/types";
import FaceRecognitionActivity from "../activities/FaceRecognitionActivity";

type ActivityProps = {
  slide: ActivitySlideType;
  index: number;
};

export default function ActivitySlide({ slide, index }: ActivityProps) {
  return (
    <View style={styles.container}>
      <FaceRecognitionActivity systemRecognitionTime={5000} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  text: {
    color: "#fff",
  },
});
