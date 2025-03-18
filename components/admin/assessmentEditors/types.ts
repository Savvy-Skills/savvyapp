import { AssessmentTypes, AssessmentInfo } from '@/types/index';

export interface BaseEditorProps {
  questionText: string;
  options: string[];
  correctAnswers: number[];
  onQuestionTextChange: (text: string) => void;
  onOptionsChange: (options: string[]) => void;
  onCorrectAnswersChange: (answers: number[]) => void;
  onFormDataChange: (formData: Partial<AssessmentInfo>) => void;
} 