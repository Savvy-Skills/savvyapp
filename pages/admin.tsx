import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter, useSearchParams } from 'next/navigation';
import { Text } from 'react-native-paper';
import CourseManager from '@/components/admin/CourseManager';
import ModuleManager from '@/components/admin/ModuleManager';
import ViewManager from '@/components/admin/ViewManager';
import SlideManager from '@/components/admin/SlideManager';
import styles from '@/styles/styles';

export default function AdminPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get parameters from URL
  const courseId = searchParams.get('courseId') ? Number(searchParams.get('courseId')) : null;
  const moduleId = searchParams.get('moduleId') ? Number(searchParams.get('moduleId')) : null;
  const viewId = searchParams.get('viewId') ? Number(searchParams.get('viewId')) : null;
  
  // Update URL with new parameters
  const updateUrlParams = (params: {
    courseId?: number | null;
    moduleId?: number | null;
    viewId?: number | null;
  }) => {
    const newParams = new URLSearchParams(searchParams.toString());
    
    // Update or remove courseId
    if (params.courseId !== undefined) {
      if (params.courseId === null) {
        newParams.delete('courseId');
      } else {
        newParams.set('courseId', params.courseId.toString());
      }
    }
    
    // Update or remove moduleId
    if (params.moduleId !== undefined) {
      if (params.moduleId === null) {
        newParams.delete('moduleId');
      } else {
        newParams.set('moduleId', params.moduleId.toString());
      }
    }
    
    // Update or remove viewId
    if (params.viewId !== undefined) {
      if (params.viewId === null) {
        newParams.delete('viewId');
      } else {
        newParams.set('viewId', params.viewId.toString());
      }
    }
    
    // Push the new URL
    router.push(`/admin?${newParams.toString()}`);
  };

  const handleCourseSelect = (id: number) => {
    updateUrlParams({ courseId: id, moduleId: null, viewId: null });
  };

  const handleModuleSelect = (id: number) => {
    updateUrlParams({ moduleId: id, viewId: null });
  };

  const handleViewSelect = (id: number) => {
    updateUrlParams({ viewId: id });
  };

  return (
    <View style={localStyles.container}>
      <Text variant="headlineLarge" style={localStyles.title}>Admin Dashboard</Text>
      
      <View style={localStyles.row}>
        <View style={localStyles.column}>
          <CourseManager onCourseSelect={handleCourseSelect} selectedCourseId={courseId} />
        </View>
      </View>
      
      {courseId !== null && (
        <View style={localStyles.row}>
          <View style={localStyles.column}>
            <ModuleManager 
              courseId={courseId} 
              onModuleSelect={handleModuleSelect} 
              selectedModuleId={moduleId}
            />
          </View>
        </View>
      )}
      
      {moduleId !== null && (
        <View style={localStyles.row}>
          <View style={localStyles.column}>
            <ViewManager 
              moduleId={moduleId} 
              onViewSelect={handleViewSelect} 
              selectedViewId={viewId}
            />
          </View>
        </View>
      )}
      
      {viewId !== null && (
        <View style={localStyles.row}>
          <View style={localStyles.column}>
            <SlideManager viewId={viewId} />
          </View>
        </View>
      )}
    </View>
  );
}

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    marginBottom: 20,
  },
  row: {
    marginBottom: 20,
  },
  column: {
    flex: 1,
  },
}); 