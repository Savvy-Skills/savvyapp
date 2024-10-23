export interface ModuleInfo {
  video: string;
  slides: number;
  sections: Section[];
  questions: number;
  activities: number;
}

export interface Section {
  name: string;
  section_slides: SectionSlide[];
}

export interface SectionSlide {
  slide: number;
  title: string;
}

export interface Module {
  readonly id: number;
  readonly created_at: number;
  name: string;
  description: string;
  class_id: number;
  owner_id: number;
  shared_user_ids: number[];
  savvy_module: boolean;
  content_id?: string;
  module_info: ModuleInfo;
  slides: BaseSlide[];
}

export interface ModuleWithSlides {
  readonly id: number;
  name: string;
  class_id: number;
  content_id: string;
  slides: Slide[];
  module_content: ContentInfo;
  readonly timestamp: number;
  progress: Progress;
}
export interface Progress {
	readonly id: string;
	readonly created_at: number;
	user_id: number;
	module_id: number;
	slide_n: number;
	class_id: number;
  }

export interface BareSlide {
  readonly slide_id: number;
  order: number;
}

export interface BaseSlide extends BareSlide {
  readonly created_at: number;
  published: boolean;
  module_id: number;
  type: 'Assessment' | 'Content' | 'Activity';
}

export interface AssessmentSlide extends BaseSlide {
  type: 'Assessment';
  question_id: number;
  question_info: QuestionInfo;
}

export interface ContentSlide extends BaseSlide {
  type: 'Content';
  content_id: string;
  content_info: ContentInfo;
}

export interface ActivitySlide extends BaseSlide {
  type: 'Activity';
  activity_id: string;
  activity_info: ActivityInfo;
}

export type Slide = AssessmentSlide | ContentSlide | ActivitySlide;

export interface ActivityInfo {
  readonly created_at: number;
  name: string;
  dataset_id: string;
  steps: number;
}

type ContentTypes = "Video" | "Image" | "Rich Text";

export interface ContentInfo {
  readonly created_at: number;
  type: ContentTypes;
  url: string;
  state: string;
  title: string;
  image: Image;
}

type QuestionTypes = "Multiple Choice" | "Single Choice" | "True or False" | "Fill in the Blank" | "Order List" | "Open Ended" | "Numerical" | "Match the Words";

export interface QuestionInfo {
  readonly created_at: number;
  title: string;
  instruction: string;
  text: string;
  type: QuestionTypes;
  answerType: string;
  gradingScale: number;
  explanation: string;
  dataset?: string;
  context: string;
  options: Option[];
}

export interface Option {
  text: string;
  isCorrect: boolean;
  correctOrder: number;
  type: string;
}

export interface Image {
  url: string;
  description?: string;
}