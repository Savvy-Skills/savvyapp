import { TRIANGULATION } from './triangulation';

const DEFAULT_DRAWING_OPTIONS = {
	color: "white",
	fillColor: "white", // Default fill color is the same as outline color
	lineWidth: 4,
	radius: 6,
	visibilityMin: 0.5
};

// Helper function to merge options with defaults
export const getDrawingOptions = (options: any = {}) => {
	// If no fillColor is specified, use the color value
	const fillColor = options.fillColor || options.color;
	return { ...DEFAULT_DRAWING_OPTIONS, ...options, fillColor };
};

// Helper function to handle options that can be functions or values
export const resolveOption = (option: any, params: any) => {
	return typeof option === 'function' ? option(params) : option;
};

// Custom implementation of drawLandmarks
export const drawPoints = (
	ctx: CanvasRenderingContext2D,
	keypoints: any[],
	options: any = {}
) => {
	if (!keypoints) return;

	const drawOptions = getDrawingOptions(options);
	const canvasWidth = ctx.canvas.width;
	const canvasHeight = ctx.canvas.height;

	ctx.save();

	let index = 0;
	for (const landmark of keypoints) {
		if (
			!landmark ||
			(landmark.visibility !== undefined && landmark.visibility < drawOptions.visibilityMin)
		) {
			index++;
			continue;
		}

		// Resolve style options for this specific landmark
		const fillStyle = resolveOption(drawOptions.fillColor, {
			index,
			from: landmark
		});

		const strokeStyle = resolveOption(drawOptions.color, {
			index,
			from: landmark
		});

		const lineWidth = resolveOption(drawOptions.lineWidth, {
			index,
			from: landmark
		});

		const radius = resolveOption(drawOptions.radius, {
			index,
			from: landmark
		});

		// Set styles
		ctx.fillStyle = fillStyle;
		ctx.strokeStyle = strokeStyle;
		ctx.lineWidth = lineWidth;

		// Draw the landmark point
		const circle = new Path2D();
		circle.arc(
			landmark.x * canvasWidth,
			landmark.y * canvasHeight,
			radius,
			0,
			2 * Math.PI
		);

		ctx.fill(circle);
		ctx.stroke(circle);

		index++;
	}

	ctx.restore();
};

// Draw path with proper styling
export const drawPath = (
	ctx: CanvasRenderingContext2D,
	points: any[],
	closePath: boolean = true,
	options: any = {}
) => {
	const drawOptions = getDrawingOptions(options);
	const region = new Path2D();
	
	// Check if points have x,y properties or are [x,y] arrays
	const firstPoint = points[0];
	const hasXYProps = firstPoint && typeof firstPoint === 'object' && 'x' in firstPoint;
	
	if (hasXYProps) {
		const canvasWidth = ctx.canvas.width;
		const canvasHeight = ctx.canvas.height;
		region.moveTo(points[0].x * canvasWidth, points[0].y * canvasHeight);
		for (let i = 1; i < points.length; i++) {
			region.lineTo(points[i].x * canvasWidth, points[i].y * canvasHeight);
		}
	} else {
		region.moveTo(points[0][0], points[0][1]);
		for (let i = 1; i < points.length; i++) {
			region.lineTo(points[i][0], points[i][1]);
		}
	}
	
	if (closePath) {
		region.closePath();
	}
	
	const strokeStyle = resolveOption(drawOptions.color, {
		index: 0,
		from: points[0]
	});
	const lineWidth = resolveOption(drawOptions.lineWidth, {
		index: 0,
		from: points[0]
	});
	
	// Use the resolved styles instead of hardcoded values
	ctx.strokeStyle = strokeStyle;
	ctx.lineWidth = lineWidth;
	ctx.stroke(region);
};

export const drawTriangles = (
	ctx: CanvasRenderingContext2D,
	keypoints: any[],
	options: any = {}
) => {
	for (let i = 0; i < TRIANGULATION.length / 3; i++) {
		const points = [
			TRIANGULATION[i * 3],
			TRIANGULATION[i * 3 + 1],
			TRIANGULATION[i * 3 + 2]
		].map(index => keypoints[index]);
		
		// Only draw if all points are valid
		if (points.every(point => point && point.x !== undefined && point.y !== undefined)) {
			drawPath(ctx, points, true, options);
		}
	}
};

// Test function to draw a hardcoded triangle
export const drawTestTriangle = (
	ctx: CanvasRenderingContext2D,
	options: any = {}
) => {
	// Define a simple triangle in normalized coordinates
	const points = [
		{ x: 0.3, y: 0.3 },
		{ x: 0.7, y: 0.3 },
		{ x: 0.5, y: 0.7 }
	];
	
	// Draw the triangle
	drawPath(ctx, points, true, options);
	
	// Also draw points at each vertex
	drawPoints(ctx, points, { color: 'yellow', radius: 5 });
};

