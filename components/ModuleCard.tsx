import React from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Text } from "react-native-paper";
import { useRouter } from "expo-router";
import { Course, Module } from "../types";
import { Colors } from "@/constants/Colors";
import ThemedTitle from "./themed/ThemedTitle";

interface ModuleCardProps {
  module: Module;
}

export default function CourseCard({ module }: ModuleCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/modules/${module.id}`);
  };

  const quizLessons = module.lessons.filter((l) => l.quiz).length;
  const normalLessons = module.lessons.length - quizLessons;

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
        <ThemedTitle style={styles.title} numberOfLines={2}>
          {module.name}
        </ThemedTitle>
        <View style={styles.infoContainer}>
          <Text style={styles.info}>
            {normalLessons} {normalLessons !== 1 ? "Lessons" : "Lesson"}
          </Text>
          <Text style={styles.info}>
            {quizLessons} {quizLessons !== 1 ? "Quizes" : "Quiz"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: 16,
  },
  infoContainer: {
    flexDirection: "row",
    gap: 16,
  },
  info: {
    paddingHorizontal: 10,
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
    borderRadius: 8,
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
    fontSize: 18,
    fontFamily: "Poppins",
    fontWeight: "bold",
  },
});
