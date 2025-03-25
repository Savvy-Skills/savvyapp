import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { AssessmentTypes, AssessmentInfo } from '@/types/index';
import { TextInput } from 'react-native-paper';
import Dropdown from '@/components/common/Dropdown';

// Import all editors
import {
	SingleChoiceEditor,
	MultipleChoiceEditor,
	TrueFalseEditor,
	FillInTheBlankEditor,
	MatchWordsEditor,
	OrderListEditor,
	NumericalEditor,
	DragDropEditor,
	OpenEndedEditor
} from './assessmentEditors';

interface AssessmentFormFieldsProps {
	assessmentType: AssessmentTypes;
	questionText: string;
	options: string[];
	correctAnswers: number[];
	onAssessmentTypeChange: (type: AssessmentTypes) => void;
	onQuestionTextChange: (text: string) => void;
	onOptionsChange: (options: string[]) => void;
	onCorrectAnswersChange: (answers: number[]) => void;
	onFormDataChange: (formData: Partial<AssessmentInfo>) => void;
	formData?: AssessmentInfo;
}

export default function AssessmentFormFieldsContainer(props: AssessmentFormFieldsProps) {
	const {
		assessmentType,
		questionText,
		onQuestionTextChange,
		onAssessmentTypeChange
	} = props;

	// Create dropdown options for assessment types
	const assessmentTypeOptions = [
		{ label: 'Single Choice', value: 'Single Choice' },
		{ label: 'Multiple Choice', value: 'Multiple Choice' },
		{ label: 'True or False', value: 'True or False' },
		{ label: 'Fill in the Blank', value: 'Fill in the Blank' },
		{ label: 'Numerical', value: 'Numerical' },
		{ label: 'Match the Words', value: 'Match the Words' },
		{ label: 'Order List', value: 'Order List' },
		{ label: 'Drag and Drop', value: 'Drag and Drop' },
		{ label: 'Open Ended', value: 'Open Ended' }
	];

	// Type selection menu
	const renderTypeSelector = () => (
		<View style={styles.dropdownContainer}>
			<Dropdown
				label="Assessment Type"
				value={assessmentType}
				options={assessmentTypeOptions}
				onChange={(value: string) => onAssessmentTypeChange(value as AssessmentTypes)}
			/>
		</View>
	);

	// Question text input (common to all types)
	const renderQuestionInput = () => (
		assessmentType !== 'Fill in the Blank' ? (
			<TextInput
				label="Question Text"
				value={questionText}
				onChangeText={onQuestionTextChange}
				multiline
				style={styles.input}
				placeholder="Enter your question here..."
			/>
		) : null
	);

	// Render the appropriate editor based on assessment type
	const renderEditor = () => {
		switch (assessmentType) {
			case 'Single Choice':
				return <SingleChoiceEditor {...props} />;
			case 'Multiple Choice':
				return <MultipleChoiceEditor {...props} />;
			case 'True or False':
				return <TrueFalseEditor {...props} />;
			case 'Fill in the Blank':
				return <FillInTheBlankEditor {...props} />;
			case 'Match the Words':
				return <MatchWordsEditor {...props} />;
			case 'Order List':
				return <OrderListEditor {...props} />;
			case 'Numerical':
				return <NumericalEditor {...props} />;
			case 'Drag and Drop':
				return <DragDropEditor {...props} />;
			case 'Open Ended':			
				return <OpenEndedEditor {...props} />;
			default:
				return null;
		}
	};

	return (
		<View style={styles.container}>
			{renderTypeSelector()}
			{renderQuestionInput()}
			{renderEditor()}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		width: '100%',
	},
	dropdownContainer: {
		marginTop: 8,
		marginBottom: 16,
	},
	input: {
		marginBottom: 16,
	},
}); 