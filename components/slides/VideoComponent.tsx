import { Platform } from "react-native";
import WebVideoComponent from "../WebVideoComponent";
import MobileVideoComponent from "../MobileVideoComponent";

interface VideoSlideProps {
  url: string;
  isActive: boolean;
  onVideoEnd?: () => void;
}

const VideoComponent: React.FC<VideoSlideProps> = (props) => {
  return Platform.OS === "web" ? (
    <WebVideoComponent {...props} />
  ) : (
    <MobileVideoComponent {...props} />
  );
};

export default VideoComponent;
