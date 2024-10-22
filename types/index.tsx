
export interface Module {
  id: number;
  created_at: number;
  name: string;
  description: string;
  class_id: number;
  owner_id: number;
  shared_user_ids: number[];
  savvy_module: boolean;
  content_id?: string;
  module_info: any;
  slides: BaseSlide[];
}

export interface ModuleWithSlides {
  id: number;
  name: string;
  class_id: number;
  content_id: string;
  slides: Slide[];
  module_content: ContentInfo;
  timestamp: number;
  progress: Progress;
}

export interface BaseSlide {
  slide_id: number;
  order: number;
}

export interface Slide extends BaseSlide {
  created_at: number;
  published: boolean;
  module_id: number;
  type: string;
  question_id: number;
  content_id?: string;
  activity_id?: string;
  question_info?: QuestionInfo;
  content_info?: ContentInfo;
  activity_info?: ActivityInfo;
}

export interface ActivityInfo {
  created_at: number;
  type: string;
  url: string;
  state: string;
  title: string;
  images: any[];
}

export interface ContentInfo {
  created_at: number;
  type: string;
  url: string;
  state: string;
  title: string;
  images: any[];
}

export interface QuestionInfo {
  created_at: number;
  title: string;
  instruction: string;
  text: string;
  type: string;
  AnswerType: string;
  GradingScale: number;
  Explanation: string;
  Dataset?: string;
  Context: string;
  options: Option[];
}

export interface Option {
  text: string;
  isCorrect: boolean;
  correctOrder: number;
  Type: string;
}

export interface Progress {
  id: string;
  created_at: number;
  user_id: number;
  module_id: number;
  slide_n: number;
  class_id: number;
}
