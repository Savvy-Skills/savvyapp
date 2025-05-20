import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, TextInput, Divider, Card } from 'react-native-paper';
import { ContentInfo, ContentSubtypes, ContentTypes } from '@/types/index';
import { createContent, updateContent } from '@/services/adminApi';
import ContentEditor from '@/components/admin/content/ContentEditor';
import Dropdown from '../common/Dropdown';
import styles from '@/styles/styles';

interface ContentFormProps {
	editingContent?: ContentInfo | null;
	onContentCreated: (content: ContentInfo) => void;
	onCancel: () => void;
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

export default function ContentForm({
	editingContent,
	onContentCreated,
	onCancel,
	viewId,
	isEditing = false
}: ContentFormProps) {
	const [contentType, setContentType] = useState<ContentTypes>('Rich Text');
	const [contentSubtype, setContentSubtype] = useState<ContentSubtypes | null>(null);
	const [contentTitle, setContentTitle] = useState(isEditing ? '' : 'New Content');
	const [contentData, setContentData] = useState<Partial<ContentInfo>>({});
	const [loading, setLoading] = useState(false);

	// Initialize form when editing content
	useEffect(() => {
		if (editingContent) {
			setContentType(editingContent.type || 'Rich Text');
			setContentSubtype(editingContent.subtype || null);
			setContentTitle(editingContent.title || '');
			setContentData({
				...editingContent
			});
		} else if (!isEditing) {
			setContentTitle('New Content'); // Set default title for new content
		}
	}, [editingContent, isEditing]);

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
				return !!contentData.state?.value;
			case 'Image':
			case 'Video':
				return !!contentData.url;
			case 'Dataset':
				return !!contentData.dataset_id;
			case 'Definition':
				return !!contentData.state?.value;
			case 'Tool':
				switch (contentSubtype) {
					case 'Neuron':
						return !!contentData.dataset_id;
					case 'Word2Vec':
						return !!contentData.dataset_id && !!contentData.dataset_info?.word_vec;
					case 'Tokenization':
					case 'Auto Tokenization':
						return !!contentData.state?.value;
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
			let fullContentData: Partial<ContentInfo> = {
				...contentData,
				title: contentTitle,
				type: contentType as ContentTypes,
				subtype: contentSubtype as ContentSubtypes,
			};

			let savedContent;
			if (isEditing) {
				savedContent = await updateContent(fullContentData);
			} else {
				savedContent = await createContent(fullContentData);
			}

			// Notify parent component
			onContentCreated(savedContent);
		} catch (error) {
			console.error(`Failed to ${isEditing ? 'update' : 'create'} content:`, error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Card style={localStyles.card}>
			<Card.Title title={isEditing ? "Edit Content" : "Create New Content"} />
			<Card.Content>
				<TextInput
					label="Content Title"
					value={contentTitle}
					onChangeText={setContentTitle}
					style={styles.input}
					placeholder="Enter a title for this content"
				/>

				<Text variant="titleMedium" style={localStyles.sectionTitle}>Content Type</Text>
				<Dropdown
					label="Content Type"
					value={contentType}
					options={contentTypeOptions}
					onChange={(value: string) => setContentType(value as ContentTypes)}
				/>

				{contentType === 'Tool' ? (
					<Dropdown
						label="Content Subtype"
						value={contentSubtype || ''}
						options={contentSubtypeOptions.filter(option => option.educational === false || option.educational === undefined)}
						onChange={(value: string) => setContentSubtype(value as ContentSubtypes)}
					/>
				) : contentType === 'Educational' ? (
					<Dropdown
						label="Content Subtype"
						value={contentSubtype || ''}
						options={contentSubtypeOptions.filter(option => option.educational === true)}
						onChange={(value: string) => setContentSubtype(value as ContentSubtypes)}
					/>
				) : null}
				<Divider style={localStyles.divider} />

				<ContentEditor
					contentType={contentType}
					contentSubtype={contentSubtype || null}
					content={contentData as ContentInfo}
					onContentChange={handleContentChange}
				/>

				<View style={localStyles.formActions}>
					<Button
						onPress={onCancel}
						mode="outlined"
						style={[styles.savvyButton, localStyles.cancelButton]}
					>
						Cancel
					</Button>
					<Button
						onPress={handleSave}
						loading={loading}
						disabled={loading || !isFormValid()}
						mode="contained"
						style={[styles.savvyButton, localStyles.saveButton]}
					>
						{isEditing ? "Update" : "Create"}
					</Button>
				</View>
			</Card.Content>
		</Card>
	);
}

const localStyles = StyleSheet.create({
	card: {
		marginBottom: 20,
	},
	sectionTitle: {
		marginTop: 8,
		marginBottom: 8,
	},
	divider: {
		marginVertical: 16,
	},
	formActions: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		marginTop: 20,
		gap: 12,
	},
	cancelButton: {
		marginRight: 8,
	},
	saveButton: {
		minWidth: 100,
	},
});
