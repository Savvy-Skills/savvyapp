import React, { useState } from 'react';
import { View, StyleSheet, FlatList, ScrollView } from 'react-native';
import { Button, Card, Text, RadioButton, Searchbar, Chip, Divider } from 'react-native-paper';
import { AssessmentInfo } from '@/types/index';
import styles from '@/styles/styles';
import { Colors } from '@/constants/Colors';

interface AssessmentListProps {
  assessmentList: AssessmentInfo[];
  onAssessmentSelect: (assessment: AssessmentInfo) => void;
  onCancel: () => void;
}

export default function AssessmentList({ assessmentList, onAssessmentSelect, onCancel }: AssessmentListProps) {
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  
  // Extract unique assessment types for filtering
  const assessmentTypes = [...new Set(assessmentList.map(assessment => assessment.type))];
  
  // Filter assessments based on search and type filter
  const filteredAssessments = assessmentList.filter(assessment => {
    const matchesSearch = searchQuery ? 
      (assessment.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
       assessment.text?.toLowerCase().includes(searchQuery.toLowerCase())) : 
      true;
    
    const matchesFilter = activeFilter ? 
      assessment.type === activeFilter : 
      true;
    
    return matchesSearch && matchesFilter;
  });
  
  const renderAssessmentItem = ({ item }: { item: AssessmentInfo }) => (
    <Card style={[localStyles.assessmentCard, selectedId === item.id && localStyles.selectedCard]}>
      <Card.Content style={localStyles.cardContent}>
        <View style={localStyles.assessmentInfo}>
          <Text style={localStyles.assessmentTitle}>{item.title || 'Unnamed Assessment'}</Text>
          <Text numberOfLines={2} style={localStyles.assessmentText}>{item.text}</Text>
          <Chip 
            compact 
            style={localStyles.assessmentTypeChip}
          >
            {item.type}
          </Chip>
        </View>
        <RadioButton	
          value={item.id.toString()}
          status={selectedId === item.id ? 'checked' : 'unchecked'}
          onPress={() => setSelectedId(item.id || null)}
        />
      </Card.Content>
    </Card>
  );
  
  const handleSelect = () => {
    if (!selectedId) return;
    
    const selectedAssessment = assessmentList.find(a => a.id === selectedId);
    if (selectedAssessment) {
      onAssessmentSelect(selectedAssessment);
    }
  };
  
  return (
    <View style={localStyles.container}>
      <Searchbar
        placeholder="Search assessments..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={localStyles.searchBar}
      />
      
      <View style={localStyles.filterContainer}>
        <Text variant="bodyMedium" style={localStyles.filterLabel}>Filter by type: </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {assessmentTypes.map((type) => (
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
      
      {filteredAssessments.length > 0 ? (
        <FlatList
          data={filteredAssessments}
          renderItem={renderAssessmentItem}
          keyExtractor={(item) => item.id.toString()}
          style={localStyles.list}
        />
      ) : (
        <View style={localStyles.emptyState}>
          <Text>No matching assessments found</Text>
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
  assessmentCard: {
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
  assessmentInfo: {
    flex: 1,
    marginRight: 8,
  },
  assessmentTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  assessmentText: {
    marginBottom: 4,
    color: '#555',
  },
  assessmentTypeChip: {
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