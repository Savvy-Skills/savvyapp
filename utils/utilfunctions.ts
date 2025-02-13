import { AssessmentAnswer } from "@/store/courseStore";
import styles from "@/styles/styles";
import { CustomSlide, LocalSlide, Submission, ViewWithSlides } from "@/types";

const includes = <T>(arr: readonly T[], x: T): boolean => arr.includes(x)

function hexToRgbA(hex: string) {
	var c;
	if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
		c = hex.substring(1).split('');
		if (c.length == 3) {
			c = [c[0], c[0], c[1], c[1], c[2], c[2]];
		}
		c = '0x' + c.join('');
		return 'rgba(' + [(parseInt(c) >> 16) & 255, (parseInt(c) >> 8) & 255, parseInt(c) & 255].join(',') + ',1)';
	}
	throw new Error('Bad Hex');
}

const generateColors = (color: string, opacity: number) => {
	let rgba = color.startsWith("#") ? hexToRgbA(color) : color;
	const color1 = rgba.replace(/[^,]+(?=\))/, "1");
	const color2 = rgba.replace(/[^,]+(?=\))/, opacity.toString());
	return { normal: color1, muted: color2 };
}

async function loadModules(resources: any, target: Record<string, any>) {
	for (let prop in resources) {
		resources[prop].then((r: any) => (target[prop] = r));
	}
	return await Promise.all(Object.values(resources));
}

function groupByColumn(data: any[], key?: string) {
	if (!data || !key) return {};
	return data.reduce((acc, item) => {
		const group = item[key];
		acc[group] = acc[group] || [];
		acc[group].push(item);
		return acc;
	}, {});
}

function createCustomSlide(
	type: string,
	module_id: number,
	view: ViewWithSlides
): CustomSlide {
	if (type === "intro") {
		return {
			name: `Intro: ${view.name}`,
			order: 0,
			slide_id: 0,
			created_at: Date.now(),
			published: true,
			module_id: module_id,
			type: "Custom",
			subtype: "intro",
			image: `${view.view_info.intro_image}`,
			contents: [],
		};
	} else {
		return {
			name: `Stats`,
			order: 999,
			slide_id: 999999,
			created_at: Date.now(),
			published: true,
			module_id: module_id,
			type: "Custom",
			subtype: "outro",
			image: `${view.view_info.intro_image}`,
			contents: [],
		};
	}
}
export interface OptionProps extends OptionStylesProps {
	handleChoiceSelection: (option: string) => void;
}


export const getCorrectAnswers = (slide: LocalSlide) => {
	if (slide.type === "Assessment") {
		switch (slide.assessment_info?.type) {
			case "Multiple Choice":
				return slide.assessment_info?.options.filter((option) => option.isCorrect).map((option) => ({ text: option.text }));
			case "Single Choice":
				return slide.assessment_info?.options.filter((option) => option.isCorrect).map((option) => ({ text: option.text }));
			case "True or False":
				return slide.assessment_info?.options.filter((option) => option.isCorrect).map((option) => ({ text: option.text }));
			case "Order List":
				return slide.assessment_info?.options.slice().sort((a, b) => a.correctOrder - b.correctOrder).map((option) => ({ text: option.text }));
			case "Numerical":
				return [{text: slide.assessment_info?.options[0].text}];
			case "Fill in the Blank":
				const matches = slide.assessment_info?.text.match(/\[(.*?)\]/g);
				const texts = matches?.map((match) => match.replace(/[\[\]]/g, ''));
				if (!texts) return [];
				return texts.map((text, index) => ({ text: text, order: index }));
			case "True or False":
				return slide.assessment_info?.options.filter((option) => option.isCorrect).map((option) => ({ text: option.text }));
			default:
				return [];
		}
	}
	return [];
}

export const getMultipleOptionStyles = ({
	option,
	quizMode,
	correctAnswers,
	selectedValues,
	isCorrect,
	isRevealed,
	isSubmitted,
	questionType
}: MultipleOptionStylesProps) => {
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

interface OptionStylesProps {
	option: string;
	quizMode: boolean;
	isCorrect: boolean;
	selectedValue: string;
	correctAnswer: string;
	isRevealed: boolean;
	isSubmitted: boolean;
	questionType: "Text" | "Image";
}

interface MultipleOptionStylesProps {
	option: string;
	quizMode: boolean;
	correctAnswers: string[];
	selectedValues: string[];
	isCorrect: boolean;
	isRevealed: boolean;
	isSubmitted: boolean;
	questionType: "Text" | "Image";
}

export interface MultipleOptionProps {
	handleChoiceSelection: (option: string) => void;
	blocked: boolean;
	option: string;
	quizMode: boolean;
	correctAnswers: string[];
	selectedValues: string[];
	isCorrect: boolean;
	isRevealed: boolean;
	isSubmitted: boolean;
}

export const getOptionStyles = ({
	option,
	quizMode,
	isCorrect,
	selectedValue,
	correctAnswer,
	isRevealed,
	isSubmitted,
	questionType,
}: OptionStylesProps) => {
	const isSelected = option === selectedValue;
	const isCorrectAnswer = option === correctAnswer;
	const baseStyles = questionType === "Image" ? [styles.imageOption] : [styles.option];

	// Handle quiz mode wrong answer states first
	if (quizMode && isSubmitted && !isCorrect) {
		if (isCorrectAnswer) return [...baseStyles, styles.correctOption];
		if (isSelected) return [...baseStyles, styles.incorrectOption];
		return [...baseStyles, styles.disabledOption];
	}

	// Handle revealed correct answers (non-quiz mode)
	if (isRevealed && isCorrectAnswer && !quizMode) {
		return [...baseStyles, styles.revealedOption];
	}

	// Handle selected option states
	if (isSelected) {
		if (isSubmitted && isCorrect) return [...baseStyles, styles.correctOption];
		if (isSubmitted && !isCorrect) return [...baseStyles, styles.incorrectOption];
		if (isRevealed) return [...baseStyles, styles.revealedOption];

		return questionType === "Image"
			? [...baseStyles, styles.selectedImage]
			: [...baseStyles, styles.selectedOption];
	}

	return baseStyles;
};

const createSubmission = (
	assessment_id: number,
	correct: boolean,
	answer: AssessmentAnswer,
	view_id: number,
	submission_id: number
): Submission => {
	return {
		id: submission_id,
		created_at: Date.now(),
		assessment_id,
		views_id: view_id,
		submissionTime: Date.now(),
		isCorrect: correct,
		answer: answer.answer,
		revealed: answer.revealed,
	};
};

export {
	includes,
	loadModules,
	groupByColumn,
	createCustomSlide,
	createSubmission,
	generateColors
}