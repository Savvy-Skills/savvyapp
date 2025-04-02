import styles from "@/styles/styles";
import { Image } from "expo-image";
import { TouchableOpacity, View } from "react-native";
import OptionStatusIcon from "./OptionStatusIcon";
import { getMultipleOptionStyles, MultipleOptionProps } from "@/utils/utilfunctions";

const ImageOptionMultiple = ({
	option,
	selectedValues,
	handleChoiceSelection,
	blocked,
	correctAnswers,
	quizMode,
	isCorrect,
	isRevealed,
	isSubmitted
}: MultipleOptionProps) => (
	<TouchableOpacity
		style={styles.imageContainer}
		onPress={() => handleChoiceSelection(option)}
		disabled={blocked}
		accessibilityRole="checkbox"
		accessibilityState={{ checked: selectedValues.includes(option) }}
	>
		<View
			style={getMultipleOptionStyles({
				option,
				quizMode,
				correctAnswers,
				selectedValues,
				isCorrect,
				isRevealed,
				isSubmitted,
				questionType: "Image"
			})}
		>
			<Image
				source={{ uri: option }}
				style={styles.image}
			/>
			<View style={styles.imageIconContainer}>
				<OptionStatusIcon
					option={option}
					isCorrect={isCorrect}
					isRevealed={isRevealed}
					isSubmitted={isSubmitted}
					selectedValues={selectedValues}
					correctAnswers={correctAnswers}
					quizMode={quizMode}
				/>
			</View>
		</View>
	</TouchableOpacity>
);

export default ImageOptionMultiple;