export interface Course {
  readonly id: number;
  readonly created_at: number;
  name: string;
  description: string;
  image: Image;
  grade_level: string;
  tags: string[];
  type: "Savvy" | "Own";
  duration: number;
}

export interface Module {
  readonly id: number;
  readonly created_at: number;
  name: string;
  description: string;
  course_id: number;
  course_info: Course;
  lessons: Lesson[];
}

export interface LessonInfo {
  video: string;
  slides: number;
  questions: number;
  activities: number;
}

export interface Lesson {
  readonly id: number;
  readonly created_at: number;
  name: string;
  description: string;
  class_id: number;
  owner_id: number;
  shared_user_ids: number[];
  savvy_lesson: boolean;
  content_id?: string;
  lesson_info: LessonInfo;
  module_id: number;
  quiz: boolean;
  slides: BaseSlide[];
}

export interface LessonWithSlides {
  readonly id: number;
  name: string;
  class_id: number;
  content_id: string;
  slides: Slide[];
  lesson_content: ContentInfo;
  module_id: number;
  progress: Progress;
  quiz: boolean;
  readonly timestamp: number;
}
export interface Progress {
  readonly id: string;
  readonly created_at: number;
  user_id: number;
  lesson_id: number;
  slide_n: number;
  class_id: number;
}

export interface BareSlide {
  readonly slide_id: number;
  order: number;
  quizMode: boolean;
}

export interface BaseSlide extends BareSlide {
  readonly created_at: number;
  published: boolean;
  module_id: number;
  type: "Assessment" | "Content" | "Activity" | "Custom";
}

export interface AssessmentSlide extends BaseSlide {
  type: "Assessment";
  question_id: number;
  question_info: QuestionInfo;
}

export interface ContentSlide extends BaseSlide {
  type: "Content";
  content_id: string;
  content_info: ContentInfo;
}

export interface ActivitySlide extends BaseSlide {
  type: "Activity";
  activity_id: string;
  activity_info: ActivityInfo;
}
export interface CustomSlide extends BaseSlide {
  type: "Custom";
  subtype: "first" | "last";
}

export type Slide =
  | AssessmentSlide
  | ContentSlide
  | ActivitySlide
  | CustomSlide;

export interface ActivityInfo {
  readonly created_at: number;
  readonly id: string;
  name: string;
  dataset_id: string;
  steps: number;
}

type ContentTypes = "Video" | "Image" | "Rich Text";

export interface ContentInfo {
  readonly created_at: number;
  readonly id: string;
  type: ContentTypes;
  url: string;
  state: string;
  title: string;
  image: Image;
}

export interface Submission {
  question_id: number;
  correct: boolean;
  answer?: string[];
}

type QuestionTypes =
  | "Multiple Choice"
  | "Single Choice"
  | "True or False"
  | "Fill in the Blank"
  | "Order List"
  | "Open Ended"
  | "Numerical"
  | "Match the Words";

type QuestionSubtypes = "Text" | "Image";

export type NumericOperator = "gt" | "gte" | "lt" | "lte" | "eq" | "neq";

interface ExtrasInfo {
  text?: string;
  text2?: string;
  operator: NumericOperator;
}

export interface QuestionInfo {
  readonly created_at: number;
  id: number;
  title: string;
  text: string;
  type: QuestionTypes;
  answerType: string;
  gradingScale: number;
  explanation: string;
  dataset?: string;
  context: string;
  options: Option[];
  dataset_info?: DatasetInfo;
  extras?: ExtrasInfo;
  subtype?: QuestionSubtypes;
}

export interface DatasetInfo {
  id: string;
  type: string;
  extension: string;
  name: string;
  url: string;
  metadata: Metadata;
  about: string;
  description: string;
  image_url: string;
  disabled: boolean;
}
export interface Metadata {
  rows: number;
  columns: number;
}

export interface Option {
  text: string;
  isCorrect: boolean;
  correctOrder: number;
  match: string;
}

export interface Image {
  url: string;
  description?: string;
}

export interface LoginResponse {
  auth_token: string;
}

export interface User {
  id: number;
  created_at: number;
  name: string;
  email: string;
  districts_id: number;
  profile_picture: string;
  birthdate: string;
  google_oauth: GoogleOauth;
  schools: School[];
}

export interface GoogleOauth {
  id: string;
  name: string;
  email: string;
}

export interface School {
  schools_id: number;
  roles_app_id: number;
  active: boolean;
  school_info: SchoolInfo;
  role_info: RoleInfo;
}

export interface SchoolInfo {
  created_at: number;
  Name: string;
  Logo?: Logo;
}

export interface Logo {
  path: string;
  name: string;
  url: string;
}

export interface RoleInfo {
  Role_Name: string;
  Rank_Value: number;
}
