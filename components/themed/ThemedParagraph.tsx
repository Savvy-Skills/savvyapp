import { Paragraph, Title, useTheme } from "react-native-paper";
import { TextProps } from "react-native";

export type Props = TextProps & {
	children: React.ReactNode;
  };
  
const ThemedParagraph = (props: Props) => {
  const theme = useTheme();
  return (
    <Paragraph {...props} style={{ fontFamily: theme.fonts.default.fontFamily }}>
      {props.children}
    </Paragraph>
  );
};

export default ThemedParagraph;
