import React from 'react';
import { ContentInfo, ContentSubtypes, ContentTypes } from '@/types/index';
import RichTextEditor from './editors/RichTextEditor';
import ImageEditor from './editors/ImageEditor';
import VideoEditor from './editors/VideoEditor';
import DatasetEditor from './editors/DatasetEditor';
import NeuralNetworkEditor from './editors/NeuralNetworkEditor';
import ActivityEditor from './editors/ActivityEditor';
import NeuronEditor from './editors/NeuronEditor';
import Word2VecEditor from './editors/Word2VecEditor';
import MNISTEditor from './editors/BlankEditor';
import TokenizeEditor from './editors/TokenizeEditor';
import AutoTokenizeEditor from './editors/AutoTokenizeEditor';
import BlankEditor from './editors/BlankEditor';
import LessonEditor from './editors/LessonEditor';
import DefinitionEditor from './editors/DefinitionEditor';
import DatasetsManager from '../DatasetsManager';

interface ContentEditorProps {
	content?: ContentInfo;
	onContentChange: (updatedContent: Partial<ContentInfo>) => void;
	contentType: ContentTypes;
	contentSubtype: ContentSubtypes | null;
	onDatasetSelect: (datasetId: string) => void;
}

export default function ContentEditor({
	content,
	onContentChange,
	contentType,
	contentSubtype,
	onDatasetSelect,
}: ContentEditorProps) {

	// Render the appropriate editor based on content type
	switch (contentType) {
		case 'Rich Text':
			return <RichTextEditor content={content} onContentChange={onContentChange} />;
		case 'Definition':
			return <DefinitionEditor value={content?.state?.value ?? ""} onContentChange={onContentChange} />;
		case 'Image':
			return <ImageEditor content={content} onContentChange={onContentChange} />;
		case 'Video':
			return <VideoEditor content={content} onContentChange={onContentChange} />;
		case 'Dataset':
			return <DatasetEditor content={content} onContentChange={onContentChange} />;
		case 'Tool':
			switch (contentSubtype) {
				case 'Neural Network':
					return <>
						<DatasetsManager onDatasetSelect={onDatasetSelect} />
						<NeuralNetworkEditor content={content} onContentChange={onContentChange} />
					</>
				case 'Activity':
					return <ActivityEditor content={content} onContentChange={onContentChange} />;
				case 'Neuron':
					return <NeuronEditor content={content} onContentChange={onContentChange} />;
				case 'Word2Vec':
					return <Word2VecEditor content={content} onContentChange={onContentChange} />;
				case 'MNIST':
					return <BlankEditor content={content} onContentChange={onContentChange} />;
				case 'Tokenization':
					return <TokenizeEditor content={content} onContentChange={onContentChange} />;
				case 'Auto Tokenization':
					return <AutoTokenizeEditor content={content} onContentChange={onContentChange} />;
				case 'Image Encoding':
					return <LessonEditor content={content} onContentChange={onContentChange} />;
				case 'Audio Encoding':
					return <LessonEditor content={content} onContentChange={onContentChange} />;
				case 'Teachable Machine':
					return <BlankEditor content={content} onContentChange={onContentChange} />;
				case 'BERT':
					return <BlankEditor content={content} onContentChange={onContentChange} />;
				case 'Next Word':
					return <BlankEditor content={content} onContentChange={onContentChange} />;
				case 'Speech to Text':
					return <BlankEditor content={content} onContentChange={onContentChange} />;
				case 'Face Detection':
					return <BlankEditor content={content} onContentChange={onContentChange} />;
				default:
					return <BlankEditor content={content} onContentChange={onContentChange} />;
			}
		case 'Educational':
			switch (contentSubtype) {
				case 'Image Encoding':
					return <LessonEditor content={content} onContentChange={onContentChange} />;
				case 'Pixel Simulator':
					return <LessonEditor content={content} onContentChange={onContentChange} />;
				case 'MNIST':
					return <BlankEditor content={content} onContentChange={onContentChange} />;
				default:
					return <BlankEditor content={content} onContentChange={onContentChange} />;
			}
		default:
			return <BlankEditor content={content} onContentChange={onContentChange} />;
	}
} 