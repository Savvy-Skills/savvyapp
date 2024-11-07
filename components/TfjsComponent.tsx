import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  Platform,
  Image as ImageComp,
  ScrollView,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as tf from "@tensorflow/tfjs";
import * as posedetection from "@tensorflow-models/pose-detection";
import * as ScreenOrientation from "expo-screen-orientation";
import { cameraWithTensors } from "@tensorflow/tfjs-react-native";
import Svg, { Circle } from "react-native-svg";
import { ExpoWebGLRenderingContext } from "expo-gl";
import { Button, Text } from "react-native-paper";

const TensorCamera = cameraWithTensors(CameraView);

const IS_ANDROID = Platform.OS === "android";
const IS_IOS = Platform.OS === "ios";

const CAM_PREVIEW_WIDTH = Dimensions.get("window").width;
const CAM_PREVIEW_HEIGHT = CAM_PREVIEW_WIDTH / (IS_IOS ? 9 / 16 : 3 / 4);

const MIN_KEYPOINT_SCORE = 0.3;
const OUTPUT_TENSOR_WIDTH = 180;
const OUTPUT_TENSOR_HEIGHT = OUTPUT_TENSOR_WIDTH / (IS_IOS ? 9 / 16 : 3 / 4);
const AUTO_RENDER = false;

type CameraStatus = "running" | "error" | "loading" | "paused" | "predicting";

