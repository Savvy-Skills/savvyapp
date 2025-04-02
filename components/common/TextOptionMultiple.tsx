import CustomCheckbox from "@/components/common/SavvyCheckbox";
import styles from "@/styles/styles";
import { AssessmentInfo } from "@/types";
import { View } from "react-native";
import OptionStatusIcon from "./OptionStatusIcon";
import { getMultipleOptionStyles, MultipleOptionProps } from "@/utils/utilfunctions";

const TextOptionMultiple = ({
	option,
	selectedValues,
	handleChoiceSelection,
	blocked,
	correctAnswers,
	quizMode,
	isCorrect,
	isRevealed,
	isSubmitted,
}: MultipleOptionProps) => {
	return (
		<View style={styles.optionContainer}>
			<CustomCheckbox
				label={option}
				status={selectedValues.includes(option) ? "checked" : "unchecked"}
				onPress={() => handleChoiceSelection(option)}
				disabled={blocked && !correctAnswers.includes(option)}
				style={getMultipleOptionStyles({
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