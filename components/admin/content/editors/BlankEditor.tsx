import { ContentInfo } from '@/types/index';

interface BlankEditorProps {
  content?: ContentInfo;
  onContentChange: (updatedContent: Partial<ContentInfo>) => void;
}

export default function BlankEditor({ content, onContentChange }: BlankEditorProps) {
  return null
} 