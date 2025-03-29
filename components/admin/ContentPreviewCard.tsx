import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Card, Text, Button, Chip } from 'react-native-paper';
import { ContentInfo } from '@/types/index';
import RichText from '../slides/RichTextComponent';

interface ContentPreviewCardProps {
	content: Partial<ContentInfo>;
	index: number;
	onRemove: (index: number) => void;
	onEdit?: (content: ContentInfo) => void;
}

export default function ContentPreviewCard({ content, index, onRemove, onEdit }: ContentPreviewCardProps) {

	// Helper function to render neuron preview
	const renderNeuronPreview = () => {
		const neuronConfig = content.neuronConfig;
		if (!neuronConfig) return <Text style={styles.previewValue}>[No neuron configuration]</Text>;

		return (
			<View style={styles.neuronPreview}>
				{content.dataset_info ? (
					<View style={styles.datasetInfo}>
						<Text style={styles.previewValue}>
							Dataset: {content.dataset_info.name}
						</Text>
						{content.dataset_info.metadata && (
							<Text style={styles.datasetMetadata}>
								{`${content.dataset_info.metadata.rows} rows × ${content.dataset_info.metadata.columns} columns`}
							</Text>
						)}
					</View>
				) : (
					<Text style={styles.previewValue}>[No dataset selected]</Text>
				)}

				<View style={styles.neuronConfigRows}>
					<View style={styles.neuronConfigRow}>
						<Text style={styles.neuronLabel}>X-Axis:</Text>
						<Text style={styles.neuronValue}>
							{neuronConfig.axes.x.emoji} {neuronConfig.axes.x.name} [{neuronConfig.axes.x.min}-{neuronConfig.axes.x.max}{neuronConfig.axes.x.suffix}]
						</Text>
					</View>

					<View style={styles.neuronConfigRow}>
						<Text style={styles.neuronLabel}>Y-Axis:</Text>
						<Text style={styles.neuronValue}>
							{neuronConfig.axes.y.emoji} {neuronConfig.axes.y.name} [{neuronConfig.axes.y.min}-{neuronConfig.axes.y.max}{neuronConfig.axes.y.suffix}]
						</Text>
					</View>

					<View style={styles.classesPreview}>
						<Text style={styles.neuronLabel}>Classes:</Text>
						<View style={styles.classChips}>
							<View style={[styles.classChip, { backgroundColor: neuronConfig.classes.positive.color + '40' }]}>
								<View style={[styles.colorDot, { backgroundColor: neuronConfig.classes.positive.color }]} />
								<Text>{neuronConfig.classes.positive.value}</Text>
							</View>
							<View style={[styles.classChip, { backgroundColor: neuronConfig.classes.negative.color + '40' }]}>
								<View style={[styles.colorDot, { backgroundColor: neuronConfig.classes.negative.color }]} />
								<Text>{neuronConfig.classes.negative.value}</Text>
							</View>
							<View style={[styles.classChip, { backgroundColor: neuronConfig.classes.neutral.color + '40' }]}>
								<View style={[styles.colorDot, { backgroundColor: neuronConfig.classes.neutral.color }]} />
								<Text>{neuronConfig.classes.neutral.value}</Text>
							</View>
						</View>
					</View>

					<View style={styles.neuronConfigRow}>
						<Text style={styles.neuronLabel}>Initial Values:</Text>
						<Text style={styles.neuronValue}>
							b={neuronConfig.initialValues.bias}, w₁={neuronConfig.initialValues.weight1}, w₂={neuronConfig.initialValues.weight2}
						</Text>
					</View>
					<View style={styles.neuronConfigRow}>
						<Text style={styles.neuronLabel}>Vertical Slider:</Text>
						<Text style={styles.neuronValue}>
							{neuronConfig.useVerticalSlider ? 'Yes' : 'No'}
						</Text>
					</View>
					<View style={styles.neuronConfigRow}>
						<Text style={styles.neuronLabel}>Locked:</Text>
						<Text style={styles.neuronValue}>
							Bias: {neuronConfig.locked.bias ? 'Yes' : 'No'}, Weight 1: {neuronConfig.locked.weight1 ? 'Yes' : 'No'}, Weight 2: {neuronConfig.locked.weight2 ? 'Yes' : 'No'}
						</Text>
					</View>
				</View>
			</View>
		);
	};

	// Helper function to render Word2Vec preview
	const renderWord2VecPreview = () => {
		if (!content.dataset_info) return <Text style={styles.previewValue}>[No Word2Vec dataset selected]</Text>;

		return (
			<View style={styles.word2vecPreview}>
				<View style={styles.datasetInfo}>
					<Text style={styles.previewValue}>
						Dataset: {content.dataset_info.name}
					</Text>
					{content.dataset_info.metadata && (
						<>
							<Text style={styles.datasetMetadata}>
								{`${content.dataset_info.metadata.rows} words in dataset`}
							</Text>
							{content.dataset_info.metadata.description && (
								<Text style={styles.datasetDescription} numberOfLines={2}>
									{content.dataset_info.metadata.description}
								</Text>
							)}
						</>
					)}
				</View>
				
				<View style={styles.datasetTypeContainer}>
					<Chip icon="vector-point" style={styles.word2vecChip}>Word2Vec Dataset</Chip>
				</View>
			</View>
		);
	};

	return (
		<Card key={`content-${index}`} style={styles.previewCard}>
			<Card.Content>
				<View style={styles.previewCardHeader}>
					<Text variant="titleSmall">
						{content.title ? content.title : `Content #${index + 1}`}
					</Text>
					<View style={styles.headerButtons}>
						{onEdit && content.id && (
							<Button
								mode="text"
								icon="pencil"
								onPress={() => onEdit(content as ContentInfo)}
								compact
							>
								Edit
							</Button>
						)}
						<Button
							mode="text"
							icon="close"
							onPress={() => onRemove(index)}
							compact
						>
							Remove
						</Button>
					</View>
				</View>

				<Text style={styles.previewLabel}>Type:</Text>
				<Text style={styles.previewValue}>{content.type}</Text>
				<Text style={styles.previewLabel}>Preview:</Text>
				{['Rich Text', 'Tokenization', 'Auto Tokenization'].includes(content.type || '') && (
					<RichText text={content.state || ''} />
				)}

				{content.type === 'Image' && (
					<>
						<Text style={styles.previewLabel}>Image:</Text>
						{content.url ? (
							<View style={styles.imagePreviewContainer}>
								<Image
									source={{ uri: content.url }}
									style={styles.imagePreview}
									resizeMode="contain"
								/>
								<Text style={styles.imageUrl} numberOfLines={1}>
									{content.url}
								</Text>
							</View>
						) : (
							<Text style={styles.previewValue}>[No image URL]</Text>
						)}
					</>
				)}

				{content.type === 'Video' && (
					<>
						<Text style={styles.previewLabel}>Video URL:</Text>
						<Text style={styles.previewValue} numberOfLines={2}>
							{content.url || '[No video URL]'}
						</Text>
					</>
				)}

				{content.type === 'Dataset' && (
					<>
						<Text style={styles.previewLabel}>Dataset:</Text>
						<Text style={styles.previewValue}>
							{content.dataset_info?.name || '[No dataset selected]'}
						</Text>
						{content.dataset_info?.metadata && (
							<Text style={styles.previewValue} numberOfLines={2}>
								{`${content.dataset_info.metadata.rows} rows × ${content.dataset_info.metadata.columns} columns`}
							</Text>
						)}
					</>
				)}

				{content.type === 'Neuron' && renderNeuronPreview()}
				
				{content.type === 'Word2Vec' && renderWord2VecPreview()}


				{['Neural Network', 'Activity'].includes(content.type || '') && (
					<Text style={styles.previewValue}>
						[Preview not available for {content.type} type]
					</Text>
				)}
			</Card.Content>
		</Card>
	);
}

