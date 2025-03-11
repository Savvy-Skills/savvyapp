import { View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import DrawingBoxWeb, { DrawingBoxHandle } from './react/DrawingBoxWeb'
import { Button, IconButton, Text } from 'react-native-paper';
import { Image } from 'expo-image';
import { useTFStore } from '@/store/tensorStore';
import LoadingIndicator from './LoadingIndicator';
import ProbabilityVisualizer from './ProbabilityVisualizer';
import { mnistStyles } from '@/styles/styles';

const MESSAGE_TYPE_IMAGE_PREDICT = "image_predict";
const MESSAGE_TYPE_LOAD_REMOTE_MODEL = "load_remote_model";

// CurrentState:
// {
// 	"mnist": {
// 	  "model": {
// 		"prediction": 2,
// 		"probabilities": {
// 		  "0": 0.012882346287369728,
// 		  "1": 0.025706561282277107,
// 		  "2": 0.599070131778717,
// 		  "3": 0.007910500280559063,
// 		  "4": 0.006109512876719236,
// 		  "5": 0.039087433367967606,
// 		  "6": 0.10860644280910492,
// 		  "7": 0.0005255664582364261,
// 		  "8": 0.19542789459228516,
// 		  "9": 0.004673598799854517
// 		}
// 	  }
// 	}
//   }

const MNISTComponent = () => {

	const { tfWorker, initializeWorker, workerReady, setCurrentModelId, currentState } = useTFStore();

	useEffect(() => {
		if (!workerReady) {
			initializeWorker();
		}
	}, [initializeWorker, workerReady]);

	useEffect(() => {
		if (workerReady) {
			tfWorker?.postMessage({
				from: "main",
				type: MESSAGE_TYPE_LOAD_REMOTE_MODEL,
				data: { type: "mnist" },
			});
		}
	}, [workerReady, setCurrentModelId])

	const drawingBoxRef = useRef<DrawingBoxHandle>(null);

	// Add a state to track canvas emptiness
	const [isCanvasEmpty, setIsCanvasEmpty] = useState(true);

	const handleDrawChange = (imageData: string) => {
		// Update canvas empty state if we have a ref
		if (drawingBoxRef.current) {
			setIsCanvasEmpty(drawingBoxRef.current.isEmpty());
		}

		tfWorker?.postMessage({
			from: "main",
			type: MESSAGE_TYPE_IMAGE_PREDICT,
			data: { image: imageData },
		});
	};

	const handleClearCanvas = () => {
		if (drawingBoxRef.current) {
			drawingBoxRef.current.clearCanvas();
			setIsCanvasEmpty(true);
		}
	};

	const getProbabilities = () => {
		return currentState?.mnist?.model?.probabilities || {};
	};

	const getPrediction = () => {
		return Number(currentState?.mnist?.model?.prediction || -1);
	};

	if (!workerReady) {
		return <LoadingIndicator />
	}

	return (
		<View style={mnistStyles.container}>
			<View style={mnistStyles.contentContainer}>
				<View style={mnistStyles.drawingBoxContainer}>
					<DrawingBoxWeb ref={drawingBoxRef} onDrawChange={handleDrawChange} />
					<IconButton
						icon="eraser"
						size={24}
						onPress={handleClearCanvas}
						style={mnistStyles.clearButton}
					/>
				</View>

				<View style={mnistStyles.resultContainer}>
					<Text style={mnistStyles.predictionText}>
						{isCanvasEmpty
							? 'Draw a digit...'
							: `Prediction: ${getPrediction() !== -1 ? getPrediction() : 'Processing...'}`}
					</Text>
					<ProbabilityVisualizer
						probabilities={isCanvasEmpty ? {} : getProbabilities()}
						prediction={getPrediction()}
						isEmpty={isCanvasEmpty}
					/>
				</View>
			</View>
		</View>
	)
}

export default MNISTComponent