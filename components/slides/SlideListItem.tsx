import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, List, Text, useTheme } from 'react-native-paper';
import { Colors } from '@/constants/Colors';

interface SlideListItemProps {
  name: string;
  type: "Assessment" | "Content" | "Activity" | "Custom";
  subtype?: string;
  isCompleted: boolean;
  onPress: () => void;
  isActive?: boolean;
}

export default function SlideListItem({ 
  name, 
  type, 
  subtype, 
  isCompleted, 
  onPress,
  isActive,
}: SlideListItemProps) {

  const getIcon = () => {
    switch (type) {
      case "Assessment":
        return "clipboard-text";
      case "Content":
        switch (subtype) {
          case "Video":
            return "play-circle";
          case "Image":
            return "image";
          case "Rich Text":
            return "text-box";
          default:
            return "file-document";
        }
      case "Activity":
        return "puzzle";
      default:
        return "bookmark";
    }
  };

  return (
    <List.Item
      title={name}
      onPress={onPress}
      left={props => (
        <Icon
          source={getIcon()}
          size={24}
          color={Colors.light.primary}
        />
      )}
      right={props => (
        <View style={styles.rightContent}>
          {isCompleted && (
            <Icon
              source="check-circle"
              size={20}
              color={Colors.light.primary}
            />
          )}
        </View>
      )}
      style={[
        styles.listItem,
        isActive && { backgroundColor: "rgba(108, 92, 231, 0.2)" }
      ]}
    />
  );
}

const styles = StyleSheet.create({
  listItem: {
    borderRadius: 8,
    marginVertical: 2,
    marginHorizontal: 8,
	paddingHorizontal: 24,
  },
  icon: {
    marginLeft: 8,
    alignSelf: 'center',
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeLabel: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    overflow: 'hidden',
	color: "#fff",
  },
});

