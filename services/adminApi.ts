import { Course, Module, ViewWithSlides, LocalSlide } from "@/types";
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

export const updateSlide = async (viewId: number, slideId: number, slideData: Partial<LocalSlide>): Promise<LocalSlide> => {
  try {
    const response = await admin_api.put<LocalSlide>(`/views/${viewId}/slides/${slideId}`, slideData);
    return response.data;
  } catch (error) {
    console.error("Error updating slide", error);
    throw error;
  }
};

export const disableSlide = async (viewId: number, slideId: number): Promise<void> => {
  try {
    await admin_api.put(`/views/${viewId}/slides/${slideId}/disable`);
  } catch (error) {
    console.error("Error deleting slide", error);
    throw error;
  }
};

// Reorder slides
export const reorderSlides = async (viewId: number, slideIds: number[]): Promise<void> => {
  try {
    await admin_api.post(`/views/${viewId}/reorder-slides`, { slideIds });
  } catch (error) {
    console.error("Error reordering slides", error);
    throw error;
  }
}; 