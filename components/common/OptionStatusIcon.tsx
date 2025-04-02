import StatusIcon from "@/components/common/StatusIcon";

type RenderStatusIconProps = {
	option: string;
	selectedValues: string[];
	correctAnswers: string[];
	quizMode: boolean;
	isCorrect: boolean;
	isSubmitted: boolean;
	isRevealed: boolean;
};

const OptionStatusIcon = ({
	option,
	selectedValues,
	correctAnswers,
	quizMode,
	isCorrect,
	isSubmitted,
	isRevealed,
}: RenderStatusIconProps) => {
	const isSelected = selectedValues.includes(option);
	const isCorrectOption = correctAnswers.includes(option);

	if (quizMode && isSubmitted && !isCorrect) {
		const status = isCorrectOption
			? { isCorrect: true, isWrong: false, showAnswer: false }
			: isSelected
				? { isCorrect: false, isWrong: true, showAnswer: false }
				: null;

		return status && <StatusIcon {...status} />;
	}

	if (isSelected) {
		return (
			<StatusIcon
				isCorrect={isSubmitted && isCorrect}
				isWrong={isSubmitted && !isCorrect}
				showAnswer={isRevealed}
			/>
		);
	}

	return null;
};

export default OptionStatusIcon;