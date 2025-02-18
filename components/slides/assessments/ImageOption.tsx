import styles from "@/styles/styles";
import { getOptionStyles, OptionProps } from "@/utils/utilfunctions";
import { Image } from "expo-image";
import { TouchableOpacity, View } from "react-native";
import OptionStatusIcon from "./OptionStatusIcon";


const ImageOption = ({
	option,
	selectedValue,
	correctAnswer,
	isRevealed,
	isCorrect,
	quizMode,
	isSubmitted,
	handleChoiceSelection,
}: OptionProps) => {
	const blocked = quizMode && isSubmitted && !isCorrect;

	return (
		<TouchableOpacity
			style={styles.imageContainer}
			onPress={() => handleChoiceSelection(option)}
			disabled={blocked}
			accessibilityRole="radio"
			accessibilityState={{ checked: selectedValue === option }}
		>
			<View
				style={getOptionStyles({
					option,
					quizMode,
					isSubmitted,
					isCorrect,
					selectedValue,
					correctAnswer,
					isRevealed,
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
						selectedValues={[selectedValue]}
						correctAnswers={[correctAnswer]}
						isRevealed={isRevealed}
						isCorrect={isCorrect}
						quizMode={quizMode}
						isSubmitted={isSubmitted}
					/>
				</View>
			</View>
		</TouchableOpacity>
	);
}

export default ImageOption;