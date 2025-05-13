'use dom'
import { useEffect, useState } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";


function SavvyAgentGame() {
	const { unityProvider, requestFullscreen } = useUnityContext({
		loaderUrl: ("unity/SavvyAgent.loader.js"),
		dataUrl: ("unity/SavvyAgent.data"),
		frameworkUrl: ("unity/SavvyAgent.framework.js"),
		codeUrl: ("unity/SavvyAgent.wasm"),
	});
	// We'll use a state to store the device pixel ratio.
	const [devicePixelRatio, setDevicePixelRatio] = useState(
		window.devicePixelRatio
	);
	

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
			<Unity
				unityProvider={unityProvider}
				style={{ width: 1280, height: 720 }}
				devicePixelRatio={devicePixelRatio}
			/>
			<div id="buttons">
				<button id="fullscreen-button" onClick={handleFullscreen}>Fullscreen</button>
			</div>
		</div>
	);


}

export default SavvyAgentGame;
