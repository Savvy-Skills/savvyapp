// ConfirmationDialog.tsx
import { useCourseStore } from "@/store/courseStore";
import styles from "@/styles/styles";
import React, { useState } from "react";
import { View, StyleSheet, useWindowDimensions, Switch, Pressable } from "react-native";
import { Dialog, Portal, Button, Icon, Text, Checkbox } from "react-native-paper";
import { Image } from "expo-image";
interface ConfirmationDialogProps {
	visible: boolean;
	onDismiss: () => void;
	onConfirm: (skip: boolean) => void;
	skip?: boolean;
	title: string;
	content?: string;
	children?: React.ReactNode;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
	visible,
	onDismiss,
	onConfirm,
	skip,
	title,
	content,
	children
}) => {
	const { width } = useWindowDimensions();
	const { skipAssessments } = useCourseStore();
	const [localSkipAssessments, setLocalSkipAssessments] = useState(skipAssessments);
	const maxWidth = width <= 600 ? width - 32 : 600;
	return (
		<Portal>
			<Dialog
				visible={visible}
				onDismiss={onDismiss}
				style={[styles.centeredMaxWidth, styles.slideWidth, { maxWidth }]}
			>
				<Dialog.Content style={{ gap: 16 }}>
					<View style={{ alignItems: "center" }}>
						<Image source={require("@/assets/images/svgs/warning.svg")} style={{ width: 120, height: 120 }} />
					</View>
					{!children && <Text style={[styles.subtitle, { textAlign: "center" }]}>{content}</Text>}
					{children && children}
					{/* TODO: if skip is true, show toggle with skipAssessments state */}
					{skip && (
						<Pressable style={{ flexDirection: "row", alignItems: "center", alignSelf: "flex-start" }} onPress={() => setLocalSkipAssessments(!localSkipAssessments)}>
							<Checkbox
								status={localSkipAssessments ? "checked" : "unchecked"}
								onPress={() => setLocalSkipAssessments(!localSkipAssessments)}
							/>
							<Text>Don't show this message again.</Text>
						</Pressable>
					)}
				</Dialog.Content>
				<Dialog.Actions>
					<Button onPress={onDismiss}>No</Button>
					<Button
						onPress={() => {
							onConfirm(localSkipAssessments);
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
