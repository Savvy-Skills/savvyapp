import React, { useState } from 'react';
import { View, StyleSheet, FlatList, ScrollView } from 'react-native';
import { Button, Card, Text, RadioButton, Searchbar, Chip, Divider } from 'react-native-paper';
import { ContentInfo } from '@/types/index';
import styles from '@/styles/styles';
import { Colors } from '@/constants/Colors';

interface ContentListProps {
  contentList: ContentInfo[];
  onContentSelect: (content: ContentInfo) => void;
  onCancel: () => void;
}

export default function ContentList({ contentList, onContentSelect, onCancel }: ContentListProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  
  // Extract unique content types for filtering
  const contentTypes = [...new Set(contentList.map(content => content.type))];
  
  // Filter content based on search and type filter
  const filteredContent = contentList.filter(content => {
    const matchesSearch = searchQuery ? 
      content.title.toLowerCase().includes(searchQuery.toLowerCase()) : 
      true;
    
    const matchesFilter = activeFilter ? 
      content.type === activeFilter : 
      true;
    
    return matchesSearch && matchesFilter;
  });
  
  const renderContentItem = ({ item }: { item: ContentInfo }) => (
    <Card style={[localStyles.contentCard, selectedId === item.id && localStyles.selectedCard]}>
      <Card.Content style={localStyles.cardContent}>
        <View style={localStyles.contentInfo}>
          <Text style={localStyles.contentTitle}>{item.title}</Text>
          <Chip 
            compact 
            style={localStyles.contentTypeChip}
          >
            {item.type}
          </Chip>
        </View>
        <RadioButton
          value={item.id || ''}
          status={selectedId === item.id ? 'checked' : 'unchecked'}
          onPress={() => setSelectedId(item.id || null)}
        />
      </Card.Content>
    </Card>
  );
  
  const handleSelect = () => {
    if (!selectedId) return;
    
    const selectedContent = contentList.find(c => c.id === selectedId);
    if (selectedContent) {
      onContentSelect(selectedContent);
    }
  };
  
  return (
    <View style={localStyles.container}>
      <Searchbar
        placeholder="Search content..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={localStyles.searchBar}
      />
      
      <View style={localStyles.filterContainer}>
        <Text variant="bodyMedium" style={localStyles.filterLabel}>Filter by type: </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {contentTypes.map((type) => (
            <Chip
              key={type}
              selected={activeFilter === type}
              onPress={() => setActiveFilter(activeFilter === type ? null : type)}
              style={localStyles.filterChip}
              mode="outlined"
            >
              {type}
            </Chip>
          ))}
        </ScrollView>
      </View>
      
      {filteredContent.length > 0 ? (
        <FlatList
          data={filteredContent}
          renderItem={renderContentItem}
          keyExtractor={(item) => item.id || Math.random().toString()}
          style={localStyles.list}
        />
      ) : (
        <View style={localStyles.emptyState}>
          <Text>No matching content found</Text>
        </View>
      )}
      
      <Divider style={localStyles.divider} />
      
      <View style={localStyles.actionButtons}>
        <Button
          mode="outlined"
          onPress={onCancel}
          style={[styles.savvyButton, localStyles.button]}
        >
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={handleSelect}
          disabled={!selectedId}
          style={[styles.savvyButton, localStyles.button]}
        >
          Select
        </Button>
      </View>
    </View>
  );
}

const localStyles = StyleSheet.create({
  container: {
    padding: 8,
  },
  searchBar: {
    marginBottom: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  filterLabel: {
    marginRight: 8,
  },
  filterChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  list: {
    maxHeight: 300,
  },
  contentCard: {
    marginBottom: 8,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contentInfo: {
    flex: 1,
  },
  contentTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  contentTypeChip: {
    alignSelf: 'flex-start',
  },
  divider: {
    marginVertical: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  button: {
    minWidth: 100,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  }
}); 