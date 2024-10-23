import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Button, useTheme } from 'react-native-paper';
import { useModuleStore } from '../../store/moduleStore';
import SlideRenderer from '../../components/Slides/SlideRenderer';
import styles from '@/styles/styles';

export default function ModuleDetail() {
  const { id } = useLocalSearchParams();
  const { getModuleById, currentModule, currentSlideIndex, setCurrentSlideIndex } = useModuleStore();
  const theme = useTheme();

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
    <View style={[styles.container, { backgroundColor: theme.colors.background}]}>
      <ScrollView
        contentContainerStyle={localStyles.slidesContainer} 
        scrollEnabled={false}
      >
        {currentModule.slides.map((slide, index) => (
          <View 
            key={slide.slide_id} 
            style={[
              localStyles.slideWrapper,
              { display: index === currentSlideIndex ? 'flex' : 'none' }
            ]}
          >
            <SlideRenderer 
              slide={slide} 
              isActive={index === currentSlideIndex} 
            />
          </View>
        ))}
      </ScrollView>
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

const localStyles = StyleSheet.create({
	container: {
	  flex: 1,
	  justifyContent: 'space-between',
	},
	slidesContainer: {
	  flexGrow: 1,
	},
	slideWrapper: {
	  flex: 1,
	},
	navigation: {
	  flexDirection: 'row',
	  justifyContent: 'space-between',
	  padding: 16,
	},
  });