import { useModuleStore } from "@/store/moduleStore";
import styles from "@/styles/styles";
import { View } from "react-native";
import { Button, IconButton } from "react-native-paper";

const BottomBarNav = () => {
  const { previousSlide, currentModule, currentSlideIndex, nextSlide, submittableStates } =
    useModuleStore();

	const isLastSlide = currentModule && currentSlideIndex === currentModule.slides.length - 1
	const isCurrentSlideSubmittable = submittableStates[currentSlideIndex]
  
	
  return (
    <View style={styles.bottomNavigation}>
      <IconButton
        icon="chevron-left"
        size={24}
        onPress={previousSlide}
        disabled={currentSlideIndex === 0}
        style={styles.navButton}
      />
      <Button icon="check" mode="contained" disabled={!isCurrentSlideSubmittable} onPress={()=>{}}>Check</Button>
      <IconButton
        icon="chevron-right"
        size={24}
        onPress={nextSlide}
        disabled={isLastSlide}
        style={styles.navButton}
      />
    </View>
  );
};

export default BottomBarNav;
