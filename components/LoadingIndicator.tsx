import { Colors } from '@/constants/Colors';
import { Image } from 'expo-image';
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

const LoadingIndicator: React.FC = () => (
  <View style={styles.container}>
    {/* <ActivityIndicator size="large" color="#0000ff" /> */}
	<Image source={require("@/assets/animations/loader.gif")} style={{ width: 100, height: 100, alignSelf: "center" }} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  image: {
    width: 100,
    height: 100,
  },
});

export default LoadingIndicator;