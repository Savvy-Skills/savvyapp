// ConfirmationDialog.tsx
import { useCourseStore } from "@/store/courseStore";
import styles from "@/styles/styles";
import React, { useState } from "react";
import { View, StyleSheet, useWindowDimensions, Switch } from "react-native";
import { Dialog, Portal, Button, Icon, Text } from "react-native-paper";

interface ConfirmationDialogProps {
	visible: boolean;
	onDismiss: () => void;
	onConfirm: (skip: boolean) => void;
	skip?: boolean;
	title: string;
	content: string;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
	visible,
	onDismiss,
	onConfirm,
	skip,
	title,
	content,
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
				<Dialog.Title>{title}</Dialog.Title>
				<Dialog.Content style={{ gap: 16 }}>
					<View style={{ alignItems: "center" }}>
						<Icon source="alert" size={120} color="#ff861d" />
					</View>
					<Text style={{ alignSelf: "center" }}>{content}</Text>
					{/* TODO: if skip is true, show toggle with skipAssessments state */}
					{skip && (
						<View style={{ flexDirection: "column", alignSelf: "center", justifyContent: "center" }}>
							<Text>Not show this again.</Text>
							<Switch value={localSkipAssessments} onValueChange={setLocalSkipAssessments} />
						</View>
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
