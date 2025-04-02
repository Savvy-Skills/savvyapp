import React from "react";
import { ActivityIndicator } from "react-native-paper";
import RichText from "../../RichTextComponent";
import { View } from "react-native";
import styles from "@/styles/styles";

interface RichTextSlideProps {
	text: string;
}

const RichTextSlide: React.FC<RichTextSlideProps> = ({ text }) => {
  if (!text) {
    return <ActivityIndicator />;
  }
  return (
	<View style={[styles.centeredMaxWidth, styles.slideWidth]}>
		<RichText text={text} />
	</View>
  );
};

export default RichTextSlide;
