import React, { useEffect, useState } from "react";
import { FlatList, ScrollView, StyleSheet, View } from "react-native";
import ModuleCard from "../../components/ModuleCard";
import styles from "@/styles/styles";
import ScreenWrapper from "@/components/screens/ScreenWrapper";
import { Lesson, Module } from "@/types";
import { getModuleLessons } from "@/services/coursesApi";
import { useLocalSearchParams } from "expo-router";
import LessonCard from "@/components/LessonCard";
import TopNavBar from "@/components/navigation/TopNavBar";
import ThemedTitle from "@/components/themed/ThemedTitle";

export default function ModulesList() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [module, setModule] = useState<Module>({} as Module);
  const { id } = useLocalSearchParams();

  useEffect(() => {
    getModuleLessons(Number(id)).then((data) => {
      setLessons(data.lessons);
      setModule(data.module);
    });
  }, []);

  return (
    <ScreenWrapper>
      <TopNavBar module={module} />
      <View style={styles.innerSection}>
        <ThemedTitle style={styles.sectionTitle}>Lessons</ThemedTitle>
        <FlatList
          data={lessons}
          renderItem={({ item }) => <LessonCard lesson={item} />}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
        />
      </View>
    </ScreenWrapper>
  );
}
