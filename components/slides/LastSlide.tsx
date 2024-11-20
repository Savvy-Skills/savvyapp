import styles from "@/styles/styles";
import {
  Text,
  View,
  /* @tutinfo Import <CODE>StyleSheet</CODE> to define styles. */ StyleSheet,
} from "react-native";



export default function LastSlide() {
  return (
    <View style={[styles.container, styles.centeredContainer]}>
      <Text>Last Slide</Text>
    </View>
  );
}

