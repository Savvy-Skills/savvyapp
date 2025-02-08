import { TraceConfig } from "@/components/data/DataVisualizerPlotly";
import { NNState } from "./neuralnetwork";

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
	published: boolean;
}

export interface ModuleInfo {
	readonly created_at: number;
	readonly id: number;
	name: string;
	description: string;
	course_id: number;
	published: boolean;
}

export interface Module extends ModuleInfo {
	course_info: Course;
	views: ViewType[];
	views_progress: ViewProgress[];
	image: Image;
}

export interface ViewInfo {
	video: string;
	slides: number;
	questions: number;
	activities: number;
	intro_image: string;
}

interface BaseView {
	view_id: number;
	order: number;
}

export interface ViewType extends BaseView {
	readonly id: number;
	readonly created_at: number;
	name: string;
	description: string;
	class_id: number;
	owner_id: number;
	shared_user_ids: number[];
	savvy: boolean;
	content_id?: string;
	view_info: ViewInfo;
	module_id: number;
	quiz: boolean;
	published: boolean;
	type: "lesson" | "example" | "tool";
	slides: BaseSlide[];
}

export interface ViewWithSlides {
	readonly id: number;
	view_info: ViewInfo;
	name: string;
	class_id: number;
	content_id: string;
	slides: Slide[];
	view_content: ContentInfo;
	module_id: number;
	progress: Progress;
	quiz: boolean;
	readonly timestamp: number;
	module_info: Module;
	published: boolean;
}
export interface Progress {
	readonly id: string;
	readonly created_at: number;
	user_id: number;
	view_id: number;
	slide_n: number;
	class_id: number;
}

export interface BareSlide {
	readonly slide_id: number;
	order: number;
}

interface ContentResponse extends ContentInfo {
	content_id: string;
	order: number;
}

export interface BaseSlide extends BareSlide {
	readonly created_at: number;
	published: boolean;
	module_id: number;
	type: "Assessment" | "Content" | "Activity" | "Custom";
	contents: ContentResponse[];
	name: string;
	subtype?: string;
	buttonLabel?: string;
}

export interface AssessmentSlide extends BaseSlide {
	type: "Assessment";
	assessment_id: number;
	assessment_info: QuestionInfo;
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
	subtype: "intro" | "outro" | "mid";
	image?: string;
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

export interface Answer {
	text: string;
	order?: number;
	match?: string;
}

export interface BaseSubmission {
	assessment_id: number;
	isCorrect: boolean;
	answer: Answer[];
	views_id: number;
	revealed: boolean;
}

export interface Submission extends BaseSubmission {
	id: number;
	created_at: number;
	submissionTime: number;
	student_id?: number;
}

export interface ViewProgress {
	readonly id?: string;
	readonly created_at: number;
	user_id: number;
	view_id: number;
	class_id: number;
	progress: any[];
	timestamp: number;
}

type ContentTypes = "Video" | "Image" | "Rich Text" | "Dataset" | "Neural Network" | "Activity";

export interface ContentInfo {
	readonly created_at: number;
	readonly id: string;
	type: ContentTypes;
	url: string;
	state: string;
	title: string;
	image: Image;
	dataset_id?: string;
	dataset_info?: DatasetInfo;
	traces?: TraceConfig[];
	nnState?: NNState;
}

type QuestionTypes =
	| "Multiple Choice"
	| "Single Choice"
	| "True or False"
	| "Fill in the Blank"
	| "Order List"
	| "Open Ended"
	| "Numerical"
	| "Match the Words"
	| "Drag and Drop"
	| "True or False";

type QuestionSubtypes = "Text" | "Image";

export type NumericOperator = "gt" | "gte" | "lt" | "lte" | "eq" | "neq";

interface ExtrasInfo {
	text?: string;
	text2?: string;
	operator: NumericOperator;
	filterable: boolean;
	table: boolean;
	plot: boolean;
	traces: any[];
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

export interface BaseFeedback {
	type: string;
	text: string;
	extra_info: any;
}

export interface Feedback extends BaseFeedback {
	readonly id: string;
	readonly created_at: number;
	user_id: number;
}
