import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import AdminSidebar from '@/components/admin/AdminSidebar';
import CourseManager from '@/components/admin/CourseManager';
import ModuleManager from '@/components/admin/ModuleManager';
import ViewManager from '@/components/admin/ViewManager';
import SlideManager from '@/components/admin/SlideManager';
import ScreenWrapper from '@/components/screens/ScreenWrapper';
import { useAuthStore } from '@/store/authStore';
import { router } from 'expo-router';

export type AdminSection = 'courses' | 'modules' | 'views' | 'slides';

export default function AdminDashboard() {
	const [activeSection, setActiveSection] = useState<AdminSection>('courses');
	const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
	const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
	const [selectedViewId, setSelectedViewId] = useState<number | null>(null);
	const { user } = useAuthStore();
	const [isMounted, setIsMounted] = useState(false);

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

	const handleCourseSelect = (courseId: number) => {
		setSelectedCourseId(courseId);
		setSelectedModuleId(null);
		setSelectedViewId(null);
		setActiveSection('modules');
	};

	const handleModuleSelect = (moduleId: number) => {
		setSelectedModuleId(moduleId);
		setSelectedViewId(null);
		setActiveSection('views');
	};

	const handleViewSelect = (viewId: number) => {
		setSelectedViewId(viewId);
		setActiveSection('slides');
	};

	const renderContent = () => {
		switch (activeSection) {
			case 'courses':
				return <CourseManager onCourseSelect={handleCourseSelect} />;
			case 'modules':
				return (
					<ModuleManager
						courseId={selectedCourseId}
						onModuleSelect={handleModuleSelect}
					/>
				);
			case 'views':
				return (
					<ViewManager
						moduleId={selectedModuleId}
						onViewSelect={handleViewSelect}
					/>
				);
			case 'slides':
				return <SlideManager viewId={selectedViewId} />;
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
					activeSection={activeSection}
					onSectionChange={setActiveSection}
					courseId={selectedCourseId}
					moduleId={selectedModuleId}
					viewId={selectedViewId}
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