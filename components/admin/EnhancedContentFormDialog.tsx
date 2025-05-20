import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Dialog, Portal, Text, TextInput, SegmentedButtons, Divider, Menu } from 'react-native-paper';
import { ContentInfo, ContentSubtypes, ContentTypes } from '@/types/index';
import { createContent, updateContent } from '@/services/adminApi';
import ContentEditor from '@/components/admin/content/ContentEditor';
import Dropdown from '../common/Dropdown';

interface EnhancedContentFormDialogProps {
	visible: boolean;
	onDismiss: () => void;
	onSave: (content: ContentInfo) => void;
	editingContent?: ContentInfo | null;
	viewId?: number;
	isEditing?: boolean;
}

const contentTypeOptions: { label: string, value: ContentTypes }[] = [
	{ label: 'Rich Text', value: 'Rich Text' },
	{ label: 'Image', value: 'Image' },
	{ label: 'Video', value: 'Video' },
	{ label: 'Dataset', value: 'Dataset' },
	{ label: 'Definition', value: 'Definition' },
	{ label: 'Tool', value: 'Tool' },
	{ label: 'Educational', value: 'Educational' },
];

const contentSubtypeOptions: { label: string, value: ContentSubtypes, educational?: boolean }[] = [
	{ label: 'Neural Network', value: 'Neural Network' },
	{ label: 'Neuron', value: 'Neuron' },
	{ label: 'Word2Vec', value: 'Word2Vec' },
	{ label: 'MNIST', value: 'MNIST' },
	{ label: 'Tokenization', value: 'Tokenization' },
	{ label: 'Auto Tokenization', value: 'Auto Tokenization' },
	{ label: 'Teachable Machine', value: 'Teachable Machine' },
	{ label: 'Speech to Text', value: 'Speech to Text' },
	{ label: 'Face Detection', value: 'Face Detection' },
	{ label: 'Next Word', value: 'Next Word' },
	{ label: 'BERT', value: 'BERT' },
	{ label: 'Audio Encoding', value: 'Audio Encoding', educational: true },
	{ label: 'Image Encoding', value: 'Image Encoding', educational: true },
	{ label: 'Pixel Simulator', value: 'Pixel Simulator', educational: true },

];

