import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { useCourseStore } from "@/store/courseStore";
import styles from "@/styles/styles";
import { Image } from "expo-image";
import { Colors } from "@/constants/Colors";

const LessonInfo = () => {
  const { currentLesson } = useCourseStore();
  const currentModuleName = currentLesson?.module_info.name;
  return (
    <View
      style={[
        styles.centeredMaxWidth,
        styles.slideWidth,
        localStyles.container,
      ]}
    >
      <Image
        source={require("@/assets/images/savvylogo.svg")}
        style={{
          height: 16,
          width: 16,
        }}
      />
      <Text style={localStyles.text}>{currentModuleName}</Text>
	  <Text style={[localStyles.text, localStyles.lesson]}>[{currentLesson?.name}]</Text>
    </View>
  );
};

export default LessonInfo;

const localStyles = StyleSheet.create({
  container: {
	paddingHorizontal: 8,
    flexDirection: "row",
    marginBottom: 10,
	alignItems: "center",
	gap: 8,
  },
  text: {
	fontSize: 12,
	fontWeight: "bold",
  },
  lesson: {
	color: Colors.light.primary,
  }
});
