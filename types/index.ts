import { TraceConfig } from "@/components/data/DataVisualizerPlotly";
import { NNState } from "./neuralnetwork";

export interface Course {
	readonly id: number;
	readonly created_at: number;
	name: string;
	description: string;
	image_url: string;
	grade_level: string;
	tags: string[];
	type: "Savvy" | "Own";
	duration: number;
	published: boolean;
	modules: [{
		readonly module_id: number;
		order: number;
		module_info?: Module;
	}];
}

export interface ClassConfig {
	value: string;
	emoji?: string;
	color: string;
}

export interface NeuronVisualizationProps {
	config: NeuronConfig;
	dataset_info?: DatasetInfo;
}

export interface NeuronConfig {
	axes: {
		x: {
			name: string;
			emoji?: string;
			min?: number;
			max?: number;
			tickValues?: number[];
			tickText?: string[];
			suffix?: string;
			prefix?: string;
			useTickText?: boolean;
		};
		y: {
			name: string;
			emoji?: string;
			min?: number;
			max?: number;
			tickValues?: number[];
			tickText?: string[];
			suffix?: string;
			prefix?: string;
			useTickText?: boolean;
		};
	};
	classes: {
		negative: ClassConfig;
		neutral: ClassConfig;
		positive: ClassConfig;
	};
	initialValues: {
		weight1: number;
		weight2: number;
		bias: number;
	};
	locked: {
		weight1?: boolean;
		weight2?: boolean;
		bias?: boolean;
	};
	useVerticalSlider?: boolean;
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
	image_url: string;
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
	type: "lesson" | "example" | "tool" | "post";
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
	progress: Progress;
	quiz: boolean;
	readonly timestamp: number;
	module_info: Module;
	published: boolean;
	type: "lesson" | "example" | "tool" | "post";
}
export interface Progress {
	readonly id: string;
	readonly created_at: number;
	user_id: number;
	view_id: number;
	class_id: number;
	progress: boolean[];
}

export interface BareSlide {
	readonly slide_id: number;
	order: number;
}

interface ContentResponse extends ContentInfo {
	content_id: string;
	order: number;
}

interface ImageType {
	access: string;
	path: string;
	name: string;
	type: string;
	size: number;
	mime: string;
	meta: {
		width: number;
		height: number;
	}
}

interface VideoType {
	access: string;
	path: string;
	name: string;
	type: string;
	size: number;
	mime: string;
	meta: {
		duration: number;
		video: {
			codec: string;
			profile: string;
			res: string;
			postWidth: number;
			postHeight: number;
			fps: number;
			bitrate: number;
			dar: number;
			par: boolean;
		};
		audio: {
			codec: string;
			freq: number;
			bitrate: number;
		};
	}
}
export interface ImageResponse { 
	url: string;
	image: ImageType;
}

export interface VideoResponse {
	url: string;
	video: VideoType;
}

export type SlideTypes = "Assessment" | "Content" | "Activity" | "Custom";

export interface BaseSlide extends BareSlide {
	readonly created_at: number;
	published: boolean;
	module_id: number;
	type: SlideTypes;
	contents?: ContentResponse[];
	name: string;
	subtype?: string;
	buttonLabel?: string;
}

export interface AssessmentSlide extends BaseSlide {
	type: "Assessment";
	assessment_id: number;
	assessment_info: AssessmentInfo;
}

export interface ContentSlide extends BaseSlide {
	type: "Content";
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

export type ViewStatus = "LOADING" | "READY" | "ERROR" | "RESTARTING";

export interface view extends Omit<ViewWithSlides, "slides"> { }

export interface ViewStore {
	viewId: number | null;
	viewStatus: ViewStatus;
	skipAssessments: boolean;
	setSkipAssessments: (skip: boolean) => void;
	slides: LocalSlide[];
	currentSlideIndex: number;
	setCurrentSlideIndex: (index: number) => void;
	fetchViewData: (viewId: number) => Promise<void>;
	nextSlide: () => void;
	prevSlide: () => void;
	toggleExplanation: () => void;
	revealAnswer: () => void;
	submitAnswer: () => void;
	view: ViewWithSlides | null;
	setAnswer: (answer: Answer[], isCorrect: boolean, notSubmittable?: boolean) => void;
	restartView: () => void;
	tryAgain: () => void;
	completeSlide: (index: number) => void;
	submitProgress: () => void;
	trigger: string | null;
	setTrigger: (trigger: string) => void;
	resetTrigger: () => void;
	checkSlideCompletion: (index: number) => void;
}

export interface LocalSlide extends BaseSlide {
	completed: boolean;
	submittable: boolean;
	submitted: boolean;
	answer?: Answer[];
	revealed?: boolean;
	isCorrect?: boolean;
	showExplanation: boolean;
	assessment_id?: number;
	assessment_info?: AssessmentInfo;
	submission_id?: number;
}


export interface ViewProgress {
	readonly id?: string;
	readonly created_at: number;
	user_id: number;
	view_id: number;
	class_id: number;
	progress: boolean[];
	timestamp: number;
}

export type ContentTypes = "Video" | "Image" | "Rich Text" | "Dataset" | "Neural Network" | "Activity" | "Neuron" | "Word2Vec";

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
	neuronConfig?: NeuronConfig;
}

export type AssessmentTypes =
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
}

export interface Assessment {
	title: string;
	text: string;
	type: AssessmentTypes;
	answerType: string;
	gradingScale?: number;
	explanation?: string;
	dataset?: string;
	context?: string;
	extras?: ExtrasInfo;
	subtype?: QuestionSubtypes;
	options?: Option[];
}

export interface AssessmentInfo extends Assessment {
	readonly created_at: number;
	readonly id: number;
	dataset_info?: DatasetInfo;
}

export interface DatasetInfo {
	id: string;
	type: string;
	extension: string;
	name: string;
	url: string;
	metadata: Metadata;
	image_url: string;
	disabled: boolean;
	word_vec: boolean;
}
export interface Metadata {
	rows: number;
	columns: number;
	description?: string;
	about?: string;
	source?: string;
	source_url?: string;
	hints?: string[];
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

interface Role {
	id: string;
	name: string;
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
	role?: Role;
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
