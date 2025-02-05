import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import styles from "@/styles/styles";
import { Icon } from "react-native-paper";
import { useThemeStore } from "@/store/themeStore";

interface CustomMenuProps {
	visible: boolean;
	onDismiss: () => void;
	onShowTopSheet: () => void;
	showModal: () => void;
	onRestart: () => void;
}

const CustomNavMenu: React.FC<CustomMenuProps> = ({
	visible,
	onDismiss,
	onShowTopSheet,
	showModal,
	onRestart
}) => {
	if (!visible) return null;

	const { backgroundAssessment, setBackgroundAssessment } = useThemeStore();

	return (
		<>
			<TouchableOpacity
				style={styles.overlay}
				// onPress={onDismiss}
				activeOpacity={1}
			>
				<View style={styles.menuContainer}>
					<TouchableOpacity
						style={styles.centeredItems}
						onPress={() => {
							onRestart();
							onDismiss();
						}}
					>
						<Icon source="restore" size={24} color="white" />
						<Text style={styles.menuText}>Restart Lesson</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.centeredItems}
						onPress={() => {
							onShowTopSheet();
							onDismiss();
						}}
					>
						<Icon source="format-list-numbered" size={24} color="white" />
						<Text style={styles.menuText}>Slide List</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.centeredItems}
						onPress={() => {
							showModal();
							onDismiss();
						}}
					>
						<Icon source="send" size={24} color="white" />
						<Text style={styles.menuText}>Message us</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.centeredItems}
						onPress={() => {
							setBackgroundAssessment(!backgroundAssessment);
						}}
					>
						<Icon source="theme-light-dark" size={24} color="white" />
						<Text style={styles.menuText}>{backgroundAssessment ? "No Background" : "Put Background"}</Text>
					</TouchableOpacity>
				</View>
			</TouchableOpacity>
		</>
	);
};

export default CustomNavMenu;
