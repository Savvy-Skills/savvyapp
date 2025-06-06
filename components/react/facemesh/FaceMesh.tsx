'use dom'

import React, { useEffect, useRef, useState } from 'react';
import { FACEMESH_TESSELATION, FACEMESH_RIGHT_EYE, FACEMESH_RIGHT_EYEBROW, FACEMESH_RIGHT_IRIS, FACEMESH_LEFT_EYE, FACEMESH_LEFT_EYEBROW, FACEMESH_LEFT_IRIS, FACEMESH_FACE_OVAL, FACEMESH_LIPS } from '@mediapipe/face_mesh';
import './FaceMesh.css';
import '../index.css';
import workerCode from './facemeshworker';
import { TRIANGULATION } from './triangulation';
import { 
	drawPoints, 
	drawPath, 
	drawTriangles, 
	drawOriginalFaceMesh,
	drawFaceMesh as drawFaceMeshUtil,
	renderStoppedCameraView as renderStoppedCameraViewUtil
} from './drawUtils';

const FaceMesh: React.FC = () => {
	const videoRef = useRef<HTMLVideoElement>(null);
	const cameraCanvasRef = useRef<HTMLCanvasElement>(null);
	const faceCanvasRef = useRef<HTMLCanvasElement>(null);
	const overlayCanvasRef = useRef<HTMLCanvasElement>(null);

	// Updated state variables
	const [workerStatus, setWorkerStatus] = useState<'initializing' | 'ready' | 'error'>('initializing');
	const [cameraStatus, setCameraStatus] = useState<'off' | 'starting' | 'ready'>('off');
	const [error, setError] = useState<string | null>(null);
	const [isDetecting, setIsDetecting] = useState<boolean>(false);
	const workerRef = useRef<Worker | null>(null);
	const isDetectingRef = useRef<boolean>(false);
	const animationFrameRef = useRef<number | null>(null);

	// Stats and debug state
	const [debugLog, setDebugLog] = useState<string[]>([]);
	const [isDebugVisible, setIsDebugVisible] = useState<boolean>(false);
	const [framesSent, setFramesSent] = useState<number>(0);
	const [framesProcessed, setFramesProcessed] = useState<number>(0);
	const [lastFpsUpdate, setLastFpsUpdate] = useState<number>(Date.now());
	const [fps, setFps] = useState<number>(0);
	const [lastFrameTime, setLastFrameTime] = useState<number>(0);
	const [processingTimes, setProcessingTimes] = useState<number[]>([]);
	const lastProcessRequestTime = useRef<number | null>(null);
	const [fpps, setFpps] = useState<number>(0);
	const processedFrameTimestamps = useRef<number[]>([]);

	// Add a state to store the last camera frame for displaying when stopped
	const [lastFrameSnapshot, setLastFrameSnapshot] = useState<ImageData | null>(null);

	// Add a new state for face mesh snapshot
	const [lastFaceMeshSnapshot, setLastFaceMeshSnapshot] = useState<ImageData | null>(null);

	const [activeTab, setActiveTab] = useState<'camera' | 'facemesh'>('camera');

	const addDebugMessage = (message: string) => {
		setDebugLog(prev => [...prev.slice(-19), message]);
	};

	// Previous useEffect for worker initialization (uncommented and updated)
	useEffect(() => {
		addDebugMessage("Component mounted, initializing worker...");

		// Initialize the worker
		try {
			addDebugMessage("Creating worker...");

			// Create a Blob with the worker code
			// This avoids Expo Router's transformation pipeline that causes the require error
			const workerBlob = new Blob([workerCode], { type: 'application/javascript' });

			// Create worker from the blob
			const worker = new Worker(URL.createObjectURL(workerBlob));
			workerRef.current = worker;

			// Handle messages from the worker
			worker.onmessage = (e) => {
				const { type, data, success } = e.data;

				if (type === 'WORKER_INITIALIZED') {
					addDebugMessage("Worker initialized, starting detector...");
					worker.postMessage({ type: 'INIT' });
				} else if (type === 'WORKER_READY') {
					addDebugMessage('FaceMesh worker is ready!');
					setWorkerStatus('ready');
				} else if (type === 'INFERENCE_RESULT') {
					// Only process results if we're still in detecting state
					if (!isDetectingRef.current) {
						addDebugMessage("Detection inactive, ignoring inference results");
						return;
					}

					// Add check to confirm we got valid faces data
					if (!Array.isArray(data)) {
						addDebugMessage(`Received invalid faces data: ${typeof data}`);
						return;
					}

					// Calculate processing time if we have a reference time
					if (lastProcessRequestTime.current) {
						const processingTime = performance.now() - lastProcessRequestTime.current;
						// Keep a rolling window of the last 10 processing times
						setProcessingTimes(prev => [...prev.slice(-9), processingTime]);
					}

					// Reset the reference time
					lastProcessRequestTime.current = null;

					// Track timestamp for FPPS calculation - with safeguard
					const now = performance.now();

					// Only add timestamp if we haven't already recorded one very recently
					const lastTimestamp = processedFrameTimestamps.current[processedFrameTimestamps.current.length - 1];
					if (!lastTimestamp || now - lastTimestamp > 10) { // 10ms minimum gap between frames
						processedFrameTimestamps.current.push(now);
					}

					// Only keep the last second of timestamps
					const oneSecondAgo = now - 1000;
					processedFrameTimestamps.current = processedFrameTimestamps.current.filter(
						timestamp => timestamp >= oneSecondAgo
					);

					// Calculate FPPS from the timestamps, and ensure it can't exceed FPS cap
					const calculatedFpps = processedFrameTimestamps.current.length;
					setFpps(Math.min(calculatedFpps, 30)); // Cap at 30fps

					addDebugMessage(`Received valid inference data - ${data.length} faces`);

					// Increment processed frames counter
					setFramesProcessed(prev => {
						const newCount = prev + 1;
						return newCount;
					});

					const faceCount = data.length;
					if (faceCount > 0) {
						addDebugMessage(`Received inference results: ${faceCount} faces detected`);
					}
					drawFaceMesh(data);
				} else if (type === 'ERROR') {
					addDebugMessage(`Worker ERROR: ${data}`);
					console.error('FaceMesh worker error:', data);
					setError(data);
					setWorkerStatus('error');
				} else if (type === 'DEBUG') {
					addDebugMessage(`Worker debug: ${data}`);
				} else if (type === 'STATUS_REPORT') {
					// Add a check to make sure data exists before destructuring
					if (data) {
						const { detectorReady } = data;
						addDebugMessage(`Worker status: detector ${detectorReady ? 'ready' : 'not ready'}`);

						if (!detectorReady && isDetecting) {
							addDebugMessage("Warning: Detection active but detector not ready");
						}
					} else {
						addDebugMessage('Received STATUS_REPORT with missing data');
					}
				}
			};

			// Send initial message to the worker
			workerRef.current.postMessage({ type: 'WORKER_CREATED' });

			worker.onerror = (error) => {
				addDebugMessage(`Worker error event: ${error.message}`);
				setError(`Worker error: ${error.message}`);
				setWorkerStatus('error');
			};
		} catch (err) {
			const errorMsg = `Failed to initialize worker: ${(err as Error).message}`;
			addDebugMessage(errorMsg);
			setError(errorMsg);
			setWorkerStatus('error');
		}

		return () => {
			addDebugMessage("Component unmounting, cleaning up...");
			// Cancel any pending animation frame
			if (animationFrameRef.current !== null) {
				cancelAnimationFrame(animationFrameRef.current);
			}
			// Cleanup
			if (workerRef.current) {
				workerRef.current.terminate();
			}
			if (videoRef.current && videoRef.current.srcObject) {
				const mediaStream = videoRef.current.srcObject as MediaStream;
				mediaStream.getTracks().forEach(track => track.stop());
			}
		};
	}, []);

	// For FPS calculation, tracking the frame rate
	useEffect(() => {
		if (isDetecting) {
			setFps(30); // Our frame send rate is capped at 30fps
		} else {
			setFps(0);
		}
	}, [isDetecting]);

	// Emergency cleanup on route changes
	useEffect(() => {
		return () => {
			if (isDetectingRef.current) {
				isDetectingRef.current = false;
				addDebugMessage('Emergency detection stop due to navigation');
			}
		};
	}, []);

	const startCamera = async () => {
		addDebugMessage("Starting camera...");
		setCameraStatus('starting');

		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: { width: 480, height: 360, facingMode: 'user' },
				audio: false
			});

			addDebugMessage("Camera access granted");
			if (videoRef.current) {
				videoRef.current.srcObject = stream;
				videoRef.current.onloadedmetadata = () => {
					addDebugMessage("Video metadata loaded");
					if (videoRef.current) {
						videoRef.current.play();
						addDebugMessage("Video playback started");
						// Set camera as ready
						setCameraStatus('ready');
						// Start the render loop
						animationFrameRef.current = requestAnimationFrame(renderFrame);
					}
				};
			}
		} catch (err) {
			const errorMsg = 'Error accessing camera: ' + (err as Error).message;
			addDebugMessage(errorMsg);
			setError(errorMsg);
			setCameraStatus('off');
		}
	};

	const renderFrame = () => {
		if (!videoRef.current || !cameraCanvasRef.current || !faceCanvasRef.current || !overlayCanvasRef.current) {
			addDebugMessage("Video or canvas elements not available");
			animationFrameRef.current = requestAnimationFrame(renderFrame);
			return;
		}

		const cameraCtx = cameraCanvasRef.current.getContext('2d');
		const faceCtx = faceCanvasRef.current.getContext('2d');
		const overlayCtx = overlayCanvasRef.current.getContext('2d');

		if (!cameraCtx || !faceCtx || !overlayCtx) {
			addDebugMessage("Canvas context not available");
			animationFrameRef.current = requestAnimationFrame(renderFrame);
			return;
		}

		// Always draw the video frame on the camera canvas only
		if (videoRef.current.readyState >= 2) {
			// Clear camera canvas
			cameraCtx.clearRect(0, 0, cameraCanvasRef.current.width, cameraCanvasRef.current.height);

			// Draw video on camera canvas only
			cameraCtx.drawImage(
				videoRef.current,
				0, 0,
				videoRef.current.videoWidth, videoRef.current.videoHeight,
				0, 0,
				cameraCanvasRef.current.width, cameraCanvasRef.current.height
			);

			// Clear the face canvas but don't draw the video
			if (!isDetectingRef.current) {
				// When not detecting, show placeholder text
				faceCtx.clearRect(0, 0, faceCanvasRef.current.width, faceCanvasRef.current.height);
				faceCtx.fillStyle = '#333333';
				faceCtx.fillRect(0, 0, faceCanvasRef.current.width, faceCanvasRef.current.height);

				faceCtx.font = 'bold 24px Arial';
				faceCtx.fillStyle = '#cccccc';
				faceCtx.textAlign = 'center';
				faceCtx.fillText(
					'Start detection to see face mesh',
					faceCanvasRef.current.width / 2,
					faceCanvasRef.current.height / 2
				);

				// Clear the overlay canvas when not detecting
				overlayCtx.clearRect(0, 0, overlayCanvasRef.current.width, overlayCanvasRef.current.height);
			}
		}

		// Process frame if detection is active - with 30fps limit
		if (isDetectingRef.current) {
			const now = performance.now();
			const frameInterval = 1000 / 30; // 33.33ms for 30fps

			// Only send frames at 30fps
			if (now - lastFrameTime >= frameInterval) {
				// Send frame to worker
				if (workerRef.current) {
					try {
						// Get image data from the camera canvas
						const imageData = cameraCtx.getImageData(
							0, 0,
							cameraCanvasRef.current.width,
							cameraCanvasRef.current.height
						);

						// Log every 30th frame
						if (framesSent % 30 === 0) {
							addDebugMessage(`Sending frame #${framesSent} to worker (30fps limited)`);
						}

						// Record when we sent this frame
						lastProcessRequestTime.current = performance.now();

						// Send to worker
						workerRef.current.postMessage({
							type: 'PROCESS_FRAME',
							imageData
						}, [imageData.data.buffer]);

						// Update counters and time
						setFramesSent(prev => prev + 1);
						setLastFrameTime(now);
					} catch (err) {
						addDebugMessage(`Error in frame send: ${(err as Error).message}`);
					}
				}
			}
		}

		// Add a periodic debug log in the renderFrame function to log FPPS information
		if (isDetectingRef.current && framesSent % 60 === 0) {
			addDebugMessage(`FPPS Debug: ${processedFrameTimestamps.current.length} responses in last second. FPS cap: 30`);
		}

		// Continue the render loop
		animationFrameRef.current = requestAnimationFrame(renderFrame);
	};

	const toggleDetection = () => {
		const newState = !isDetecting;

		addDebugMessage(`${newState ? 'Starting' : 'Stopping'} detection`);

		// Update both the state and the ref
		setIsDetecting(newState);
		isDetectingRef.current = newState;

		// Reset counters when toggling detection
		if (newState) {
			addDebugMessage('Resetting frame counters');
			setFramesSent(0);
			setFramesProcessed(0);
			setLastFpsUpdate(Date.now());
			setFps(0);
		} else {
			addDebugMessage('Detection stopped');
		}
	};

	const toggleDebugPanel = () => {
		setIsDebugVisible(prev => !prev);
	};

	// Updated drawFaceMesh function that uses the utility functions
	const drawFaceMesh = (faces: any[]) => {
		drawFaceMeshUtil(faces, faceCanvasRef, overlayCanvasRef, isDetectingRef);
	};

	// Update the stopCamera function to capture both camera and face mesh
	const stopCamera = () => {
		addDebugMessage("Stopping camera...");

		// Take a snapshot of the current camera frame
		if (cameraCanvasRef.current) {
			const ctx = cameraCanvasRef.current.getContext('2d');
			if (ctx) {
				const imageData = ctx.getImageData(
					0, 0,
					cameraCanvasRef.current.width,
					cameraCanvasRef.current.height
				);
				setLastFrameSnapshot(imageData);
			}
		}

		// Take a snapshot of the face mesh
		if (faceCanvasRef.current) {
			const ctx = faceCanvasRef.current.getContext('2d');
			if (ctx) {
				const imageData = ctx.getImageData(
					0, 0,
					faceCanvasRef.current.width,
					faceCanvasRef.current.height
				);
				setLastFaceMeshSnapshot(imageData);
			}
		}

		// Rest of the function remains the same...
		if (isDetectingRef.current) {
			addDebugMessage("Also stopping active detection");
			setIsDetecting(false);
			isDetectingRef.current = false;
		}

		// Stop the camera stream
		if (videoRef.current && videoRef.current.srcObject) {
			const mediaStream = videoRef.current.srcObject as MediaStream;
			mediaStream.getTracks().forEach(track => track.stop());
			videoRef.current.srcObject = null;
		}

		// Cancel any pending animation frame
		if (animationFrameRef.current !== null) {
			cancelAnimationFrame(animationFrameRef.current);
			animationFrameRef.current = null;
		}

		// Update camera status
		setCameraStatus('off');
	};

	// Updated renderStoppedCameraView function
	const renderStoppedCameraView = () => {
		renderStoppedCameraViewUtil(lastFrameSnapshot, cameraCanvasRef);
	};

	// Updated renderStoppedFaceMeshView function
	const renderStoppedFaceMeshView = () => {
		renderStoppedCameraViewUtil(lastFaceMeshSnapshot, faceCanvasRef);
	};

	// Update the effect to render both snapshots
	useEffect(() => {
		if (cameraStatus === 'off') {
			// Render camera snapshot
			if (lastFrameSnapshot !== null) {
				renderStoppedCameraView();
			}

			// Render face mesh snapshot
			if (lastFaceMeshSnapshot !== null) {
				renderStoppedFaceMeshView();
			}
		}
	}, [cameraStatus, lastFrameSnapshot, lastFaceMeshSnapshot]);


	// Update the renderCanvasContent function to show face mesh snapshot
	const renderCanvasContent = () => {
		if (cameraStatus === 'off') {
			// Render placeholder when camera is off
			return (
				<div className="canvas-container">
					<div className="canvas-tabs">
						<button
							className={`tab-button ${activeTab === 'camera' ? 'active' : ''}`}
							onClick={() => setActiveTab('camera')}
						>
							Camera Feed
						</button>
						<button
							className={`tab-button ${activeTab === 'facemesh' ? 'active' : ''}`}
							onClick={() => setActiveTab('facemesh')}
						>
							Face Mesh
						</button>
					</div>

					<div className="tab-content">
						{/* Camera View */}
						<div className={`camera-view ${activeTab === 'camera' ? 'active' : ''}`}>
							{workerStatus === 'initializing' && (
								<div className="loading-overlay">
									<div className="loading-content">
										<div className="loading-spinner"></div>
										<p>Initializing model...</p>
									</div>
								</div>
							)}

							{workerStatus === 'ready' && lastFrameSnapshot === null && (
								<div className="placeholder-message">
									<p>Click "Start Camera" to begin</p>
								</div>
							)}

							{workerStatus === 'ready' && lastFrameSnapshot !== null && (
								<div className="snapshot-container full-size">
									<canvas
										ref={cameraCanvasRef}
										className="camera-canvas full-size"
										width={480}
										height={360}
									/>
								</div>
							)}

							{workerStatus === 'error' && (
								<div className="placeholder-message error">
									<p className="error-text">Error: {error}</p>
									<p>Failed to initialize FaceMesh model</p>
								</div>
							)}
						</div>

						{/* Face Mesh View */}
						<div className={`facemesh-view ${activeTab === 'facemesh' ? 'active' : ''}`}>
							{workerStatus === 'initializing' && (
								<div className="loading-overlay">
									<div className="loading-content">
										<div className="loading-spinner"></div>
										<p>Initializing FaceMesh model...</p>
									</div>
								</div>
							)}

							{workerStatus === 'ready' && lastFaceMeshSnapshot === null && (
								<div className="placeholder-message">
									<p>FaceMesh model ready!</p>
									<p>Click "Start Camera" to begin</p>
								</div>
							)}

							{workerStatus === 'ready' && lastFaceMeshSnapshot !== null && (
								<div className="snapshot-container full-size">
									<canvas
										ref={faceCanvasRef}
										className="face-canvas full-size"
										width={480}
										height={360}
									/>
								</div>
							)}

							{workerStatus === 'error' && (
								<div className="placeholder-message error">
									<p className="error-text">Error: {error}</p>
									<p>Failed to initialize FaceMesh model</p>
								</div>
							)}
						</div>
					</div>
				</div>
			);
		} else {
			// Render active camera content
			return (
				<div className="canvas-container">
					<div className="canvas-tabs">
						<button
							className={`tab-button ${activeTab === 'camera' ? 'active' : ''}`}
							onClick={() => setActiveTab('camera')}
						>
							Camera Feed
						</button>
						<button
							className={`tab-button ${activeTab === 'facemesh' ? 'active' : ''}`}
							onClick={() => setActiveTab('facemesh')}
						>
							Face Mesh
						</button>
					</div>

					<div className="tab-content">
						{/* Always render video element regardless of active tab */}
						<video
							ref={videoRef}
							className="camera-video"
							playsInline
							muted
							style={{ display: 'none' }}
						/>

						<div className={`camera-view ${activeTab === 'camera' ? 'active' : ''}`}>
							{cameraStatus === 'starting' && (
								<div className="loading-overlay">
									<div className="loading-content">
										<div className="loading-spinner"></div>
										<p>Starting camera...</p>
									</div>
								</div>
							)}
							<div className="camera-overlay-container">
								<canvas
									ref={cameraCanvasRef}
									className="camera-canvas"
									width={480}
									height={360}
								/>
								<canvas
									ref={overlayCanvasRef}
									className="overlay-canvas"
									width={480}
									height={360}
								/>
							</div>
						</div>

						<div className={`facemesh-view ${activeTab === 'facemesh' ? 'active' : ''}`}>
							<canvas
								ref={faceCanvasRef}
								className="face-canvas"
								width={480}
								height={360}
							/>
						</div>
					</div>
				</div>
			);
		}
	};

	return (
		<div className="face-mesh-wrapper">
			<div className="face-mesh-container">
				<div className="step-card main-column">
					<h3 className="main-header">Face Detection</h3>

					{/* Canvas Content with Tabs */}
					{renderCanvasContent()}

					{/* Controls - Always visible */}
					<div className="control-panel">
						{cameraStatus === 'off' ? (
							<button
								className="primary hoverable full-width"
								onClick={startCamera}
								disabled={workerStatus !== 'ready'}
							>
								Start Camera
							</button>
						) : (
							<div className="control-row">
								<button
									className={`primary full-width hoverable ${isDetecting ? 'outline' : ''}`}
									onClick={toggleDetection}
								>
									{isDetecting ? 'Stop Detection' : 'Start Detection'}
								</button>

								<button
									className="secondary hoverable full-width"
									onClick={stopCamera}
								>
									Stop Camera
								</button>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

// Add a property to the window for logging state
declare global {
	interface Window {
		hasLoggedDimensions?: boolean;
		hasLoggedFrameSend?: boolean;
		hasLoggedFaceData?: boolean;
	}
}

export default FaceMesh;