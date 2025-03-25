import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Text, Card, TextInput, SegmentedButtons, Divider, Dialog, Portal } from 'react-native-paper';
import { getViewByID } from '@/services/coursesApi';
import { createSlide, updateSlide, reorderSlides, createAssessment, getContents, getAssessments } from '@/services/adminApi';
import { AssessmentInfo, ContentInfo, LocalSlide } from '@/types/index';
import SlideList from './SlideList';
import ImportDialog from './ImportDialog';
import ConfirmDialog from './ConfirmDialog';
import AssessmentFormDialog from './AssessmentFormDialog';
import EnhancedContentFormDialog from './EnhancedContentFormDialog';
import ContentPreviewCard from './ContentPreviewCard';
import DraggableList from './DraggableList';
import { SlidesOrder } from '@/services/adminApi';
import ConfirmationDialog from '@/components/modals/ConfirmationDialog';
import styles from '@/styles/styles';
import { Colors } from '@/constants/Colors';

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
		name: 'New Slide',
		type: 'Content',
	});

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

	// Add these new state variables for reordering
	const [isReordering, setIsReordering] = useState(false);
	const [reorderedSlides, setReorderedSlides] = useState<LocalSlide[]>([]);
	const [hasReorderChanges, setHasReorderChanges] = useState(false);

	// Add state for slide removal confirmation
	const [removeConfirmVisible, setRemoveConfirmVisible] = useState(false);
	const [slideToRemove, setSlideToRemove] = useState<LocalSlide | null>(null);

	// Load slides when viewId changes
	useEffect(() => {
		if (viewId) {
			fetchSlides();
			fetchContentList();
			fetchAssessmentList();
		} else {
			setSlides([]);
			setReorderedSlides([]);
		}
	}, [viewId]);

	// When slides are loaded, initialize reorderedSlides
	useEffect(() => {
		setReorderedSlides([...slides]);
	}, [slides]);

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
			name: 'New Slide',
			type: 'Content',
		});
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
			// Determine slide type based on attachments
			const determineSlideType = (): SlideType => {
				if (attachedAssessment) {
					return 'Assessment';
				}
				return 'Content';
			};

			// Prepare data to save
			let slideData: Partial<LocalSlide> = {
				name: slideForm.name,
				type: determineSlideType(),
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
				await updateSlide(editingSlideId, slideData);
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
		return;
		try {
			// await disableSlide(viewId, slideToDelete);
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
		console.log('newContent', newContent);
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

	// Add new function to handle reordering
	const handleReorderModeToggle = () => {
		setIsReordering(!isReordering);
		// If canceling reorder mode, reset to original order
		if (isReordering) {
			setReorderedSlides([...slides]);
			setHasReorderChanges(false);
		}
	};

	// Add function to handle when slides are reordered
	const handleReorder = (reordered: LocalSlide[]) => {
		setReorderedSlides(reordered);
		setHasReorderChanges(true);
	};

	// Add function to save the new slide order
	const handleSaveReorder = async () => {
		if (!viewId) return;

		try {
			const slidesOrder: SlidesOrder[] = reorderedSlides.map((slide, index) => ({
				slide_id: slide.slide_id,
				order: index
			}));

			await reorderSlides(viewId, slidesOrder);

			// Update the original slides order after successful save
			setSlides([...reorderedSlides]);
			setHasReorderChanges(false);

			// Optionally exit reorder mode after saving
			setIsReordering(false);
		} catch (error) {
			console.error('Failed to save new slide order:', error);
		}
	};

	const handleCancelReorder = () => {
		setIsReordering(false);
		setReorderedSlides([...slides]);
		setHasReorderChanges(false);
	};

	// Add function to handle removing a slide
	const handleRemoveSlide = (slide: LocalSlide) => {
		setSlideToRemove(slide);
		setRemoveConfirmVisible(true);
	};

	// Add function to confirm removal
	const confirmRemoveSlide = async (skip: boolean) => {
		if (!viewId || !slideToRemove) return;

		try {
			// Filter out the slide to remove and create a new order
			const updatedSlides = slides.filter(s => s.slide_id !== slideToRemove.slide_id);

			// Create the slides order array for the API call
			const slidesOrder: SlidesOrder[] = updatedSlides.map((slide, index) => ({
				slide_id: slide.slide_id,
				order: index
			}));

			// Call the reorderSlides function to update the view without the removed slide
			await reorderSlides(viewId, slidesOrder);

			// Refresh the slides after removal
			fetchSlides();
		} catch (error) {
			console.error('Failed to remove slide:', error);
		}

		// Reset state
		setSlideToRemove(null);
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
							<Button
								mode="outlined"
								onPress={showContentAttachOptions}
								style={[styles.savvyButton, localStyles.addButton]}
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
										style={[styles.savvyButton, localStyles.clearAllButton]}
									>
										Clear All Contents
									</Button>
								)}
							</>
						) : (
							<Text style={localStyles.noAttachmentText}>No content attached</Text>
						)}
					</View>

					<Divider style={localStyles.divider} />

					{/* Assessment Attachment Section - always visible */}
					<View style={localStyles.attachmentSection}>
						<View style={localStyles.attachmentHeader}>
							<Text variant="titleMedium">Assessment</Text>
							{!attachedAssessment ? (
								<Button
									mode="outlined"
									onPress={showAssessmentAttachOptions}
									style={[styles.savvyButton, localStyles.addButton]}
								>
									Attach Assessment
								</Button>
							) : (
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

						{attachedAssessment ? (
							<Card style={localStyles.previewCard}>
								<Card.Content>
									<Text style={localStyles.previewLabel}>Type:</Text>
									<Text style={localStyles.previewValue}>{attachedAssessment.type}</Text>

									<Text style={localStyles.previewLabel}>Question:</Text>
									<Text style={localStyles.previewValue}>{attachedAssessment.text}</Text>

									{attachedAssessment.options && attachedAssessment.options.length > 0 && (
										<>
											<Text style={localStyles.previewLabel}>Options:</Text>
											{attachedAssessment.options.map((option, index) => (
												<Text key={index} style={[
													localStyles.previewValue,
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
							<Text style={localStyles.noAttachmentText}>No assessment attached</Text>
						)}
					</View>

					<View style={localStyles.formActions}>
						<Button mode="outlined" onPress={cancelEditingSlide} style={[styles.savvyButton, localStyles.formButton]}>
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
	};

	return (
		<ScrollView style={localStyles.container}>
			<View style={localStyles.header}>
				<View style={localStyles.headerActions}>
					<Button
						mode="outlined"
						onPress={handleBack}
						style={[styles.savvyButton, localStyles.backButton]}
						icon="arrow-left"
					>
						{isEditing ? 'Back to Slides' : 'Back to Views'}
					</Button>
					<Text variant="headlineMedium">Slide Management</Text>
				</View>
				<View style={localStyles.headerButtons}>
					{!isEditing && !isReordering && (
						<Button
							mode="contained"
							onPress={startAddingSlide}
							style={[styles.savvyButton, localStyles.addButton]}
						>
							Add New Slide
						</Button>
					)}
					{!isEditing && slides.length > 1 && (
						<Button
							mode={isReordering ? "contained" : "outlined"}
							onPress={handleReorderModeToggle}
							style={[styles.savvyButton, localStyles.reorderButton]}
							icon={isReordering ? "cancel" : "reorder-horizontal"}
						>
							{isReordering ? 'Cancel Reorder' : 'Reorder Slides'}
						</Button>
					)}
					{isReordering && hasReorderChanges && (
						<Button
							mode="contained"
							onPress={handleSaveReorder}
							style={[styles.savvyButton, localStyles.saveReorderButton]}
							icon="content-save"
						>
							Save Order
						</Button>
					)}
				</View>
			</View>

			{isEditing ? renderSlideForm() : (
				isReordering ? (
					<DraggableList
						slides={reorderedSlides}
						onReorder={handleReorder}
						onSave={handleSaveReorder}
						onCancel={handleCancelReorder}
					/>
				) : (
					<SlideList
						slides={slides}
						loading={loading}
						onEditSlide={startEditingSlide}
						onDisableSlide={handleDisableSlide}
						onRemoveSlide={handleRemoveSlide}
					/>
				)
			)}

			{/* Content Attach Options Dialog */}
			<Portal>
				<Dialog
					visible={contentAttachOptionsVisible}
					onDismiss={() => setContentAttachOptionsVisible(false)}
					style={localStyles.dialog}
				>
					<Dialog.Title style={localStyles.dialogTitle}>Attach Content</Dialog.Title>
					<Dialog.Content>
						<View style={localStyles.dialogHeader}>
							<Text variant="titleMedium">Choose an option:</Text>
						</View>
						<Button
							mode="outlined"
							onPress={() => {
								setContentAttachOptionsVisible(false);
								setImportContentDialogVisible(true);
							}}
							style={localStyles.dialogButton}
						>
							Import Existing Content
						</Button>
						<Button
							mode="outlined"
							onPress={() => {
								setContentAttachOptionsVisible(false);
								setCreateContentDialogVisible(true);
							}}
							style={localStyles.dialogButton}
						>
							Create New Content
						</Button>
					</Dialog.Content>
					<Divider />
					<Dialog.Actions style={localStyles.dialogActions}>
						<Button
							mode="outlined"
							onPress={() => setContentAttachOptionsVisible(false)}
							style={localStyles.cancelButton}
						>
							Cancel
						</Button>
					</Dialog.Actions>
				</Dialog>
			</Portal>

			{/* Assessment Attach Options Dialog */}
			<Portal>
				<Dialog style={localStyles.dialog} visible={assessmentAttachOptionsVisible} onDismiss={() => setAssessmentAttachOptionsVisible(false)}>
					<Dialog.Title>Attach Assessment</Dialog.Title>
					<Dialog.Content>
						<View style={localStyles.dialogHeader}>
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
							style={localStyles.dialogButton}
						>
							Import Existing Assessment
						</Button>
						<Button
							mode="outlined"
							onPress={() => {
								setAssessmentAttachOptionsVisible(false);
								setCreateAssessmentDialogVisible(true);
							}}
							style={localStyles.dialogButton}
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

			{/* Slide Removal Confirmation Dialog */}
			<ConfirmationDialog
				visible={removeConfirmVisible}
				onDismiss={() => setRemoveConfirmVisible(false)}
				onConfirm={confirmRemoveSlide}
				title="Remove Slide"
				content={`Are you sure you want to remove the slide "${slideToRemove?.name}" from this view? This action cannot be undone.`}
			/>
		</ScrollView>
	);
}

const localStyles = StyleSheet.create({
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
	headerButtons: {
		flexDirection: 'row',
		gap: 12,
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
		borderRadius: 4,
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
		borderRadius: 12,
		padding: 8,
	},
	dialogTitle: {
		textAlign: 'center',
		fontSize: 20,
		fontWeight: 'bold',
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
	reorderButton: {
		marginLeft: 16,
	},
	saveReorderButton: {
		marginLeft: 16,
		backgroundColor: Colors.primary,
	},
	actionButtons: {
		flexDirection: 'row',
		gap: 8,
	},
	actionButton: {
		marginHorizontal: 4,
	},
	removeButton: {
		borderColor: Colors.revealedButton,
		color: Colors.revealedButton,
	},
}); 