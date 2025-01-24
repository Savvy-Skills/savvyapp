import { Colors } from "@/constants/Colors";
import styles from "@/styles/styles";
import { Module } from "@/types";
import { router } from "expo-router";
import { View } from "react-native";
import { IconButton, Text } from "react-native-paper";
import { useCallback, useRef } from "react";
import { SLIDE_MAX_WIDTH } from "@/constants/Utils";

interface ModuleProps {
  module: Module;
}

const ModuleTopNavBar = (props: ModuleProps) => {
  const lastClickTimeRef = useRef<number>(0);

  const handleBack = useCallback(() => {
    const now = Date.now();
    if (now - lastClickTimeRef.current < 1000) {
      return;
    }
    lastClickTimeRef.current = now;

    const course = props.module.course_id;
    if (course) {
      router.dismissTo({ pathname: "/courses/[id]", params: { id: course } });
    }
  }, [props.module.course_id]);

  return (
    <View style={[styles.topNavBarInner, styles.centeredMaxWidth, {maxWidth: SLIDE_MAX_WIDTH+22}]}>
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
            color: Colors.primary,
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