import { Title, useTheme } from "react-native-paper";
import { Text } from "react-native";

export type Props = React.ComponentProps<typeof Text> & {
  children: React.ReactNode;
};

const ThemedTitle = ({ children }: Props) => {
  const theme = useTheme();
  return (
    <Title style={{ fontFamily: theme.fonts.default.fontFamily }}>
      {children}
    </Title>
  );
};

export default ThemedTitle;
