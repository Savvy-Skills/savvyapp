// ConfirmationDialog.tsx
import styles from "@/styles/styles";
import React from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import { Dialog, Portal, Button, Icon, Text } from "react-native-paper";

interface ConfirmationDialogProps {
  visible: boolean;
  onDismiss: () => void;
  onConfirm: () => void;
  title: string;
  content: string;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  visible,
  onDismiss,
  onConfirm,
  title,
  content,
}) => {
  const { width } = useWindowDimensions();
  const maxWidth = width <= 600 ? width-32 : 600;
  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={onDismiss}
        style={[styles.centeredMaxWidth, styles.slideWidth, { maxWidth }]}
      >
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Content style={{ gap: 16 }}>
          <View style={{ alignItems: "center" }}>
            <Icon source="alert" size={120} color="#ff861d" />
          </View>
          <Text style={{ alignSelf: "center" }}>{content}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>No</Button>
          <Button
            onPress={() => {
              onConfirm();
              onDismiss();
            }}
          >
            Yes
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default ConfirmationDialog;
