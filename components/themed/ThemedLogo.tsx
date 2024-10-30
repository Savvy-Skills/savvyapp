import React from "react";
import { Image } from "react-native";
import { useTheme } from "react-native-paper";

type ThemedLogoProps = {
	width: number;
	height: number;
};

const ThemedLogo = (props: ThemedLogoProps) => {
  const theme = useTheme();
  const { width, height } = props;

  return (
    <Image
      style={{
        width,
        height
      }}
      source={
        theme.dark
          ? require("../../assets/images/savvyimagotipeawhite.png")
          : require("../../assets/images/savvyimagotipe.png")
      }
    />
  );
};

export default ThemedLogo;
