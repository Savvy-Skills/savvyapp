import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { Surface, Text } from "react-native-paper";
import styles from "@/styles/styles";
import { TeachableTabs } from "./TeachableTabs";
import { ClassesList } from "./ClassesList";
import { TrainSettings } from "./TrainSettings";
import { PredictionView } from "./PredictionView";
import { useTeachableMachine } from "./useTeachableMachine";
import { TeachableMachineProps } from "./types";
import { LayerType } from "@/types/neuralnetwork";

export default function TeachableMachine({ modelId = "teachable-default", content }: TeachableMachineProps) {
  const [selectedLayer, setSelectedLayer] = useState<LayerType>("input");
  // Track camera states globally
  const [predictionCameraActive, setPredictionCameraActive] = useState(true);
  const [predictionActive, setPredictionActive] = useState(false);
  
  const {
    classes,
    prediction,
    epochs,
    setEpochs,
    activeClassId,
    workerReady,
    currentState,
    handleAddClass,
    handleRemoveClass,
    handleClassNameChange,
    handleSelectClass,
    handleStartTraining,
    handleClearSample,
    handleClearAllSamples,
    canRemoveClass,
    canStartTraining,
    isMobilenetLoaded,
    isLoadingMobilenet
  } = useTeachableMachine(modelId);

  // Clean up cameras when changing layers
  useEffect(() => {
    // When leaving output layer, remember camera state but turn off prediction
    if (selectedLayer !== "output") {
      setPredictionActive(false);
    }
    
    // When leaving input layer, deselect the active class
    if (selectedLayer !== "input" && activeClassId) {
      handleSelectClass(null);
    }
  }, [selectedLayer, handleSelectClass, activeClassId]);

  function handleTrain() {
    handleStartTraining();
    setSelectedLayer("output");
  }
  
  // Function to change the selected layer
  const changeSelectedLayer = (layer: LayerType) => {
    // Clean up before changing layers
    if (layer !== selectedLayer) {
      setSelectedLayer(layer);
    }
  };
  
  // Function to render the active layer content
  const renderLayerContent = () => {
    switch (selectedLayer) {
      case "input":
        return (
          <ClassesList
            classes={classes}
            activeClassId={activeClassId}
            onAddClass={handleAddClass}
            onRemoveClass={handleRemoveClass}
            onClassNameChange={handleClassNameChange}
            onSelectClass={handleSelectClass}
            onClearSample={handleClearSample}
            onClearAllSamples={handleClearAllSamples}
            canRemoveClass={canRemoveClass}
          />
        );
      case "hidden":
        return (
          <TrainSettings
            classes={classes}
            epochs={epochs}
            setEpochs={setEpochs}
            currentState={currentState}
            modelId={modelId}
            onStartTraining={handleTrain}
            isMobilenetLoaded={isMobilenetLoaded}
            isLoadingMobilenet={isLoadingMobilenet}
          />
        );
      case "output":
        return (
          <PredictionView
            currentState={currentState}
            modelId={modelId}
            classes={classes}
            prediction={prediction}
            onGoToTraining={() => changeSelectedLayer("hidden")}
            isCameraActive={predictionCameraActive}
            setIsCameraActive={setPredictionCameraActive}
            isPredictionActive={predictionActive}
            setIsPredictionActive={setPredictionActive}
          />
        );
      default:
        return null;
    }
  };
  
  return (
    <View style={[styles.container, { gap: 16 }]}>
      {/* Tabs for navigation between layers */}
      <TeachableTabs
        selectedLayer={selectedLayer}
        setSelectedLayer={changeSelectedLayer}
        classes={classes}
      />      
      {/* Layer content */}
      <View>
        {renderLayerContent()}
      </View>
    </View>
  );
} 