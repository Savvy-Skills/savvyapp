import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet } from "react-native";
import ModuleCard from "../../components/ModuleCard";
import styles from "@/styles/styles";
import ScreenWrapper from "@/components/screens/ScreenWrapper";
import { useLocalSearchParams } from "expo-router";
import { getCourseModules } from "@/services/coursesApi";
import { Module } from "@/types";
import ThemedTitle from "@/components/themed/ThemedTitle";
import TopNavBar from "@/components/navigation/TopNavBar";

export default function ModulesList() {
  const [modules, setModules] = useState<Module[]>([]);
  const { id } = useLocalSearchParams();
  useEffect(() => {
    getCourseModules(Number(id)).then((data) => {
      setModules(data);
    });
  }, []);
  return (
    <ScreenWrapper>
      <TopNavBar />
      <ThemedTitle>Modules</ThemedTitle>
      <FlatList
        data={modules}
        renderItem={({ item }) => <ModuleCard module={item} />}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.container}
      />
    </ScreenWrapper>
  );
}
