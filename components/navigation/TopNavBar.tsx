import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useModuleStore } from '@/store/moduleStore';
import { useTheme } from 'react-native-paper';

const TopNavBar = () => {
  const { currentModule, completedSlides, currentSlideIndex, setCurrentSlideIndex } = useModuleStore();
  const theme = useTheme();

  if (!currentModule) return null;

  return (
    <View style={styles.container}>
      {currentModule.slides.map((_, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.slideIndicator,
            completedSlides[index] && styles.completed,
            currentSlideIndex === index && [styles.current,{borderColor: theme.dark ? '#fff' : '#000'}],
          ]}
          onPress={() => setCurrentSlideIndex(index)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
	flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideIndicator: {
    minWidth: 24,
    height: 4,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 2,
  },
  completed: {
    backgroundColor: '#664acc',
  },
  current: {
    backgroundColor: '#f4bb62',
	borderWidth: 2,
	height: 6,
	width: 30,
  },
});

export default TopNavBar;