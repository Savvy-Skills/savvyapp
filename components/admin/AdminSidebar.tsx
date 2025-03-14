import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Divider, Text } from 'react-native-paper';
import { AdminSection } from '@/app/(misc)/admin';
import styles from '@/styles/styles';

interface AdminSidebarProps {
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
  courseId: number | null;
  moduleId: number | null;
  viewId: number | null;
}

export default function AdminSidebar({ 
  activeSection, 
  onSectionChange,
  courseId,
  moduleId,
  viewId
}: AdminSidebarProps) {
  
  const renderNavButton = (section: AdminSection, label: string, disabled = false) => (
    <Button
      mode={activeSection === section ? 'contained' : 'outlined'}
      onPress={() => onSectionChange(section)}
      style={[styles.savvyButton, localStyles.navButton]}
      disabled={disabled}
    >
      {label}
    </Button>
  );

  return (
    <View style={localStyles.sidebar}>
      <Text variant="headlineMedium" style={localStyles.title}>Admin Panel</Text>
      <Divider style={localStyles.divider} />
      <ScrollView>
        {renderNavButton('courses', 'Courses')}
        {renderNavButton('modules', 'Modules', !courseId)}
        {renderNavButton('views', 'Views', !moduleId)}
        {renderNavButton('slides', 'Slides', !viewId)}
        
        <View style={localStyles.infoBox}>
          <Text variant="titleMedium">Selected Items:</Text>
          <Text>Course ID: {courseId || 'None'}</Text>
          <Text>Module ID: {moduleId || 'None'}</Text>
          <Text>View ID: {viewId || 'None'}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const localStyles = StyleSheet.create({
  sidebar: {
    width: 250,
    backgroundColor: '#f5f5f5',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
    padding: 16,
  },
  title: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  divider: {
    marginBottom: 16,
  },
  navButton: {
    marginBottom: 8,
  },
  infoBox: {
    marginTop: 32,
    padding: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
  }
}); 