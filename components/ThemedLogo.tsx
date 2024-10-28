import { Image, View } from "react-native";
import { useTheme } from "react-native-paper";

const ThemedLogo = () => {
  const theme = useTheme();

  return (
    <Image
      style={{
        width: 140,
        height: 140,
      }}
      source={
        theme.dark
          ? require("../assets/images/savvyimagotipeawhite.png")
          : require("../assets/images/savvyimagotipe.png")
      }
    />
  );
};

export default ThemedLogo;
