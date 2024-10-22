import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Button } from 'react-native-paper';
import { useModuleStore } from '../../store/moduleStore';
import SlideRenderer from '../../components/SlideRenderer';

export default function ModuleDetail() {
  const { id } = useLocalSearchParams();
  const { getModuleById, currentModule } = useModuleStore();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

	useEffect(() => {
		getModuleById(Number(id));
	}, [id]);

  if (!currentModule) {
    return null;
  }

  const handleNextSlide = () => {
    if (currentSlideIndex < currentModule.slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const handlePreviousSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  return (
    <View style={styles.container}>
      <SlideRenderer slide={currentModule.slides[currentSlideIndex]} />
      <View style={styles.navigation}>
        <Button onPress={handlePreviousSlide} disabled={currentSlideIndex === 0}>
          Previous
        </Button>
        <Button onPress={handleNextSlide} disabled={currentSlideIndex === currentModule.slides.length - 1}>
          Next
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
});