export default function EnhancedContentFormDialog({
	visible,
	onDismiss,
	onSave,
	editingContent,
	viewId,
	isEditing = false
}: EnhancedContentFormDialogProps) {
	const [contentType, setContentType] = useState<ContentTypes>('Rich Text');
	const [contentSubtype, setContentSubtype] = useState<ContentSubtypes | null>(null);
	const [contentTitle, setContentTitle] = useState(isEditing ? '' : 'New Content');
	const [contentData, setContentData] = useState<Partial<ContentInfo>>({});
	const [loading, setLoading] = useState(false);

	// Initialize form when editing content
	useEffect(() => {
		if (editingContent && visible) {
			setContentType(editingContent.type || 'Rich Text');
			setContentSubtype(editingContent.subtype || null);
			setContentTitle(editingContent.title || '');
			setContentData({
				...editingContent
			});
		} else if (visible && !isEditing) {
			setContentTitle('New Content'); // Set default title for new content
		}
	}, [editingContent, visible, isEditing]);

	const resetForm = () => {
		setContentType('Rich Text');
		setContentTitle(isEditing ? '' : 'New Content');
		setContentData({});
		setLoading(false);
	};

	const handleDismiss = () => {
		resetForm();
		onDismiss();
	};

	const handleContentChange = (updatedContent: Partial<ContentInfo>) => {
		setContentData(prevData => ({
			...prevData,
			...updatedContent
		}));
	};

	const isFormValid = () => {
		if (!contentTitle) return false;

		switch (contentType) {
			case 'Rich Text':
				return !!contentData.state;
			case 'Image':
			case 'Video':
				return !!contentData.url;
			case 'Dataset':
				return !!contentData.dataset_id;
			case 'Tool':
				switch (contentSubtype) {
					case 'Neuron':
						return !!contentData.dataset_id;
					case 'Word2Vec':
						return !!contentData.dataset_id && !!contentData.dataset_info?.word_vec;
					case 'Tokenization':
					case 'Auto Tokenization':
						return !!contentData.state;
					case 'Teachable Machine':
					case 'Speech to Text':
					case 'Face Detection':
					case 'Next Word':
					case 'BERT':
					case 'Audio Encoding':
					case 'Image Encoding':
					case 'Pixel Simulator':
					case 'MNIST':
						return true;
					default:
						return false;
				}
			default:
				return false;
		}
	};

	const handleSave = async () => {
		if (!isFormValid()) {
			return;
		}

		setLoading(true);
		try {
			// Prepare content data with title and type
			const fullContentData: Partial<ContentInfo> = {
				...contentData,
				title: contentTitle,
				type: contentType,
			};

			let savedContent;
			if (isEditing) {
				savedContent = await updateContent(fullContentData);
			} else {
				savedContent = await createContent(fullContentData);
			}

			// Notify parent component
			onSave(savedContent);
			resetForm();
		} catch (error) {
			console.error(`Failed to ${isEditing ? 'update' : 'create'} content:`, error);
		} finally {
			setLoading(false);
		}
	};

	const dialogTitle = isEditing ? "Edit Content" : "Create New Content";
	const actionButtonLabel = isEditing ? "Update" : "Create";

	return (
		<Portal>
			<Dialog visible={visible} onDismiss={handleDismiss} style={styles.dialog}>
				<Dialog.Title style={styles.dialogTitle}>{dialogTitle}</Dialog.Title>
				<ScrollView style={styles.dialogContent}>
					<Dialog.Content>
						<TextInput
							label="Content Title"
							value={contentTitle}
							onChangeText={setContentTitle}
							style={styles.input}
							placeholder="Enter a title for this content"
						/>
						<Text variant="titleMedium" style={styles.sectionTitle}>Content Type</Text>
						<Dropdown
							label="Content Type"
							value={contentType}
							options={contentTypeOptions}
							onChange={(value: string) => setContentType(value as ContentTypes)}
						/>

						{contentType === 'Tool' && (
							<Dropdown
								label="Content Subtype"
								value={contentSubtype || ''}
								options={contentSubtypeOptions.filter(option => option.educational === false || option.educational === undefined)}
								onChange={(value: string) => setContentSubtype(value as ContentSubtypes)}
							/>
						)}
						{contentType === 'Educational' && (
							<Dropdown
								label="Content Subtype"
								value={contentSubtype || ''}
								options={contentSubtypeOptions.filter(option => option.educational === true)}
								onChange={(value: string) => setContentSubtype(value as ContentSubtypes)}
							/>
						)}

						<Divider style={styles.divider} />

						<ContentEditor
							contentType={contentType}
							contentSubtype={contentSubtype || null}
							content={contentData as ContentInfo}
							onContentChange={handleContentChange}
						/>
					</Dialog.Content>
				</ScrollView>

				<Divider />
				<Dialog.Actions style={styles.dialogActions}>
					<Button
						onPress={handleDismiss}
						mode="outlined"
						style={styles.cancelButton}
					>
						Cancel
					</Button>
					<Button
						onPress={handleSave}
						loading={loading}
						disabled={loading || !isFormValid()}
						mode="contained"
						style={styles.saveButton}
					>
						{actionButtonLabel}
					</Button>
				</Dialog.Actions>
			</Dialog>
		</Portal>
	);
}

const styles = StyleSheet.create({
	dialog: {
		maxWidth: 600,
		width: '100%',
		marginHorizontal: "auto",
	},
	dialogTitle: {
		paddingBottom: 8,
	},
	dialogContent: {
		maxHeight: 500,
		paddingBottom: 16,
	},
	container: {
		flex: 1,
	},
	input: {
		marginBottom: 16,
	},
	sectionTitle: {
		marginTop: 8,
		marginBottom: 8,
	},
	segmentedButton: {
		marginVertical: 8,
	},
	divider: {
		marginVertical: 16,
	},
	dialogActions: {
		padding: 16,
		justifyContent: 'flex-end',
	},
	cancelButton: {
		marginRight: 8,
	},
	saveButton: {
		minWidth: 100,
	},
}); 