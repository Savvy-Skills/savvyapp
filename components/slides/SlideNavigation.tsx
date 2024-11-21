import React from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useCourseStore } from "@/store/courseStore";
import { IconButton, useTheme } from "react-native-paper";
import { router } from "expo-router";

interface SlideNavigationProps {
  wideScreen: boolean;
}

const SlideNavigation: React.FC<SlideNavigationProps> = ({ wideScreen }) => {
  const {
    currentLesson,
    completedSlides,
    currentSlideIndex,
    setCurrentSlideIndex,
  } = useCourseStore();
  const theme = useTheme();

  if (!currentLesson) return null;

  const handleClose = () => {
    setCurrentSlideIndex(0);
	const currentModule = currentLesson.module_id;
    router.navigate(`/modules/${currentModule}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.navContainer}>
        <IconButton icon="close" size={20} onPress={handleClose} />
        {currentLesson.slides.map((_, index) => (
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
        <View style={{ position: "absolute", right: 20, top: 8 }}>
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

export default SlideNavigation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
