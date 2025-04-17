import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Text, Divider, SegmentedButtons } from 'react-native-paper';
import DefinitionComponent from '@/components/react/definitioncontent/DefinitionComponent';
import { ContentInfo } from '@/types';
import { generateColors } from '@/utils/utilfunctions';
import styles from '@/styles/styles';
import { Colors } from '@/constants/Colors';

interface DefinitionEditorProps {
	value: string;
	onContentChange: (updatedContent: Partial<ContentInfo>) => void;
	label?: string;
	placeholder?: string;
	numberOfLines?: number;
	height?: number | string;
	editorHeight?: number | string;
	propTitle?: string;
}

type Theme = "purple" | "lavender" | "orange" | "blue" | "cards-purple" | "cards-orange" | "cream";

const THEMES: { value: Theme, label: string, style: any }[] = [
	{ value: 'purple', label: 'Purple', style: { ...styles.toggleButton } },
	{ value: 'lavender', label: 'Lavender', style: { ...styles.toggleButton } },
	{ value: 'orange', label: 'Orange', style: { ...styles.toggleButton } },
	{ value: 'blue', label: 'Blue', style: { ...styles.toggleButton } },
	{ value: 'cards-purple', label: 'Cards Purple', style: { ...styles.toggleButton } },
	{ value: 'cards-orange', label: 'Cards Orange', style: { ...styles.toggleButton } },
];

export default function DefinitionEditor({
	value,
	onContentChange,
	label = "Definition Text",
	placeholder = "Enter definition text here...\nUse {{word}} to highlight important terms.",
	propTitle = "",
	numberOfLines = 8,
	height,
	editorHeight
}: DefinitionEditorProps) {
	const [text, setText] = useState(value || '');
	const [theme, setTheme] = useState<Theme>('purple');
	const [title, setTitle] = useState(propTitle || '');

	useEffect(() => {
		setText(value || '');
	}, [value]);

	const handleTextChange = (newText: string) => {
		setText(newText);
		onContentChange({
			state: {
				value: newText,
				title: title,
				theme: theme,
			}
		});
	};

	const handleTitleChange = (newTitle: string) => {
		setTitle(newTitle);
		onContentChange({
			state: {
				value: text,
				title: newTitle,
				theme: theme,
			}
		});
	};

	const handleThemeChange = (newTheme: Theme) => {
		setTheme(newTheme);
		onContentChange({
			state: {
				theme: newTheme,
				value: text,
				title: title,
			}
		});
	}

	// Mock timestamped transcription for preview
	const mockTranscription = {
		segments: [{
			words: []
		}]
	};


	return (
		<View style={[localStyles.container, height ? { height: height as number } : {}]}>
			<View style={localStyles.themeSelector}>
				<Text variant="titleSmall" style={localStyles.sectionTitle}>Theme:</Text>
				<SegmentedButtons
					value={theme}
					onValueChange={(value) => handleThemeChange(value as Theme)}
					buttons={THEMES}
					theme={{ roundness: 0, colors: { secondaryContainer: generateColors(Colors.primary, 0.2).muted } }}
				/>
			</View>

			<View style={localStyles.titleSelector}>
				<TextInput
					label="Title"
					value={title}
					onChangeText={handleTitleChange}
				/>
			</View>

			<TextInput
				label={label}
				value={text}
				onChangeText={handleTextChange}
				multiline
				numberOfLines={numberOfLines}
				placeholder={placeholder}
				style={[localStyles.textArea, editorHeight ? { height: editorHeight as number } : {}]}
			/>

			<View style={localStyles.previewContainer}>
				<Text variant="titleSmall" style={localStyles.previewTitle}>Preview:</Text>
				<Divider style={localStyles.divider} />
				<View style={localStyles.previewContent}>
					<DefinitionComponent
						definitionText={text}
						timestampedTranscription={mockTranscription}
						theme={theme}
						title={title}
					/>
				</View>
			</View>
		</View>
	);
}

const localStyles = StyleSheet.create({
	container: {
		width: '100%',
	},
	titleSelector: {
		marginBottom: 16,
	},
	themeSelector: {
		marginBottom: 16,
	},
	sectionTitle: {
		marginBottom: 8,
	},
	textArea: {
		marginBottom: 16,
		minHeight: 100,
	},
	previewContainer: {
		marginTop: 8,
		borderWidth: 1,
		borderColor: '#e0e0e0',
		borderRadius: 4,
		padding: 16,
		backgroundColor: '#f9f9f9',
	},
	previewTitle: {
		marginBottom: 8,
	},
	divider: {
		marginBottom: 16,
	},
	previewContent: {
		alignSelf: "center",
		maxWidth: 400,
		width: "100%",
		minHeight: 150,
	},
});