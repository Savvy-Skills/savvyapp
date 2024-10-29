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
    router.replace("/modules")
  };

  return (
    <View style={styles.container}>
      <IconButton
        icon="close"
        size={20}
        onPress={handleClose}
      />
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
    justifyContent: "center",
    alignItems: "center",
  },
  slideIndicator: {
    minWidth: 24,
    height: 4,
    borderRadius: 4,
    backgroundColor: "#ccc",
    marginHorizontal: 2,
  },
  completed: {
    backgroundColor: "#664acc",
  },
  current: {
    backgroundColor: "#f4bb62",
    borderWidth: 2,
    height: 6,
    width: 30,
  },
});

export default TopNavBar;
