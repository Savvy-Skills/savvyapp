import React, { useEffect, useState } from "react";
import { FlatList, ScrollView, StyleSheet, View } from "react-native";
import ModuleCard from "../../../components/cards/ModuleCard";
import styles from "@/styles/styles";
import ScreenWrapper from "@/components/screens/ScreenWrapper";
import { useLocalSearchParams } from "expo-router";
import { getCourse } from "@/services/coursesApi";
import { Course, Module } from "@/types";
import ThemedTitle from "@/components/themed/ThemedTitle";
import TopNavBar from "@/components/navigation/TopNavBar";

export default function ModulesList() {
  const [courseInfo, setCourseInfo] = useState<Course>({} as Course);
  const { id } = useLocalSearchParams();
  useEffect(() => {
    getCourse(Number(id)).then((data) => {
      setCourseInfo(data);
    });
  }, []);

  const modules = courseInfo.modules?.map((module) => module.module_info).filter((item): item is Module => item !== undefined) || [];
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
			style={{ paddingHorizontal: 4 }}
          />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
