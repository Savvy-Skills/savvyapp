import { Colors } from '@/constants/Colors';
import { AssessmentInfo, ContentInfo } from '@/types/index';
import { generateColors } from '@/utils/utilfunctions';
import { FlashList } from '@shopify/flash-list';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Dimensions, FlatList } from 'react-native';
import { Button, Dialog, Portal, Text, DataTable, Divider, Checkbox } from 'react-native-paper';

type ImportItem = AssessmentInfo | ContentInfo;

interface ImportDialogProps {
	visible: boolean;
	onDismiss: () => void;
	title: string;
	items: AssessmentInfo[] | ContentInfo[];
	selectedItemId: number | null;
	onSelectItem: (id: number) => void;
	onImport: (id: number) => void;
	emptyMessage: string;
	onRefresh?: () => void;
	multiSelect?: boolean;
	selectedItems?: number[];
	onSelectMultiple?: (ids: number[]) => void;
}

export default function ImportDialog({
	visible,
	onDismiss,
	title,
	items,
	selectedItemId,
	onSelectItem,
	onImport,
	emptyMessage,
	onRefresh,
	multiSelect = false,
	selectedItems = [],
	onSelectMultiple
}: ImportDialogProps) {
	const [selectedIds, setSelectedIds] = useState<number[]>(selectedItems);

	const toggleItemSelection = (itemId: number) => {
		if (selectedIds.includes(itemId)) {
			setSelectedIds(selectedIds.filter(id => id !== itemId));
		} else {
			setSelectedIds([...selectedIds, itemId]);
		}
	};

	const handleImportMultiple = () => {
		if (onSelectMultiple) {
			onSelectMultiple(selectedIds);
		}
	};

	return (
		<Portal>
			<Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
				<Dialog.Title style={styles.dialogTitle}>
					<View style={styles.titleContainer}>
						<Text variant="titleLarge">{title}</Text>
						{onRefresh && (
							<Button
								icon="refresh"
								mode="text"
								onPress={onRefresh}
								compact
							>
								Refresh
							</Button>
						)}
					</View>
				</Dialog.Title>
				<Dialog.ScrollArea style={styles.scrollArea}>
					{items.length === 0 ? (
						<View style={styles.emptyContainer}>
							<Text>{emptyMessage}</Text>
						</View>
					) : (
						<View style={styles.tableContainer}>
							<DataTable.Header>
								{multiSelect && <DataTable.Title style={{ flex: 0.5 }}>Select</DataTable.Title>}
								<DataTable.Title>Type</DataTable.Title>
								<DataTable.Title style={{ flex: 2 }}>
									{title.includes('Assessment') ? 'Question' : 'Title/Content'}
								</DataTable.Title>
							</DataTable.Header>
							
							<View style={styles.listContainer}>
								<FlatList<ImportItem>
									data={items as ImportItem[]}
									renderItem={({ item }) => (
										<DataTable.Row
											key={item.id}
											onPress={() => multiSelect ? toggleItemSelection(item.id as number) : onSelectItem(item.id as number)}
											style={(multiSelect && selectedIds.includes(item.id as number)) || 
												(!multiSelect && selectedItemId === item.id) ? 
												styles.selectedRow : undefined}
										>
											{multiSelect && (
												<DataTable.Cell style={{ flex: 0.5 }}>
													<Checkbox
														status={selectedIds.includes(item.id as number) ? 'checked' : 'unchecked'}
														onPress={() => toggleItemSelection(item.id as number)}
													/>
												</DataTable.Cell>
											)}
											<DataTable.Cell>{item.type}</DataTable.Cell>
											<DataTable.Cell style={{ flex: 2 }}>
												{title.includes('Assessment') 
													? ('text' in item ? item.text : 'No text available') 
													: ('title' in item ? item.title : 'No title available')}
											</DataTable.Cell>
										</DataTable.Row>
									)}
								/>
							</View>
						</View>
					)}
				</Dialog.ScrollArea>
				<Divider />
				<Dialog.Actions style={styles.dialogActions}>
					<Button
						onPress={onDismiss}
						mode="outlined"
						style={styles.cancelButton}
					>
						Cancel
					</Button>
					{multiSelect ? (
						<Button
							onPress={handleImportMultiple}
							disabled={selectedIds.length === 0}
							mode="contained"
							style={styles.importButton}
						>
							Import Selected ({selectedIds.length})
						</Button>
					) : (
						<Button
							onPress={() => selectedItemId && onImport(selectedItemId)}
							disabled={!selectedItemId}
							mode="contained"
							style={styles.importButton}
						>
							Import
						</Button>
					)}
				</Dialog.Actions>
			</Dialog>
		</Portal>
	);
}

const styles = StyleSheet.create({
	dialog: {
		maxWidth: 800,
		width: '100%',
		marginHorizontal: 'auto',
	},
	dialogTitle: {
		paddingBottom: 8,
	},
	scrollArea: {
		maxHeight: 400,
	},
	tableContainer: {
		height: 300, // Fixed height for the table container
	},
	listContainer: {
		height: 250, // Fixed height for the list
		flex: 1,
	},
	emptyContainer: {
		padding: 16,
		alignItems: 'center',
	},
	selectedRow: {
		backgroundColor: generateColors(Colors.orange, 0.4).muted,
	},
	titleContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		width: '100%',
	},
	dialogActions: {
		padding: 16,
		justifyContent: 'flex-end',
	},
	cancelButton: {
		marginRight: 8,
	},
	importButton: {
		minWidth: 100,
	},
}); 