'use dom'

import { useEffect, useRef, useCallback, useMemo, memo, useReducer, lazy, Suspense } from 'react';
import './RGBPixelSimulator.css';
import StepCard from './ui/StepCard';
import ExpandableFact from './ui/ExpandableFact';
// Use lazy loading for PixelGrid component
const PixelGrid = lazy(() => import('./ui/PixelGrid'));

// Utility function for debouncing
const debounce = <T extends unknown>(fn: (this: T, ...args: any[]) => void, ms = 10) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function(this: T, ...args: any[]) {
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
			return () => {};
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

const CombinedColorBox = memo(({ color }: { color: string }) => (
  <div className="combined-color" style={{ backgroundColor: color }}>
    <p className="combined-text">Combined Color</p>
  </div>
));

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

export default function PixelSimulator() {
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

	// Memoize the step cards to prevent re-renders when only colors change
	const PixelStep = useMemo(() => (
	  <StepCard stepNumber={1} title="What Is a Pixel?">
		<p>
			A pixel (short for "picture element") is the smallest unit of a digital image.
			Think of it as a tiny square that contains a single color. When many pixels are arranged in a grid,
			they form the images you see on screens.
		</p>

		<div className="pixel-illustration">
			<Suspense fallback={<SuspenseFallback />}>
				<PixelGrid highlightColor={combinedColor} />
			</Suspense>
			<div className="pixel-zoom">
				<div className="zoomed-pixel" style={{ backgroundColor: combinedColor }}>
					<span>1 Pixel</span>
				</div>
			</div>
		</div>

		<ExpandableFact
			title="Savvy Fact: Screen Resolution"
			emoji="🖥️"
			color="#0ea5e9"
		>
			<p>
				Modern screens have millions of pixels! A 4K screen has over 8 million pixels.
			</p>
		</ExpandableFact>
	  </StepCard>
	), [combinedColor]);

	const ColorStep = useMemo(() => (
	  <StepCard stepNumber={2} title="Pixel Color Fundamentals" color="#0ea5e9">
		<p>
			Each pixel on your screen can display a single color at a time. The color is created by
			mixing three primary colors of light: <span style={{ color: 'var(--red)' }}>Red</span>,
			<span style={{ color: 'var(--green)' }}>Green</span>, and
			<span style={{ color: 'var(--blue)' }}>Blue</span> (RGB).
		</p>

		<div className="color-section">
			<div className="color-boxes">
				<ColorBox color={redBoxColor} label="Red" />
				<ColorBox color={greenBoxColor} label="Green" />
				<ColorBox color={blueBoxColor} label="Blue" />
			</div>

			<CombinedColorBox color={combinedColor} />
		</div>

		<div className="info-box">
			<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="42" height="42" fill="none" viewBox="0 0 24 24">
				<path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16.872 9.687 20 6.56 17.44 4 4 17.44 6.56 20 16.873 9.687Zm0 0-2.56-2.56M6 7v2m0 0v2m0-2H4m2 0h2m7 7v2m0 0v2m0-2h-2m2 0h2M8 4h.01v.01H8V4Zm2 2h.01v.01H10V6Zm2-2h.01v.01H12V4Zm8 8h.01v.01H20V12Zm-2 2h.01v.01H18V14Zm2 2h.01v.01H20V16Z" />
			</svg>

			<span>
				Try moving the sliders below to see how different combinations of Red, Green, and Blue
				create different colors. This is exactly how pixels on your screen work!
			</span>
		</div>

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
			color="#f97316"
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
	  <StepCard stepNumber={3} title="Grayscale Conversion">
		<p>
			Grayscale is created by averaging the three color values into one brightness number between 0 (black) and 1 (white).
		</p>

		<div className="grayscale-comparison">
			<div className="color-pixel" style={{ backgroundColor: combinedColor }}>
				<span>Color</span>
			</div>
			<div className="grayscale-pixel" style={{ backgroundColor: grayscaleColor }}>
				<span>Grayscale</span>
			</div>
		</div>
		<div className="value-display">
			<p className="value-label">Value: {normalizedValue}</p>
		</div>

		<ExpandableFact
			title="Grayscale Formula"
			emoji="🔢"
			color="#64748b"
		>
			<p>Grayscale Formula: (<span style={{ color: 'var(--red)' }}>Red</span> + <span style={{ color: 'var(--green)' }}>Green</span> + <span style={{ color: 'var(--blue)' }}>Blue</span>) ÷ 3</p>
			<p>({red} + {green} + {blue}) ÷ 3 = {grayscale}</p>
			<p>Normalized Value (0-1): {normalizedValue}</p>
		</ExpandableFact>
	  </StepCard>
	), [combinedColor, grayscaleColor, normalizedValue, red, green, blue, grayscale]);

	return (
		<div className="lesson-container">
			<h1 className="lesson-title">Understanding Pixels</h1>
			{PixelStep}
			{ColorStep}
			{GrayscaleStep}
		</div>
	);
}
