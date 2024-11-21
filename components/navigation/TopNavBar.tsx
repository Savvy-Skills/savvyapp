import { useSegments } from "expo-router";
import React from "react";
import { View, StyleSheet, Image, useWindowDimensions } from "react-native";
import SlideNavigation from "../slides/SlideNavigation";
import HomeTopNavBar from "./HomeTopNavBar";
import CourseTopNavBar from "./CourseTopNavBar";
import { Course, Module } from "@/types";
import ModuleTopNavBar from "./ModuleTopNavBar";

interface NavBarProps {
	course?: Course;
	module?: Module;
}

const TopNavBar = (props: NavBarProps) => {
  const { width } = useWindowDimensions();
  const segments = useSegments();
  const wideScreen = width > 1024;

  const isCourse = segments[0] === "courses" ;
  const isModule = segments[0] === "modules";
  const isLesson = segments[0] === "lessons";
  const isHome = segments[0]=== "home";

  return (
    <View style={[styles.navHeader, styles.webNav]}>
      {isLesson && <SlideNavigation wideScreen={wideScreen} />}
      {isHome && <HomeTopNavBar />}
	  {isCourse && props.course && <CourseTopNavBar course={props.course}/>}
	  {isModule&& props.module && <ModuleTopNavBar module={props.module}/>}
    </View>
  );
};

const styles = StyleSheet.create({
  navHeader: {
    flexDirection: "row",
    justifyContent: "center",
    zIndex: 2,
    paddingVertical: 4,
	maxHeight: 56,
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
