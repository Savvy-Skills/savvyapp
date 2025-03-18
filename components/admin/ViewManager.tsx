import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Dialog, Portal, TextInput, Text, Switch, DataTable, Card, Menu } from 'react-native-paper';
import { ViewWithSlides, ViewType, Module } from '@/types/index';
import { getModule } from '@/services/coursesApi';
import { createView, updateView, disableView, updateModule } from '@/services/adminApi';
import ImageUploader from '@/components/common/ImageUploader';
import { Colors } from '@/constants/Colors';
import styles from '@/styles/styles';
import { Image } from 'expo-image';

interface ViewManagerProps {
  moduleId: number | null;
  onViewSelect: (viewId: number) => void;
  selectedViewId: number | null;
  onBack?: () => void;
}

export default function ViewManager({ moduleId, onViewSelect, selectedViewId, onBack }: ViewManagerProps) {
  const [views, setViews] = useState<ViewType[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [viewForm, setViewForm] = useState<Partial<ViewWithSlides>>({
    name: '',
    quiz: false,
    type: 'lesson',
  });
  const [editingViewId, setEditingViewId] = useState<number | null>(null);
  const [disableDialogVisible, setDisableDialogVisible] = useState(false);
  const [viewToDisable, setViewToDisable] = useState<number | null>(null);
  
  // Module details state
  const [moduleDetails, setModuleDetails] = useState<Module | null>(null);
  const [editingModule, setEditingModule] = useState(false);
  const [moduleForm, setModuleForm] = useState<Partial<Module>>({
    name: '',
    description: '',
    image_url: '',
  });

  // Add state for menu visibility
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    if (moduleId) {
      fetchViews();
      fetchModuleDetails();
    } else {
      setViews([]);
      setModuleDetails(null);
    }
  }, [moduleId]);
  
  const fetchModuleDetails = async () => {
    if (!moduleId) return;
    
    try {
      const module = await getModule(moduleId);
      setModuleDetails(module);
      setModuleForm({
        name: module.name,
        description: module.description,
        image_url: module.image_url || '',
      });
    } catch (error) {
      console.error('Failed to fetch module details:', error);
    }
  };

  const fetchViews = async () => {
    if (!moduleId) return;
    
    setLoading(true);
    try {
      const moduleData = await getModule(moduleId);
      setViews((moduleData.views || []).map((view: any) => ({
        ...view,
        view_content: null,
        progress: null,
        timestamp: new Date().toISOString(),
        module_info: null
      })));
    } catch (error) {
      console.error('Failed to fetch views:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (view?: ViewWithSlides) => {
    if (view) {
      setViewForm({
        name: view.name,
        quiz: view.quiz || false,
        type: view.type || 'lesson',
      });
      setEditingViewId(view.id);
    } else {
      setViewForm({
        name: '',
        quiz: false,
        type: 'lesson',
      });
      setEditingViewId(null);
    }
    setDialogVisible(true);
  };

  const handleSaveView = async () => {
    if (!moduleId) return;
    
    try {
      if (editingViewId) {
        await updateView(editingViewId, viewForm);
      } else {
        await createView(moduleId, viewForm);
      }
      setDialogVisible(false);
      fetchViews();
    } catch (error) {
      console.error('Failed to save view:', error);
    }
  };

  const handleDisableView = (viewId: number) => {
    setViewToDisable(viewId);
    setDisableDialogVisible(true);
  };

  const confirmDisableView = async () => {
    if (viewToDisable) {
      try {
        await disableView(viewToDisable);
        fetchViews();
      } catch (error) {
        console.error('Failed to disable view:', error);
      }
    }
    setDisableDialogVisible(false);
    setViewToDisable(null);
  };
  
  const toggleModuleEditing = () => {
    if (editingModule) {
      // Save module changes
      saveModuleChanges();
    }
    setEditingModule(!editingModule);
  };
  
  const saveModuleChanges = async () => {
    if (!moduleId) return;
    
    try {
      await updateModule(moduleId, moduleForm);
      await fetchModuleDetails();
    } catch (error) {
      console.error('Failed to update module:', error);
    }
  };

  // Define view type options
  const viewTypeOptions = [
    { label: 'Lesson', value: 'lesson' },
    { label: 'Example', value: 'example' },
    { label: 'Tool', value: 'tool' },
    { label: 'Post', value: 'post' },
    // Add other view types as needed
  ];

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  if (!moduleId) {
    return (
      <View style={styles.container}>
        <Text>Please select a module first.</Text>
      </View>
    );
  }

  return (
    <View style={localStyles.container}>
      {/* Module details card */}
      {moduleDetails && (
        <Card style={localStyles.detailsCard}>
          <Card.Content>
            <View style={localStyles.cardHeader}>
              <Text variant="titleLarge">Module Details</Text>
              <View style={localStyles.buttonContainer}>
                {editingModule && (
                  <Button
                    mode="outlined"
                    onPress={toggleModuleEditing}
                    style={[styles.savvyButton, localStyles.cancelButton]}
                  >
                    Cancel
                  </Button>
                )}
                <Button 
                  mode="outlined" 
                  onPress={toggleModuleEditing}
                  style={[styles.savvyButton, localStyles.cancelButton]}
                >
                  {editingModule ? 'Save' : 'Edit'}
                </Button>
              </View>
            </View>
            
            {editingModule ? (
              <>
                <TextInput 
                  label="Module Name"
                  value={moduleForm.name}
                  onChangeText={(text) => setModuleForm({...moduleForm, name: text})}
                  style={localStyles.input}
                />
                <TextInput 
                  label="Description"
                  value={moduleForm.description}
                  onChangeText={(text) => setModuleForm({...moduleForm, description: text})}
                  multiline
                  numberOfLines={2}
                  style={localStyles.input}
                />
                <ImageUploader
                  imageUrl={moduleForm.image_url || ''}
                  onImageSelected={(url) => setModuleForm({
                    ...moduleForm,
                    image_url: url
                  })}
                  label="Module Image"
                />
              </>
            ) : (
              <View style={localStyles.moduleDetails}>
                {moduleDetails.image_url ? (
                  <View style={localStyles.imagePreviewContainer}>
                    <Image
                      source={{ uri: moduleDetails.image_url }}
                      style={localStyles.previewImage}
                    />
                  </View>
                ) : (
                  <View style={localStyles.imagePlaceholder}>
                    <Text>No Image</Text>
                  </View>
                )}
                <View style={localStyles.moduleDetailsText}>
                  <Text variant="titleMedium">{moduleDetails.name}</Text>
                  <Text variant="bodyMedium">{moduleDetails.description}</Text>
                </View>
              </View>
            )}
          </Card.Content>
        </Card>
      )}
      
      <View style={localStyles.header}>
        <View style={localStyles.headerActions}>
          <Button
            mode="outlined"
            onPress={handleBack}
            style={[styles.savvyButton, localStyles.backButton]}
            icon="arrow-left"
          >
            Back to Modules
          </Button>
          <Text variant="headlineMedium">View Management</Text>
        </View>
        <Button 
          mode="contained" 
          onPress={() => handleOpenDialog()}
          style={[styles.savvyButton, localStyles.addButton]}
        >
          Add New View
        </Button>
      </View>

      {loading ? (
        <Text>Loading views...</Text>
      ) : (
        <ScrollView>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Name</DataTable.Title>
              <DataTable.Title>Order</DataTable.Title>
              <DataTable.Title>Quiz Mode</DataTable.Title>
              <DataTable.Title>Actions</DataTable.Title>
            </DataTable.Header>

            {views.map((view, index) => (
              <DataTable.Row 
                key={view.id}
                style={view.id === selectedViewId ? localStyles.selectedRow : undefined}
              >
                <DataTable.Cell>{view.name}</DataTable.Cell>
                <DataTable.Cell>{index + 1}</DataTable.Cell>
                <DataTable.Cell>{view.quiz ? 'Yes' : 'No'}</DataTable.Cell>
                <DataTable.Cell>
                  <View style={localStyles.actionButtons}>
                    <Button 
                      mode={view.id === selectedViewId ? "contained" : "outlined"} 
                      onPress={() => onViewSelect(view.id)}
                      style={[styles.savvyButton, localStyles.actionButton]}
                    >
                      {view.id === selectedViewId ? "Selected" : "Select"}
                    </Button>
                    <Button 
                      mode="outlined" 
                      onPress={() => handleOpenDialog(view as unknown as ViewWithSlides)}
                      style={[styles.savvyButton, localStyles.actionButton]}
                    >
                      Edit
                    </Button>
                    {/* <Button 
                      mode="outlined" 
                      onPress={() => handleDisableView(view.id)}
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
            {editingViewId ? 'Edit View' : 'Add New View'}
          </Dialog.Title>
          <Dialog.Content style={localStyles.dialogContent}>
            <TextInput
              label="View Name"
              value={viewForm.name}
              onChangeText={(text) => setViewForm({ ...viewForm, name: text })}
              style={localStyles.input}
              mode="outlined"
            />
            
            {/* Row container for view type and quiz mode */}
            <View style={localStyles.formRow}>
              {/* View Type Column */}
              <View style={localStyles.formColumn}>
                <Text style={localStyles.sectionLabel}>View Type</Text>
                <Menu
                  visible={menuVisible}
                  onDismiss={closeMenu}
                  anchor={
                    <Button 
                      mode="outlined" 
                      onPress={openMenu}
                      style={localStyles.menuButton}
                      icon="chevron-down"
                      contentStyle={localStyles.menuButtonContent}
                      labelStyle={localStyles.menuButtonLabel}
                    >
                      {viewForm.type ? viewTypeOptions.find(option => option.value === viewForm.type)?.label || 'Select type' : 'Select type'}
                    </Button>
                  }
                >
                  {viewTypeOptions.map((option) => (
                    <Menu.Item
                      key={option.value}
                      title={option.label}
                      onPress={() => {
                        setViewForm({ ...viewForm, type: option.value as "lesson" | "example" | "tool" | "post" });
                        closeMenu();
                      }}
                    />
                  ))}
                </Menu>
              </View>
              
              {/* Quiz Mode Column */}
              <View style={localStyles.formColumn}>
                <Text style={localStyles.sectionLabel}>Quiz Mode</Text>
                <View style={localStyles.switchContainer}>
                  <Text style={localStyles.switchLabel}>Enable</Text>
                  <Switch
                    value={viewForm.quiz}
                    onValueChange={(value) => setViewForm({ ...viewForm, quiz: value })}
                    color={Colors.primary}
                  />
                </View>
              </View>
            </View>
          </Dialog.Content>
          <Dialog.Actions style={localStyles.dialogActions}>
            <Button 
              onPress={() => setDialogVisible(false)}
              mode="outlined"
              style={localStyles.cancelDialogButton}
            >
              Cancel
            </Button>
            <Button 
              onPress={handleSaveView}
              mode="contained"
              style={localStyles.saveDialogButton}
            >
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={disableDialogVisible} onDismiss={() => setDisableDialogVisible(false)}>
          <Dialog.Title>Confirm Disable</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to disable this view? Students will no longer have access to it.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDisableDialogVisible(false)}>Cancel</Button>
            <Button onPress={confirmDisableView}>Disable</Button>
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
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  moduleDetails: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  moduleDetailsText: {
	flex: 1,
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
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  actionButton: {
    marginHorizontal: 4,
  },
  cancelButton: {
    marginRight: 8,
  },
  disableButton: {
    borderColor: Colors.revealedButton,
    color: Colors.revealedButton,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
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
  dropdownLabel: {
    fontSize: 16,
    marginBottom: 8,
    marginTop: 16,
    color: Colors.text,
  },
  menuContainer: {
    marginBottom: 0,
  },
  menuButton: {
    width: '100%',
    borderRadius: 8,
    borderWidth: 1,
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
  sectionLabel: {
    fontSize: 16,
    marginBottom: 8,
    marginTop: 16,
    color: Colors.text,
  },
  switchLabel: {
    fontSize: 16,
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
  menuButtonContent: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    padding: 4,
    gap: 16,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 16,
  },
  formColumn: {
    flex: 1,
  },
  menuButtonLabel: {
    fontWeight: 'bold', 
  },
  selectedRow: {
    backgroundColor: 'rgba(98, 0, 238, 0.08)',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButton: {
    marginRight: 8,
  },
}); 