import { useEffect, useRef, useCallback, useMemo, memo, useReducer, lazy, Suspense, useState } from 'react';
import './RGBPixelSimulator.css';
import StepCard from './ui/StepCard';
import ExpandableFact from './ui/ExpandableFact';
import { ContentInfo } from '@/types';
import RegularFact from './ui/RegularFact';
// Use lazy loading for PixelGrid component
const PixelGrid = lazy(() => import('./ui/PixelGrid'));

// Utility function for debouncing
const debounce = <T extends unknown>(fn: (this: T, ...args: any[]) => void, ms = 10) => {
	let timeoutId: ReturnType<typeof setTimeout>;
	return function (this: T, ...args: any[]) {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => fn.apply(this, args), ms);
	};
};

// Separate component to handle the sliders only
const ColorSliders = memo(({ red, green, blue, setRed, setGreen, setBlue }: {
	red: number,
	green: number,
	blue: number,
	setRed: (value: number) => void,
	setGreen: (value: number) => void,
	setBlue: (value: number) => void
}) => {
	const redSliderRef = useRef<HTMLInputElement>(null);
	const greenSliderRef = useRef<HTMLInputElement>(null);
	const blueSliderRef = useRef<HTMLInputElement>(null);

	// Update slider background using requestAnimationFrame for better performance
	const updateSliderBackground = useCallback((slider: HTMLInputElement | null, value: number, color: string) => {
		if (slider) {
			requestAnimationFrame(() => {
				const percentage = (value / 255) * 100;
				slider.style.background = `linear-gradient(to right, var(${color}) 0%, var(${color}) ${percentage}%, #ececec ${percentage}%, #ececec 100%)`;
			});
		}
	}, []);

	// Debounced version of setRed for better performance
	const debouncedSetRed = useMemo(() => debounce(setRed, 5), [setRed]);
	const debouncedSetGreen = useMemo(() => debounce(setGreen, 5), [setGreen]);
	const debouncedSetBlue = useMemo(() => debounce(setBlue, 5), [setBlue]);

	// Optimize handlers with direct state updates and requestAnimationFrame
	const handleRedChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const value = +e.target.value;
		debouncedSetRed(value);
		updateSliderBackground(redSliderRef.current, value, '--red');
	}, [debouncedSetRed, updateSliderBackground]);

	const handleGreenChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const value = +e.target.value;
		debouncedSetGreen(value);
		updateSliderBackground(greenSliderRef.current, value, '--green');
	}, [debouncedSetGreen, updateSliderBackground]);

	const handleBlueChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const value = +e.target.value;
		debouncedSetBlue(value);
		updateSliderBackground(blueSliderRef.current, value, '--blue');
	}, [debouncedSetBlue, updateSliderBackground]);

	// Set initial slider backgrounds on mount only
	useEffect(() => {
		updateSliderBackground(redSliderRef.current, red, '--red');
		updateSliderBackground(greenSliderRef.current, green, '--green');
		updateSliderBackground(blueSliderRef.current, blue, '--blue');

		// Add passive event listeners for better touch performance
		const addPassiveListener = (element: HTMLElement | null, event: string, handler: any) => {
			if (element) {
				element.addEventListener(event, handler, { passive: true });
				return () => element.removeEventListener(event, handler);
			}
			return () => { };
		};

		const cleanupRed = addPassiveListener(redSliderRef.current, 'touchmove', (e: TouchEvent) => {
			e.preventDefault(); // This won't actually be called due to passive: true
		});

		const cleanupGreen = addPassiveListener(greenSliderRef.current, 'touchmove', (e: TouchEvent) => {
			e.preventDefault(); // This won't actually be called due to passive: true
		});

		const cleanupBlue = addPassiveListener(blueSliderRef.current, 'touchmove', (e: TouchEvent) => {
			e.preventDefault(); // This won't actually be called due to passive: true
		});

		return () => {
			cleanupRed();
			cleanupGreen();
			cleanupBlue();
		};
	}, []); // Only run on mount

	return (
		<div className="sliders">
			<div className="slider-group">
				<label htmlFor="red" className="slider-label red">Red: {red}</label>
				<input
					id="red"
					type="range"
					min="0"
					max="255"
					value={red}
					onChange={handleRedChange}
					className="slider red"
					ref={redSliderRef}
				/>
			</div>
			<div className="slider-group">
				<label htmlFor="green" className="slider-label green">Green: {green}</label>
				<input
					id="green"
					type="range"
					min="0"
					max="255"
					value={green}
					onChange={handleGreenChange}
					className="slider green"
					ref={greenSliderRef}
				/>
			</div>
			<div className="slider-group">
				<label htmlFor="blue" className="slider-label blue">Blue: {blue}</label>
				<input
					id="blue"
					type="range"
					min="0"
					max="255"
					value={blue}
					onChange={handleBlueChange}
					className="slider blue"
					ref={blueSliderRef}
				/>
			</div>
		</div>
	);
});

