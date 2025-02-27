import { Colors } from "@/constants/Colors";
import { SLIDE_MAX_WIDTH } from "@/constants/Utils";
import styles from "@/styles/styles";
import { Course } from "@/types";
import { router } from "expo-router";
import { Image, View } from "react-native";
import { IconButton, Text } from "react-native-paper";

interface CourseProps {
  course: Course;
}

const CourseTopNavBar = (props: CourseProps) => {
  const handleBack = () => {
    router.dismissTo("/home");
  };
  
  return (
    <View style={[styles.topNavBarInner, styles.centeredMaxWidth, {maxWidth: SLIDE_MAX_WIDTH+22}]}>
      <IconButton
        style={{}}
        icon={"keyboard-backspace"}
        size={24}
        onPress={handleBack}
      />
      <View style={styles.navBarInfo}>
        <Text
          style={{
            color: Colors.primary,
            fontWeight: "bold",
            textAlign: "center",
			fontSize:16
          }}
        >
          {props.course.name}
        </Text>
      </View>
    </View>
  );
};

export default CourseTopNavBar;
