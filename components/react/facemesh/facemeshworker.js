const workerCode = `
importScripts(
  "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-core",
  "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-converter",
  "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-webgl",
  "https://cdn.jsdelivr.net/npm/@tensorflow-models/face-landmarks-detection",
  "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh"
);

// Access libraries from the global scope

let detector = null;
let processingFrame = false;
let modelInitAttempts = 0;
const MAX_INIT_ATTEMPTS = 3;
let isInitializing = false;
let isInitialized = false;

function sendDebug(message) {
  self.postMessage({
    type: "DEBUG",
    data: message,
  });
}

sendDebug("Worker script loaded");

// Check if detector is ready
function isDetectorReady() {
  return detector !== null;
}

async function initializeDetector() {
  if (isInitializing) {
    sendDebug("Already initializing, skipping duplicate request");
    return;
  }

  isInitializing = true;
  modelInitAttempts++;
  sendDebug('Worker: Initialization attempt' + modelInitAttempts);

  try {
    sendDebug("Worker: Starting TensorFlow initialization");

    // Make sure TF is ready
    await tf.ready();
    sendDebug("TensorFlow core is ready");

    // Try to get the WebGL context to ensure it's available
    const webGLBackend = await tf.backend();
    sendDebug('Using TensorFlow backend: ' + tf.getBackend());

    if (tf.getBackend() !== "webgl") {
      sendDebug("Setting backend to WebGL");
      await tf.setBackend("webgl");
    }

    // Clear any existing tensor memory
    tf.disposeVariables();

    // Simple configuration
    sendDebug("Initializing face detector model");
	console.log({faceLandmarksDetection, tf})
    const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
    const detectorConfig = {
      runtime: "tfjs",
      maxFaces: 1,
    };

    sendDebug("Creating detector with config");
    detector = await faceLandmarksDetection.createDetector(
      model,
      detectorConfig
    );

    if (!detector) {
      throw new Error("Detector was created but is null/undefined");
    }

    // Make a simple test detection to warm up the model
    await testDetector();

    isInitialized = true;
    isInitializing = false;
    sendDebug("Face detector initialized successfully!");

    // Notify the main thread that the worker is ready
    self.postMessage({
      type: "WORKER_READY",
      detectorReady: true,
    });
  } catch (error) {
    sendDebug('Worker ERROR during initialization: ' + error.message);
    sendDebug('Error stack: ' + error.stack);
    console.error("Worker: Failed to initialize detector:", error);

    isInitializing = false;

    if (modelInitAttempts < MAX_INIT_ATTEMPTS) {
      sendDebug(
        'Retrying initialization in 1 second (attempt ' + modelInitAttempts + '/' + MAX_INIT_ATTEMPTS + ')...'
      );
      setTimeout(initializeDetector, 1000);
    } else {
      self.postMessage({
        type: "ERROR",
        data: 'Failed to initialize face detector after ' + MAX_INIT_ATTEMPTS + ' attempts: ' + error.message,
      });
    }
  }
}

// Test face detection on a simple image to verify the model works
async function testDetector() {
  if (!detector) return false;

  try {
    sendDebug("Testing detector with synthetic image");
    // Create a small test image (red square)
    const width = 100,
      height = 100;
    const testCanvas = new OffscreenCanvas(width, height);
    const ctx = testCanvas.getContext("2d");
    ctx.fillStyle = "red";
    ctx.fillRect(0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);

    // Try to run inference (this will likely not find faces but tests the API)
    await detector.estimateFaces(imageData);
    sendDebug("Test detection completed successfully");
    return true;
  } catch (error) {
    sendDebug('Test detection failed: ' + error.message);
    return false;
  }
}

// Process incoming frames
async function processFrame(imageData) {
  if (!detector) {
    sendDebug("Detector not available, skipping frame");
    return;
  }

  if (processingFrame) {
    return; // Silently skip if already processing
  }

  processingFrame = true;

  try {
    // Only log periodically to reduce noise
    if (Math.random() < 0.05) {
      // ~5% of frames
      sendDebug('Processing frame ' + imageData.width + 'x' + imageData.height);
    }

    // Ensure we have valid image data
    if (!imageData || !imageData.data || imageData.data.length === 0) {
      return;
    }

    const faces = await detector.estimateFaces(imageData, {
      flipHorizontal: false,
    });

    // Only log when faces are found
    if (faces && faces.length > 0) {
      sendDebug('Detection found ' + faces.length + ' faces');
    }

    self.postMessage({
      type: "INFERENCE_RESULT",
      data: faces || [],
    });
  } catch (error) {
    sendDebug('ERROR: ' + error.message);
    self.postMessage({
      type: "ERROR",
      data: error.message,
    });
  } finally {
    processingFrame = false;
  }
}

// Handle messages from the main thread
self.onmessage = async (event) => {
  const { type, imageData } = event.data;

  if (type !== "PROCESS_FRAME") {
    sendDebug('Received message of type ' + type);
  }

  switch (type) {
    case "WORKER_CREATED":
      sendDebug("Worker acknowledging creation, waiting for INIT");
      // Don't auto-initialize, just acknowledge
      self.postMessage({
        type: "WORKER_INITIALIZED",
      });
      break;
    case "INIT":
      sendDebug("Starting detector initialization");
      await initializeDetector();
      break;
    case "PROCESS_FRAME":
      // Log receipt of frame periodically
      if (Math.random() < 0.1) {
        // 10% of frames
        sendDebug('Worker received frame for processing');
      }
      await processFrame(imageData);
      break;
    case "TEST_DETECTOR":
      const testResult = await testDetector();
      self.postMessage({
        type: "TEST_RESULT",
        success: testResult,
      });
      break;
    case "CHECK_STATUS":
      self.postMessage({
        type: "STATUS_REPORT",
        data: {
          detectorReady: isDetectorReady(),
          attempts: modelInitAttempts,
        },
      });
      break;
    case "REINIT":
      detector = null;
      isInitialized = false;
      modelInitAttempts = 0;
      sendDebug("Reinitializing detector");
      await initializeDetector();
      self.postMessage({
        type: "REINIT_COMPLETE",
      });
      break;
    default:
      sendDebug('Worker: Unknown message type:', type);
  }
};
`;

export default workerCode;