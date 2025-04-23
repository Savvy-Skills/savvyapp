import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, SegmentedButtons } from 'react-native-paper';
import { ContentInfo, ContentModes } from '@/types/index';

interface LessonEditorProps {
	content?: ContentInfo;
	onContentChange: (updatedContent: Partial<ContentInfo>) => void;
}

type LessonMode = "simple" | "advanced";

export default function LessonEditor({ content, onContentChange }: LessonEditorProps) {
	const [lessonMode, setLessonMode] = useState<ContentModes>(content?.mode || 'simple');

	useEffect(() => {
		if (content?.mode) {
			setLessonMode(content.mode);
		}
	}, [content]);



	const handleModeChange = (mode: ContentModes) => {
		setLessonMode(mode);
		onContentChange({
			mode: mode,
		});
	};

	return (
		<View style={styles.container}>
			<SegmentedButtons
				value={lessonMode}
				onValueChange={(value) => handleModeChange(value as ContentModes)}
				buttons={[
					{ value: 'simple', label: 'Simple' },
					// { value: 'normal', label: 'Normal' },
					{ value: 'advanced', label: 'Advanced' },
					// { value: 'custom', label: 'Custom' },
				]}
				style={styles.segmentedButtons}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		width: '100%',
	},
	segmentedButtons: {
		marginBottom: 12,
	},
	input: {
		marginTop: 8,
		marginBottom: 4,
	},
}); 