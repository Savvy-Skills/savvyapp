import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import AdminSidebar from '@/components/admin/AdminSidebar';
import CourseManager from '@/components/admin/CourseManager';
import ModuleManager from '@/components/admin/ModuleManager';
import ViewManager from '@/components/admin/ViewManager';
import SlideManager from '@/components/admin/SlideManager';
import ScreenWrapper from '@/components/screens/ScreenWrapper';
import { useAuthStore } from '@/store/authStore';
import { router, useLocalSearchParams } from 'expo-router';

export type AdminSection = 'courses' | 'modules' | 'views' | 'slides';

export default function AdminDashboard() {
	const { user } = useAuthStore();
	const [isMounted, setIsMounted] = React.useState(false);
	
	// Get parameters from URL using Expo Router
	const params = useLocalSearchParams();
	const section = (params.section as AdminSection) || 'courses';
	const courseId = params.courseId ? Number(params.courseId) : null;
	const moduleId = params.moduleId ? Number(params.moduleId) : null;
	const viewId = params.viewId ? Number(params.viewId) : null;

	useEffect(() => {
		setIsMounted(true);
		return () => setIsMounted(false);
	}, []);

	useEffect(() => {
		if (isMounted && user && user?.role?.name !== 'Savvy') {
			// Only navigate after the component is fully mounted
			router.replace('/home');
		}
	}, [user, isMounted]);

	// Update URL when selections change
	const updateUrlParams = (newParams: {
		section?: AdminSection;
		courseId?: number | null;
		moduleId?: number | null;
		viewId?: number | null;
	}) => {
		// Build new URL parameters
		const urlParams: Record<string, string> = {};
		
		// Keep existing parameters unless explicitly changed
		if (newParams.section) urlParams.section = newParams.section;
		else if (section) urlParams.section = section;
		
		if (newParams.courseId !== undefined) {
			if (newParams.courseId !== null) urlParams.courseId = newParams.courseId.toString();
		} else if (courseId !== null) {
			urlParams.courseId = courseId.toString();
		}
		
		if (newParams.moduleId !== undefined) {
			if (newParams.moduleId !== null) urlParams.moduleId = newParams.moduleId.toString();
		} else if (moduleId !== null) {
			urlParams.moduleId = moduleId.toString();
		}
		
		if (newParams.viewId !== undefined) {
			if (newParams.viewId !== null) urlParams.viewId = newParams.viewId.toString();
		} else if (viewId !== null) {
			urlParams.viewId = viewId.toString();
		}
		
		// Update the URL using Expo Router
		router.replace({
			pathname: '/(misc)/admin',
			params: urlParams
		});
	};

	const handleCourseSelect = (id: number) => {
		updateUrlParams({
			courseId: id,
			moduleId: null,
			viewId: null,
			section: 'modules'
		});
	};

	const handleModuleSelect = (id: number) => {
		updateUrlParams({
			moduleId: id,
			viewId: null,
			section: 'views'
		});
	};

	const handleViewSelect = (id: number) => {
		updateUrlParams({
			viewId: id,
			section: 'slides'
		});
	};

	const handleSectionChange = (newSection: AdminSection) => {
		updateUrlParams({ section: newSection });
	};

	// Handle back button actions
	const handleBackToCourses = () => {
		updateUrlParams({
			section: 'courses',
			moduleId: null,
			viewId: null
		});
	};

	const handleBackToModules = () => {
		updateUrlParams({
			section: 'modules',
			viewId: null
		});
	};

	const renderContent = () => {
		switch (section) {
			case 'courses':
				return <CourseManager onCourseSelect={handleCourseSelect} selectedCourseId={courseId} />;
			case 'modules':
				return (
					<ModuleManager
						courseId={courseId}
						selectedModuleId={moduleId}
						onModuleSelect={handleModuleSelect}
						onBack={handleBackToCourses}
					/>
				);
			case 'views':
				return (
					<ViewManager
						moduleId={moduleId}
						selectedViewId={viewId}
						onViewSelect={handleViewSelect}
						onBack={handleBackToModules}
					/>
				);
			case 'slides':
				return (
					<SlideManager 
						viewId={viewId} 
						onBack={() => updateUrlParams({ section: 'views' })}
					/>
				);
			default:
				return <Text>Select a section from the sidebar</Text>;
		}
	};

	// If not authorized, render nothing while redirecting
	if (user && user?.role?.name !== 'Savvy') {
		return null;
	}

	return (
		<ScreenWrapper>
			<View style={styles.container}>
				<AdminSidebar
					activeSection={section}
					onSectionChange={handleSectionChange}
					courseId={courseId}
					moduleId={moduleId}
					viewId={viewId}
				/>
				<View style={styles.content}>
					{renderContent()}
				</View>
			</View>
		</ScreenWrapper>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'row',
	},
	content: {
		flex: 1,
		padding: 20,
	},
}); 