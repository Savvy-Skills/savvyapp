import { router, useSegments } from "expo-router";
import React from "react";
import { View, StyleSheet, Image, useWindowDimensions } from "react-native";
import SlideNavigation from "../slides/SlideNavigation";
import HomeTopNavBar from "./HomeTopNavBar";
import CourseTopNavBar from "./CourseTopNavBar";
import { Course, Module } from "@/types";
import ModuleTopNavBar from "./ModuleTopNavBar";
import { Text } from "react-native-paper";
import LessonInfo from "../LessonInfo";
import { Colors } from "@/constants/Colors";

interface NavBarProps {
  course?: Course;
  module?: Module;
}

const TopNavBar = (props: NavBarProps) => {
  const { width } = useWindowDimensions();
  const segments = useSegments();
  const wideScreen = width > 1024;

  const isCourse = segments[1] === "courses";
  const isModule = segments[1] === "modules";
  const isLesson = segments[1] === "lessons";
  const isHome = segments[1] === "home";


  return (
    <>
      {isLesson ? (
        <>
          <View style={[styles.navHeader, styles.webNav]} id={"navbar"}>
            <SlideNavigation wideScreen={wideScreen} />
          </View>
          <LessonInfo />
        </>
      ) : (
        <View style={[styles.navHeader, styles.webNav]} id={"navbar"}>
          {isHome && <HomeTopNavBar />}
          {isCourse && props.course && (
            <CourseTopNavBar course={props.course} />
          )}
          {isModule && props.module && (
            <ModuleTopNavBar module={props.module} />
          )}
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  navHeader: {
	backgroundColor: Colors.light.background,
    flexDirection: "row",
    justifyContent: "center",
    zIndex: 3,
    paddingVertical: 4,
    maxHeight: 56,
    marginBottom: 10,
  },
  webNav: {
    borderBottomWidth: 1,
    borderBottomColor: "#cccccc",
    shadowColor: "#cccccc",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowRadius: 4,
  },
});
export default TopNavBar;
