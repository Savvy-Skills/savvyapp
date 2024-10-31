import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useModuleStore } from "@/store/moduleStore";
import { IconButton, useTheme } from "react-native-paper";
import { router } from "expo-router";

const TopNavBar = () => {
  const {
    currentModule,
    completedSlides,
    currentSlideIndex,
    setCurrentSlideIndex,
  } = useModuleStore();
  const theme = useTheme();

  if (!currentModule) return null;

  const handleClose = () => {
    router.replace("/modules");
  };

  return (
    <View style={styles.container}>
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
  );
};

const styles = StyleSheet.create({
  container: {
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
