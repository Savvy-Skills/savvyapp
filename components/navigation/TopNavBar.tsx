import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Image,
} from "react-native";
import { useModuleStore } from "@/store/moduleStore";
import { IconButton, useTheme } from "react-native-paper";
import { router } from "expo-router";
import { Colors } from "@/constants/Colors";
import ThemedLogo from "../themed/ThemedLogo";

const TopNavBar = () => {
  const {
    currentModule,
    completedSlides,
    currentSlideIndex,
    setCurrentSlideIndex,
  } = useModuleStore();
  const theme = useTheme();
  const { width } = useWindowDimensions();

  if (!currentModule) return null;

  const handleClose = () => {
    router.replace("/modules");
  };

  const wideScreen = width > 1024;

  return (
    <View style={[styles.navHeader, wideScreen && styles.webNav]}>
      <View style={styles.navContainer}>
        <IconButton icon="close" size={20} onPress={handleClose} />
        {currentModule.slides.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.slideIndicator,
              completedSlides[index] && styles.completed,
              currentSlideIndex === index && [
                styles.current,
                { borderColor: theme.dark ? "#fff" : "#000" },
              ],
            ]}
            onPress={() => setCurrentSlideIndex(index)}
          />
        ))}
      </View>
      {wideScreen && (
        <View style={{ position: "absolute", right: 20, top: 12 }}>
          <Image
            source={require("@/assets/images/savvylogo.svg")}
            style={{
              height: 32,
              width: 32,
            }}
          />
        </View>
      )}
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
  navContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    maxWidth: 600,
    width: "100%",
    paddingHorizontal: 8,
  },
  slideIndicator: {
    flex: 1,
    height: 4,
    borderRadius: 4,
    backgroundColor: "#ccc",
    marginHorizontal: 2,
    width: "100%",
  },
  completed: {
    backgroundColor: "#664acc",
  },
  current: {
    flex: 1.5,
    backgroundColor: "#f4bb62",
    borderWidth: 2,
    height: 10,
  },
});
export default TopNavBar;
