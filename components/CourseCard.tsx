import React from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Text } from "react-native-paper";
import { useRouter } from "expo-router";
import { Course } from "../types";
import { Colors } from "@/constants/Colors";

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
      style={styles.container}
    >
      <View style={styles.card}>
        <Image
          source={require("../assets/images/placeholder.png")}
          style={styles.backgroundPattern}
        />
        <View style={styles.tagContainer}>
          <Text style={styles.tag}>AI</Text>
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {course.name}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: 16,
  },
  card: {
    backgroundColor: "white",
    width: 320,
    borderRadius: 8,
    overflow: "hidden",
    padding: 10,
    marginBottom: 6,
    gap: 10,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 4,
    shadowColor: "grey",
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
  tagContainer: {
    backgroundColor: "rgba(102, 74, 204, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: "flex-start",
  },
  tag: {
    fontSize: 12,
    fontFamily: "PoppinsBold",
    color: Colors.light.primary,
  },
  title: {
    fontSize: 20,
    fontFamily: "PoppinsBold",
  },
});
