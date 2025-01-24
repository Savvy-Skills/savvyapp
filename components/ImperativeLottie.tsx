import React, { useEffect, useRef } from "react";
import LottieView from "lottie-react-native";


interface AnimationWithImperativeApiProps {
	state: AnimationState;
	show: boolean;
}
interface AnimationState {
	lottie: 'revealed'  | 'correct' | 'incorrect';
	play: boolean;

}

export default function AnimationWithImperativeApi({ state, show }: AnimationWithImperativeApiProps) {
	const animationRefs = {
		revealed: useRef<LottieView>(null),
		correct: useRef<LottieView>(null),
		incorrect: useRef<LottieView>(null),
	};

	useEffect(() => {
		if (show) {
			if (state.play) {
				animationRefs[state.lottie].current?.play(0);
			} else {
				animationRefs[state.lottie].current?.play(state.lottie === 'revealed' ? 85 : 45);
			}
		} 
	}, [show, state]);

	return (
		<div style={{ opacity: show ? 1 : 0 }}>
			<LottieView
				ref={animationRefs.revealed}
				source={require('@/assets/lottie/revealed.json')}
				webStyle={{ width: "100%", height: "100%", opacity: state.lottie === 'revealed' ? 1 : 0 }}
				style={{ width: "100%", height: "100%", opacity: state.lottie === 'revealed' ? 1 : 0 }}
				autoPlay={false}
				loop={false}
			/>
			<LottieView
				ref={animationRefs.correct}
				source={require('@/assets/lottie/correct.json')}
				webStyle={{ width: "100%", height: "100%", opacity: state.lottie === 'correct' ? 1 : 0 }}
				style={{ width: "100%", height: "100%", opacity: state.lottie === 'correct' ? 1 : 0 }}
				autoPlay={false}
				loop={false}
			/>
			<LottieView
				ref={animationRefs.incorrect}
				source={require('@/assets/lottie/incorrect.json')}
				webStyle={{ width: "100%", height: "100%", opacity: state.lottie === 'incorrect' ? 1 : 0 }}
				style={{ width: "100%", height: "100%", opacity: state.lottie === 'incorrect' ? 1 : 0 }}
				autoPlay={false}
				loop={false}
			/>
		</div>
	);
}
