import { ContentInfo } from "@/types";
import ImageEncodingComponent from "./ImageEncondingLesson";
export type Step = "resizing" | "RGB" |  "grayscale"

export default function ImageEncoding({ content }: { content: ContentInfo }) {


	const allowImageUpload = content.mode === "advanced";
	const availableResolutions = content.mode === "advanced" ? [30, 50, 100, 224] : [30, 50];
	const step = content.state.step || "RGB";

	return <ImageEncodingComponent step={step as Step} allowImageUpload={allowImageUpload} showSampleImages={true} availableResolutions={availableResolutions as (30 | 50 | 100 | 224)[]} defaultResolution={30} />;
}