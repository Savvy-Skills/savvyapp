import styles from "@/styles/styles";
import { Pressable } from "react-native";
import { IconButton, Text } from "react-native-paper";
import { View } from "react-native";
import { Image } from "expo-image";
import { dtypeMap, LayerType } from "@/types/neuralnetwork";
import { Column } from "@/hooks/useDataFetch";

interface TabsBaseProps {
	selectedLayer?: LayerType | null;
	setSelectedLayer: (layer: LayerType) => void;
}

export interface NNTabsProps extends TabsBaseProps {
	inputColumns: Column[];
	outputColumn: string;
	problemType: string;
	neuronsPerLayer: number[];
}

export default function NNTabs({ selectedLayer, setSelectedLayer, inputColumns, outputColumn, problemType, neuronsPerLayer }: NNTabsProps) {
	const problemTypeLower = problemType.toLowerCase();
	const imageSource = problemTypeLower === "classification" ? require("@/assets/images/svgs/nn-classification.svg") : require("@/assets/images/svgs/nn-regression.svg");
	return (
		<View style={styles.networkContainer}>
			<Pressable style={[
				styles.layerContainer,
				styles.inputLayer,
				selectedLayer === "input"
					? [styles.selectedLayer, styles.inputLayerSelected]
					: styles.unselectedLayer,
			]} onPress={() => setSelectedLayer("input")}>
				<Text style={styles.layerTitle}>Input layer</Text>
				<View style={styles.inputNodesContainer}>
					{inputColumns.map((column, index) => (
						<View key={index} style={{ gap: 4 }}>
							<Text style={styles.inputLabel}>[{column.accessor}]</Text>
							<View style={styles.inputNode}>
								<IconButton icon={dtypeMap[column.dtype as keyof typeof dtypeMap]} size={24} iconColor="#fff" />
							</View>
						</View>
					))}
				</View>
			</Pressable>

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
				<Text style={styles.layerTitle}>Hidden layers</Text>
				<View style={styles.hiddenLayerCircle}>
					<Image
						source={require("@/assets/images/pngs/nn.png")}
						style={{ width: 100, height: 100 }}
					/>
				</View>
				<Text style={styles.layerInfo}>[{neuronsPerLayer.length}] hidden layers</Text>
			</Pressable>

			<Pressable
				style={[
					styles.layerContainer,
					styles.outputLayer,
					selectedLayer === "output"
						? [styles.selectedLayer, styles.outputLayerSelected]
						: styles.unselectedLayer,
				]}
				onPress={() => setSelectedLayer("output")}>
				<Text style={styles.layerTitle}>Output layer</Text>
				<View style={styles.outputBox}>
					<Image
						source={imageSource}
						style={{ width: 60, height: 60 }}
					/>
				</View>
				<Text style={styles.outputLabel}>[{outputColumn}]</Text>
			</Pressable>
		</View>
	);
}
