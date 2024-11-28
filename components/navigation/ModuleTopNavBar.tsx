import { Colors } from "@/constants/Colors";
import styles from "@/styles/styles";
import { Course, Module } from "@/types";
import { router } from "expo-router";
import { Image, View } from "react-native";
import { IconButton, Text } from "react-native-paper";

interface ModuleProps {
  module: Module;
}

const ModuleTopNavBar = (props: ModuleProps) => {
  const handleBack = () => {
    const course = props.module.course_id;
    if (course) {
      router.navigate(`/courses/${course}`);
    }
  };
  return (
    <View style={styles.topNavBarInner}>
      <IconButton
        style={{}}
        icon={"keyboard-backspace"}
        size={24}
        onPress={handleBack}
      />
      <View style={styles.navBarInfo}>
        <Text style={{ fontWeight: "bold", fontSize: 12, textAlign: "center" }}>
          {props.module?.course_info?.name}
        </Text>
        <Text
          style={{
            color: Colors.light.primary,
            fontWeight: "bold",
            fontSize: 16,
            textAlign: "center",
          }}
        >
          {props.module?.name}
        </Text>
      </View>
    </View>
  );
};

export default ModuleTopNavBar;
