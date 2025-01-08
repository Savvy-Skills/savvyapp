import React from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Text } from "react-native-paper";
import { Link, useRouter } from "expo-router";
import { Course, Module } from "../types";
import { Colors } from "@/constants/Colors";
import ThemedTitle from "./themed/ThemedTitle";
import styles from "@/styles/styles";

interface ModuleCardProps {
  module: Module;
}

export default function ModuleCard({ module }: ModuleCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.navigate({
		pathname: "/modules/[id]",
		params: { id: module.id },
	});
  };

  const lessonViews = module.views.filter((l) => l.type === "lesson");
  const quizViews = lessonViews.filter((l) => l.quiz);

  console.log({views: module.views});

  return (
    <TouchableOpacity onPress={handlePress} accessibilityRole="button" style={localStyles.container}>
      <View style={styles.card}>
        <Image
          source={require("../assets/images/placeholder.png")}
          style={localStyles.backgroundPattern}
        />
        <ThemedTitle style={localStyles.title} numberOfLines={2}>
          {module.name}
        </ThemedTitle>
        <View style={localStyles.infoContainer}>
          <Text style={localStyles.info}>
            {lessonViews.length - quizViews.length} {lessonViews.length - quizViews.length !== 1 ? "Lessons" : "Lesson"}
          </Text>
          <Text style={localStyles.info}>
            {quizViews.length} {quizViews.length !== 1 ? "Quizes" : "Quiz"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const localStyles = StyleSheet.create({
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
  backgroundPattern: {
    width: "100%",
    height: 120,
    resizeMode: "cover",
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontFamily: "Poppins",
    fontWeight: "bold",
  },
});
