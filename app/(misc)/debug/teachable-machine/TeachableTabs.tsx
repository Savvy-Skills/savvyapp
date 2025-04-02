import styles from "@/styles/styles";
import { Pressable, ScrollView } from "react-native";
import { Icon, Text } from "react-native-paper";
import { View } from "react-native";
import { Image } from "expo-image";
import { IconButton } from "react-native-paper";
import { LayerType } from "@/types/neuralnetwork";
import { ImageClass } from "./types";
import { generateColors } from "@/utils/utilfunctions";
import { Colors } from "@/constants/Colors";

interface TeachableTabsProps {
	selectedLayer: LayerType;
	setSelectedLayer: (layer: LayerType) => void;
	classes: ImageClass[];
}

export function TeachableTabs({
	selectedLayer,
	setSelectedLayer,
	classes
}: TeachableTabsProps) {
	return (
		<View style={styles.networkContainer}>
			{/* Input Layer - Shows Classes */}
			<Pressable style={[
				styles.layerContainer,
				styles.inputLayer,
				selectedLayer === "input"
					? [styles.selectedLayer, styles.inputLayerSelected]
					: styles.unselectedLayer,
			]} onPress={() => setSelectedLayer("input")}>
				<Text style={styles.layerTitle}>Classes</Text>
				<ScrollView
				>
					<View style={styles.inputNodesContainer}>
						{classes.map((classItem, index) => (
							<View key={index} style={{ gap: 4 }}>
								<Text style={styles.inputLabel}>[{classItem.name}]</Text>
								<View style={[styles.inputNode, {width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: Colors.blue, backgroundColor: generateColors(Colors.blue, 0.1).muted}]}>
									<Image contentFit="contain" source={require("@/assets/images/pngs/images-collection.png")} style={{ width: "100%", height: "100%" }} />
								</View>
							</View>
						))}
					</View>
				</ScrollView>
			</Pressable>

			{/* Hidden Layer - Training */}
			<Pressable
				onPress={() => setSelectedLayer("hidden")}
				style={[
					styles.layerContainer,
					styles.hiddenLayer,
					selectedLayer === "hidden"
						? [styles.selectedLayer, styles.hiddenLayerSelected]
						: styles.unselectedLayer,
					styles.hiddenLayerWrapper
				]}
			>
				<Text style={styles.layerTitle}>Training</Text>
				<View style={styles.hiddenLayerCircle}>
					<Image
						source={require("@/assets/images/pngs/nn.png")}
						style={{ width: 100, height: 100 }}
					/>
				</View>
				<Text style={styles.layerInfo}>MobileNet Model</Text>
			</Pressable>

			{/* Output Layer - Prediction */}
			<Pressable
				style={[
					styles.layerContainer,
					styles.outputLayer,
					selectedLayer === "output"
						? [styles.selectedLayer, styles.outputLayerSelected]
						: styles.unselectedLayer,
				]}
				onPress={() => setSelectedLayer("output")}>
				<Text style={styles.layerTitle}>Evaluation</Text>
				<View style={styles.outputBox}>
					<Icon source="camera" size={40} color={Colors.blue} />
				</View>
			</Pressable>
		</View>
	);
} 