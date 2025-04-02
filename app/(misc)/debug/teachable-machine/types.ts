import { LayerType } from "@/types/neuralnetwork";

export type TeachableLayerType = LayerType;

export type ImageClass = {
  id: string;
  name: string;
  samples: string[]; // base64 encoded images
  color: string;
};

export interface TeachableMachineProps {
  modelId?: string;
}

export const MESSAGE_TYPE_CREATE_TRAIN_CLASSIFIER = "create_train_classifier";
export const MESSAGE_TYPE_CLASSIFIER_PREDICT = "classifier_predict";

export interface ClassesListProps {
  classes: ImageClass[];
  activeClassId: string | null;
  onAddClass: () => void;
  onRemoveClass: (classId: string) => void;
  onClassNameChange: (id: string, newName: string) => void;
  onSelectClass: (classId: string) => void;
  onClearSample: (classId: string, sampleIndex: number) => void;
  onClearAllSamples: (classId: string) => void;
  canRemoveClass: (classId: string) => boolean;
}

export interface ClassItemProps {
  classItem: ImageClass;
  isActive: boolean;
  onRemove: () => void;
  onNameChange: (name: string) => void;
  onSelect: () => void;
  onClearSample: (sampleIndex: number) => void;
  onClearAllSamples: () => void;
  showRemoveButton: boolean;
}

export interface SamplePreviewProps {
  samples: string[];
  onClearSample: (sampleIndex: number) => void;
  onClearAll: () => void;
}

export interface LayerTabsProps {
  selectedLayer: TeachableLayerType;
  onSelectLayer: (layer: TeachableLayerType) => void;
  canStartTraining: boolean;
}

export interface TrainSettingsProps {
  classes: ImageClass[];
  epochs: number;
  setEpochs: (epochs: number) => void;
  currentState: any;
  modelId: string;
  onStartTraining: () => void;
  isMobilenetLoaded: boolean;
  isLoadingMobilenet: boolean;
}

export interface PredictionViewProps {
  currentState: any;
  modelId: string;
  classes: ImageClass[];
  prediction: { label: string; confidence: number } | null;
  onGoToTraining: () => void;
  isCameraActive: boolean;
  setIsCameraActive: (active: boolean) => void;
  isPredictionActive: boolean;
  setIsPredictionActive: (active: boolean) => void;
}

export interface CameraCaptureProps {
  onCaptureComplete: () => void;
  classColor: string;
} 