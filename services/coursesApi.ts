import {
  BaseFeedback,
  BaseSubmission,
  Course,
  Feedback,
  ViewWithSlides,
  ViewProgress,
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



export const getModule = async (
  module_id: number
): Promise<Module> => {
  try {
    const response = await courses_api.get<Module>(
      `/modules/${module_id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching module", error);
    return {} as Module;
  }
};

export const getViewProgress = async (
  view_id: number
): Promise<ViewProgress> => {
  try {
    const response = await courses_api.get<ViewProgress>(
      `/views/${view_id}/progress`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching view progress", error);
    return {} as ViewProgress;
  }
};

export const postViewProgress = async (
  view_id: number,
  progress: boolean[]
): Promise<ViewProgress> => {
  try {
    const response = await courses_api.post<ViewProgress>(
      `/views/${view_id}/progress`,
      { progress }
    );
    return response.data;
  } catch (error) {
    console.error("Error posting view progress", error);
    return {} as ViewProgress;
  }
};

export const getViewSubmissions = async (
  view_id: number
): Promise<Submission[]> => {
  try {
    const response = await courses_api.get<Submission[]>(
      `/views/${view_id}/submissions`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching view submissions", error);
    return [];
  }
};

export const postViewSubmission = async (
  view_id: number,
  submission: BaseSubmission
): Promise<Submission> => {
  try {
    const response = await courses_api.post<Submission>(
      `/views/${view_id}/submissions`,
      submission
    );
    return response.data;
  } catch (error) {
    console.error("Error posting view submission", error);
    return {} as Submission;
  }
};

export const getViewByID = async (id: number): Promise<ViewWithSlides> => {
  try {
    const response = await courses_api.get<ViewWithSlides[]>(`/views/${id}`);
    return response.data[0];
  } catch (error) {
    console.error("Error fetching module", error);
    return {} as ViewWithSlides;
  }
};

export const restartView = async (view_id: number): Promise<void> => {
  try {
    await courses_api.post(`/views/${view_id}/restart`);
  } catch (error) {
    console.error("Error restarting view", error);
  }
};

export const getAllFeedback = async (): Promise<Feedback[]> => {
  try {
    const response = await courses_api.get<Feedback[]>(`/feedback`);
    return response.data;
  } catch (error) {
    console.error("Error fetching feedback", error);
    return [];
  }
};

export const postFeedback = async (
  feedback: BaseFeedback
): Promise<Feedback> => {
  try {
    const response = await courses_api.post<Feedback>(`/feedback`, feedback);
    return response.data;
  } catch (error) {
    console.error("Error posting feedback", error);
    return {} as Feedback;
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
