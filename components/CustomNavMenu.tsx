import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { Button, Icon, Modal, Portal } from "react-native-paper";
import { FeedbackModal } from "./FeedbackModal";
import { useCourseStore } from "@/store/courseStore";
import styles from "@/styles/styles";

interface CustomMenuProps {
  visible: boolean;
  onDismiss: () => void;
  onShowCaptions: () => void;
  onExplanation: () => void;
}

const CustomNavMenu: React.FC<CustomMenuProps> = ({
  visible,
  onDismiss,
  onShowCaptions,
  onExplanation,
}) => {
  if (!visible) return null;

  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const showModal = () => setFeedbackModalVisible(true);
  const hideModal = () => setFeedbackModalVisible(false);

  const { currentLesson, currentSlideIndex } = useCourseStore();

  return (
    <>
      <TouchableOpacity
        style={localStyles.overlay}
        onPress={onDismiss}
        activeOpacity={1}
      >
        <View style={styles.menuContainer}>
          <ThemeSwitcher />
          <TouchableOpacity style={styles.centeredItems} onPress={onExplanation}>
            <Icon source="account" size={24} color="white" />
            <Text style={localStyles.menuText}>Explanation</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.centeredItems}
            onPress={() => {
              showModal();
            }}
          >
            <Icon source="send" size={24} color="white" />
            <Text style={localStyles.menuText}>Message us</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
      <FeedbackModal
        visible={feedbackModalVisible}
        onDismiss={() => setFeedbackModalVisible(false)}
        currentLessonInfo={{
          lessonId: currentLesson?.id || 0,
          lessonTitle: currentLesson?.name || "",
          currentIndex: currentSlideIndex,
        }}
        onSubmitFeedback={() => {
          onDismiss();
        }}
      />
    </>
  );
};

const localStyles = StyleSheet.create({
  overlay: {
    alignItems: "center",
    alignSelf: "center",
  },
  menuText: {
    color: "white",
    marginTop: 4,
    fontSize: 12,
  },
});

export default CustomNavMenu;
