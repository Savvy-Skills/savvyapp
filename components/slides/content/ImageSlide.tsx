import React from "react";
import { StyleSheet, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { Image } from "expo-image";

interface ImageSlideProps {
  url?: string;
  index: number;
}

const blurhash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

const ImageSlide: React.FC<ImageSlideProps> = ({ url, index }) => {
  if (!url) {
    return <ActivityIndicator />;
  }
  return (
    <View style={styles.contentContainer}>
      <Image
        source={url}
        placeholder={{ blurhash }}
        contentFit="contain"
        transition={1000}
        style={styles.image}
      />
    </View>
  );
};

export default ImageSlide;
const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
	padding: 8,
  },
  image: {
    flex: 1,
    width: "100%",
  },
});