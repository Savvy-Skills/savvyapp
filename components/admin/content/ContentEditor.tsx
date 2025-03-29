import React from 'react';
import { ContentInfo, ContentTypes } from '@/types/index';
import RichTextEditor from './editors/RichTextEditor';
import ImageEditor from './editors/ImageEditor';
import VideoEditor from './editors/VideoEditor';
import DatasetEditor from './editors/DatasetEditor';
import NeuralNetworkEditor from './editors/NeuralNetworkEditor';
import ActivityEditor from './editors/ActivityEditor';
import NeuronEditor from './editors/NeuronEditor';
import Word2VecEditor from './editors/Word2VecEditor';
import MNISTEditor from './editors/MNISTEditor';
import TokenizeEditor from './editors/TokenizeEditor';
import AutoTokenizeEditor from './editors/AutoTokenizeEditor';

interface ContentEditorProps {
  content?: ContentInfo;
  onContentChange: (updatedContent: Partial<ContentInfo>) => void;
  contentType: ContentTypes;
}

export default function ContentEditor({ 
  content, 
  onContentChange,
  contentType
}: ContentEditorProps) {
  
  // Render the appropriate editor based on content type
  switch (contentType) {
    case 'Rich Text':
      return <RichTextEditor content={content} onContentChange={onContentChange} />;
    case 'Image':
      return <ImageEditor content={content} onContentChange={onContentChange} />;
    case 'Video':
      return <VideoEditor content={content} onContentChange={onContentChange} />;
    case 'Dataset':
      return <DatasetEditor content={content} onContentChange={onContentChange} />;
    case 'Neural Network':
      return <NeuralNetworkEditor content={content} onContentChange={onContentChange} />;
    case 'Activity':
      return <ActivityEditor content={content} onContentChange={onContentChange} />;
    case 'Neuron':
      return <NeuronEditor content={content} onContentChange={onContentChange} />;
    case 'Word2Vec':
      return <Word2VecEditor content={content} onContentChange={onContentChange} />;
    case 'MNIST':
      return <MNISTEditor content={content} onContentChange={onContentChange} />;
    case 'Tokenization':
      return <TokenizeEditor content={content} onContentChange={onContentChange} />;
    case 'Auto Tokenization':
      return <AutoTokenizeEditor content={content} onContentChange={onContentChange} />;
    default:
      return <RichTextEditor content={content} onContentChange={onContentChange} />;
  }
} 