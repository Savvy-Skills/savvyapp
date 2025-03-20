import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Card, Text, Button } from 'react-native-paper';
import { ContentInfo } from '@/types/index';
import RichText from '../slides/RichTextComponent';

interface ContentPreviewCardProps {
  content: Partial<ContentInfo>;
  index: number;
  onRemove: (index: number) => void;
  onEdit?: (content: ContentInfo) => void;
}

export default function ContentPreviewCard({ content, index, onRemove, onEdit }: ContentPreviewCardProps) {
	console.log('content', content);
  return (
    <Card key={`content-${index}`} style={styles.previewCard}>
      <Card.Content>
        <View style={styles.previewCardHeader}>
          <Text variant="titleSmall">
            {content.title ? content.title : `Content #${index + 1}`}
          </Text>
          <View style={styles.headerButtons}>
            {onEdit && content.id && (
              <Button 
                mode="text"
                icon="pencil" 
                onPress={() => onEdit(content as ContentInfo)}
                compact
              >
                Edit
              </Button>
            )}
            <Button 
              mode="text"
              icon="close" 
              onPress={() => onRemove(index)}
              compact
            >
              Remove
            </Button>
          </View>
        </View>
        
        <Text style={styles.previewLabel}>Type:</Text>
        <Text style={styles.previewValue}>{content.type}</Text>
        <Text style={styles.previewLabel}>Preview:</Text>
        {content.type === 'Rich Text' && (
         <RichText text={content.state || ''} />
        )}
        
        {content.type === 'Image' && (
          <>
            <Text style={styles.previewLabel}>Image:</Text>
            {content.url ? (
              <View style={styles.imagePreviewContainer}>
                <Image 
                  source={{ uri: content.url }} 
                  style={styles.imagePreview} 
                  resizeMode="contain"
                />
                <Text style={styles.imageUrl} numberOfLines={1}>
                  {content.url}
                </Text>
              </View>
            ) : (
              <Text style={styles.previewValue}>[No image URL]</Text>
            )}
          </>
        )}
        
        {content.type === 'Video' && (
          <>
            <Text style={styles.previewLabel}>Video URL:</Text>
            <Text style={styles.previewValue} numberOfLines={2}>
              {content.url || '[No video URL]'}
            </Text>
          </>
        )}
        
        {content.type === 'Dataset' && (
          <>
            <Text style={styles.previewLabel}>Dataset:</Text>
            <Text style={styles.previewValue}>
              {content.dataset_info?.name || '[No dataset selected]'}
            </Text>
            {content.dataset_info?.metadata && (
              <Text style={styles.previewValue} numberOfLines={2}>
                {`${content.dataset_info.metadata.rows} rows × ${content.dataset_info.metadata.columns} columns`}
              </Text>
            )}
          </>
        )}

        {['Neural Network', 'Activity', 'Neuron', 'Word2Vec'].includes(content.type || '') && (
          <Text style={styles.previewValue}>
            [Preview not available for {content.type} type]
          </Text>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  previewCard: {
    backgroundColor: '#f5f5f5',
    marginBottom: 12,
  },
  previewCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  previewLabel: {
    fontWeight: 'bold',
    marginTop: 4,
    marginBottom: 2,
  },
  previewValue: {
    marginBottom: 8,
  },
  imagePreviewContainer: {
    marginVertical: 8,
  },
  imagePreview: {
    width: '100%',
    height: 120,
    borderRadius: 4,
    marginBottom: 4,
  },
  imageUrl: {
    fontSize: 12,
    color: '#666',
  },
}); 