import { Colors } from "@/constants/Colors";
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
    router.navigate(`/courses/${course}`);
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
      <View style={{flexDirection:"column", flex: 1, alignItems:"center"}}>
        <Text style={{ fontWeight: "bold", fontSize: 12 }}>
          {props.module?.course_info?.name}
        </Text>
        <Text style={{ color: Colors.light.primary, fontWeight: "bold" }}>
          {props.module?.name}
        </Text>
      </View>
    </View>
  );
};

export default ModuleTopNavBar;
