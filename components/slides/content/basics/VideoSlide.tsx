import VideoComponent from "../advanced/VideoComponent";

export interface VideoSlideProps {
  url: string;
  index: number;
  canComplete: boolean;
}

const VideoSlide: React.FC<VideoSlideProps> = (props) => {
  return <VideoComponent {...props} />;
};

export default VideoSlide;