// Function to draw the unscaled face mesh on the overlay canvas
export const drawOriginalFaceMesh = (
	faces: any[],
	overlayCanvasRef: React.RefObject<HTMLCanvasElement>,
	isDetectingRef: React.RefObject<boolean>
) => {
	if (!overlayCanvasRef.current) return;

	const canvas = overlayCanvasRef.current;
	const ctx = canvas.getContext('2d');
	if (!ctx) return;

	// Clear the canvas to make it transparent
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Draw face mesh
	if (faces && faces.length > 0 && isDetectingRef.current) {
		const face = faces[0]; // Get the first face

		if (face.keypoints && Array.isArray(face.keypoints)) {
			// Set style for the mesh
			ctx.strokeStyle = '#00ffd9'; // Teal/cyan color
			ctx.lineWidth = 1;

			// Create normalized keypoints using the width and height of the canvas
			const normalizedKeypoints = face.keypoints.map((point: any) => ({
				x: point.x / canvas.width,
				y: point.y / canvas.height,
				z: point.z
			}));

			// Draw the mesh points
			drawPoints(ctx, normalizedKeypoints, { color: '#00ffd9', radius: 0.2 });
			drawTriangles(ctx, face.keypoints, { color: '#00ffd9', lineWidth: 1 });
		}
	}
};

// Draw face mesh with scaling and consistent sizing
export const drawFaceMesh = (
	faces: any[],
	faceCanvasRef: React.RefObject<HTMLCanvasElement>,
	overlayCanvasRef: React.RefObject<HTMLCanvasElement>,
	isDetectingRef: React.RefObject<boolean>
) => {
	if (!faceCanvasRef.current) return;

	const canvas = faceCanvasRef.current;
	const ctx = canvas.getContext('2d');
	if (!ctx) return;

	// Clear the canvas and fill with a black background
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = '#000000';  // Black background
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// Draw face mesh
	if (faces && faces.length > 0) {
		const face = faces[0]; // Get the first face

		if (face.keypoints && Array.isArray(face.keypoints)) {
			// Calculate the face bounding box
			let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0;
			face.keypoints.forEach((point: any) => {
				if (point.x < minX) minX = point.x;
				if (point.y < minY) minY = point.y;
				if (point.x > maxX) maxX = point.x;
				if (point.y > maxY) maxY = point.y;
			});

			// Calculate the face dimensions and center
			const faceWidth = maxX - minX;
			const faceHeight = maxY - minY;
			const faceCenterX = minX + faceWidth / 2;
			const faceCenterY = minY + faceHeight / 2;

			// Calculate scaling factor to maintain consistent size
			// Adjust the targetWidth value to control how large the face appears
			const targetWidth = canvas.width * 0.5; // Face takes 50% of canvas width
			const scale = targetWidth / faceWidth;

			// Set style for the mesh
			ctx.strokeStyle = '#00ffd9'; // Teal/cyan color
			ctx.lineWidth = 1;

			// Transform each keypoint to maintain consistent size
			const scaledKeypoints = face.keypoints.map((point: any) => ({
				x: (point.x - faceCenterX) * scale + (canvas.width / 2),
				y: (point.y - faceCenterY) * scale + (canvas.height / 2),
				z: point.z
			}));

			// Create normalized keypoints for drawing functions
			const normalizedKeypoints = scaledKeypoints.map((point: any) => ({
				x: point.x / canvas.width,
				y: point.y / canvas.height,
				z: point.z
			}));

			// Draw the mesh using the normalized keypoints for both points and triangles
			drawPoints(ctx, normalizedKeypoints, { color: '#00ffd9', radius: 0.5 });
			drawTriangles(ctx, normalizedKeypoints, { color: '#00ffd9', lineWidth: 1 });
			
		}
	} else {
		// If no faces detected but detection is active
		ctx.font = 'bold 24px Arial';
		ctx.fillStyle = '#00ffd9';
		ctx.textAlign = 'center';
		ctx.fillText(
			'No face detected',
			canvas.width / 2,
			canvas.height / 2
		);
	}

	// Draw the original mesh on the overlay canvas
	drawOriginalFaceMesh(faces, overlayCanvasRef, isDetectingRef);
};

// Render stopped camera view with grayscale effect
export const renderStoppedCameraView = (
	lastFrameSnapshot: ImageData | null,
	canvasRef: React.RefObject<HTMLCanvasElement>
) => {
	if (!lastFrameSnapshot || !canvasRef.current) return;

	const canvas = canvasRef.current;
	const ctx = canvas.getContext('2d');
	if (!ctx) return;

	// Create a grayscale version of the snapshot
	const grayscaleData = new Uint8ClampedArray(lastFrameSnapshot.data.length);
	for (let i = 0; i < lastFrameSnapshot.data.length; i += 4) {
		const avg = (lastFrameSnapshot.data[i] + lastFrameSnapshot.data[i + 1] + lastFrameSnapshot.data[i + 2]) / 3;
		grayscaleData[i] = avg;     // R
		grayscaleData[i + 1] = avg; // G
		grayscaleData[i + 2] = avg; // B
		grayscaleData[i + 3] = lastFrameSnapshot.data[i + 3]; // A
	}

	// Put the grayscale image on the canvas
	const grayscaleImageData = new ImageData(grayscaleData, lastFrameSnapshot.width, lastFrameSnapshot.height);
	ctx.putImageData(grayscaleImageData, 0, 0);

	// Add overlay with text
	ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	ctx.font = 'bold 24px Arial';
	ctx.fillStyle = '#ffffff';
	ctx.textAlign = 'center';
	ctx.fillText(
		'Camera Off',
		canvas.width / 2,
		canvas.height / 2 - 15
	);

	ctx.font = '18px Arial';
	ctx.fillText(
		'Click "Start Camera" to resume',
		canvas.width / 2,
		canvas.height / 2 + 20
	);
}; 