import { useCourseStore } from "@/store/courseStore";
import LottieView from "lottie-react-native";
import { useEffect, useRef } from "react";
export const LottieComponentAutoplay = ({ source, webStyle }: { source: any; webStyle: any }) => {
	const { setChecking } = useCourseStore();
	const animationRef = useRef<LottieView>(null);
	useEffect(() => {
		animationRef.current?.reset();
		animationRef.current?.play(0);
	}, [source]);

	const onAnimationFinish = () => {
		setChecking(false);
	};
	return <LottieView ref={animationRef} source={source} webStyle={webStyle} loop={false}
		autoPlay={true}
		onAnimationFinish={onAnimationFinish} />;
};
