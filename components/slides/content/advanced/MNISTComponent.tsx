import { View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import DrawingBoxWeb, { DrawingBoxHandle } from '../../../react/DrawingBoxWeb'
import { useTFStore } from '@/store/tensorStore';
import LoadingIndicator from '../../../common/LoadingIndicator';
import ProbabilityVisualizer from '../../../common/ProbabilityVisualizer';
import { mnistStyles } from '@/styles/styles';
import { IconButton, Text } from 'react-native-paper';

const MESSAGE_TYPE_IMAGE_PREDICT = "image_predict";
const MESSAGE_TYPE_LOAD_REMOTE_MODEL = "load_remote_model";


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
			data: { image: imageData, type: "mnist" },
		});
	};

	const handleClearCanvas = () => {
		if (drawingBoxRef.current) {
			drawingBoxRef.current.clearCanvas();
			setIsCanvasEmpty(true);
		}
	};

	const getProbabilities = () => {
		return currentState?.mnist?.model?.prediction?.probabilities || {};
	};

	const getPrediction = () => {
		return Number(currentState?.mnist?.model?.prediction?.predictedClass || -1);
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
						probabilities={isCanvasEmpty ? [] : getProbabilities()}
						prediction={getPrediction()}
						isEmpty={isCanvasEmpty}
					/>
				</View>
			</View>
		</View>
	)
}

export default MNISTComponent