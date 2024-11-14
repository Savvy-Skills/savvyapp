import React from "react";
import { Image } from "react-native";
import { useTheme } from "react-native-paper";

type ThemedLogoProps = {
  width: number;
  height: number;
  logo: "default" | "variant" | "filled";
};

const ThemedLogo = (props: ThemedLogoProps) => {
  const theme = useTheme();
  const { width, height, logo } = props;
  let source;

  const tintColor =
    logo === "default" ? (theme.dark ? "white" : "black") : undefined;

	if (logo=== "default"){
		source = require("@/assets/images/savvyimagotipe.svg");
	} else if (logo ==="filled"){
		source = require("@/assets/images/savvylogo.svg");
	}
  return (
    <Image
      style={{
        width,
        height,
      }}
      tintColor={tintColor}
      source={source}
    />
  );
};

export default ThemedLogo;
