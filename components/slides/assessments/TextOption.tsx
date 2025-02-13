import CustomRadioButton from "@/components/SavvyRadioButton";
import styles from "@/styles/styles";
import { getOptionStyles, OptionProps } from "@/utils/utilfunctions";
import { View } from "react-native";
import OptionStatusIcon from "./OptionStatusIcon";

const TextOption = ({
	option,
	selectedValue,
	correctAnswer,
	isRevealed,
	isCorrect,
	isSubmitted,
	quizMode,
	handleChoiceSelection,
}: OptionProps) => {

	const blocked = (quizMode || isCorrect) && isSubmitted;

	return (
		<View style={styles.optionContainer}>
			<CustomRadioButton
				label={option}
				value={option}
				status={selectedValue === option ? "checked" : "unchecked"}
				onPress={() => handleChoiceSelection(option)}
				disabled={blocked && option !== correctAnswer}
				style={getOptionStyles({
					option,
					quizMode,
					isSubmitted,
					isCorrect,
					selectedValue,
					correctAnswer,
					isRevealed,
					questionType: "Text",
				})}
				disabledTouchable={selectedValue === option || blocked}
			/>
			<View style={styles.iconContainer}>
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
	);
}

export default TextOption;