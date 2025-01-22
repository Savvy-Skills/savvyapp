import React from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Text } from "react-native-paper";
import { useRouter } from "expo-router";
import { Course } from "../types";
import { Colors } from "@/constants/Colors";
import styles from "@/styles/styles";

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.navigate({
      pathname: "/courses/[id]",
      params: { id: course.id },
    });
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      accessibilityRole="button"
      style={localStyles.container}
    >
      <View style={styles.card}>
        <Image
          source={require("../assets/images/pngs/placeholder.png")}
          style={localStyles.backgroundPattern}
        />
        <View style={styles.tagContainer}>
          <Text style={styles.tag}>AI</Text>
        </View>
        <Text style={localStyles.title} numberOfLines={2}>
          {course.name}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const localStyles = StyleSheet.create({
  container: {
    marginRight: 16,
  },
  backgroundPattern: {
    width: "100%",
    height: 120,
    resizeMode: "cover",
    borderTopEndRadius: 8,
    borderTopLeftRadius: 8,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontFamily: "PoppinsBold",
  },
});
