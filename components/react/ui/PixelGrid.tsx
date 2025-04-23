import React, { useState, useEffect, memo } from 'react';

interface PixelGridProps {
	highlightColor: string;
	preselectedPixel: number;
}

const PixelGrid: React.FC<PixelGridProps> = memo(({ highlightColor, preselectedPixel }) => {
	// State to track colors of all pixels in the grid
	const [pixelColors, setPixelColors] = useState<string[]>([]);
	// State to track the currently selected pixel index
	const [selectedPixel, setSelectedPixel] = useState<number | null>(null);
	// Parse RGB values from the selected pixel color
	const [rgbValues, setRgbValues] = useState({ r: 0, g: 0, b: 0 });

	// Initialize the grid with default colors when the component mounts or highlight color changes
	useEffect(() => {
		setPixelColors(Array(64).fill(0).map((_, i) =>
			i % 9 === 0 ? highlightColor : '#f0f0f0'
		));
	}, [highlightColor]);

	// Update RGB values when a pixel is selected
	useEffect(() => {
		if (selectedPixel !== null && pixelColors[selectedPixel]) {
			const color = pixelColors[selectedPixel];
			// Parse RGB values from the color string
			if (color.startsWith('rgb')) {
				const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
				if (rgbMatch) {
					setRgbValues({
						r: parseInt(rgbMatch[1], 10),
						g: parseInt(rgbMatch[2], 10),
						b: parseInt(rgbMatch[3], 10)
					});
				}
			} else if (color.startsWith('#')) {
				// Handle hex colors
				const r = parseInt(color.slice(1, 3), 16);
				const g = parseInt(color.slice(3, 5), 16);
				const b = parseInt(color.slice(5, 7), 16);
				setRgbValues({ r, g, b });
			}
		}
	}, [selectedPixel, pixelColors]);

	// Handle pixel selection
	const handlePixelClick = (index: number) => {
		setSelectedPixel(index);
	};

	// Handle color change for the selected pixel
	const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (selectedPixel !== null) {
			const newColors = [...pixelColors];
			newColors[selectedPixel] = e.target.value;
			setPixelColors(newColors);
		}
	};

	useEffect(() => {
		setSelectedPixel(preselectedPixel);
	}, [preselectedPixel]);

	// Convert hex to RGB for display
	const hexToRgb = (hex: string) => {
		const r = parseInt(hex.slice(1, 3), 16);
		const g = parseInt(hex.slice(3, 5), 16);
		const b = parseInt(hex.slice(5, 7), 16);
		return { r, g, b };
	};

	return (
		<div className="pixel-simulator-container">
			<div className="pixel-grid">
				{pixelColors.map((color, i) => (
					<div
						key={i}
						className={`single-pixel ${selectedPixel === i ? 'selected-pixel' : ''}`}
						style={{
							backgroundColor: color,
							border: selectedPixel === i ? '2px solid #0066ff' : '1px solid #ddd'
						}}
						onClick={() => handlePixelClick(i)}
					></div>
				))}
			</div>

			<div className="pixel-zoom-container">
				{selectedPixel !== null && (
					<span>Select color</span>
				)}

				<div className="pixel-zoom">
					<div
						className="zoomed-pixel"
						style={{
							backgroundColor: selectedPixel !== null ? pixelColors[selectedPixel] : highlightColor,
							cursor: selectedPixel !== null ? 'pointer' : 'default',
							position: 'relative'
						}}
						onClick={() => {
							if (selectedPixel !== null) {
								document.getElementById('pixelColorPicker')?.click();
							}
						}}
					>
						{selectedPixel !== null && (
							<input
								id="pixelColorPicker"
								type="color"
								value={pixelColors[selectedPixel].startsWith('#')
									? pixelColors[selectedPixel]
									: '#000000'}
								onChange={handleColorChange}
								style={{ 
									opacity: 0, 
									position: 'absolute', 
									width: '100%', 
									height: '100%', 
									top: 0, 
									left: 0 
								}}
							/>
						)}
					</div>

					{/* Text moved outside the pixel */}
					<div className="pixel-info">
						<div className="pixel-label">1 Pixel</div>
						{selectedPixel !== null && (
							<div className="rgb-values">
								R: {rgbValues.r}, G: {rgbValues.g}, B: {rgbValues.b}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
});

export default PixelGrid; 