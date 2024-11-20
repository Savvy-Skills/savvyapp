import { useSegments } from "expo-router";
import React from "react";
import { View, StyleSheet, Image, useWindowDimensions } from "react-native";
import SlideNavigation from "../slides/SlideNavigation";

const TopNavBar = () => {
  const { width } = useWindowDimensions();
  const segments = useSegments();
  const wideScreen = width > 1024;

  const isCourse = segments[0] === "courses";
  const isModule = segments[0] === "modules";
  const isLesson = segments[0] === "lessons";

  return (
    <View style={[styles.navHeader, wideScreen && styles.webNav]}>
      {isLesson && <SlideNavigation wideScreen={wideScreen} />}
    </View>
  );
};

const styles = StyleSheet.create({
  navHeader: {
    flexDirection: "row",
    justifyContent: "center",
    zIndex: 2,
    paddingVertical: 4,
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
