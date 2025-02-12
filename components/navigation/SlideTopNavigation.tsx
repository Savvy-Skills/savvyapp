import React from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useCourseStore } from "@/store/courseStore";
import { IconButton, useTheme } from "react-native-paper";
import { router } from "expo-router";
import styles from "@/styles/styles";
import { SLIDE_MAX_WIDTH } from "@/constants/Utils";
import { Colors } from "@/constants/Colors";
import { useViewStore } from "@/store/viewStore";

interface SlideNavigationProps {
  wideScreen: boolean;
}

const SlideNavigation: React.FC<SlideNavigationProps> = ({ wideScreen }) => {
  
  const theme = useTheme();

  const { currentSlideIndex, setCurrentSlideIndex, viewId, viewWithoutSlides, slides } = useViewStore();

  if (!viewId) return null;

  const handleClose = () => {
    setCurrentSlideIndex(0);
	const currentModule = viewWithoutSlides?.module_id;
    // router.navigate(`/modules/${currentModule}`);
	router.dismissTo(`/modules/${currentModule}`);
  };

  return (
    <View style={localStyles.container}>
      <View style={[localStyles.navContainer, styles.centeredMaxWidth, {maxWidth: SLIDE_MAX_WIDTH+22}]}>
        <IconButton icon="close" size={20} onPress={handleClose} />
        {slides.map((slide, index) => (
          <TouchableOpacity
            key={index}
            style={[
              localStyles.slideIndicator,
              slide.completed && localStyles.completed,
              currentSlideIndex === index && [
                localStyles.current,
                { borderColor: theme.dark ? "#fff" : "#000" },
              ],
            ]}
            onPress={() => setCurrentSlideIndex(index)}
          />
        ))}
      </View>
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
    backgroundColor: Colors.revealed,
    marginHorizontal: 2,
    width: "100%",
  },
  completed: {
    backgroundColor: Colors.primary,
  },
  current: {
    flex: 1.5,
    height: 10,
  },
});
