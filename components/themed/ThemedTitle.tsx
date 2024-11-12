import { Title, useTheme } from "react-native-paper";
import { StyleProp, Text, TextStyle } from "react-native";

export type Props = React.ComponentProps<typeof Text> & {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
};

const ThemedTitle = ({ children, style, ...props }: Props) => {
  const theme = useTheme();
  return (
    <Title  {...props} style={[{ fontFamily: theme.fonts.default.fontFamily }, style]}>
      {children}
    </Title>
  );
};

export default ThemedTitle;
