import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Menu, Button } from 'react-native-paper';
import { AssessmentTypes, AssessmentInfo } from '@/types/index';
import { TextInput } from 'react-native-paper';

// Import all editors
import {
	SingleChoiceEditor,
	MultipleChoiceEditor,
	TrueFalseEditor,
	FillInTheBlankEditor,
	MatchWordsEditor,
	OrderListEditor,
	NumericalEditor,
	DragDropEditor
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
}

export default function AssessmentFormFieldsContainer(props: AssessmentFormFieldsProps) {
	const {
		assessmentType,
		questionText,
		onQuestionTextChange,
		onAssessmentTypeChange
	} = props;

	const [menuVisible, setMenuVisible] = React.useState(false);

	// Type selection menu
	const renderTypeSelector = () => (
		<View style={styles.dropdownContainer}>
			<Menu
				visible={menuVisible}
				onDismiss={() => setMenuVisible(false)}
				anchor={<Button
					mode="outlined"
					onPress={() => setMenuVisible(true)}
					style={styles.dropdownButton}
				>
					Assessment Type: {assessmentType}
				</Button>}
				style={styles.menu}
			>
				{['Single Choice', 'Multiple Choice', 'True or False', 'Fill in the Blank',
					'Numerical', 'Match the Words', 'Order List', 'Drag and Drop'].map((type) => (
						<Menu.Item
							key={type}
							title={type}
							onPress={() => {
								onAssessmentTypeChange(type as AssessmentTypes);
								setMenuVisible(false);
							}}
						/>
					))}
			</Menu>
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
		position: 'relative',
		zIndex: 1000,
		marginBottom: 16,
	},
	dropdownButton: {
		width: '100%',
		justifyContent: 'flex-start',
	},
	menu: {
		width: 300,
	},
	input: {
		marginBottom: 16,
	},
}); 