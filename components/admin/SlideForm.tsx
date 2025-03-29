import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Text, Card, TextInput, Divider } from 'react-native-paper';
import { Assessment, AssessmentInfo, ContentInfo, LocalSlide } from '@/types/index';
import ContentPreviewCard from './ContentPreviewCard';
import AssessmentPreview from './AssessmentPreview';
import ContentForm from './ContentForm';
import AssessmentForm from './AssessmentForm';
import ContentList from './ContentList';
import AssessmentList from './AssessmentList';
import styles from '@/styles/styles';
import { generateColors } from '@/utils/utilfunctions';
import { Colors } from '@/constants/Colors';

interface SlideFormProps {
	slideForm: Partial<LocalSlide>;
	setSlideForm: (slideForm: Partial<LocalSlide>) => void;
	attachedContents: Partial<ContentInfo>[];
	attachedAssessment: Partial<AssessmentInfo> | null;
	editingSlideId: number | null;

	showContentAttachOptions: () => void;
	showAssessmentAttachOptions: () => void;
	handleRemoveContent: (index: number) => void;
	handleClearAllContents: () => void;
	handleEditContent: (content: ContentInfo) => void;
	handleDetachAssessment: () => void;

	cancelEditingSlide: () => void;
	handleSaveSlide: () => void;

	// New props for content/assessment lists
	contentList: ContentInfo[];
	assessmentList: AssessmentInfo[];

	// Handlers for content/assessment selection and creation
	onContentSelected: (content: ContentInfo) => void;
	onAssessmentSelected: (assessment: AssessmentInfo) => void;
	onContentCreated: (content: ContentInfo) => void;
	onAssessmentCreated: (assessment: AssessmentInfo) => void;

	// View ID for creating content/assessments
	viewId: number | null;
}

