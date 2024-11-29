import VideoComponent from "../../VideoComponent";

interface VideoSlideProps {
  url: string;
  index: number;
}

const VideoSlide: React.FC<VideoSlideProps> = (props) => {
  return <VideoComponent {...props} />;
};

export default VideoSlide;
