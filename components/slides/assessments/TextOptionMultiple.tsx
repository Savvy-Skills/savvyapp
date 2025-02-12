import CustomCheckbox from "@/components/SavvyCheckbox";
import styles from "@/styles/styles";
import { QuestionInfo } from "@/types";
import { View } from "react-native";
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
	isCorrect: boolean;
	isRevealed: boolean;
	isSubmitted: boolean;
}

const TextOptionMultiple = ({
	key,
	option,
	selectedValues,
	handleChoiceSelection,
	blocked,
	correctAnswers,
	quizMode,
	isCorrect,
	isRevealed,
	isSubmitted,
}: OptionMultipleProps) => {
	return (
		<View key={key} style={styles.optionContainer}>
			<CustomCheckbox
				label={option}
				status={selectedValues.includes(option) ? "checked" : "unchecked"}
				onPress={() => handleChoiceSelection(option)}
				disabled={blocked && !correctAnswers.includes(option)}
				style={getOptionStyles({
					option,
					quizMode,
					correctAnswers,
					selectedValues,
					isCorrect,
					isRevealed,
					isSubmitted,
					questionType: "Text"
				})}
				disabledTouchable={blocked}
			/>
			<View style={styles.iconContainer}>
				<OptionStatusIcon
					option={option}
					correctAnswers={correctAnswers}
					quizMode={quizMode}
					selectedValues={selectedValues}
					isCorrect={isCorrect}
					isSubmitted={isSubmitted}
					isRevealed={isRevealed}
				/>
			</View>
		</View>
	);
};

export default TextOptionMultiple;