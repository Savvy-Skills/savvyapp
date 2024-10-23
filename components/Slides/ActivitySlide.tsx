import {
  Text,
  View,
  /* @tutinfo Import <CODE>StyleSheet</CODE> to define styles. */ StyleSheet,
} from "react-native";
import { ActivitySlide as ActivitySlideType } from "@/types";

type ActivityProps = {
  slide: ActivitySlideType;
};

export default function ActivitySlide({ slide }: ActivityProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>AssessmentSlide</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    /* @tutinfo Add the value of <CODE>backgroundColor</CODE> property with <CODE>'#25292e'</CODE>.*/
    backgroundColor: "#25292e",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#fff",
  },
});
