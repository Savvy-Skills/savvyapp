import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, SegmentedButtons } from 'react-native-paper';
import { ContentInfo } from '@/types/index';

interface LessonEditorProps {
	content?: ContentInfo;
	onContentChange: (updatedContent: Partial<ContentInfo>) => void;
}

type LessonMode = "simple" | "advanced";

export default function LessonEditor({ content, onContentChange }: LessonEditorProps) {
	const [lessonMode, setLessonMode] = useState<LessonMode>(content?.state?.lessonMode || 'simple');

	useEffect(() => {
		if (content?.state?.lessonMode) {
			setLessonMode(content.state.lessonMode);
		}
	}, [content]);



	const handleModeChange = (mode: LessonMode) => {
		setLessonMode(mode);
		onContentChange({
			state: {
				lessonMode: mode,
			},
		});
	};

	return (
		<View style={styles.container}>
			<SegmentedButtons
				value={lessonMode}
				onValueChange={(value) => handleModeChange(value as LessonMode)}
				buttons={[
					{ value: 'simple', label: 'Simple' },
					{ value: 'advanced', label: 'Advanced' },
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