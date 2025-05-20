import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Text, Button, Card, Chip, Divider } from 'react-native-paper';
import { DatasetInfo } from '@/types/index';
import { getDatasets } from '@/services/adminApi';
import DatasetList from '@/components/common/DatasetList';

export default function DatasetsManager() {
	const [selectedDataset, setSelectedDataset] = useState<DatasetInfo | null>(null);
	const [loading, setLoading] = useState(false);

	const handleDatasetSelect = (datasetId: string, datasetInfo: DatasetInfo) => {
		setSelectedDataset(datasetInfo);
	};

	const clearSelectedDataset = () => {
		setSelectedDataset(null);
	};

	return (
		<ScrollView style={styles.container}>
			<View style={styles.header}>
				<Text variant="headlineMedium">Datasets Manager</Text>
				<Text variant="bodyMedium" style={styles.subtitle}>
					View and manage available datasets
				</Text>
			</View>
			
			{selectedDataset && (
				<Card style={[
					styles.selectedDatasetCard,
					selectedDataset.word_vec && styles.word2vecCard
				]}>
					<Card.Title 
						title="Selected Dataset" 
						subtitle={selectedDataset.name} 
						right={() => (
							<Button 
								icon="close" 
								onPress={clearSelectedDataset} 
								mode="text"
							>
								Clear
							</Button>
						)} 
					/>
					<Card.Content>
						<Text variant="bodyMedium">
							{selectedDataset.metadata.description || 'No description available'}
						</Text>
						<View style={styles.metadataContainer}>
							{selectedDataset.word_vec && (
								<Chip icon="vector-point" style={[styles.chip, styles.word2vecChip]}>Word2Vec</Chip>
							)}
							<Chip icon="table-row" style={styles.chip}>Rows: {selectedDataset.metadata.rows}</Chip>
							<Chip icon="table-column" style={styles.chip}>Columns: {selectedDataset.metadata.columns}</Chip>
							{selectedDataset.metadata.source && (
								<Chip icon="link" style={styles.chip}>Source: {selectedDataset.metadata.source}</Chip>
							)}
						</View>
						
						{/* Display column information */}
						{selectedDataset.metadata.columns_names && selectedDataset.metadata.columns_names.length > 0 && (
							<>
								<Divider style={styles.divider} />
								<Text variant="titleMedium" style={styles.sectionTitle}>Columns</Text>
								<View style={styles.columnsContainer}>
									{selectedDataset.metadata.columns_names.map((column, index) => (
										<Chip key={index} style={styles.columnChip}>
											{column}
										</Chip>
									))}
								</View>
							</>
						)}
					</Card.Content>
				</Card>
			)}

			<View style={styles.datasetListContainer}>
				<Text variant="titleMedium" style={styles.sectionTitle}>
					{selectedDataset ? 'Available Datasets' : 'Select a Dataset to Preview'}
				</Text>
				<DatasetList
					selectedDatasetId={selectedDataset?.id || ''}
					onDatasetSelect={handleDatasetSelect}
					showWordVecDatasets={true}
				/>
			</View>
			
			{/* Future: Add dataset upload functionality here */}
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
	},
	header: {
		marginBottom: 24,
	},
	subtitle: {
		marginTop: 4,
		opacity: 0.7,
	},
	selectedDatasetCard: {
		marginBottom: 24,
		borderWidth: 2,
		borderColor: '#6200ee',
	},
	word2vecCard: {
		backgroundColor: 'rgba(76, 175, 80, 0.1)',
		borderColor: '#4CAF50',
	},
	word2vecChip: {
		backgroundColor: 'rgba(76, 175, 80, 0.2)',
	},
	metadataContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		marginTop: 16,
	},
	chip: {
		marginRight: 8,
		marginBottom: 8,
	},
	sectionTitle: {
		marginBottom: 12,
	},
	divider: {
		marginVertical: 16,
	},
	columnsContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
	},
	columnChip: {
		marginRight: 8,
		marginBottom: 8,
		backgroundColor: '#f0f0f0',
	},
	datasetListContainer: {
		flex: 1,
	}
});	