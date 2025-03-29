import React, { useState, useRef, useEffect } from 'react';
import { View, FlatList, ScrollView } from 'react-native';
import { Card, Button, Text, Chip, Divider } from 'react-native-paper';
import { Assessment, AssessmentInfo } from '@/types/index';
import ConfirmationDialog from '@/components/modals/ConfirmationDialog';
import { createAssessments } from '@/services/adminApi';
import { generateAssessments, improveAssessment } from '@/services/aiApi';

// Import all editor components
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
} from '@/components/admin/assessmentEditors';

// Import extracted components
import AssessmentForm from './components/AssessmentForm';
import LoadingIndicator from './components/LoadingIndicator';
import AssessmentCard from './components/AssessmentCard';
import AssessmentEditor from './components/AssessmentEditor';
import JsonPreviewModal from './components/JsonPreviewModal';
import ImprovementModal from './components/ImprovementModal';

// Import types and constants
import { AIAssessmentGeneratorProps } from './types';
import { GRADE_LEVEL_OPTIONS, TONE_OPTIONS } from './constants';
import { styles } from './styles';

export default function AIAssessmentGenerator({ viewId, onAssessmentsCreated }: AIAssessmentGeneratorProps) {
	// Form state
	const [contentTopic, setContentTopic] = useState('');
	const [description, setDescription] = useState('');
	const [concepts, setConcepts] = useState<string[]>([]);
	const [conceptInput, setConceptInput] = useState('');
	const [gradeLevel, setGradeLevel] = useState('K-12');
	const [tone, setTone] = useState('educational');

	// Results state
	const [generatedAssessments, setGeneratedAssessments] = useState<Assessment[]>([]);
	const [loading, setLoading] = useState(false);
	const [progress, setProgress] = useState(0);
	const progressInterval = useRef<NodeJS.Timeout | null>(null);
	const [savedCount, setSavedCount] = useState(0);
	const [activeFilterType, setActiveFilterType] = useState<string>('All');
	const [filteredAssessments, setFilteredAssessments] = useState<Assessment[]>([]);

	// Editor state
	const [editingAssessmentIds, setEditingAssessmentIds] = useState<{ [key: string]: boolean }>({});
	const [editorFormDataMap, setEditorFormDataMap] = useState<{ [key: string]: Partial<AssessmentInfo> }>({});

	// JSON preview state
	const [jsonModalVisible, setJsonModalVisible] = useState(false);
	const [jsonData, setJsonData] = useState('');

	// Assessment improvement state
	const [improvingAssessmentId, setImprovingAssessmentId] = useState<string | null>(null);
	const [improvementInstructions, setImprovementInstructions] = useState('');
	const [improvementLoading, setImprovementLoading] = useState(false);
	const [improvedAssessment, setImprovedAssessment] = useState<Assessment | null>(null);
	const [improvementModalVisible, setImprovementModalVisible] = useState(false);

	// Confirmation dialog state
	const [confirmDialogVisible, setConfirmDialogVisible] = useState(false);
	const [confirmationSkip, setConfirmationSkip] = useState(false);
	const [assessmentToRemove, setAssessmentToRemove] = useState<Assessment | null>(null);
	const [removeConfirmVisible, setRemoveConfirmVisible] = useState(false);

	// Effect to filter assessments when the filter or assessments change
	useEffect(() => {
		if (activeFilterType === 'All') {
			setFilteredAssessments(generatedAssessments);
		} else {
			setFilteredAssessments(generatedAssessments.filter(a => a.type === activeFilterType));
		}
	}, [generatedAssessments, activeFilterType]);

	// Simulate progress during generation
	const simulateProgress = () => {
		if (progressInterval.current) {
			clearInterval(progressInterval.current);
		}

		setProgress(0);
		progressInterval.current = setInterval(() => {
			setProgress(prev => {
				if (prev >= 90) {
					return 90;
				}
				return prev + Math.random() * 10;
			});
		}, 1000);
	};

	// Handle form submission
	const handleGenerateAssessments = async () => {
		if (!contentTopic.trim()) return;

		setLoading(true);
		setGeneratedAssessments([]);
		setSavedCount(0);
		setActiveFilterType('All');
		simulateProgress();

		try {
			const requestData = {
				content_topic: contentTopic,
				description: description,
				concepts: concepts,
				grade_level: gradeLevel,
				tone: tone
			};

			const result = await generateAssessments(requestData);

			if (progressInterval.current) {
				clearInterval(progressInterval.current);
			}

			setProgress(100);

			// Wait a moment to show 100% progress
			setTimeout(() => {
				setGeneratedAssessments(result.assessments);
				setLoading(false);
			}, 500);

		} catch (error) {
			console.error('Error generating assessments:', error);
			setLoading(false);
			if (progressInterval.current) {
				clearInterval(progressInterval.current);
			}
		}
	};

	// Open edit view for an assessment
	const handleEditAssessment = (assessment: Assessment) => {
		// Create a unique ID for this assessment (using its text as a simple identifier)
		const assessmentId = assessment.text;

		// Initialize form data for this assessment
		setEditorFormDataMap(prev => ({
			...prev,
			[assessmentId]: {
				...assessment,
				slideName: assessment.slideName || assessment.text.substring(0, 30),
			}
		}));

		// Mark this assessment as being edited
		setEditingAssessmentIds(prev => ({
			...prev,
			[assessmentId]: true
		}));
	};

	// Handle canceling the edit of an assessment
	const handleCancelEdit = (assessmentId: string) => {
		// Remove the editing state for this assessment
		setEditingAssessmentIds(prev => {
			const newState = { ...prev };
			delete newState[assessmentId];
			return newState;
		});

		// Clean up the form data
		setEditorFormDataMap(prev => {
			const newData = { ...prev };
			delete newData[assessmentId];
			return newData;
		});
	};

	// Handle editor form data changes for a specific assessment
	const handleEditorFormChange = (assessmentId: string, data: Partial<AssessmentInfo>) => {
		setEditorFormDataMap(prevData => ({
			...prevData,
			[assessmentId]: {
				...prevData[assessmentId],
				...data
			}
		}));
	};

	// Save an edited assessment
	const handleSaveAssessment = async (assessmentId: string) => {
		try {
			const formData = editorFormDataMap[assessmentId];

			// Update the list of generated assessments with the edited data
			// but don't save to server yet - just mark as edited in local state
			setGeneratedAssessments(prev =>
				prev.map(assessment =>
					assessment.text === assessmentId ?
						{ ...assessment, ...formData, edited: true } : assessment
				)
			);

			// Clear the editing state
			handleCancelEdit(assessmentId);

		} catch (error) {
			console.error('Error updating assessment:', error);
		}
	};

	// Show remove confirmation dialog
	const handleRemoveClick = (assessment: Assessment) => {
		setAssessmentToRemove(assessment);
		setRemoveConfirmVisible(true);
	};

	// Function to remove an assessment from the generated list
	const handleRemoveAssessment = () => {
		if (!assessmentToRemove) return;

		setGeneratedAssessments(prev =>
			prev.filter(assessment => assessment.text !== assessmentToRemove.text)
		);

		setAssessmentToRemove(null);
	};

	// Handle save confirmation
	const handleConfirmSave = async (skip: boolean) => {
		setConfirmationSkip(skip);
		await performSaveAll();
	};

	// Show confirmation dialog before saving
	const handleSaveAllClick = () => {
		if (confirmationSkip) {
			performSaveAll();
		} else {
			setConfirmDialogVisible(true);
		}
	};

	// Save all assessments at once
	const performSaveAll = async () => {
		setLoading(true);
		const assessmentsToSave = generatedAssessments.filter(a => !a.saved);

		try {
			// Convert the assessment objects to the format expected by the API
			const assessmentData = assessmentsToSave.map(assessment => ({
				...assessment,
				slideName: assessment.slideName || assessment.text.substring(0, 30)
			}));

			// Save the assessments to the backend
			// The API returns a view object, not the assessments
			const view = await createAssessments(viewId, assessmentData);

			//   Check returned view object, should have a slides property and last slides should be the assessments
			//   If not, throw an error
			if (!view.slides || view.slides.length === 0) {
				throw new Error('No slides returned from createAssessments');
			}
			
			// Update the count of saved assessments
			setSavedCount(generatedAssessments.length);

			// Mark all assessments as saved in the local state
			setGeneratedAssessments(prev =>
				prev.map(assessment => ({ ...assessment, saved: true }))
			);

			// Notify parent component that assessments are created
			// This will trigger returning to the slide manager
			if (onAssessmentsCreated) {
				onAssessmentsCreated();
			}

		} catch (error) {
			console.error('Error saving assessments:', error);
			// Show error message
		} finally {
			setLoading(false);
		}
	};

	// Get all unique assessment types
	const getAssessmentTypes = () => {
		const types = [...new Set(generatedAssessments.map(a => a.type))];
		return ['All', ...types];
	};

	// Render the appropriate editor based on assessment type
	const renderEditor = (assessment: Assessment, assessmentId: string) => {
		const formData = editorFormDataMap[assessmentId];
		if (!formData) return null;

		const { type } = assessment;
		const commonProps = {
			questionText: formData.text || '',
			options: formData.options?.map(o => o.text) || [],
			correctAnswers: formData.options?.map((o, idx) => o.isCorrect ? idx : -1).filter(idx => idx !== -1) || [],
			onQuestionTextChange: (text: string) => handleEditorFormChange(assessmentId, { text }),
			onOptionsChange: (options: string[]) => {
				// Convert simple array to options array with appropriate structure
				let optionsArray = [];

				if (type === 'Match the Words' || type === 'Drag and Drop') {
					// Handle matching type editors
					optionsArray = [];
					for (let i = 0; i < options.length; i += 2) {
						if (i + 1 < options.length) {
							optionsArray.push({
								text: options[i],
								match: options[i + 1],
								isCorrect: true,
								correctOrder: i + 1
							});
						}
					}
				} else if (type === 'Order List') {
					// Handle order list with correctOrder property
					optionsArray = options.map((text, index) => ({
						text,
						correctOrder: index + 1,
						isCorrect: true
					}));
				} else {
					// Default format for most types
					optionsArray = options.map((text, index) => ({
						...formData.options?.[index],
						isCorrect: formData.options?.[index]?.isCorrect || false,
						text,
						correctOrder: index + 1
					}));
				}

				handleEditorFormChange(assessmentId, { options: optionsArray });
			},
			onCorrectAnswersChange: (answers: number[]) => {
				const updatedOptions = formData.options?.map((o, idx) => ({
					...o,
					isCorrect: answers.includes(idx)
				}));

				handleEditorFormChange(assessmentId, { options: updatedOptions });
			},
			onFormDataChange: (data: Partial<AssessmentInfo>) => handleEditorFormChange(assessmentId, data),
			formData: formData as AssessmentInfo
		};

		switch (type) {
			case 'Single Choice':
				return <SingleChoiceEditor {...commonProps} />;
			case 'Multiple Choice':
				return <MultipleChoiceEditor {...commonProps} />;
			case 'True or False':
				return <TrueFalseEditor {...commonProps} />;
			case 'Fill in the Blank':
				return <FillInTheBlankEditor {...commonProps} />;
			case 'Match the Words':
				return <MatchWordsEditor {...commonProps} />;
			case 'Order List':
				return <OrderListEditor {...commonProps} />;
			case 'Numerical':
				return <NumericalEditor {...commonProps} extras={formData.extras} />;
			case 'Drag and Drop':
				return <DragDropEditor {...commonProps} />;
			case 'Open Ended':
				return <OpenEndedEditor {...commonProps} />;
			default:
				return <Text>No editor available for this assessment type</Text>;
		}
	};

	// Function to handle showing JSON preview
	const handleShowJson = () => {
		const prettyJson = JSON.stringify(generatedAssessments, null, 2);
		setJsonData(prettyJson);
		setJsonModalVisible(true);
	};

	// Function to copy JSON to clipboard
	const handleCopyJson = () => {
		// This is a basic implementation that would need to be adapted for React Native
		if (navigator.clipboard) {
			navigator.clipboard.writeText(jsonData);
			// Show a notification or toast here
		}
	};

	// Function to start improving an assessment
	const handleStartImproveAssessment = (assessment: Assessment) => {
		setImprovingAssessmentId(assessment.text);
		setImprovementInstructions('');
		setImprovedAssessment(null);
		setImprovementModalVisible(true);
	};

	// Function to submit the improvement request
	const handleImproveAssessment = async () => {
		if (!improvingAssessmentId) return;

		setImprovementLoading(true);

		try {
			const assessmentToImprove = generatedAssessments.find(a => a.text === improvingAssessmentId);
			if (!assessmentToImprove) throw new Error('Assessment not found');

			const requestData = {
				assessment: assessmentToImprove,
				instructions: improvementInstructions,
				content_topic: contentTopic,
				description: description,
				concepts: concepts,
				grade_level: gradeLevel,
				tone: tone
			};

			const result = await improveAssessment(requestData);
			setImprovedAssessment(result.improved_assessment);
		} catch (error) {
			console.error('Error improving assessment:', error);
			// Show error message
		} finally {
			setImprovementLoading(false);
		}
	};

	// Function to accept the improved assessment
	const handleAcceptImprovedAssessment = () => {
		if (!improvedAssessment || !improvingAssessmentId) return;

		// Update the assessment in the list
		setGeneratedAssessments(prev =>
			prev.map(assessment =>
				assessment.text === improvingAssessmentId ?
					{ ...improvedAssessment, edited: true } : assessment
			)
		);

		// Close the modal and reset state
		setImprovementModalVisible(false);
		setImprovingAssessmentId(null);
		setImprovedAssessment(null);
		setImprovementInstructions('');
	};

	const assessmentToImprove = generatedAssessments.find(a => a.text === improvingAssessmentId);

	return (
		<View style={styles.container}>
			{/* Assessment form */}
			<AssessmentForm
				contentTopic={contentTopic}
				setContentTopic={setContentTopic}
				description={description}
				setDescription={setDescription}
				concepts={concepts}
				setConcepts={setConcepts}
				conceptInput={conceptInput}
				setConceptInput={setConceptInput}
				gradeLevel={gradeLevel}
				setGradeLevel={setGradeLevel}
				tone={tone}
				setTone={setTone}
				handleGenerateAssessments={handleGenerateAssessments}
				loading={loading}
				gradeLevelOptions={GRADE_LEVEL_OPTIONS}
				toneOptions={TONE_OPTIONS}
			/>

			{/* Loading indicator */}
			{loading && <LoadingIndicator progress={progress} />}

			{generatedAssessments.length > 0 && !loading && (
				<Card style={styles.resultsCard}>
					<Card.Title
						title="Generated Assessments"
						subtitle={`${generatedAssessments.length} assessments for "${contentTopic}"`}
						right={() => (
							<View style={styles.headerButtons}>
								<Button
									mode="outlined"
									onPress={handleShowJson}
									style={styles.jsonButton}
								>
									View JSON
								</Button>
								<Button
									mode="contained"
									onPress={handleSaveAllClick}
									disabled={savedCount === generatedAssessments.length}
								>
									{savedCount === 0 ? 'Save All' :
										savedCount === generatedAssessments.length ? 'All Saved' :
											`Save Remaining (${generatedAssessments.length - savedCount})`}
								</Button>
							</View>
						)}
					/>
					<Divider />
					<Card.Content style={styles.resultsList}>
						<View style={styles.assessmentTypesContainer}>
							<Text variant="bodyMedium" style={styles.typeLabel}>Assessment Types:</Text>
							<ScrollView horizontal showsHorizontalScrollIndicator={false}>
								<View style={styles.typesRow}>
									{getAssessmentTypes().map((type, index) => (
										<Chip
											key={index}
											style={[styles.typeChip, activeFilterType === type && styles.activeTypeChip]}
											onPress={() => setActiveFilterType(type)}
											selected={activeFilterType === type}
										>
											{type}
										</Chip>
									))}
								</View>
							</ScrollView>
						</View>

						<FlatList
							data={filteredAssessments}
							keyExtractor={(item, index) => `assessment-${index}`}
							renderItem={({ item, index }) => {
								const assessmentId = item.text;
								const isEditing = editingAssessmentIds[assessmentId];

								if (isEditing) {
									// Render the editor component
									return (
										<AssessmentEditor
											item={item}
											assessmentId={assessmentId}
											editorFormDataMap={editorFormDataMap}
											handleEditorFormChange={handleEditorFormChange}
											handleCancelEdit={handleCancelEdit}
											handleSaveAssessment={handleSaveAssessment}
											renderEditor={renderEditor}
										/>
									);
								}

								// Render the assessment card component
								return (
									<AssessmentCard
										item={item}
										index={index}
										handleEditAssessment={handleEditAssessment}
										handleStartImproveAssessment={handleStartImproveAssessment}
										handleRemoveClick={handleRemoveClick}
									/>
								);
							}}
							contentContainerStyle={styles.flatListContent}
						/>
					</Card.Content>
				</Card>
			)}

			{/* JSON Preview Modal */}
			<JsonPreviewModal
				visible={jsonModalVisible}
				onDismiss={() => setJsonModalVisible(false)}
				jsonData={jsonData}
				handleCopyJson={handleCopyJson}
			/>

			{/* Improvement Modal */}
			<ImprovementModal
				visible={improvementModalVisible}
				onDismiss={() => {
					if (!improvementLoading) {
						setImprovementModalVisible(false);
						setImprovingAssessmentId(null);
						setImprovedAssessment(null);
					}
				}}
				assessmentToImprove={assessmentToImprove}
				improvementInstructions={improvementInstructions}
				setImprovementInstructions={setImprovementInstructions}
				handleImproveAssessment={handleImproveAssessment}
				improvementLoading={improvementLoading}
				improvedAssessment={improvedAssessment}
				setImprovedAssessment={setImprovedAssessment}
				handleAcceptImprovedAssessment={handleAcceptImprovedAssessment}
			/>

			{/* Save Confirmation Dialog */}
			<ConfirmationDialog
				visible={confirmDialogVisible}
				onDismiss={() => setConfirmDialogVisible(false)}
				onConfirm={handleConfirmSave}
				skip={true}
				title="Save Assessments"
				content={`Are you sure you want to save ${generatedAssessments.filter(a => !a.saved).length} assessments to this view?`}
			/>

			{/* Remove Assessment Confirmation Dialog */}
			<ConfirmationDialog
				visible={removeConfirmVisible}
				onDismiss={() => {
					setRemoveConfirmVisible(false);
					setAssessmentToRemove(null);
				}}
				onConfirm={() => {
					handleRemoveAssessment();
					setRemoveConfirmVisible(false);
				}}
				title="Remove Assessment"
				content={`Are you sure you want to remove this assessment? This action cannot be undone.`}
			/>
		</View>
	);
} 