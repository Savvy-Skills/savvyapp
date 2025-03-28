import React from "react";
import { FlatList, View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";
import ModuleCard from "../../../components/cards/ModuleCard";
import ScreenWrapper from "@/components/screens/ScreenWrapper";
import { getCourses, getModules } from "@/services/coursesApi";
import { Course, Module } from "@/types";
import CourseCard from "@/components/cards/CourseCard";
import { useQuery } from "@tanstack/react-query";
import TopNavBar from "@/components/navigation/TopNavBar";
import { ScrollView } from "react-native-gesture-handler";
import styles from "@/styles/styles";
import { Link } from "expo-router";

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
      <TopNavBar  />
      <ScrollView
        style={{ flex: 1, flexGrow: 1 }}
        id={"scrollview-home-" + Date.now()}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <>
          <View style={styles.innerSection}>
            <Link href="/debug">Debug! </Link>
            <View>
              <Text style={styles.sectionTitle}>Courses</Text>
              {isLoadingCourses ? (
                <ActivityIndicator />
              ) : (
                <FlatList
                  data={courses}
                  renderItem={({ item }) => <CourseCard course={item} />}
                  keyExtractor={(item) => item.id.toString()}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ paddingHorizontal: 4 }}
                />
              )}
            </View>
            <View>
              <Text style={styles.sectionTitle}>Modules</Text>
              {isLoadingModules ? (
                <ActivityIndicator />
              ) : (
                <FlatList
                  data={modules}
                  renderItem={({ item }) => <ModuleCard module={item} />}
                  keyExtractor={(item) => item.id.toString()}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ paddingHorizontal: 4 }}
                />
              )}
            </View>
          </View>
          {/* <Footer /> */}
        </>
      </ScrollView>
    </ScreenWrapper>
  );
}
