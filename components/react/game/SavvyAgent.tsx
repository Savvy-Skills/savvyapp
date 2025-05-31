'use dom'
import GameLoadingScreen from "@/app/(misc)/debug/LoadingScreen";
import { useEffect, useState, useCallback } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";


interface SavvyAgentGameProps {	
	gameKey: string;
	urls: {
		loaderUrl: string;
		dataUrl: string;
		frameworkUrl: string;
		codeUrl: string;
	};
}

function capitalize(str: string) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

function SavvyAgentGame({ gameKey, urls }: SavvyAgentGameProps) {


	const { unityProvider, requestFullscreen, loadingProgression, isLoaded, unload  } = useUnityContext({
		loaderUrl: urls.loaderUrl,
		dataUrl: urls.dataUrl,
		frameworkUrl: urls.frameworkUrl,
		codeUrl: urls.codeUrl,
	});
	// We'll use a state to store the device pixel ratio.
	const [devicePixelRatio, setDevicePixelRatio] = useState(
		window.devicePixelRatio
	);

	const unloadGame = useCallback(async () => {
		try {
			await unload();
		} catch (error) {
			console.warn("Error unloading Unity game:", error);
		}
	}, [unload]);

	// Cleanup effect - runs when component unmounts or gameKey changes
	useEffect(() => {
		return () => {
			if (isLoaded) {
				unloadGame();
			}
		};
	}, [unloadGame, isLoaded]);
	
	// Effect for device pixel ratio handling
	useEffect(
		function () {
			// A function which will update the device pixel ratio of the Unity
			// Application to match the device pixel ratio of the browser.
			const updateDevicePixelRatio = function () {
				setDevicePixelRatio(window.devicePixelRatio);
			};
			// A media matcher which watches for changes in the device pixel ratio.
			const mediaMatcher = window.matchMedia(
				`screen and (resolution: ${devicePixelRatio}dppx)`
			);
			// Adding an event listener to the media matcher which will update the
			// device pixel ratio of the Unity Application when the device pixel
			// ratio changes.
			mediaMatcher.addEventListener("change", updateDevicePixelRatio);
			return function () {
				// Removing the event listener when the component unmounts.
				mediaMatcher.removeEventListener("change", updateDevicePixelRatio);
			};
		},
		[devicePixelRatio]
	);

	function handleFullscreen() {
		requestFullscreen(true);
	}

	return (
		<div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
			{!isLoaded && (
				<GameLoadingScreen progress={loadingProgression * 100} />
			)}
			<Unity
				unityProvider={unityProvider}
				style={{ width: 1280, height: 720, visibility: isLoaded ? 'visible' : 'hidden' }}
				devicePixelRatio={devicePixelRatio}
			/>
			<div id="buttons">
				<button id="fullscreen-button" onClick={handleFullscreen}>Fullscreen</button>
			</div>
		</div>
	);
}

export default SavvyAgentGame;
