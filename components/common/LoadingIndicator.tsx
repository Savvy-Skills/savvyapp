import { Colors } from '@/constants/Colors';
import { Image } from 'expo-image';
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Portal } from 'react-native-paper';

const LoadingIndicator: React.FC = () => (
	<Portal>
		<View style={styles.container}>
			{/* <ActivityIndicator size="large" color="#0000ff" /> */}
			<Image source={require("@/assets/animations/loader.gif")} style={styles.image} />
		</View>
	</Portal>
);

const styles = StyleSheet.create({
  container: {
	flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  image: {
    width: 300,
    height: 300,
	alignSelf: "center",
  },
});

export default LoadingIndicator;