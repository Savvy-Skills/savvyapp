import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Text, Card, TextInput, SegmentedButtons, Divider, Dialog, Portal } from 'react-native-paper';
import { getViewByID } from '@/services/coursesApi';
import { createSlide, updateSlide, disableSlide, reorderSlides, createAssessment, getContents, getAssessments } from '@/services/adminApi';
import { Assessment, AssessmentInfo, ContentInfo, LocalSlide } from '@/types/index';
import SlideList from './SlideList';
import ImportDialog from './ImportDialog';
import ConfirmDialog from './ConfirmDialog';
import AssessmentFormDialog from './AssessmentFormDialog';
import EnhancedContentFormDialog from './EnhancedContentFormDialog';
import ContentPreviewCard from './ContentPreviewCard';

interface SlideManagerProps {
	viewId: number | null;
	onBack?: () => void;
}

type SlideType = 'Content' | 'Assessment';

export default function SlideManager({ viewId, onBack }: SlideManagerProps) {
	const [slides, setSlides] = useState<LocalSlide[]>([]);
	const [loading, setLoading] = useState(false);
	
	// State for slide creation/editing
	const [isEditing, setIsEditing] = useState(false);
	const [editingSlideId, setEditingSlideId] = useState<number | null>(null);
	const [slideForm, setSlideForm] = useState<Partial<LocalSlide>>({
		name: '',
		type: 'Content',
	});
	
	// State for slide type selection
	const [slideType, setSlideType] = useState<SlideType>('Assessment');
	
	// State for attached contents and assessment
	const [attachedContents, setAttachedContents] = useState<Partial<ContentInfo>[]>([]);
	const [attachedAssessment, setAttachedAssessment] = useState<Partial<AssessmentInfo> | null>(null);
	
	// State for dialogs
	const [importContentDialogVisible, setImportContentDialogVisible] = useState(false);
	const [importAssessmentDialogVisible, setImportAssessmentDialogVisible] = useState(false);
	const [createContentDialogVisible, setCreateContentDialogVisible] = useState(false);
	const [createAssessmentDialogVisible, setCreateAssessmentDialogVisible] = useState(false);
	const [contentAttachOptionsVisible, setContentAttachOptionsVisible] = useState(false);
	const [assessmentAttachOptionsVisible, setAssessmentAttachOptionsVisible] = useState(false);
	
	// Lists for imports
	const [contentList, setContentList] = useState<any[]>([]);
	const [assessmentList, setAssessmentList] = useState<any[]>([]);
	const [selectedImportItemId, setSelectedImportItemId] = useState<number | null>(null);
	
	// Delete dialog state
	const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
	const [slideToDelete, setSlideToDelete] = useState<number | null>(null);

	// Add to state declarations
	const [slideOrder, setSlideOrder] = useState<string>('');
  
  // Content editing state
  const [editingContent, setEditingContent] = useState<ContentInfo | null>(null);
  const [editContentDialogVisible, setEditContentDialogVisible] = useState(false);

	// Load slides when viewId changes
	useEffect(() => {
		if (viewId) {
			fetchSlides();
			fetchContentList();
			fetchAssessmentList();
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

	const fetchContentList = async () => {
		if (!viewId) return;
		try {
			const contents = await getContents();
			setContentList(contents);
		} catch (error) {
			console.error('Failed to fetch content list:', error);
		}
	};

	const fetchAssessmentList = async () => {
		if (!viewId) return;
		try {
			const assessments = await getAssessments();
			setAssessmentList(assessments);
		} catch (error) {
			console.error('Failed to fetch assessment list:', error);
		}
	};

	const resetForm = () => {
		setSlideForm({
			name: '',
			type: 'Assessment',
		});
		setSlideType('Assessment');
		setAttachedContents([]);
		setAttachedAssessment(null);
		setEditingSlideId(null);
		setIsEditing(false);
		setSelectedImportItemId(null);
		setSlideOrder('');
    setEditingContent(null);
	};

	const startEditingSlide = (slide: LocalSlide) => {
		resetForm();

		// Set base slide data
		setSlideForm({
			name: slide.name,
			type: slide.type,
		});
		setEditingSlideId(slide.slide_id);
		setSlideType(slide.type as SlideType);
		setIsEditing(true);

		// Set contents if available
		if (slide.contents && slide.contents.length > 0) {
			const contents = slide.contents.map(content => ({
				...content
			}));
			setAttachedContents(contents);
		}
		
		// Set assessment if available
		if (slide.assessment_info) {
			setAttachedAssessment(slide.assessment_info);
		}
	};

	const startAddingSlide = () => {
		resetForm();
		setIsEditing(true);
	};

	const cancelEditingSlide = () => {
		resetForm();
	};

	const handleSaveSlide = async () => {
		if (!viewId) return;

		try {
			// Prepare data to save
			let slideData: Partial<LocalSlide> = {
				name: slideForm.name,
				type: slideType,
			};
			
			// Add contents if we have any attached
			if (attachedContents.length > 0) {
				const contentIds = attachedContents
					.filter(content => content.id)
					.map(content => content.id as string);
				
				if (contentIds.length > 0) {
					slideData.contents = contentIds.map((id, index) => ({
						content_id: id,
						order: index
					})) as any;
				}
			}
			
			// Add assessment_id if we have attached assessment
			if (attachedAssessment?.id) {
				slideData.assessment_id = attachedAssessment.id;
			}
			
			if (editingSlideId) {
				// Update existing slide
				await updateSlide(viewId, editingSlideId, slideData);
			} else {
				// Create new slide
				await createSlide(viewId, slideData);
			}
			
			resetForm();
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

	// Content handling functions
	const showContentAttachOptions = () => {
		setContentAttachOptionsVisible(true);
	};

	const handleImportContent = (contentId: number) => {
		const selectedContent = contentList.find(c => c.id === contentId);
		if (selectedContent) {
			setAttachedContents([...attachedContents, selectedContent]);
		}
		setImportContentDialogVisible(false);
		setContentAttachOptionsVisible(false);
	};

	const handleContentCreated = (newContent: ContentInfo) => {
		setAttachedContents([...attachedContents, newContent]);
		setCreateContentDialogVisible(false);
		setContentAttachOptionsVisible(false);
		// Refresh content list
		fetchContentList();
	};

	// Remove a specific content
	const handleRemoveContent = (contentIndex: number) => {
		const updatedContents = [...attachedContents];
		updatedContents.splice(contentIndex, 1);
		setAttachedContents(updatedContents);
	};

	// Clear all contents
	const handleClearAllContents = () => {
		setAttachedContents([]);
	};

  // Edit specific content
  const handleEditContent = (content: ContentInfo) => {
    setEditingContent(content);
    setEditContentDialogVisible(true);
  };

  // Handle content update
  const handleContentUpdated = (updatedContent: ContentInfo) => {
    const updatedContents = attachedContents.map(content => 
      content.id === updatedContent.id ? updatedContent : content
    );
    setAttachedContents(updatedContents);
    setEditContentDialogVisible(false);
    setEditingContent(null);
    // Refresh content list
    fetchContentList();
  };

	// Assessment handling functions
	const showAssessmentAttachOptions = () => {
		setAssessmentAttachOptionsVisible(true);
	};

	const handleImportAssessment = (assessmentId: number) => {
		const selectedAssessment = assessmentList.find(a => a.id === assessmentId);
		if (selectedAssessment) {
			setAttachedAssessment(selectedAssessment);
		}
		setImportAssessmentDialogVisible(false);
		setAssessmentAttachOptionsVisible(false);
	};

	const handleAssessmentCreated = (newAssessment: AssessmentInfo) => {
		setAttachedAssessment(newAssessment);
		setCreateAssessmentDialogVisible(false);
		setAssessmentAttachOptionsVisible(false);
		// Refresh assessment list
		fetchAssessmentList();
	};

	// Detach handlers
	const handleDetachContent = () => {
		setAttachedContents([]);
	};

	const handleDetachAssessment = () => {
		setAttachedAssessment(null);
	};

	const handleBack = () => {
		// If we are editing a slide, cancel the edit
		if (isEditing) {
			resetForm();
		} else {
			// Otherwise, go back to the slides list
			if (onBack) {
				onBack();
			}
		}
	};

	if (!viewId) {
		return (
			<View style={styles.container}>
				<Text>Please select a view first.</Text>
			</View>
		);
	}

	// Render slide form
	const renderSlideForm = () => {
		return (
			<Card style={styles.formCard}>
				<Card.Title title={editingSlideId ? "Edit Slide" : "Create New Slide"} />
				<Card.Content>
					<TextInput
						label="Slide Name"
						value={slideForm.name}
						onChangeText={(text) => setSlideForm({ ...slideForm, name: text })}
						style={styles.input}
					/>

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
					
					<Divider style={styles.divider} />
					
					{/* Content Attachment Section */}
					<View style={styles.attachmentSection}>
						<View style={styles.attachmentHeader}>
							<Text variant="titleMedium">Contents</Text>
							<Button 
								mode="outlined" 
								onPress={showContentAttachOptions}
							>
								Add Content
							</Button>
						</View>
						
						{attachedContents.length > 0 ? (
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
										style={styles.clearAllButton}
									>
										Clear All Contents
									</Button>
								)}
							</>
						) : (
							<Text style={styles.noAttachmentText}>No content attached</Text>
						)}
					</View>
					
					<Divider style={styles.divider} />
					
					{/* Assessment Attachment Section - Only show if slide type is Assessment */}
					{slideType === 'Assessment' && (
						<View style={styles.attachmentSection}>
							<View style={styles.attachmentHeader}>
								<Text variant="titleMedium">Assessment</Text>
								{!attachedAssessment ? (
									<Button 
										mode="outlined" 
										onPress={showAssessmentAttachOptions}
									>
										Attach Assessment
									</Button>
								) : (
									<Button 
										mode="outlined"
										icon="close" 
										onPress={handleDetachAssessment}
									>
										Detach
									</Button>
								)}
							</View>
							
							{attachedAssessment ? (
								<Card style={styles.previewCard}>
									<Card.Content>
										<Text style={styles.previewLabel}>Type:</Text>
										<Text style={styles.previewValue}>{attachedAssessment.type}</Text>
										
										<Text style={styles.previewLabel}>Question:</Text>
										<Text style={styles.previewValue}>{attachedAssessment.text}</Text>
										
										{attachedAssessment.options && attachedAssessment.options.length > 0 && (
											<>
												<Text style={styles.previewLabel}>Options:</Text>
												{attachedAssessment.options.map((option, index) => (
													<Text key={index} style={[
														styles.previewValue, 
														option.isCorrect && styles.correctOption
													]}>
														• {option.text} {option.match ? `---> ${option.match}` : ''} {option.isCorrect ? '(Correct)' : ''} 
													</Text>
												))}
											</>
										)}
									</Card.Content>
								</Card>
							) : (
								<Text style={styles.noAttachmentText}>No assessment attached</Text>
							)}
						</View>
					)}
					
					<View style={styles.formActions}>
						<Button mode="outlined" onPress={cancelEditingSlide} style={styles.formButton}>
							Cancel
						</Button>
						<Button 
							mode="contained" 
							onPress={handleSaveSlide} 
							style={styles.formButton}
							disabled={!slideForm.name}
						>
							Save
						</Button>
					</View>

				</Card.Content>
			</Card>
		);
	};

	return (
		<ScrollView style={styles.container}>
			<View style={styles.header}>
				<View style={styles.headerActions}>
					<Button
						mode="outlined"
						onPress={handleBack}
						style={[styles.backButton]}
						icon="arrow-left"
					>
						{isEditing ? 'Back to Slides' : 'Back to Views'}
					</Button>
					<Text variant="headlineMedium">Slide Management</Text>
				</View>
				{!isEditing && (
					<Button
						mode="contained"
						onPress={startAddingSlide}
						style={styles.addButton}
					>
						Add New Slide
					</Button>
				)}
			</View>

			{isEditing ? renderSlideForm() : (
				<SlideList
					slides={slides}
					loading={loading}
					onEditSlide={startEditingSlide}
					onDisableSlide={handleDisableSlide}
				/>
			)}

			{/* Content Attach Options Dialog */}
			<Portal>
				<Dialog 
					visible={contentAttachOptionsVisible} 
					onDismiss={() => setContentAttachOptionsVisible(false)}
					style={styles.dialog}
				>
					<Dialog.Title style={styles.dialogTitle}>Attach Content</Dialog.Title>
					<Dialog.Content>
						<View style={styles.dialogHeader}>
							<Text variant="titleMedium">Choose an option:</Text>
							<Button 
								icon="refresh" 
								mode="text" 
								onPress={fetchContentList}
								compact
							>
								Refresh List
							</Button>
						</View>
						<Button 
							mode="outlined" 
							onPress={() => {
								setContentAttachOptionsVisible(false);
								setImportContentDialogVisible(true);
							}}
							style={styles.dialogButton}
						>
							Import Existing Content
						</Button>
						<Button 
							mode="outlined" 
							onPress={() => {
								setContentAttachOptionsVisible(false);
								setCreateContentDialogVisible(true);
							}}
							style={styles.dialogButton}
						>
							Create New Content
						</Button>
					</Dialog.Content>
					<Divider />
					<Dialog.Actions style={styles.dialogActions}>
						<Button 
							mode="outlined"
							onPress={() => setContentAttachOptionsVisible(false)}
							style={styles.cancelButton}
						>
							Cancel
						</Button>
					</Dialog.Actions>
				</Dialog>
			</Portal>

			{/* Assessment Attach Options Dialog */}
			<Portal>
				<Dialog style={styles.dialog} visible={assessmentAttachOptionsVisible} onDismiss={() => setAssessmentAttachOptionsVisible(false)}>
					<Dialog.Title>Attach Assessment</Dialog.Title>
					<Dialog.Content>
						<View style={styles.dialogHeader}>
							<Text>Choose an option:</Text>
							{/* <Button 
								icon="refresh" 
								mode="text" 
								onPress={fetchAssessmentList}
								compact
							>
								Refresh List
							</Button> */}
						</View>
						<Button 
							mode="outlined" 
							onPress={() => {
								setAssessmentAttachOptionsVisible(false);
								setImportAssessmentDialogVisible(true);
							}}
							style={styles.dialogButton}
						>
							Import Existing Assessment
						</Button>
						<Button 
							mode="outlined" 
							onPress={() => {
								setAssessmentAttachOptionsVisible(false);
								setCreateAssessmentDialogVisible(true);
							}}
							style={styles.dialogButton}
						>
							Create New Assessment
						</Button>
					</Dialog.Content>
					<Dialog.Actions>
						<Button onPress={() => setAssessmentAttachOptionsVisible(false)}>Cancel</Button>
					</Dialog.Actions>
				</Dialog>
			</Portal>

			{/* Import Content Dialog */}
			<ImportDialog
				visible={importContentDialogVisible}
				onDismiss={() => setImportContentDialogVisible(false)}
				title="Import Existing Content"
				items={contentList}
				selectedItemId={selectedImportItemId}
				onSelectItem={setSelectedImportItemId}
				onImport={handleImportContent}
				emptyMessage="No existing content found."
				onRefresh={fetchContentList}
			/>

			{/* Import Assessment Dialog */}
			<ImportDialog
				visible={importAssessmentDialogVisible}
				onDismiss={() => setImportAssessmentDialogVisible(false)}
				title="Import Existing Assessment"
				items={assessmentList}
				selectedItemId={selectedImportItemId}
				onSelectItem={setSelectedImportItemId}
				onImport={handleImportAssessment}
				emptyMessage="No existing assessments found."
				onRefresh={fetchAssessmentList}
			/>

			{/* Create Content Dialog */}
			<EnhancedContentFormDialog
				visible={createContentDialogVisible}
				onDismiss={() => setCreateContentDialogVisible(false)}
				onSave={handleContentCreated}
				viewId={viewId}
        		isEditing={false}
			/>

			{/* Edit Content Dialog */}
			<EnhancedContentFormDialog
				visible={editContentDialogVisible}
				onDismiss={() => {
				setEditContentDialogVisible(false);
				setEditingContent(null);
				}}
				onSave={handleContentUpdated}
				editingContent={editingContent}
				viewId={viewId}
				isEditing={true}
			/>

			{/* Create Assessment Dialog */}
			<AssessmentFormDialog
				visible={createAssessmentDialogVisible}
				onDismiss={() => setCreateAssessmentDialogVisible(false)}
				onSave={handleAssessmentCreated}
				viewId={viewId}
			/>

			{/* Delete Confirmation Dialog */}
			<ConfirmDialog
				visible={deleteDialogVisible}
				onDismiss={() => setDeleteDialogVisible(false)}
				onConfirm={confirmDisableSlide}
				title="Confirm Disable"
				message="Are you sure you want to disable this slide? This will hide it from users."
				confirmLabel="Disable"
				cancelLabel="Cancel"
			/>
		</ScrollView>
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
		paddingHorizontal: 16,
		paddingTop: 16,
	},
	headerActions: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	addButton: {
		marginLeft: 16,
		maxWidth: 200,
	},
	backButton: {
		marginRight: 16,
	},
	formCard: {
		padding: 8,
		marginBottom: 20,
		marginHorizontal: 16,
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
	attachmentSection: {
		marginVertical: 16,
	},
	attachmentHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 12,
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
	previewValue: {
		marginBottom: 8,
	},
	correctOption: {
		color: 'green',
		fontWeight: 'bold',
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
	noAttachmentText: {
		fontStyle: 'italic',
		color: '#888',
		marginVertical: 16,
	},
	dialog: {
		maxWidth: 600,
		width: "100%",
		marginHorizontal: 'auto',
	},
	dialogTitle: {
		paddingBottom: 8,
	},
	dialogHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 16,
	},
	dialogButton: {
		marginVertical: 8,
		width: '100%',
	},
	dialogActions: {
		padding: 16,
		justifyContent: 'flex-end',
	},
	cancelButton: {
		marginRight: 8,
	},
	clearAllButton: {
		marginTop: 12,
	},
}); 