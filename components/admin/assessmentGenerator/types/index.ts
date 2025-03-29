import { Assessment, AssessmentInfo, Option } from '@/types/index';

// Form component props interface
export interface AssessmentFormProps {
  contentTopic: string;
  setContentTopic: (topic: string) => void;
  description: string;
  setDescription: (desc: string) => void;
  concepts: string[];
  setConcepts: (concepts: string[]) => void;
  conceptInput: string;
  setConceptInput: (input: string) => void;
  gradeLevel: string;
  setGradeLevel: (level: string) => void;
  tone: string;
  setTone: (tone: string) => void;
  handleGenerateAssessments: () => Promise<void>;
  loading: boolean;
  gradeLevelOptions: Array<{label: string; value: string}>;
  toneOptions: Array<{label: string; value: string}>;
}

// Loading indicator props interface
export interface LoadingIndicatorProps {
  progress: number;
}

// Assessment card props interface
export interface AssessmentCardProps {
  item: Assessment;
  index: number;
  handleEditAssessment: (assessment: Assessment) => void;
  handleStartImproveAssessment: (assessment: Assessment) => void;
  handleRemoveClick: (assessment: Assessment) => void;
}

// Editor props interface
export interface AssessmentEditorProps {
  item: Assessment;
  assessmentId: string;
  editorFormDataMap: { [key: string]: Partial<AssessmentInfo> };
  handleEditorFormChange: (assessmentId: string, data: Partial<AssessmentInfo>) => void;
  handleCancelEdit: (assessmentId: string) => void;
  handleSaveAssessment: (assessmentId: string) => void;
  renderEditor: (assessment: Assessment, assessmentId: string) => React.ReactNode;
}

// JSON Modal props interface
export interface JsonPreviewModalProps {
  visible: boolean;
  onDismiss: () => void;
  jsonData: string;
  handleCopyJson: () => void;
}

// Improvement modal props interface
export interface ImprovementModalProps {
  visible: boolean;
  onDismiss: () => void;
  assessmentToImprove: Assessment | undefined;
  improvementInstructions: string;
  setImprovementInstructions: (instructions: string) => void;
  handleImproveAssessment: () => Promise<void>;
  improvementLoading: boolean;
  improvedAssessment: Assessment | null;
  setImprovedAssessment: (assessment: Assessment | null) => void;
  handleAcceptImprovedAssessment: () => void;
}

// Main component props
export interface AIAssessmentGeneratorProps {
  viewId: number;
  onAssessmentsCreated: () => void;
} 