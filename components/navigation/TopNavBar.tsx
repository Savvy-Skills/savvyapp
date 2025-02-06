import { router, useSegments } from "expo-router";
import React from "react";
import { View, StyleSheet, Image, useWindowDimensions } from "react-native";
import SlideNavigation from "@/components/navigation/SlideTopNavigation";
import HomeTopNavBar from "@/components/navigation/HomeTopNavBar";
import CourseTopNavBar from "@/components/navigation/CourseTopNavBar";
import { Course, Module } from "@/types";
import ModuleTopNavBar from "@/components/navigation/ModuleTopNavBar";
import ViewInfo from "@/components/navigation/ViewInfo";
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
  const isView = segments[1] === "views";
  const isHome = segments[1] === "home";


  return (
    <>
      {isView ? (
        <>
          <View style={[styles.navHeader, styles.webNav]} id={"navbar"}>
            <SlideNavigation wideScreen={wideScreen} />
          </View>
          <ViewInfo />
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
	backgroundColor: Colors.background,
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
