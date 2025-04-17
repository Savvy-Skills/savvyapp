import { ContentInfo } from "@/types";
import ImageEncodingComponent from "./ImageEncondingLesson";

export default function ImageEncoding({ content }: { content: ContentInfo }) {


	const allowImageUpload = content.state.lessonMode === "advanced";
	const availableResolutions = content.state.lessonMode === "advanced" ? [30, 50, 100, 224] : [30, 50];

	return <ImageEncodingComponent allowImageUpload={allowImageUpload} showSampleImages={true} availableResolutions={availableResolutions as (30 | 50 | 100 | 224)[]} defaultResolution={30} />;
}