// Memoized color box components to prevent unnecessary re-renders
const ColorBox = memo(({ color, label }: { color: string, label: string }) => (
	<div className="color-box" style={{ backgroundColor: color }}>{label}</div>
));

const CombinedColorBox = memo(({ color }: { color: string }) => {
	const [r, g, b] = color.replace('rgb(', '').replace(')', '').split(',').map(Number);
	return (
		<div className="combined-color" style={{ backgroundColor: color }}>
			<span className="combined-text">Combined</span>
			<span className="combined-text">Color</span>
			<span className="combined-text">R: {r}, G: {g}, B: {b}</span>
		</div>
	);
});

// Reducer to handle all color state updates in one place
type ColorState = {
	red: number;
	green: number;
	blue: number;
};

type ColorAction =
	| { type: 'SET_RED'; value: number }
	| { type: 'SET_GREEN'; value: number }
	| { type: 'SET_BLUE'; value: number };

function colorReducer(state: ColorState, action: ColorAction): ColorState {
	switch (action.type) {
		case 'SET_RED':
			return { ...state, red: action.value };
		case 'SET_GREEN':
			return { ...state, green: action.value };
		case 'SET_BLUE':
			return { ...state, blue: action.value };
		default:
			return state;
	}
}

// Create a memoized fallback component for Suspense
const SuspenseFallback = memo(() => (
	<div style={{
		width: '100%',
		height: '240px',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#f5f5f5',
		borderRadius: '8px'
	}}>
		Loading...
	</div>
));

// Add this helper function at the top of the file or in a utils file
const rgbToHex = (r: number, g: number, b: number): string => {
	return '#' + [r, g, b].map(x => {
		const hex = x.toString(16);
		return hex.length === 1 ? '0' + hex : hex;
	}).join('');
};

