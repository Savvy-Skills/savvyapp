import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet } from "react-native";
import ModuleCard from "../../components/ModuleCard";
import styles from "@/styles/styles";
import ScreenWrapper from "@/components/screens/ScreenWrapper";
import { Lesson } from "@/types";
import { getModuleLessons } from "@/services/coursesApi";
import { useLocalSearchParams } from "expo-router";
import LessonCard from "@/components/LessonCard";
import TopNavBar from "@/components/navigation/TopNavBar";

export default function ModulesList() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const { id } = useLocalSearchParams();

  useEffect(() => {
    getModuleLessons(Number(id)).then((data) => {
      setLessons(data);
    });
  }, []);

  return (
    <ScreenWrapper>
      <TopNavBar />
      <FlatList
        data={lessons}
        renderItem={({ item }) => <LessonCard lesson={item} />}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.container}
      />
    </ScreenWrapper>
  );
}
