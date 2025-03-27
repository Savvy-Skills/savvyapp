import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import styles from "@/styles/styles";
import { Icon } from "react-native-paper";

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


	return (
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
		</View>
	);
};

export default CustomNavMenu;