export default function TensorFlowPoseDetection() {
  const cameraRef = useRef<CameraView | null>(null);
  const [tfReady, setTfReady] = useState(false);
  const [model, setModel] = useState<posedetection.PoseDetector | null>(null);
  const [poses, setPoses] = useState<posedetection.Pose[]>([]);
  const [fps, setFps] = useState(0);
  const [orientation, setOrientation] =
    useState<ScreenOrientation.Orientation>();
  const [cameraType, setCameraType] = useState<"front" | "back">("front");
  const rafId = useRef<number | null>(null);
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>("loading");
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    async function prepare() {
      rafId.current = null;

      const curOrientation = await ScreenOrientation.getOrientationAsync();
      setOrientation(curOrientation);

      ScreenOrientation.addOrientationChangeListener((event) => {
        setOrientation(event.orientationInfo.orientation);
      });

      await requestPermission();
      await tf.ready();

      const movenetModelConfig: posedetection.MoveNetModelConfig = {
        modelType: posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        enableSmoothing: true,
      };
      const model = await posedetection.createDetector(
        posedetection.SupportedModels.MoveNet,
        movenetModelConfig
      );
      setModel(model);

      setTfReady(true);
    }

    prepare();

    return () => {
      if (rafId.current != null && rafId.current !== 0) {
        cancelAnimationFrame(rafId.current);
        rafId.current = 0;
      }
    };
  }, []);

  const handleCameraStream = async () => {
    setCameraStatus("running");
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (cameraStatus === "predicting") {
      intervalId = setInterval(handlePoseEstimation, 500);
    } else if (intervalId) {
      clearInterval(intervalId);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [cameraStatus]);

  const handlePoseEstimation = async () => {
    if (cameraStatus === "predicting") {
      if (!cameraRef.current || !model) return;
      const image = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.3,
      });
      if (!image) return;
      setCapturedImage(`data:image/jpeg;base64,${image.base64}`);
      const img = new Image();
      img.src = `data:image/jpeg;base64,${image.base64}`;
      img.width = image.width;
      img.height = image.height;
      img.onload = async () => {
        const poses = await model.estimatePoses(img, undefined, Date.now());
        setPoses(poses);
      };
    }
  };

  const renderPose = () => {
    if (poses.length > 0) {
      const keypoints = poses[0].keypoints
        .filter((k) => (k.score ?? 0) > MIN_KEYPOINT_SCORE)
        .map((k) => {
          const flipX = IS_ANDROID || cameraType === "back";
          const x = flipX ? getOutputTensorWidth() - k.x : k.x;
          const y = k.y;
          const cx =
            (x / getOutputTensorWidth()) *
            (isPortrait() ? CAM_PREVIEW_WIDTH : CAM_PREVIEW_HEIGHT);
          const cy =
            (y / getOutputTensorHeight()) *
            (isPortrait() ? CAM_PREVIEW_HEIGHT : CAM_PREVIEW_WIDTH);
          return (
            <Circle
              key={`skeletonkp_${k.name}`}
              cx={cx}
              cy={cy}
              r="4"
              strokeWidth="2"
              fill="#00AA00"
              stroke="white"
            />
          );
        });

      return <Svg style={styles.svg}>{keypoints}</Svg>;
    }
    return null;
  };

  const isPortrait = () => {
    return (
      orientation === ScreenOrientation.Orientation.PORTRAIT_UP ||
      orientation === ScreenOrientation.Orientation.PORTRAIT_DOWN
    );
  };

  const getOutputTensorWidth = () => {
    return isPortrait() || IS_ANDROID
      ? OUTPUT_TENSOR_WIDTH
      : OUTPUT_TENSOR_HEIGHT;
  };

  const getOutputTensorHeight = () => {
    return isPortrait() || IS_ANDROID
      ? OUTPUT_TENSOR_HEIGHT
      : OUTPUT_TENSOR_WIDTH;
  };

  const getTextureRotationAngleInDegrees = () => {
    if (IS_ANDROID) return 0;

    switch (orientation) {
      case ScreenOrientation.Orientation.PORTRAIT_DOWN:
        return 180;
      case ScreenOrientation.Orientation.LANDSCAPE_LEFT:
        return cameraType === "front" ? 270 : 90;
      case ScreenOrientation.Orientation.LANDSCAPE_RIGHT:
        return cameraType === "front" ? 90 : 270;
      default:
        return 0;
    }
  };

  if (!tfReady) {
    return (
      <View style={styles.loadingMsg}>
        <Text>Loading...</Text>
      </View>
    );
  }

  async function startPoseEstimation() {
    setCameraStatus((state) =>
      state === "predicting" ? "running" : "predicting"
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{
		flexGrow: 1,
        gap: 16,
		justifyContent: "center",
      }}
    >
      <View style={{ flex: 1 }}>
        <CameraView ref={cameraRef} style={styles.camera} facing={cameraType} />
        {renderPose()}
        <View style={styles.fpsContainer}>
          <Text>FPS: {fps}</Text>
        </View>
        {Platform.OS !== "web" && (
          <View
            style={styles.cameraTypeSwitcher}
            onTouchEnd={() =>
              setCameraType(cameraType === "front" ? "back" : "front")
            }
          >
            <Text>
              Switch to {cameraType === "front" ? "back" : "front"} camera
            </Text>
          </View>
        )}
      </View>
      <View>
        <Text>{cameraStatus}</Text>
        <Button mode="text" onPress={startPoseEstimation}>
          Start Pose Estimation
        </Button>
        {poses.length > 0 && (
			<Text>{JSON.stringify(poses)}</Text>
		)}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    position: "relative",
    width: 400,
    height: 400,
    alignSelf: "center",
  },
  containerPortrait: {
    position: "relative",
    width: CAM_PREVIEW_WIDTH,
    height: CAM_PREVIEW_HEIGHT,
  },
  containerLandscape: {
    position: "relative",
    width: CAM_PREVIEW_HEIGHT,
    height: CAM_PREVIEW_WIDTH,
    marginLeft: Dimensions.get("window").height / 2 - CAM_PREVIEW_HEIGHT / 2,
  },
  loadingMsg: {
    position: "absolute",
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  camera: {
    width: "100%",
    height: "100%",
    zIndex: 1,
  },
  svg: {
    width: "100%",
    height: "100%",
    position: "absolute",
    zIndex: 30,
  },
  fpsContainer: {
    position: "absolute",
    top: 10,
    left: 10,
    width: 80,
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, .7)",
    borderRadius: 2,
    padding: 8,
    zIndex: 20,
  },
  cameraTypeSwitcher: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 180,
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, .7)",
    borderRadius: 2,
    padding: 8,
    zIndex: 20,
  },
  capturedImage: {
    width: CAM_PREVIEW_WIDTH,
    height: CAM_PREVIEW_HEIGHT,
    marginTop: 10,
  },
});