export default function PixelSimulator({ content }: { content: ContentInfo }) {
	// Use reducer instead of multiple useState calls
	const [colorState, dispatch] = useReducer(colorReducer, {
		red: 128,
		green: 128,
		blue: 128
	});

	const { red, green, blue } = colorState;

	// Handlers for updating colors
	const setRed = useCallback((value: number) => {
		dispatch({ type: 'SET_RED', value });
	}, []);

	const setGreen = useCallback((value: number) => {
		dispatch({ type: 'SET_GREEN', value });
	}, []);

	const setBlue = useCallback((value: number) => {
		dispatch({ type: 'SET_BLUE', value });
	}, []);

	// Memoize these values to prevent recalculation on every render
	const combinedColor = useMemo(() => `rgb(${red}, ${green}, ${blue})`, [red, green, blue]);
	const grayscale = useMemo(() => Math.round((red + green + blue) / 3), [red, green, blue]);
	const grayscaleColor = useMemo(() => `rgb(${grayscale}, ${grayscale}, ${grayscale})`, [grayscale]);
	const normalizedValue = useMemo(() => (grayscale / 255).toFixed(2), [grayscale]);

	// Memoize color values for the color boxes
	const redBoxColor = useMemo(() => `rgb(${red},0,0)`, [red]);
	const greenBoxColor = useMemo(() => `rgb(0,${green},0)`, [green]);
	const blueBoxColor = useMemo(() => `rgb(0,0,${blue})`, [blue]);

	// Add this new state in the main PixelSimulator component
	const [grayscaleCustomColor, setGrayscaleCustomColor] = useState(combinedColor);

	// Add this effect to update custom color when combined color changes
	useEffect(() => {
		setGrayscaleCustomColor(combinedColor);
	}, [combinedColor]);

	// Add this function to handle color change
	const handleGrayscaleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setGrayscaleCustomColor(e.target.value);
	};

	// Update the grayscale calculations based on custom color
	const customGrayscaleValues = useMemo(() => {
		// Parse RGB values from custom color
		let r = 0, g = 0, b = 0;

		if (grayscaleCustomColor.startsWith('rgb')) {
			const match = grayscaleCustomColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
			if (match) {
				r = parseInt(match[1], 10);
				g = parseInt(match[2], 10);
				b = parseInt(match[3], 10);
			}
		} else if (grayscaleCustomColor.startsWith('#')) {
			r = parseInt(grayscaleCustomColor.slice(1, 3), 16);
			g = parseInt(grayscaleCustomColor.slice(3, 5), 16);
			b = parseInt(grayscaleCustomColor.slice(5, 7), 16);
		}

		const gray = Math.round((r + g + b) / 3);
		const grayColor = `rgb(${gray}, ${gray}, ${gray})`;
		const normalizedVal = (gray / 255).toFixed(2);

		return { r, g, b, gray, grayColor, normalizedVal };
	}, [grayscaleCustomColor]);

	// Memoize the step cards to prevent re-renders when only colors change
	const PixelStep = useMemo(() => (
		<StepCard
			stepNumber={1}
			title="What Is a Pixel?"
			stepNumberStyle={{ whiteSpace: 'nowrap', minWidth: '60px', flexShrink: 0 }}
			titleStyle={{ flexGrow: 1, hyphens: 'auto', overflowWrap: 'break-word' }}
		>
			<p>
				A pixel (short for "picture element") is the smallest unit of a digital image.
				Think of it as a tiny square that contains a single color. When many pixels are arranged in a grid,
				they form the images you see on screens.
			</p>
			<RegularFact fact="Try selecting a pixel in the grid blow to see its color and change it." />

			<div className="pixel-illustration">
				<Suspense fallback={<SuspenseFallback />}>
					<PixelGrid highlightColor={combinedColor} preselectedPixel={0} />
				</Suspense>
			</div>

			<ExpandableFact
				title="Savvy Fact: Screen Resolution"
				emoji="🖥️"
				color="var(--info-color)"
			>
				<p>
					Modern screens have millions of pixels! A 4K screen has over 8 million pixels.
				</p>
			</ExpandableFact>
		</StepCard>
	), [combinedColor]);

	const ColorStep = useMemo(() => (
		<StepCard
			stepNumber={2}
			title="Pixel Color Fundamentals"
			stepNumberStyle={{ whiteSpace: 'nowrap', minWidth: '60px', flexShrink: 0 }}
			titleStyle={{ flexGrow: 1, hyphens: 'auto', overflowWrap: 'break-word' }}
		>
			<p>
				Each pixel on your screen can display a single color at a time. The color is created by
				mixing three primary colors of light: <span style={{ color: 'var(--red)' }}>Red</span>,
				<span style={{ color: 'var(--green)' }}> Green</span>, and
				<span style={{ color: 'var(--blue)' }}> Blue</span> (RGB).
			</p>

			<div className="color-section">
				<div className="color-boxes">
					<ColorBox color={redBoxColor} label={`Red: ${red}`} />
					<ColorBox color={greenBoxColor} label={`Green: ${green}`} />
					<ColorBox color={blueBoxColor} label={`Blue: ${blue}`} />
				</div>

				<CombinedColorBox color={combinedColor} />
			</div>

			<RegularFact fact="Try moving the sliders below to see how different combinations of Red, Green, and Blue create different colors. This is exactly how pixels on your screen work!" />

			{/* Extract sliders into a separate component to minimize re-renders */}
			<ColorSliders
				red={red}
				green={green}
				blue={blue}
				setRed={setRed}
				setGreen={setGreen}
				setBlue={setBlue}
			/>

			<ExpandableFact
				title="RGB Colors"
				emoji="🎨"
				color="var(--secondary-color)"
			>
				<p>
					Did you know that with just these three colors (RGB), we can create
					over 16 million different colors? That's because each color has 256
					possible values (0-255), which gives us 256 × 256 × 256 = 16,777,216
					possible combinations!
				</p>
			</ExpandableFact>
		</StepCard>
	), [combinedColor, redBoxColor, greenBoxColor, blueBoxColor, red, green, blue, setRed, setGreen, setBlue]);

	const GrayscaleStep = useMemo(() => (
		<StepCard
			stepNumber={3}
			title="Grayscale Conversion"
			stepNumberStyle={{ whiteSpace: 'nowrap', minWidth: '60px', flexShrink: 0 }}
			titleStyle={{ flexGrow: 1, hyphens: 'auto', overflowWrap: 'break-word' }}
		>
			<p>
				Grayscale is created by averaging the three color values into one brightness number between 0 (black) and 1 (white).
			</p>

			<div className="grayscale-comparison">
				<div className="color-pixel-container">
					<span>Select color</span>
					<div className="color-pixel" 
						style={{ 
							backgroundColor: grayscaleCustomColor,
							cursor: 'pointer',
							position: 'relative'
						}}
						onClick={() => document.getElementById('colorPickerInput')?.click()}
					>
						<span>Color</span>
						<input
							id="colorPickerInput"
							type="color"
							value={grayscaleCustomColor.startsWith('#')
								? grayscaleCustomColor
								: rgbToHex(customGrayscaleValues.r, customGrayscaleValues.g, customGrayscaleValues.b)}
							onChange={handleGrayscaleColorChange}
							style={{ opacity: 0, position: 'absolute', width: '100%', height: '100%', top: 0, left: 0 }}
						/>
					</div>
					<span>R:{customGrayscaleValues.r}, G:{customGrayscaleValues.g}, B:{customGrayscaleValues.b}</span>
				</div>

				<div className="grayscale-pixel" style={{ backgroundColor: customGrayscaleValues.grayColor }}>
					<span>Grayscale</span>
				</div>
			</div>
			<div className="value-display">
				<p className="value-label">Value: {customGrayscaleValues.normalizedVal}</p>
			</div>

			<ExpandableFact
				title="Grayscale Formula"
				emoji="🔢"
				color="var(--primary-color)"
			>
				<p>Grayscale Formula: (<span style={{ color: 'var(--red)' }}>Red</span> + <span style={{ color: 'var(--green)' }}>Green</span> + <span style={{ color: 'var(--blue)' }}>Blue</span>) ÷ 3</p>
				<p>({customGrayscaleValues.r} + {customGrayscaleValues.g} + {customGrayscaleValues.b}) ÷ 3 = {customGrayscaleValues.gray}</p>
				<p>Normalized Value (0-1): {customGrayscaleValues.normalizedVal}</p>
			</ExpandableFact>
		</StepCard>
	), [grayscaleCustomColor, customGrayscaleValues, handleGrayscaleColorChange]);

	const step = content?.state.step || "pixel";

	return (
		<div>
			{step == "pixel" && PixelStep}
			{step == "RGB" && ColorStep}
			{step == "grayscale" && GrayscaleStep}
		</div>
	);
}
