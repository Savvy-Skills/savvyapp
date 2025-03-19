import React from "react";
import { View, StyleSheet, Image, ImageSourcePropType } from "react-native";
import { Button, Text } from "react-native-paper";
import styles from "@/styles/styles";

interface ErrorComponentProps {
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  imageSource?: ImageSourcePropType;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

const ErrorComponent = ({
  title = "Something went wrong",
  message,
  actionLabel = "Try Again",
  onAction,
  imageSource,
  secondaryActionLabel,
  onSecondaryAction,
}: ErrorComponentProps) => {
  return (
    <View style={localStyles.container}>
      {imageSource && (
        <Image 
          source={imageSource} 
          style={localStyles.image} 
          resizeMode="contain"
        />
      )}
      
      <Text style={localStyles.title}>{title}</Text>
      <Text style={localStyles.message}>{message}</Text>
      
      <View style={localStyles.buttonContainer}>
        {onAction && (
          <Button 
            mode="contained" 
            onPress={onAction}
            style={styles.defaultButton}
          >
            {actionLabel}
          </Button>
        )}
        
        {onSecondaryAction && (
          <Button 
            mode="outlined" 
            onPress={onSecondaryAction}
            style={styles.defaultButton}
          >
            {secondaryActionLabel}
          </Button>
        )}
      </View>
    </View>
  );
};

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    maxWidth: 600,
    width: "100%",
    alignSelf: "center",
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    color: "#666",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
    flexWrap: "wrap",
  }
});

export default ErrorComponent; 