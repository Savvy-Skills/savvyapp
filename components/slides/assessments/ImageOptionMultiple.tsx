import styles from "@/styles/styles";
import { Image } from "expo-image";
import { TouchableOpacity, View } from "react-native";
import OptionStatusIcon from "./OptionStatusIcon";

interface OptionStylesProps {
	option: string;
	quizMode: boolean;
	correctAnswers: string[];
	selectedValues: string[];
	isCorrect: boolean;
	isRevealed: boolean;
	isSubmitted: boolean;
	questionType: "Text" | "Image";
}

const getOptionStyles = ({
	option,
	quizMode,
	correctAnswers,
	selectedValues,
	isCorrect,
	isRevealed,
	isSubmitted,
	questionType
}: OptionStylesProps) => {
	const baseStyles =
		questionType === "Image" ? [styles.imageOption] : [styles.option];

	if (isRevealed && correctAnswers.includes(option)) {
		if (!quizMode) {
			return [...baseStyles, styles.revealedOption];
		}
	}

	if (quizMode && !isCorrect) {
		if (correctAnswers.includes(option)) {
			return [...baseStyles, styles.correctOption];
		}
		if (selectedValues.includes(option)) {
			return [...baseStyles, styles.incorrectOption];
		}
		return [...baseStyles, styles.disabledOption];
	}

	if (selectedValues.includes(option)) {
		if (isSubmitted && isCorrect) {
			return [...baseStyles, styles.correctOption];
		} else if (isSubmitted && !isCorrect) {
			return [...baseStyles, styles.incorrectOption];
		} else if (isRevealed) {
			return [...baseStyles, styles.revealedOption];
		}
		if (questionType === "Image") {
			return [...baseStyles, styles.selectedImage];
		}
		return [...baseStyles, styles.selectedOption];
	}
	return baseStyles;
};

interface OptionMultipleProps {
	key: string;
	option: string;
	selectedValues: string[];
	handleChoiceSelection: (option: string) => void;
	blocked: boolean;
	correctAnswers: string[];
	showAnswer: boolean;
	quizMode: boolean;
	currentSubmission: any;
}

const ImageOptionMultiple = ({
	key,
	option,
	selectedValues,
	handleChoiceSelection,
	blocked,
	correctAnswers,
	showAnswer,
	quizMode,
	currentSubmission
}: OptionMultipleProps) => (
	<TouchableOpacity
		key={key}
		style={styles.imageContainer}
		onPress={() => handleChoiceSelection(option)}
		disabled={blocked}
		accessibilityRole="checkbox"
		accessibilityState={{ checked: selectedValues.includes(option) }}
	>
		<View
			style={getOptionStyles({
				option,
				quizMode,
				correctAnswers,
				selectedValues,
				isCorrect: currentSubmission?.isCorrect ?? false,
				isRevealed: showAnswer,
				isSubmitted: currentSubmission?.submitted ?? false,
				questionType: "Image"
			})}
		>
			<Image
				source={{ uri: option }}
				style={styles.image}
			/>
			<View style={styles.imageIconContainer}>
				<OptionStatusIcon
					isCorrect={currentSubmission?.isCorrect ?? false}
					isRevealed={showAnswer}
					isSubmitted={currentSubmission?.submitted ?? false}
					option={option}
					selectedValues={selectedValues}
					correctAnswers={correctAnswers}
					quizMode={quizMode}
				/>
			</View>
		</View>
	</TouchableOpacity>
);

export default ImageOptionMultiple;