export default function SlideForm({
	slideForm,
	setSlideForm,
	attachedContents,
	attachedAssessment,
	editingSlideId,

	handleRemoveContent,
	handleClearAllContents,
	handleEditContent,
	handleDetachAssessment,

	cancelEditingSlide,
	handleSaveSlide,

	contentList,
	assessmentList,
	onContentSelected,
	onAssessmentSelected,
	onContentCreated,
	onAssessmentCreated,
	viewId
}: SlideFormProps) {
	// States for showing content/assessment sections
	const [showContentSection, setShowContentSection] = useState<'none' | 'list' | 'create'>('none');
	const [showAssessmentSection, setShowAssessmentSection] = useState<'none' | 'list' | 'create'>('none');

	// Content section handling
	const showContentAttachOptions = () => {
		setShowContentSection('list');
	};

	const handleContentFormCancel = () => {
		setShowContentSection('none');
	};

	const handleContentSelected = (content: ContentInfo) => {
		onContentSelected(content);
		setShowContentSection('none');
	};

	const handleContentCreated = (content: ContentInfo) => {
		onContentCreated(content);
		setShowContentSection('none');
	};

	// Assessment section handling
	const showAssessmentAttachOptions = () => {
		setShowAssessmentSection('list');
	};

	const handleAssessmentFormCancel = () => {
		setShowAssessmentSection('none');
	};

	const handleAssessmentSelected = (assessment: AssessmentInfo) => {
		onAssessmentSelected(assessment);
		setShowAssessmentSection('none');
	};

	const handleAssessmentCreated = (assessment: AssessmentInfo) => {
		onAssessmentCreated(assessment);
		setShowAssessmentSection('none');
	};

	return (
		<Card style={localStyles.formCard}>
			<Card.Title title={editingSlideId ? "Edit Slide" : "Create New Slide"} />
			<Card.Content>
				<TextInput
					label="Slide Name"
					value={slideForm.name}
					onChangeText={(text) => setSlideForm({ ...slideForm, name: text })}
					style={styles.input}
				/>

				<Divider style={localStyles.divider} />

				{/* Content Attachment Section - always visible */}
				<View style={localStyles.attachmentSection}>
					<View style={localStyles.attachmentHeader}>
						<Text variant="titleMedium">Contents</Text>
						{showContentSection === 'none' && (
							<Button
								mode="outlined"
								onPress={showContentAttachOptions}
								style={[styles.savvyButton, localStyles.addButton]}
							>
								Add Content
							</Button>
						)}
					</View>

					{showContentSection === 'list' && (
						<View style={localStyles.actionPanel}>
							<View style={localStyles.actionHeader}>
								<Text variant="titleMedium">Select Existing Content</Text>
								<Button 
									mode="outlined" 
									onPress={() => setShowContentSection('create')}
									style={localStyles.actionButton}
								>
									Create New Content
								</Button>
							</View>
							<ContentList 
								contentList={contentList} 
								onContentSelect={handleContentSelected}
								onCancel={handleContentFormCancel}
							/>
						</View>
					)}

					{showContentSection === 'create' && (
						<ContentForm
							onContentCreated={handleContentCreated}
							onCancel={handleContentFormCancel}
							viewId={viewId || undefined}
						/>
					)}

					{showContentSection === 'none' && (
						attachedContents.length > 0 ? (
							<>
								{attachedContents.map((content, index) => (
									<ContentPreviewCard
										key={`content-${index}`}
										content={content}
										index={index}
										onRemove={handleRemoveContent}
										onEdit={handleEditContent}
									/>
								))}

								{attachedContents.length > 1 && (
									<Button
										mode="outlined"
										icon="delete-sweep"
										onPress={handleClearAllContents}
										style={[styles.savvyButton, localStyles.clearAllButton]}
									>
										Clear All Contents
									</Button>
								)}
							</>
						) : (
							<Text style={localStyles.noAttachmentText}>No content attached</Text>
						)
					)}
				</View>

				<Divider style={localStyles.divider} />

				{/* Assessment Attachment Section - always visible */}
				<View style={localStyles.attachmentSection}>
					<View style={localStyles.attachmentHeader}>
						<Text variant="titleMedium">Assessment</Text>
						{showAssessmentSection === 'none' && !attachedAssessment && (
							<Button
								mode="outlined"
								onPress={showAssessmentAttachOptions}
								style={[styles.savvyButton, localStyles.addButton]}
							>
								Attach Assessment
							</Button>
						)}
						{showAssessmentSection === 'none' && attachedAssessment && (
							<Button
								mode="outlined"
								icon="close"
								onPress={handleDetachAssessment}
								style={[styles.savvyButton, localStyles.addButton]}
							>
								Detach
							</Button>
						)}
					</View>

					{showAssessmentSection === 'list' && (
						<View style={localStyles.actionPanel}>
							<View style={localStyles.actionHeader}>
								<Text variant="titleMedium">Select Existing Assessment</Text>
								<Button 
									mode="outlined" 
									onPress={() => setShowAssessmentSection('create')}
									style={localStyles.actionButton}
								>
									Create New Assessment
								</Button>
							</View>
							<AssessmentList 
								assessmentList={assessmentList} 
								onAssessmentSelect={handleAssessmentSelected}
								onCancel={handleAssessmentFormCancel}
							/>
						</View>
					)}

					{showAssessmentSection === 'create' && (
						<AssessmentForm
							onAssessmentCreated={handleAssessmentCreated}
							onCancel={handleAssessmentFormCancel}
							viewId={viewId}
						/>
					)}

					{showAssessmentSection === 'none' && attachedAssessment && (
						<Card style={localStyles.previewCard}>
							<Card.Content>
								<View style={localStyles.previewHeader}>
									<Text style={localStyles.questionType}>Type: {attachedAssessment.type}</Text>
									{attachedAssessment.type !== 'Fill in the Blank' && (
										<Text style={localStyles.questionText}>Question: {attachedAssessment.text}</Text>
									)}
								</View>
								{/* Use AssessmentPreview component to render the assessment */}
								<AssessmentPreview assessment={attachedAssessment as Assessment} />
							</Card.Content>
						</Card>
					)}

					{showAssessmentSection === 'none' && !attachedAssessment && (
						<Text style={localStyles.noAttachmentText}>No assessment attached</Text>
					)}
				</View>

				<View style={localStyles.formActions}>
					<Button
						mode="outlined"
						onPress={cancelEditingSlide}
						style={[styles.savvyButton, localStyles.formButton]}
					>
						Cancel
					</Button>
					<Button
						mode="contained"
						onPress={handleSaveSlide}
						style={[styles.savvyButton, localStyles.formButton]}
						disabled={
							!slideForm.name ||
							(attachedContents.length === 0 && !attachedAssessment)
						}
					>
						Save
					</Button>
				</View>
			</Card.Content>
		</Card>
	);
}

const localStyles = StyleSheet.create({
	previewHeader: {
		backgroundColor: generateColors(Colors.primary, 0.1).muted,
		marginBottom: 12,
		padding: 12,
		gap: 8,
		paddingHorizontal: 16,
		borderRadius: 8,
	},
	questionType: {
		color: Colors.primary,
		fontWeight: 'bold',
	},
	questionText: {
		fontWeight: 'bold',
	},
	formCard: {
		padding: 8,
		marginBottom: 20,
		marginHorizontal: 16,
	},
	divider: {
		marginVertical: 16,
	},
	attachmentSection: {
		marginVertical: 16,
	},
	attachmentHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 12,
	},
	addButton: {
		marginLeft: 16,
		maxWidth: 200,
	},
	clearAllButton: {
		marginTop: 12,
	},
	previewCard: {
		backgroundColor: '#f5f5f5',
		marginBottom: 20,
	},
	previewLabel: {
		fontWeight: 'bold',
		marginTop: 8,
		marginBottom: 4,
	},
	noAttachmentText: {
		fontStyle: 'italic',
		color: '#888',
		marginVertical: 16,
	},
	formActions: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		marginTop: 20,
		gap: 12,
	},
	formButton: {
		minWidth: 100,
	},
	actionPanel: {
		marginBottom: 16,
		borderWidth: 1,
		borderColor: '#e0e0e0',
		borderRadius: 8,
		padding: 12,
	},
	actionHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 16,
	},
	actionButton: {
		marginLeft: 8,
	},
}); 