import { Course, Module, ViewWithSlides, LocalSlide, Assessment, ContentInfo } from "@/types/index";
import { createAPI } from "./apiConfig";

export const admin_api = createAPI("admin");

// Courses API calls
export const createCourse = async (courseData: Partial<Course>): Promise<Course> => {
  try {
    const response = await admin_api.post<Course>('/courses', courseData);
    return response.data;
  } catch (error) {
    console.error("Error creating course", error);
    throw error;
  }
};

export const updateCourse = async (courseId: number, courseData: Partial<Course>): Promise<Course> => {
  try {
    const response = await admin_api.post<Course>(`/courses`, {...courseData, id: courseId});
    return response.data;
  } catch (error) {
    console.error("Error updating course", error);
    throw error;
  }
};


export const disableCourse = async (courseId: number): Promise<void> => {
  try {
    await admin_api.put(`/courses/${courseId}/disable`);
  } catch (error) {
    console.error("Error deleting course", error);
    throw error;
  }
};

// Modules API calls
export const createModule = async (courseId: number, moduleData: Partial<Module>): Promise<Module> => {
  try {
    const response = await admin_api.post<Module>(`/courses/${courseId}/modules`, moduleData);
    return response.data;
  } catch (error) {
    console.error("Error creating module", error);
    throw error;
  }
};

export const updateModule = async (moduleId: number, moduleData: Partial<Module>): Promise<Module> => {
  try {
    const response = await admin_api.put<Module>(`/modules/${moduleId}`, moduleData);
    return response.data;
  } catch (error) {
    console.error("Error updating module", error);
    throw error;
  }
};

export const disableModule = async (moduleId: number): Promise<void> => {
  try {
    await admin_api.put(`/modules/${moduleId}/disable`);
  } catch (error) {
    console.error("Error deleting module", error);
    throw error;
  }
};

// Views API calls
export const createView = async (moduleId: number, viewData: Partial<ViewWithSlides>): Promise<ViewWithSlides> => {
  try {
    const response = await admin_api.post<ViewWithSlides>(`/modules/${moduleId}/views`, viewData);
    return response.data;
  } catch (error) {
    console.error("Error creating view", error);
    throw error;
  }
};

export const updateView = async (viewId: number, viewData: Partial<ViewWithSlides>): Promise<ViewWithSlides> => {
  try {
    const response = await admin_api.put<ViewWithSlides>(`/views/${viewId}`, viewData);
    return response.data;
  } catch (error) {
    console.error("Error updating view", error);
    throw error;
  }
};

export const disableView = async (viewId: number): Promise<void> => {
  try {
    await admin_api.put(`/views/${viewId}/disable`);
  } catch (error) {
    console.error("Error deleting view", error);
    throw error;
  }
};

// Slides API calls
export const createSlide = async (viewId: number, slideData: Partial<LocalSlide>): Promise<LocalSlide> => {
  try {
    const response = await admin_api.post<LocalSlide>(`/views/${viewId}/slides`, slideData);
    return response.data;
  } catch (error) {
    console.error("Error creating slide", error);
    throw error;
  }
};

export const updateSlide = async (slideId: number, slideData: Partial<LocalSlide>): Promise<LocalSlide> => {
  try {
    const response = await admin_api.put<LocalSlide>(`/slides/${slideId}`, slideData);
    return response.data;
  } catch (error) {
    console.error("Error updating slide", error);
    throw error;
  }
};

export type SlidesOrder = {
  slide_id: number;
  order: number;
}
// Reorder slides
export const reorderSlides = async (viewId: number, slides: SlidesOrder[]): Promise<void> => {
  try {
    await admin_api.post(`/views/${viewId}/slidesorder`, { slides });
  } catch (error) {
    console.error("Error reordering slides", error);
    throw error;
  }
};

interface AssessmentData extends Assessment {
  slideName?: string;
}

// Create Assessment (This will create an assessment and return the assessment object)
export const createAssessment = async (assessmentData: AssessmentData): Promise<Assessment> => {
  try {
    const response = await admin_api.post<Assessment>('/assessments', assessmentData);
    return response.data;
  } catch (error) {
    console.error("Error creating assessment", error);
    throw error;
  }
};

// Get all assessments
export const getAssessments = async (): Promise<Assessment[]> => {
  try {
    const response = await admin_api.get<Assessment[]>('/assessments');
    return response.data;
  } catch (error) {
    console.error("Error getting assessments", error);
    throw error;
  }
};

// Get all contents
export const getContents = async (): Promise<ContentInfo[]> => {
  try {
    const response = await admin_api.get<ContentInfo[]>('/contents');
    return response.data;
  } catch (error) {
    console.error("Error getting contents", error);
	throw error;
  }
};

// Create Content (This will create a content and return the content object)
export const createContent = async (contentData: Partial<ContentInfo>): Promise<ContentInfo> => {
  try {
    const response = await admin_api.post<ContentInfo>('/contents', contentData);
    return response.data;
  } catch (error) {
	console.error("Error creating content", error);
	throw error;
  }
};
