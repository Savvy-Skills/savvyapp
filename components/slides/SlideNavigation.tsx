import React from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useCourseStore } from "@/store/courseStore";
import { IconButton, useTheme } from "react-native-paper";
import { router } from "expo-router";
import styles from "@/styles/styles";
import { SLIDE_MAX_WIDTH } from "@/constants/Utils";

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
    // router.navigate(`/modules/${currentModule}`);
	router.dismissTo(`/modules/${currentModule}`);
  };

  return (
    <View style={localStyles.container}>
      <View style={[localStyles.navContainer, styles.centeredMaxWidth, {maxWidth: SLIDE_MAX_WIDTH+16}]}>
        <IconButton icon="close" size={20} onPress={handleClose} />
        {currentLesson.slides.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              localStyles.slideIndicator,
              completedSlides[index] && localStyles.completed,
              currentSlideIndex === index && [
                localStyles.current,
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

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navContainer: {
    flexDirection: "row",
    alignItems: "center",
	marginLeft: -16,
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
