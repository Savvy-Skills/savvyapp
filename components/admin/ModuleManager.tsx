import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Button, Dialog, Portal, TextInput, Text, DataTable, Card } from 'react-native-paper';
import { Module, Course } from '@/types';
import { getCourse } from '@/services/coursesApi';
import { createModule, updateModule, disableModule, updateCourse } from '@/services/adminApi';
import ImageUploader from '@/components/common/ImageUploader';
import styles from '@/styles/styles';
import { Colors } from '@/constants/Colors';

interface ModuleManagerProps {
	courseId: number | null;
	onModuleSelect: (moduleId: number) => void;
}

export default function ModuleManager({ courseId, onModuleSelect }: ModuleManagerProps) {
	const [modules, setModules] = useState<Module[]>([]);
	const [loading, setLoading] = useState(false);
	const [dialogVisible, setDialogVisible] = useState(false);
	const [moduleForm, setModuleForm] = useState<Partial<Module>>({
		name: '',
		description: '',
		image_url: '',
	});
	const [editingModuleId, setEditingModuleId] = useState<number | null>(null);
	const [disableDialogVisible, setDisableDialogVisible] = useState(false);
	const [moduleToDisable, setModuleToDisable] = useState<number | null>(null);

	// Course details state
	const [courseDetails, setCourseDetails] = useState<Course | null>(null);
	const [editingCourse, setEditingCourse] = useState(false);
	const [courseForm, setCourseForm] = useState<Partial<Course>>({
		name: '',
		description: '',
		image_url: '',
	});

	useEffect(() => {
		if (courseId) {
			fetchModules();
			fetchCourseDetails();
		} else {
			setModules([]);
			setCourseDetails(null);
		}
	}, [courseId]);

	const fetchCourseDetails = async () => {
		if (!courseId) return;

		try {
			const course = await getCourse(courseId);
			setCourseDetails(course);
			setCourseForm({
				name: course.name,
				description: course.description,
				image_url: course.image_url,
			});
		} catch (error) {
			console.error('Failed to fetch course details:', error);
		}
	};

	const fetchModules = async () => {
		if (!courseId) return;

		setLoading(true);
		try {
			const courseData = await getCourse(courseId);
			// Extract actual Module objects from the nested structure
			setModules(courseData.modules?.map(item => item.module_info).filter(Boolean) as Module[] || []);
		} catch (error) {
			console.error('Failed to fetch modules:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleOpenDialog = (module?: Module) => {
		if (module) {
			setModuleForm({
				name: module.name,
				description: module.description,
				image_url: module.image_url,
			});
			setEditingModuleId(module.id);
		} else {
			setModuleForm({
				name: '',
				description: '',
				image_url: '',
			});
			setEditingModuleId(null);
		}
		setDialogVisible(true);
	};

	const handleSaveModule = async () => {
		if (!courseId) return;

		try {
			if (editingModuleId) {
				await updateModule(editingModuleId, moduleForm);
			} else {
				await createModule(courseId, moduleForm);
			}
			setDialogVisible(false);
			fetchModules();
		} catch (error) {
			console.error('Failed to save module:', error);
		}
	};

	const handleDisableModule = (moduleId: number) => {
		setModuleToDisable(moduleId);
		setDisableDialogVisible(true);
	};

	const confirmDisableModule = async () => {
		if (moduleToDisable) {
			try {
				await disableModule(moduleToDisable);
				fetchModules();
			} catch (error) {
				console.error('Failed to disable module:', error);
			}
		}
		setDisableDialogVisible(false);
		setModuleToDisable(null);
	};

	const toggleCourseEditing = () => {
		if (editingCourse) {
			// Save course changes
			saveCourseChanges();
		}
		setEditingCourse(!editingCourse);
	};

	const saveCourseChanges = async () => {
		if (!courseId) return;

		try {
			await updateCourse(courseId, courseForm);
			await fetchCourseDetails();
		} catch (error) {
			console.error('Failed to update course:', error);
		}
	};

	if (!courseId) {
		return (
			<View style={localStyles.container}>
				<Text>Please select a course first.</Text>
			</View>
		);
	}

	return (
		<View style={localStyles.container}>
			{/* Course details card */}
			{courseDetails && (
				<Card style={localStyles.detailsCard}>
					<Card.Content>
						<View style={localStyles.cardHeader}>
							<Text variant="titleLarge">Course Details</Text>
							<View style={localStyles.buttonContainer}>

								{editingCourse && (
									<Button
										mode="outlined"
										onPress={toggleCourseEditing}
										style={[styles.savvyButton, localStyles.cancelButton]}
									>
										Cancel
									</Button>
								)}
								<Button
									mode="outlined"
									onPress={toggleCourseEditing}
									style={[styles.savvyButton, localStyles.cancelButton]}
								>
									{editingCourse ? 'Save' : 'Edit'}
								</Button>
							</View>
						</View>

						{editingCourse ? (
							<>
								<TextInput
									label="Course Name"
									value={courseForm.name}
									onChangeText={(text) => setCourseForm({ ...courseForm, name: text })}
									style={localStyles.input}
								/>
								<TextInput
									label="Description"
									value={courseForm.description}
									onChangeText={(text) => setCourseForm({ ...courseForm, description: text })}
									multiline
									numberOfLines={2}
									style={localStyles.input}
								/>
								<ImageUploader
									imageUrl={courseForm.image_url || ''}
									onImageSelected={(url) => setCourseForm({
										...courseForm,
										image_url: url
									})}
									label="Course Image"
								/>
							</>
						) : (
							<View style={localStyles.courseDetails}>
								{courseDetails.image_url && (
									<View style={localStyles.imagePreviewContainer}>
										<Image
											source={{ uri: courseDetails.image_url }}
											style={localStyles.previewImage}
											resizeMode="cover"
										/>
									</View>
								)}
								<View style={localStyles.courseDetailsText}>
									<Text variant="titleMedium">{courseDetails.name}</Text>
									<Text variant="bodyMedium">{courseDetails.description}</Text>
								</View>
							</View>
						)}
					</Card.Content>
				</Card>
			)}

			<View style={localStyles.header}>
				<Text variant="headlineMedium">Module Management</Text>
				<Button
					mode="contained"
					onPress={() => handleOpenDialog()}
					style={[styles.savvyButton, localStyles.addButton]}
				>
					Add New Module
				</Button>
			</View>

			{loading ? (
				<Text>Loading modules...</Text>
			) : (
				<ScrollView>
					<DataTable>
						<DataTable.Header>
							<DataTable.Title style={{ maxWidth: 100 }}>Image</DataTable.Title>
							<DataTable.Title style={localStyles.moduleName}>Name</DataTable.Title>
							<DataTable.Title>Description</DataTable.Title>
							<DataTable.Title>Actions</DataTable.Title>
						</DataTable.Header>

						{modules.map((module) => (
							<DataTable.Row key={module.id}>
								<DataTable.Cell style={{ maxWidth: 100 }}>
									{module.image_url ? (
										<Image 
											source={{ uri: module.image_url }} 
											style={localStyles.previewImage}
											resizeMode="cover"
										/>
									) : (
										<View style={localStyles.imagePlaceholder}>
											<Text>No Image</Text>
										</View>
									)}
								</DataTable.Cell>
								<DataTable.Cell style={localStyles.moduleName}>{module.name}</DataTable.Cell>
								<DataTable.Cell>{module.description}</DataTable.Cell>
								<DataTable.Cell>
									<View style={localStyles.actionButtons}>
										<Button
											mode="outlined"
											onPress={() => onModuleSelect(module.id)}
											style={[styles.savvyButton, localStyles.actionButton]}
										>
											Select
										</Button>
										<Button
											mode="outlined"
											onPress={() => handleOpenDialog(module)}
											style={[styles.savvyButton, localStyles.actionButton]}
										>
											Edit
										</Button>
										{/* <Button
											mode="contained"
											onPress={() => handleDisableModule(module.id)}
											style={[styles.savvyButton, localStyles.disableButton]}
										>
											Disable
										</Button> */}
									</View>
								</DataTable.Cell>
							</DataTable.Row>
						))}
					</DataTable>
				</ScrollView>
			)}

			<Portal>
				<Dialog 
					visible={dialogVisible} 
					onDismiss={() => setDialogVisible(false)}
					style={localStyles.dialog}
				>
					<Dialog.Title style={localStyles.dialogTitle}>
						{editingModuleId ? 'Edit Module' : 'Add New Module'}
					</Dialog.Title>
					<Dialog.Content style={localStyles.dialogContent}>
						<TextInput
							label="Module Name"
							value={moduleForm.name}
							onChangeText={(text) => setModuleForm({ ...moduleForm, name: text })}
							style={localStyles.input}
							mode="outlined"
						/>
						<TextInput
							label="Description"
							value={moduleForm.description}
							onChangeText={(text) => setModuleForm({ ...moduleForm, description: text })}
							multiline
							numberOfLines={3}
							style={localStyles.input}
							mode="outlined"
						/>
						<ImageUploader
							imageUrl={moduleForm.image_url || ''}
							onImageSelected={(url) => setModuleForm({
								...moduleForm,
								image_url: url
							})}
							label="Module Image"
						/>
					</Dialog.Content>
					<Dialog.Actions style={localStyles.dialogActions}>
						<Button 
							onPress={() => setDialogVisible(false)}
							mode="outlined"
							style={[styles.savvyButton, localStyles.cancelDialogButton]}
						>
							Cancel
						</Button>
						<Button 
							onPress={handleSaveModule}
							mode="contained"
							style={[styles.savvyButton, localStyles.saveDialogButton]}
						>
							Save
						</Button>
					</Dialog.Actions>
				</Dialog>

				<Dialog 
					visible={disableDialogVisible} 
					onDismiss={() => setDisableDialogVisible(false)}
					style={localStyles.dialog}
				>
					<Dialog.Title style={localStyles.dialogTitle}>Confirm Disable</Dialog.Title>
					<Dialog.Content style={localStyles.dialogContent}>
						<Text>Are you sure you want to disable this module? Students will no longer have access to it.</Text>
					</Dialog.Content>
					<Dialog.Actions style={localStyles.dialogActions}>
						<Button 
							onPress={() => setDisableDialogVisible(false)}
							mode="outlined"
							style={[styles.savvyButton, localStyles.cancelDialogButton]}
						>
							Cancel
						</Button>
						<Button 
							onPress={confirmDisableModule}
							mode="contained"
							style={[styles.savvyButton, localStyles.saveDialogButton]}
						>
							Disable
						</Button>
					</Dialog.Actions>
				</Dialog>
			</Portal>
		</View>
	);
}

const localStyles = StyleSheet.create({
	container: {
		flex: 1,
	},
	moduleName: {
		maxWidth: 260,
	},
	buttonContainer: {
		flexDirection: 'row',
		gap: 8,
	},
	courseDetails: {
		flexDirection: 'row',
		gap: 8,
		alignItems: 'center',
	},
	courseDetailsText: {
		flexDirection: 'column',
	},
	detailsCard: {
		marginBottom: 20,
	},
	cardHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 12,
	},
	urlText: {
		marginTop: 8,
		color: '#666',
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
	actionButtons: {
		flex: 1,
		flexDirection: 'row',
		gap: 8,
	},
	actionButton: {
		marginHorizontal: 4,
	},
	cancelButton: {
		marginRight: 8,
	},
	disableButton: {
		backgroundColor: Colors.revealedButton,
	},
	imagePreviewContainer: {
		marginTop: 12,
	},
	previewImage: {
		width: 50,
		height: 50,
		borderRadius: 4,
	},
	imagePlaceholder: {
		width: 50,
		height: 50,
		borderRadius: 4,
		backgroundColor: '#e0e0e0',
		justifyContent: 'center',
		alignItems: 'center',
	},
	dialog: {
		borderRadius: 12,
		padding: 8,
		maxWidth: 600,
		width: '100%',
		alignSelf: 'center',
	},
	dialogTitle: {
		textAlign: 'center',
		fontSize: 20,
		fontWeight: 'bold',
	},
	dialogContent: {
		paddingHorizontal: 20,
	},
	dialogActions: {
		padding: 16,
		justifyContent: 'space-between',
	},
	cancelDialogButton: {
		minWidth: 100,
	},
	saveDialogButton: {
		minWidth: 100,
	},
}); 