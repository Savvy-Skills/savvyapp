import React from 'react';
import { ContentInfo } from '@/types/index';
import MNISTComponent from '@/components/slides/content/advanced/MNISTComponent';

interface MNISTEditorProps {
  content?: ContentInfo;
  onContentChange: (updatedContent: Partial<ContentInfo>) => void;
}

export default function MNISTEditor({ content, onContentChange }: MNISTEditorProps) {
  return null
} 