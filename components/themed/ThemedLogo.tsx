import React from "react";
import { useTheme } from "react-native-paper";
import { Image } from "expo-image";

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
        height,
      }}
      tintColor={theme.dark ? "white" : "black"}
      source={require("@/assets/images/svgs/savvyimagotipe.svg")}
    />
  );
};

export default ThemedLogo;