const styles = StyleSheet.create({
	previewCard: {
		backgroundColor: '#f5f5f5',
		marginBottom: 12,
	},
	previewCardHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 8,
		borderBottomWidth: 1,
		borderBottomColor: '#eee',
		paddingBottom: 8,
	},
	headerButtons: {
		flexDirection: 'row',
	},
	previewLabel: {
		fontWeight: 'bold',
		marginTop: 4,
		marginBottom: 2,
	},
	previewValue: {
		marginBottom: 8,
	},
	imagePreviewContainer: {
		marginVertical: 8,
	},
	imagePreview: {
		width: '100%',
		height: 120,
		borderRadius: 4,
		marginBottom: 4,
	},
	imageUrl: {
		fontSize: 12,
		color: '#666',
	},
	neuronPreview: {
		backgroundColor: '#f9f9f9',
		borderRadius: 8,
		padding: 10,
		marginTop: 4,
	},
	datasetInfo: {
		marginBottom: 8,
		borderBottomWidth: 1,
		borderBottomColor: '#eee',
		paddingBottom: 8,
	},
	datasetMetadata: {
		fontSize: 12,
		color: '#666',
		marginTop: 2,
	},
	neuronConfigRows: {
		gap: 6,
	},
	neuronConfigRow: {
		flexDirection: 'row',
		marginBottom: 4,
	},
	neuronLabel: {
		fontWeight: 'bold',
		marginRight: 8,
		minWidth: 70,
	},
	neuronValue: {
		flex: 1,
	},
	classesPreview: {
		marginBottom: 6,
	},
	classChips: {
		flexDirection: 'row',
		marginTop: 4,
		gap: 8,
	},
	classChip: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 16,
		gap: 4,
	},
	colorDot: {
		width: 12,
		height: 12,
		borderRadius: 6,
	},
	word2vecPreview: {
		backgroundColor: '#f9f9f9',
		borderRadius: 8,
		padding: 10,
		marginTop: 4,
	},
	datasetDescription: {
		fontSize: 12,
		color: '#444',
		marginTop: 4,
		fontStyle: 'italic',
	},
	datasetTypeContainer: {
		flexDirection: 'row',
		marginTop: 4,
	},
	word2vecChip: {
		backgroundColor: 'rgba(76, 175, 80, 0.2)',
	},
}); 