import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Dialog, Portal, TextInput, Text, SegmentedButtons, Card, DataTable, Divider } from 'react-native-paper';
import { LocalSlide } from '@/types';
import { getViewByID } from '@/services/coursesApi';
import { createSlide, updateSlide, disableSlide, reorderSlides } from '@/services/adminApi';

interface SlideManagerProps {
	viewId: number | null;
}

type SlideType = 'Content' | 'Assessment';
type ContentType = 'Text' | 'Image' | 'Video';
type AssessmentType = 'Single Choice' | 'Multiple Choice' | 'Numerical' | 'Open Ended' | 'Fill in the Blank' | 'True or False';

export default function SlideManager({ viewId }: SlideManagerProps) {
	const [slides, setSlides] = useState<LocalSlide[]>([]);
	const [loading, setLoading] = useState(false);
	const [dialogVisible, setDialogVisible] = useState(false);
	const [slideForm, setSlideForm] = useState<Partial<LocalSlide>>({
		name: '',
		type: 'Content',
		order: 0,
	});
	const [editingSlideId, setEditingSlideId] = useState<number | null>(null);
	const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
	const [slideToDelete, setSlideToDelete] = useState<number | null>(null);

	// Form state for slide type selection
	const [slideType, setSlideType] = useState<SlideType>('Content');
	const [contentType, setContentType] = useState<ContentType>('Text');
	const [assessmentType, setAssessmentType] = useState<AssessmentType>('Single Choice');

	// Additional form fields based on slide type
	const [contentText, setContentText] = useState('');
	const [mediaUrl, setMediaUrl] = useState('');
	const [questionText, setQuestionText] = useState('');
	const [options, setOptions] = useState<string[]>(['', '']);
	const [correctAnswers, setCorrectAnswers] = useState<number[]>([0]);

	useEffect(() => {
		if (viewId) {
			fetchSlides();
		} else {
			setSlides([]);
		}
	}, [viewId]);

	const fetchSlides = async () => {
		if (!viewId) return;

		setLoading(true);
		try {
			const viewData = await getViewByID(viewId);
			setSlides(viewData.slides as unknown as LocalSlide[]);
		} catch (error) {
			console.error('Failed to fetch slides:', error);
		} finally {
			setLoading(false);
		}
	};

	const resetForm = () => {
		setSlideForm({
			name: '',
			type: 'Content',
			order: slides.length,
		});
		setSlideType('Content');
		setContentType('Text');
		setAssessmentType('Single Choice');
		setContentText('');
		setMediaUrl('');
		setQuestionText('');
		setOptions(['', '']);
		setCorrectAnswers([0]);
		setEditingSlideId(null);
	};

	const handleOpenDialog = (slide?: LocalSlide) => {
		resetForm();

		if (slide) {
			// Set base slide data
			setSlideForm({
				name: slide.name,
				type: slide.type,
				order: slide.order,
			});
			setEditingSlideId(slide.slide_id);
			setSlideType(slide.type as SlideType);

			// Set specific data based on slide type
			if (slide.type === 'Content' && (slide as any).content_info) {
				setContentType((slide as any).content_info.type as ContentType);

				if ((slide as any).content_info.type === 'Text' && slide.contents) {
					setContentText((slide.contents[0] as any)?.text || '');
				} else if (['Image', 'Video'].includes((slide as any).content_info.type) && slide.contents) {
					setMediaUrl(slide.contents[0]?.url || '');
				}
			} else if (slide.type === 'Assessment' && slide.assessment_info) {
				setAssessmentType(slide.assessment_info.type as AssessmentType);
				setQuestionText(slide.assessment_info.text || '');

				if (slide.assessment_info.options) {
					setOptions(slide.assessment_info.options.map(opt => opt.text));

					// Set correct answers based on assessment type
					if (['Single Choice', 'Multiple Choice'].includes(slide.assessment_info.type)) {
						setCorrectAnswers(
							slide.assessment_info.options
								.map((opt, idx) => ({ idx, isCorrect: opt.isCorrect }))
								.filter(opt => opt.isCorrect)
								.map(opt => opt.idx)
						);
					}
				}
			}
		}

		setDialogVisible(true);
	};

	const handleSaveSlide = async () => {
		if (!viewId) return;

		let finalSlideData: Partial<LocalSlide> = {
			...slideForm,
			type: slideType,
		};

		// Add type-specific data
		if (slideType === 'Content') {
			(finalSlideData as any).content_info = {
				type: contentType,
			};

			if (contentType === 'Text') {
				finalSlideData.contents = [{ type: contentType as any, text: contentText } as any];
			} else if (['Image', 'Video'].includes(contentType)) {
				finalSlideData.contents = [{ type: contentType, url: mediaUrl } as any];
			}
		} else if (slideType === 'Assessment') {
			(finalSlideData as any).assessment_info = {
				type: assessmentType,
				text: questionText,
				options: options.map((text, idx) => ({
					text,
					isCorrect: correctAnswers.includes(idx),
					correctOrder: idx,
					match: '',
				})),
			};
		}

		try {
			if (editingSlideId) {
				await updateSlide(viewId, editingSlideId, finalSlideData);
			} else {
				await createSlide(viewId, finalSlideData);
			}
			setDialogVisible(false);
			fetchSlides();
		} catch (error) {
			console.error('Failed to save slide:', error);
		}
	};

	const handleDisableSlide = (slideId: number) => {
		setSlideToDelete(slideId);
		setDeleteDialogVisible(true);
	};

	const confirmDisableSlide = async () => {
		if (!viewId || !slideToDelete) return;

		try {
			await disableSlide(viewId, slideToDelete);
			fetchSlides();
		} catch (error) {
			console.error('Failed to disable slide:', error);
		}
		setDeleteDialogVisible(false);
		setSlideToDelete(null);
	};

	const handleAddOption = () => {
		setOptions([...options, '']);
	};

	const handleRemoveOption = (index: number) => {
		if (options.length <= 2) return; // Minimum 2 options

		const newOptions = options.filter((_, idx) => idx !== index);
		setOptions(newOptions);

		// Update correctAnswers if needed
		setCorrectAnswers(prev =>
			prev.filter(i => i !== index)
				.map(i => i > index ? i - 1 : i)
		);
	};

	const handleOptionChange = (text: string, index: number) => {
		const newOptions = [...options];
		newOptions[index] = text;
		setOptions(newOptions);
	};

	const toggleCorrectAnswer = (index: number) => {
		if (assessmentType === 'Single Choice') {
			setCorrectAnswers([index]);
		} else {
			// For multiple choice, toggle the selection
			if (correctAnswers.includes(index)) {
				setCorrectAnswers(prev => prev.filter(i => i !== index));
			} else {
				setCorrectAnswers(prev => [...prev, index]);
			}
		}
	};

	const renderSlideTypeOptions = () => (
		<View style={styles.formSection}>
			<Text variant="titleMedium">Slide Type</Text>
			<SegmentedButtons
				value={slideType}
				onValueChange={(value) => setSlideType(value as SlideType)}
				buttons={[
					{ value: 'Content', label: 'Content' },
					{ value: 'Assessment', label: 'Assessment' }
				]}
				style={styles.segmentedButton}
			/>
		</View>
	);

	const renderContentTypeOptions = () => (
		<View style={styles.formSection}>
			<Text variant="titleMedium">Content Type</Text>
			<SegmentedButtons
				value={contentType}
				onValueChange={(value) => setContentType(value as ContentType)}
				buttons={[
					{ value: 'Text', label: 'Text' },
					{ value: 'Image', label: 'Image' },
					{ value: 'Video', label: 'Video' }
				]}
				style={styles.segmentedButton}
			/>
		</View>
	);

	const renderAssessmentTypeOptions = () => (
		<View style={styles.formSection}>
			<Text variant="titleMedium">Assessment Type</Text>
			<SegmentedButtons
				value={assessmentType}
				onValueChange={(value) => setAssessmentType(value as AssessmentType)}
				buttons={[
					{ value: 'Single Choice', label: 'Single Choice' },
					{ value: 'Multiple Choice', label: 'Multiple Choice' },
					{ value: 'Numerical', label: 'Numerical' }
				]}
				style={styles.segmentedButton}
			/>
			<SegmentedButtons
				value={assessmentType}
				onValueChange={(value) => setAssessmentType(value as AssessmentType)}
				buttons={[
					{ value: 'Open Ended', label: 'Open Ended' },
					{ value: 'Fill in the Blank', label: 'Fill in the Blank' },
					{ value: 'True or False', label: 'True or False' }
				]}
				style={[styles.segmentedButton, { marginTop: 8 }]}
			/>
		</View>
	);

	const renderContentFields = () => {
		if (contentType === 'Text') {
			return (
				<TextInput
					label="Content Text"
					value={contentText}
					onChangeText={setContentText}
					multiline
					numberOfLines={4}
					style={styles.input}
				/>
			);
		} else {
			return (
				<TextInput
					label={contentType === 'Image' ? 'Image URL' : 'Video URL'}
					value={mediaUrl}
					onChangeText={setMediaUrl}
					style={styles.input}
				/>
			);
		}
	};

	const renderAssessmentFields = () => (
		<>
			<TextInput
				label="Question Text"
				value={questionText}
				onChangeText={setQuestionText}
				multiline
				numberOfLines={2}
				style={styles.input}
			/>

			{['Single Choice', 'Multiple Choice', 'True or False'].includes(assessmentType) && (
				<View style={styles.optionsContainer}>
					<Text variant="titleMedium" style={{ marginBottom: 8 }}>Options</Text>

					{options.map((option, index) => (
						<View key={index} style={styles.optionRow}>
							<TextInput
								value={option}
								onChangeText={(text) => handleOptionChange(text, index)}
								style={styles.optionInput}
								placeholder={`Option ${index + 1}`}
							/>
							<Button
								mode={correctAnswers.includes(index) ? 'contained' : 'outlined'}
								onPress={() => toggleCorrectAnswer(index)}
								style={styles.correctButton}
							>
								{correctAnswers.includes(index) ? 'Correct' : 'Mark Correct'}
							</Button>
							<Button
								icon="delete"
								mode="text"
								onPress={() => handleRemoveOption(index)}
								disabled={options.length <= 2}
							>
								Delete
							</Button>
						</View>
					))}

					<Button
						icon="plus"
						mode="outlined"
						onPress={handleAddOption}
						style={{ marginTop: 8 }}
					>
						Add Option
					</Button>
				</View>
			)}

			{assessmentType === 'Numerical' && (
				<TextInput
					label="Correct Answer (Number)"
					value={options[0] || ''}
					onChangeText={(text) => setOptions([text])}
					keyboardType="numeric"
					style={styles.input}
				/>
			)}

			{['Open Ended', 'Fill in the Blank'].includes(assessmentType) && (
				<TextInput
					label="Expected Answer"
					value={options[0] || ''}
					onChangeText={(text) => setOptions([text])}
					style={styles.input}
				/>
			)}
		</>
	);

	if (!viewId) {
		return (
			<View style={styles.container}>
				<Text>Please select a view first.</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text variant="headlineMedium">Slide Management</Text>
				<Button
					mode="contained"
					onPress={() => handleOpenDialog()}
					style={styles.addButton}
				>
					Add New Slide
				</Button>
			</View>

			{loading ? (
				<Text>Loading slides...</Text>
			) : (
				<ScrollView>
					<DataTable>
						<DataTable.Header>
							<DataTable.Title>Name</DataTable.Title>
							<DataTable.Title>Type</DataTable.Title>
							<DataTable.Title>Subtype</DataTable.Title>
							<DataTable.Title>Order</DataTable.Title>
							<DataTable.Title>Actions</DataTable.Title>
						</DataTable.Header>

						{slides.map((slide, index) => (
							<DataTable.Row key={slide.slide_id}>
								<DataTable.Cell>{slide.name}</DataTable.Cell>
								<DataTable.Cell>{slide.type}</DataTable.Cell>
								<DataTable.Cell>
									{slide.type === 'Content'
										? (slide as any).content_info?.type
										: (slide as any).assessment_info?.type}
								</DataTable.Cell>
								<DataTable.Cell>{index + 1}</DataTable.Cell>
								<DataTable.Cell>
									<View style={styles.actionButtons}>
										<Button
											mode="outlined"
											onPress={() => handleOpenDialog(slide)}
											style={styles.actionButton}
										>
											Edit
										</Button>
										<Button
											mode="outlined"
											onPress={() => handleDisableSlide(slide.slide_id)}
											style={[styles.actionButton, styles.deleteButton]}
										>
											Disable
										</Button>
									</View>
								</DataTable.Cell>
							</DataTable.Row>
						))}
					</DataTable>
				</ScrollView>
			)}

			<Portal>
				<Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)} style={{ maxWidth: 600 }}>
					<Dialog.Title>
						{editingSlideId ? 'Edit Slide' : 'Add New Slide'}
					</Dialog.Title>
					<Dialog.ScrollArea style={{ maxHeight: 500 }}>
						<ScrollView contentContainerStyle={{ padding: 20 }}>
							<TextInput
								label="Slide Name"
								value={slideForm.name}
								onChangeText={(text) => setSlideForm({ ...slideForm, name: text })}
								style={styles.input}
							/>

							<TextInput
								label="Order"
								value={slideForm.order?.toString()}
								onChangeText={(text) => setSlideForm({ ...slideForm, order: parseInt(text) || 0 })}
								keyboardType="numeric"
								style={styles.input}
							/>

							{/* Slide Type Selection */}
							{renderSlideTypeOptions()}
							<Divider style={styles.divider} />

							{/* Content-specific options */}
							{slideType === 'Content' && (
								<>
									{renderContentTypeOptions()}
									{renderContentFields()}
								</>
							)}

							{/* Assessment-specific options */}
							{slideType === 'Assessment' && (
								<>
									{renderAssessmentTypeOptions()}
									{renderAssessmentFields()}
								</>
							)}
						</ScrollView>
					</Dialog.ScrollArea>
					<Dialog.Actions>
						<Button onPress={() => setDialogVisible(false)}>Cancel</Button>
						<Button onPress={handleSaveSlide}>Save</Button>
					</Dialog.Actions>
				</Dialog>

				<Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
					<Dialog.Title>Confirm Disable</Dialog.Title>
					<Dialog.Content>
						<Text>Are you sure you want to disable this slide? This will hide it from users.</Text>
					</Dialog.Content>
					<Dialog.Actions>
						<Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
						<Button onPress={confirmDisableSlide}>Disable</Button>
					</Dialog.Actions>
				</Dialog>
			</Portal>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 20,
	},
	addButton: {
		marginLeft: 16,
		maxWidth: 200,
	},
	input: {
		marginBottom: 16,
	},
	formSection: {
		marginVertical: 12,
	},
	segmentedButton: {
		marginTop: 8,
	},
	divider: {
		marginVertical: 16,
	},
	optionsContainer: {
		marginBottom: 16,
	},
	optionRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 8,
	},
	optionInput: {
		flex: 1,
		marginRight: 8,
	},
	correctButton: {
		marginHorizontal: 8,
	},
	actionButtons: {
		flexDirection: 'row',
		gap: 8,
	},
	actionButton: {
		marginHorizontal: 4,
	},
	deleteButton: {
		borderColor: 'red',
		color: 'red',
	},
}); 