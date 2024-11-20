import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import ModuleCard from "../../components/ModuleCard";
import ScreenWrapper from "@/components/screens/ScreenWrapper";
import { getCourses, getModules } from "@/services/coursesApi";
import { Course, Module } from "@/types";
import CourseCard from "@/components/CourseCard";
import { useQuery } from "@tanstack/react-query";

export default function Home() {
  const { data: courses = [], isLoading: isLoadingCourses } = useQuery<
    Course[]
  >({
    queryKey: ["courses"],
    queryFn: getCourses,
  });
  const { data: modules = [], isLoading: isLoadingModules } = useQuery<
    Module[]
  >({
    queryKey: ["modules"],
    queryFn: getModules,
  });

  return (
    <ScreenWrapper>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Courses</Text>
        <FlatList
          data={courses}
          renderItem={({ item }) => <CourseCard course={item} />}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Modules</Text>
        <FlatList
          data={modules}
          renderItem={({ item }) => <ModuleCard module={item} />}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 28,
    fontFamily: "PoppinsBold",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  listContainer: {
    paddingHorizontal: 16,
  },
});
