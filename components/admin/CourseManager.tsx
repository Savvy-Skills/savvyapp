import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Button, Card, Dialog, Portal, TextInput, Text, FAB, DataTable } from 'react-native-paper';
import { Course } from '@/types/index';
import { getCourses } from '@/services/coursesApi';
import { createCourse, updateCourse, disableCourse } from '@/services/adminApi';
import ImageUploader from '@/components/common/ImageUploader';
import { Colors } from '@/constants/Colors';
import styles from '@/styles/styles';

interface CourseManagerProps {
  onCourseSelect: (courseId: number) => void;
  selectedCourseId: number | null;
}

export default function CourseManager({ onCourseSelect, selectedCourseId }: CourseManagerProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [courseForm, setCourseForm] = useState<Partial<Course>>({
    name: '',
    description: '',
    image_url: '',
  });
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);
  const [disableDialogVisible, setDisableDialogVisible] = useState(false);
  const [courseToDisable, setCourseToDisable] = useState<number | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const coursesData = await getCourses();
      setCourses(coursesData);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (course?: Course) => {
    if (course) {
      setCourseForm({
        name: course.name,
        description: course.description,
        image_url: course.image_url,
      });
      setEditingCourseId(course.id);
    } else {
      setCourseForm({
        name: '',
        description: '',
        image_url: '',
      });
      setEditingCourseId(null);
    }
    setDialogVisible(true);
  };

  const handleSaveCourse = async () => {
    try {
      if (editingCourseId) {
        await updateCourse(editingCourseId, courseForm);
      } else {
        await createCourse(courseForm);
      }
      setDialogVisible(false);
      fetchCourses();
    } catch (error) {
      console.error('Failed to save course:', error);
    }
  };

  const handleDisableCourse = (courseId: number) => {
    setCourseToDisable(courseId);
    setDisableDialogVisible(true);
  };

  const confirmDisableCourse = async () => {
    if (courseToDisable) {
      try {
        // Assuming there's a disableCourse API function
        await disableCourse(courseToDisable);
        fetchCourses();
      } catch (error) {
        console.error('Failed to disable course:', error);
      }
    }
    setDisableDialogVisible(false);
    setCourseToDisable(null);
  };

  return (
    <View style={localStyles.container}>
      <View style={localStyles.header}>
        <Text variant="headlineMedium">Course Management</Text>
        <Button 
          mode="contained" 
          onPress={() => handleOpenDialog()}
          style={[styles.savvyButton, localStyles.addButton]}
        >
          Add New Course
        </Button>
      </View>

      {loading ? (
        <Text>Loading courses...</Text>
      ) : (
        <ScrollView>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title style={{ maxWidth: 100 }}>Image</DataTable.Title>
              <DataTable.Title>Name</DataTable.Title>
              <DataTable.Title>Description</DataTable.Title>
              <DataTable.Title>Actions</DataTable.Title>
            </DataTable.Header>

            {courses.map((course) => (
              <DataTable.Row 
                key={course.id} 
                style={course.id === selectedCourseId ? localStyles.selectedRow : undefined}
              >
                <DataTable.Cell style={{ maxWidth: 100 }}>
                  {course.image_url ? (
                    <Image 
                      source={{ uri: course.image_url }} 
                      style={localStyles.previewImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={localStyles.imagePlaceholder}>
                      <Text>No Image</Text>
                    </View>
                  )}
                </DataTable.Cell>
                <DataTable.Cell>{course.name}</DataTable.Cell>
                <DataTable.Cell>{course.description}</DataTable.Cell>
                <DataTable.Cell>
                  <View style={localStyles.actionButtons}>
                    <Button 
                      mode={course.id === selectedCourseId ? "contained" : "outlined"}
                      onPress={() => onCourseSelect(course.id)}
                      style={[styles.savvyButton, localStyles.actionButton]}
                    >
                      {course.id === selectedCourseId ? "Selected" : "Select"}
                    </Button>
                    <Button 
                      mode="outlined" 
                      onPress={() => handleOpenDialog(course)}
                      style={[styles.savvyButton, localStyles.actionButton]}
                    >
                      Edit
                    </Button>
                    {/* <Button 
                      mode="contained" 
                      onPress={() => handleDisableCourse(course.id)}
                      style={[styles.savvyButton, localStyles.actionButton, localStyles.disableButton]}
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
            {editingCourseId ? 'Edit Course' : 'Add New Course'}
          </Dialog.Title>
          <Dialog.Content style={localStyles.dialogContent}>
            <TextInput
              label="Course Name"
              value={courseForm.name}
              onChangeText={(text) => setCourseForm({ ...courseForm, name: text })}
              style={localStyles.input}
              mode="outlined"
            />
            <TextInput
              label="Description"
              value={courseForm.description}
              onChangeText={(text) => setCourseForm({ ...courseForm, description: text })}
              multiline
              numberOfLines={3}
              style={localStyles.input}
              mode="outlined"
            />
            
            <ImageUploader 
              imageUrl={courseForm.image_url || ''} 
              onImageSelected={(url) => setCourseForm({
                ...courseForm,
                image_url: url
              })}
              label="Course Image"
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
              onPress={handleSaveCourse} 
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
            <Text>Are you sure you want to disable this course? Students will no longer have access to it.</Text>
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
              onPress={confirmDisableCourse}
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
    flexDirection: 'row',
    gap: 8,
	flex: 1,
  },
  actionButton: {
    marginHorizontal: 4,
  },
  disableButton: {
	backgroundColor: Colors.revealedButton,
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
  selectedRow: {
    backgroundColor: 'rgba(98, 0, 238, 0.08)',
  },
}); 