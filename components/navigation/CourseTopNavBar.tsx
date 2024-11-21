import { Colors } from "@/constants/Colors";
import { Course } from "@/types";
import { router } from "expo-router";
import { Image, View } from "react-native";
import { IconButton, Text } from "react-native-paper";

interface CourseProps {
  course: Course;
}

const CourseTopNavBar = (props: CourseProps) => {
  const handleBack = () => {
    router.navigate("/home");
  };
  return (
    <View
      style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 16 }}
    >
      <IconButton
        style={{}}
        icon={"keyboard-backspace"}
        size={24}
        onPress={handleBack}
      />
      <View style={{flex:1, alignItems:"center"}}>
        <Text style={{ color: Colors.light.primary, fontWeight: "bold" }}>
          {props.course.name}
        </Text>
      </View>
    </View>
  );
};

export default CourseTopNavBar;
