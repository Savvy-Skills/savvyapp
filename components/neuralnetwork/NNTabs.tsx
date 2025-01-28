import styles from "@/styles/styles";
import { Pressable } from "react-native";

import { IconButton, Text } from "react-native-paper";
import { View } from "react-native";
import { Surface } from "react-native-paper";
import { Image } from "expo-image";
import { dtypeMap, LayerType } from "@/types/neuralnetwork";
import { Column } from "@/hooks/useDataFetch";

interface NNTabsProps {
	selectedLayer?: LayerType | null;
	setSelectedLayer: (layer: LayerType) => void;
	inputColumns: Column[];
	outputColumn: string;
	problemType: string;
}

export default function NNTabs({selectedLayer, setSelectedLayer, inputColumns, outputColumn, problemType}: NNTabsProps) {

	const problemTypeLower = problemType.toLowerCase();
	const imageSource = problemTypeLower === "classification" ? require("@/assets/images/svgs/nn-classification.svg") : require("@/assets/images/svgs/nn-regression.svg");
	return (
		<View style={styles.networkContainer}>
			<Pressable onPress={() => setSelectedLayer("input")}>
				<Surface
						style={[
							styles.layerContainer,
							styles.inputLayer,
							selectedLayer === "input"
								? [styles.selectedLayer, styles.inputLayerSelected]
								: styles.unselectedLayer,
						]}
					>
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
					</Surface>
				</Pressable>

				<Pressable
					style={styles.hiddenLayerWrapper}
					onPress={() => setSelectedLayer("hidden")}
				>
					<Surface
						style={[
							styles.layerContainer,
							styles.hiddenLayer,
							selectedLayer === "hidden"
								? [styles.selectedLayer, styles.hiddenLayerSelected]
								: styles.unselectedLayer,
						]}
					>
						<Text style={styles.layerTitle}>Hidden layers</Text>
						<View style={styles.hiddenLayerCircle}>
							<Image
								source={require("@/assets/images/pngs/nn.png")}
								style={{ width: 100, height: 100 }}
							/>
						</View>
						<Text style={styles.layerInfo}>[3] hidden layers</Text>
					</Surface>
				</Pressable>

				<Pressable onPress={() => setSelectedLayer("output")}>
					<Surface
						style={[
							styles.layerContainer,
							styles.outputLayer,
							selectedLayer === "output"
								? [styles.selectedLayer, styles.outputLayerSelected]
								: styles.unselectedLayer,
						]}
					>
						<Text style={styles.layerTitle}>Output layer</Text>
						<View style={styles.outputBox}>
							{/* IF problemType is classification, show nn-classification.svg */}
							{/* ELSE show nn-regression.svg */}
							<Image
								source={imageSource}
								style={{ width: 60, height: 60 }}
							/>
						</View>
						<Text style={styles.outputLabel}>[{outputColumn}]</Text>
					</Surface>
				</Pressable>
		</View>
	);
}
