import styles from "@/styles/styles";
import {
  Text,
  View,
  /* @tutinfo Import <CODE>StyleSheet</CODE> to define styles. */ StyleSheet,
} from "react-native";

export default function FirstSlide() {
  return (
    <View style={[styles.container, styles.centeredContainer]}>
      <Text>First Slide</Text>
    </View>
  );
}

