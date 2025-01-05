import React, { useEffect, useState } from "react";
import { FlatList, ScrollView, StyleSheet, View } from "react-native";
import ModuleCard from "../../../components/ModuleCard";
import styles from "@/styles/styles";
import ScreenWrapper from "@/components/screens/ScreenWrapper";
import { useLocalSearchParams } from "expo-router";
import { getCourseModules } from "@/services/coursesApi";
import { Course, Module } from "@/types";
import ThemedTitle from "@/components/themed/ThemedTitle";
import TopNavBar from "@/components/navigation/TopNavBar";

export default function ModulesList() {
  const [modules, setModules] = useState<Module[]>([]);
  const [courseInfo, setCourseInfo] = useState<Course>({} as Course);
  const { id } = useLocalSearchParams();
  useEffect(() => {
    getCourseModules(Number(id)).then((data) => {
      setModules(data.modules);
      setCourseInfo(data.course_info);
    });
  }, []);
  return (
    <ScreenWrapper>
      <TopNavBar course={courseInfo} />
      <ScrollView contentContainerStyle={styles.innerSection}>
        <View>
          <ThemedTitle style={styles.sectionTitle}>Modules</ThemedTitle>
          <FlatList
            data={modules}
            renderItem={({ item }) => <ModuleCard module={item} />}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
