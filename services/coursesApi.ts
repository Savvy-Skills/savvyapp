import { Course, Lesson, LessonWithSlides, Module } from "../types";
import { createAPI } from "./apiConfig";

export const courses_api = createAPI("courses");

export const getCourses = async (): Promise<Course[]> =>{
	try {
		const response = await courses_api.get<Course[]>(
		  `/courses`
		);
		return response.data;
	  } catch (error) {
		console.error("Error fetching modules", error);
		return [];
	  }
}


export const getModules = async (): Promise<Module[]> => {
  try {
    const response = await courses_api.get<Module[]>(
      `/modules`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching modules", error);
    return [];
  }
};
export const getCourseModules = async (course_id: number): Promise<Module[]> => {
  try {
    const response = await courses_api.get<Module[]>(
      `/courses/${course_id}/modules`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching modules", error);
    return [];
  }
};

export const getModuleLessons = async (
  module_id: number
): Promise<Lesson[]> => {
  try {
    const response = await courses_api.get<Lesson[]>(
      `/modules/${module_id}/lessons`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching lessons", error);
    return [];
  }
};

export const getLessonsByID = async (id: number): Promise<LessonWithSlides> => {
  try {
    const response = await courses_api.get<LessonWithSlides[]>(
      `/lessons/${id}`
    );
    return response.data[0];
  } catch (error) {
    console.error("Error fetching module", error);
    return {} as LessonWithSlides;
  }
};

courses_api.interceptors.request.use(
  (config) => {
    config.headers["Content-Type"] = "multipart/form-data";
    return config;
  },
  (error) => {
    // Do something with request error
    console.error("Request error", error);
    return Promise.reject(error);
  }
);
