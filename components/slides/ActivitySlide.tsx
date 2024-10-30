import {
  Text,
  View,
  /* @tutinfo Import <CODE>StyleSheet</CODE> to define styles. */ StyleSheet,
} from "react-native";
import { ActivitySlide as ActivitySlideType } from "@/types";

type ActivityProps = {
  slide: ActivitySlideType;
  index: number;
};

export default function ActivitySlide({ slide, index }: ActivityProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Activity Slide</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#fff",
  },
});
