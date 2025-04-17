import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Button } from "react-native-paper";
import { ClassesListProps } from "./types";
import { ClassItem } from "./ClassItem";

export function ClassesList({ 
  classes, 
  activeClassId, 
  onAddClass, 
  onRemoveClass, 
  onClassNameChange, 
  onSelectClass,
  onClearSample,
  onClearAllSamples,
  canRemoveClass
}: ClassesListProps) {
  return (
    <ScrollView style={styles.classesScrollView}>
      <View style={styles.classesContainer}>
        {classes.map(cls => (
          <ClassItem
            key={cls.id}
            classItem={cls}
            isActive={activeClassId === cls.id}
            onRemove={() => onRemoveClass(cls.id)}
            onNameChange={(name) => onClassNameChange(cls.id, name)}
            onSelect={() => onSelectClass(cls.id)}
            onClearSample={(sampleIndex) => onClearSample(cls.id, sampleIndex)}
            onClearAllSamples={() => onClearAllSamples(cls.id)}
            showRemoveButton={canRemoveClass(cls.id)}
          />
        ))}
        
        <Button
          mode="outlined"
          icon="plus"
          onPress={onAddClass}
          style={styles.addClass}
        >
          Add Class
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  classesScrollView: {
    width: '100%',
  },
  classesContainer: {
    padding: 8,
  },
  addClass: {
    marginTop: 8,
    borderRadius: 4,
  },
}); 