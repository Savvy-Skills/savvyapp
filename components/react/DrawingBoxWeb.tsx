'use dom'

import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';

interface DrawingBoxProps {
	width?: number | string;
	height?: number | string;
	lineWidth?: number;
	className?: string;
	onDrawChange?: (base64Image: string) => void;
}

export interface DrawingBoxHandle {
	getBase64Image: () => string;
	clearCanvas: () => void;
	isEmpty: () => boolean;
}

const DrawingBoxWeb = forwardRef<DrawingBoxHandle, DrawingBoxProps>(({
	width = '100%',
	height = '100%',
	lineWidth = 10,
	className = '',
	onDrawChange,
}, ref) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [isDrawing, setIsDrawing] = useState(false);
	const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
	const [isEmpty, setIsEmpty] = useState(true);

	// Initialize canvas
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const context = canvas.getContext('2d');
		if (!context) return;

		// Set up canvas
		context.lineCap = 'round';
		context.lineJoin = 'round';
		context.strokeStyle = 'black';
		context.lineWidth = lineWidth;

		setCtx(context);
	}, []);

	// Set up canvas background
	useEffect(() => {
		if (!ctx || !canvasRef.current) return;

		// Update line width when it changes
		ctx.lineWidth = lineWidth;

		// Only clear and set white background on initial setup
		if (!canvasRef.current.getAttribute('data-initialized')) {
			ctx.fillStyle = 'white';
			ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
			canvasRef.current.setAttribute('data-initialized', 'true');

			// Initial image callback
			if (onDrawChange) {
				onDrawChange(canvasRef.current.toDataURL('image/jpeg', 0.8));
			}
		}
	}, [ctx, lineWidth, onDrawChange]);

	const startDrawing = (x: number, y: number) => {
		if (!ctx) return;
		ctx.beginPath();
		ctx.moveTo(x, y);
		setIsDrawing(true);
	};

	const draw = (x: number, y: number) => {
		if (!isDrawing || !ctx) return;

		// Ensure line width is maintained during drawing
		ctx.lineWidth = lineWidth;

		ctx.lineTo(x, y);
		ctx.stroke();

		// Canvas is not empty when drawing
		setIsEmpty(false);

		// Notify about drawing change
		if (onDrawChange) {
			onDrawChange(getBase64Image());
		}
	};

	const stopDrawing = () => {
		if (!ctx) return;
		ctx.closePath();
		setIsDrawing(false);
	};

	const getCoordinates = (event: React.MouseEvent | React.TouchEvent): { x: number, y: number } | null => {
		const canvas = canvasRef.current;
		if (!canvas) return null;

		const rect = canvas.getBoundingClientRect();

		if ('touches' in event) {
			// Touch event
			return {
				x: event.touches[0].clientX - rect.left,
				y: event.touches[0].clientY - rect.top,
			};
		} else {
			// Mouse event
			return {
				x: event.clientX - rect.left,
				y: event.clientY - rect.top,
			};
		}
	};

	const handleMouseDown = (event: React.MouseEvent) => {
		const coords = getCoordinates(event);
		if (coords) startDrawing(coords.x, coords.y);
	};

	const handleMouseMove = (event: React.MouseEvent) => {
		const coords = getCoordinates(event);
		if (coords) draw(coords.x, coords.y);
	};

	const handleTouchStart = (event: React.TouchEvent) => {
		event.preventDefault();
		const coords = getCoordinates(event);
		if (coords) startDrawing(coords.x, coords.y);
	};

	const handleTouchMove = (event: React.TouchEvent) => {
		event.preventDefault();
		const coords = getCoordinates(event);
		if (coords) draw(coords.x, coords.y);
	};

	const clearCanvas = () => {
		if (!ctx || !canvasRef.current) return;

		// Maintain the line width when clearing
		const currentLineWidth = ctx.lineWidth;

		ctx.fillStyle = 'white';
		ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

		// Restore the line width after clearing
		ctx.lineWidth = currentLineWidth;

		// Set state to empty
		setIsEmpty(true);

		// Notify about drawing change after clearing
		if (onDrawChange) {
			onDrawChange(getBase64Image());
		}
	};

	// This function gets the base64 image with inverted colors
	const getBase64Image = (): string => {
		if (!canvasRef.current) return '';

		// Return the base64 representation
		return canvasRef.current.toDataURL('image/jpeg', 0.8);
	};

	// Expose methods to parent via ref
	useImperativeHandle(ref, () => ({
		getBase64Image,
		clearCanvas,
		isEmpty: () => isEmpty
	}));

	return (
		<div className={className} style={{ width: '100%', height: '100%' }}>

			<canvas
				ref={canvasRef}
				width={typeof width === 'number' ? width : canvasRef.current?.parentElement?.clientWidth || 400}
				height={typeof height === 'number' ? height : canvasRef.current?.parentElement?.clientHeight || 400}
				onMouseDown={handleMouseDown}
				onMouseMove={handleMouseMove}
				onMouseUp={stopDrawing}
				onMouseLeave={stopDrawing}
				onTouchStart={handleTouchStart}
				onTouchMove={handleTouchMove}
				onTouchEnd={stopDrawing}
				style={{
					backgroundColor: 'white',
					touchAction: 'none',
					width: '100%',
					height: '100%',
					display: 'block'
				}}
			/>
		</div>
	);
});

export default DrawingBoxWeb;
