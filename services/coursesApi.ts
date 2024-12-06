import {
	BaseSubmission,
  Course,
  Lesson,
  LessonProgress,
  LessonWithSlides,
  Module,
  Submission,
} from "../types";
import { createAPI } from "./apiConfig";

export const courses_api = createAPI("courses");

export const getCourses = async (): Promise<Course[]> => {
  try {
    const response = await courses_api.get<Course[]>(`/courses`);
    return response.data;
  } catch (error) {
    console.error("Error fetching modules", error);
    return [];
  }
};

export const getModules = async (): Promise<Module[]> => {
  try {
    const response = await courses_api.get<Module[]>(`/modules`);
    return response.data;
  } catch (error) {
    console.error("Error fetching modules", error);
    return [];
  }
};

interface CourseModules {
  modules: Module[];
  course_info: Course;
}

export const getCourseModules = async (
  course_id: number
): Promise<CourseModules> => {
  try {
    const response = await courses_api.get<CourseModules>(
      `/courses/${course_id}/modules`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching modules", error);
    return {} as CourseModules;
  }
};

interface ModuleLessons {
  lessons: Lesson[];
  module: Module;
}

export const getModuleLessons = async (
  module_id: number
): Promise<ModuleLessons> => {
  try {
    const response = await courses_api.get<ModuleLessons>(
      `/modules/${module_id}/lessons`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching lessons", error);
    return {} as ModuleLessons;
  }
};

export const getLessonProgress = async (
  lesson_id: number
): Promise<LessonProgress> => {
  try {
    const response = await courses_api.get<LessonProgress>(
      `/lessons/${lesson_id}/progress`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching lesson progress", error);
    return {} as LessonProgress;
  }
};

export const postLessonProgress = async (
  lesson_id: number,
  progress: boolean[]
): Promise<LessonProgress> => {
  try {
    const response = await courses_api.post<LessonProgress>(
      `/lessons/${lesson_id}/progress`,
      { progress }
    );
    return response.data;
  } catch (error) {
    console.error("Error posting lesson progress", error);
    return {} as LessonProgress;
  }
};

export const getLessonSubmissions = async (
  lesson_id: number
): Promise<Submission[]> => {
  try {
    const response = await courses_api.get<Submission[]>(
      `/lessons/${lesson_id}/submissions`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching lesson submissions", error);
    return [];
  }
};

export const postLessonSubmission = async (
  lesson_id: number,
  submission: BaseSubmission
): Promise<Submission> => {
  try {
	const response = await courses_api.post<Submission>(
	  `/lessons/${lesson_id}/submissions`,
	  submission
	);
	return response.data;
  } catch (error) {
	console.error("Error posting lesson submission", error);
	return {} as Submission;
  }
}

export const getLessonByID = async (id: number): Promise<LessonWithSlides> => {
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
