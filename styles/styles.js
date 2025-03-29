import { SLIDE_MAX_WIDTH } from "@/constants/Utils";
import { StyleSheet, Dimensions } from "react-native";
import { Colors } from "@/constants/Colors";
const { width } = Dimensions.get("window");

function hexToRgbA(hex) {
	var c;
	if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
		c = hex.substring(1).split('');
		if (c.length == 3) {
			c = [c[0], c[0], c[1], c[1], c[2], c[2]];
		}
		c = '0x' + c.join('');
		return 'rgba(' + [(parseInt(c) >> 16) & 255, (parseInt(c) >> 8) & 255, parseInt(c) & 255].join(',') + ',1)';
	}
	throw new Error('Bad Hex');
}

const generateColors = (color, opacity) => {
	let rgba = color.startsWith("#") ? hexToRgbA(color) : color;
	const color1 = rgba.replace(/[^,]+(?=\))/, "1");
	const color2 = rgba.replace(/[^,]+(?=\))/, opacity.toString());
	return { normal: color1, muted: color2 };
}


const fontSizes = {
  small: 12,
  medium: 16,
  large: 20,
  extraLarge: 24,
};

export default StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },

  datasetTitle: {
	fontWeight: "bold",
  },
  datasetAbout: {
  },
  datasetSource: {
	fontSize: 12,
	fontWeight: "bold",
  },

  toggleButton: {
    borderRadius: 4,
    borderColor: Colors.revealedButton,
  },
  toggleButtonActive: {
    backgroundColor: generateColors(Colors.primary, 0.2).muted,
  },

  feedbackModalContainer: {
    backgroundColor: Colors.background,
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  listContainer: {
    padding: 4,
    flexGrow: 1,
	gap: 16
  },
  overlay: {
    alignItems: "center",
    alignSelf: "center",
  },
  menuText: {
    color: Colors.whiteText,
    marginTop: 4,
    fontSize: 12,
  },
  topNavBarInner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  metricContainer: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
    borderWidth: 1,
    padding: 8,
    borderRadius: 4,
  },
  navBarInfo: {
    flex: 1,
    alignItems: "center",
    marginRight: 62,
  },
  sectionTitle: {
    fontSize: 28,
    marginBottom: 16,
	fontWeight: "bold",
  },
  innerSection: {
    paddingHorizontal: 8,
    maxWidth: 1080,
    width: "100%",
    alignSelf: "center",
    flex: 1,
    gap: 16,
  },
  customContainer: {
    justifyContent: "center",
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  centeredMaxWidth: {
    alignSelf: "center",
    width: "100%",
  },
  centeredItems: {
    alignItems: "center",
  },
  menuContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#4a148c",
    borderRadius: 12,
    paddingVertical: 12,
    gap: 16,
    paddingHorizontal: 12,
	zIndex:1000
  },
  slideWidth: {
    maxWidth: SLIDE_MAX_WIDTH,
  },
  title: {
    fontSize: fontSizes.large,
    fontWeight: "bold",
    textAlign: "center",
  },
  defaultButton: {
    borderRadius: 8,
  },
  selectedPointContainer: {
    backgroundColor: generateColors(Colors.primary, 0.2).muted,
    borderRadius: 8,
	padding: 8,
	alignSelf: "center",
	justifyContent: "center",
  },
  selectedPointText: {
	fontSize: 12,
	fontWeight: "bold",
  },
  navHeader: {
	backgroundColor: Colors.background,
    flexDirection: "row",
    justifyContent: "center",
    zIndex: 3,
    paddingVertical: 4,
    maxHeight: 56,
    marginBottom: 10,
  },
  webNav: {
    borderBottomWidth: 1,
    borderBottomColor: "#cccccc",
	// from the shadow above make boxshadow
	boxShadow: "0 1px 4px rgba(0, 0, 0, 0.2)",
		
  },
  button: {
    padding: 10,
    borderRadius: 5,
    width: width * 0.8, // 80% of screen width
  },
  savvyButton:{
	borderRadius: 4,
	height: 40,
  },
  savvyContainedButton: {
	backgroundColor: Colors.primary,
  },
  savvyContainedButtonText: {
	color: Colors.whiteText,
	fontWeight: "bold",
  },
  savvyOutlinedButton: {
	borderColor: Colors.primary,
  },
  savvyOutlinedButtonText: {
	color: Colors.primary,
	fontWeight: "bold",
  },
  buttonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: fontSizes.medium,
  },
  card: {
    width: 320,
    backgroundColor: Colors.background,
    borderRadius: 8,
    overflow: "hidden",
    marginVertical: 6,
  },
  viewCard: {
    backgroundColor: Colors.assessmentBackground,
    display: "flex",
    flexDirection: "column",
	borderRadius: 8,
  },
  touchable: {
    gap: 10,
    padding: 10,
	borderRadius: 8,
	flex: 1,
  },
  tagContainer: {
    backgroundColor: generateColors(Colors.primary, 0.2).muted,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: "flex-start",
  },
  networkContainer: {
    flex: 1,
    flexDirection: "row",
	maxHeight: 400,
  },
  tag: {
    fontSize: 12,
    color: Colors.primary,
  },
  // Add more styles as needed
  layerContainer: {
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#ccc",
    height: "100%",
	boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
  },
  hiddenLayerWrapper: {
    flex: 1,
    marginHorizontal: 8,
  },
  selectedLayer: {
    borderStyle: "solid",
    borderWidth: 2,
    elevation: 2,
  },
  inputLayer: {
    width: "auto",
  },
  inputLayerSelected: {
    borderColor: Colors.blue,
  },
  hiddenLayer: {
    flexDirection: "column",
  },
  hiddenLayerSelected: {
    borderColor: Colors.success,
  },
  outputLayer: {
    width: "auto",
  },
  outputLayerSelected: {
    borderColor: Colors.orange,
  },
  inputNodesContainer: {
    gap: 16,
  },
  inputNode: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2196f3",
    justifyContent: "center",
    alignSelf: "center",
    alignItems: "center",
  },
  inputLabel: {
    fontSize: 12,
    textAlign: "center",
    margin: 0,
    fontWeight: "bold",
  },
  hiddenLayerCircle: {
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  neuronsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 4,
  },
  neuron: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#7c4dff",
  },
  layerInfo: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: "bold",
  },
  outputBox: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "rgba(255, 204, 128, 0.2)",
    borderColor: "#ffcc80",
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  outputLabel: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: "bold",
  },

  unselectedLayer: {
    backgroundColor: "transparent",
  },
  layerTitle: {
    fontWeight: "bold",
    marginBottom: 8,
  },

  detailsContainer: {
    padding: 16,
    borderRadius: 4,
    elevation: 2,
    gap: 16,
	backgroundColor: Colors.background,
  },
  feedbackContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    borderWidth: 0,
    gap: 10,
    alignSelf: "center",
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  bottomBarWrapper: {
    flexDirection: "column",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    marginTop: 8,
  },
  lottieContainer: {
    width: 40,
    height: 40,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  feedbackHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flex: 1,
  },
  feedbackTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 16,
    padding: 10,
  },
  dropdownMenuButton: {
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  dropdownMenuContainer: {
    flexDirection: "row-reverse",
  },
  problemBadge: {
    backgroundColor: generateColors(Colors.blue, 0.2).muted,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 12,
    textTransform: "capitalize",
    color: Colors.blue,
  },
  correctWrapper: {
    backgroundColor: Colors.successBackground,
  },
  incorrectWrapper: {
    backgroundColor: Colors.errorBackground,
  },
  revealedWrapper: {
    backgroundColor: Colors.revealedBackground,
  },
  correctTitle: {
    color: Colors.successText,
  },
  incorrectTitle: {
    color: Colors.errorText,
  },
  revealedTitle: {
    color: Colors.revealedText,
  },
  navigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  assessmentWrapper: {
    flex: 1,
    gap: 16,
    paddingVertical: 30,
	paddingHorizontal: 16,
  },
  assessmentButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  explanationContainer: {
    padding: 16,
    backgroundColor: "#e9ecef",
    borderRadius: 4,
  },
  slideRenderer: {
    flex: 1,
    justifyContent: "center",
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    justifyContent: "center",
  },
  imageContainer: {
    width: "35%",
    aspectRatio: 1,
  },
  imageOption: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#cccccc",
    overflow: "hidden",
    position: "relative",
    padding: 10,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  selectedImage: {
    borderWidth: 1,
    backgroundColor: "rgba(108, 92, 231, 0.1)",
    borderColor: "#a197f9",
  },
  imageIconContainer: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 1,
  },
  trueFalseTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: Colors.text,
  },
  trueFalseButton: {
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    borderRadius: 4,
  },
  operatorContainer: {
    backgroundColor: "#ff7b09",
    borderRadius: 4,
    padding: 8,
  },
  operator: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  inputContainer: {
    position: "relative",
    width: 80,
  },
  input: {
    height: 38,
    backgroundColor: "white",
    borderRadius: 4,
    color: "black",
    borderWidth: 1,
    borderColor: "grey",
	flex: 1,
  },
  centerText: {
    textAlign: "center",
  },
  trueFalseButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: Colors.text,
  },
  bottomNavigation: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    backgroundColor: generateColors(Colors.assessmentBackground, 0.4).muted,
    borderRadius: 10,
    padding: 10,
  },
  assessmentTitle:{
	fontSize: 24,
	lineHeight: 27,
	fontWeight: 600,
	textAlign: "center",
  },
  navButton: {
    margin: 0,
    borderRadius: 4,
  },
  checkButton: {
    borderRadius: 4,
    flex: 1,
  },
  lightOrangeButton: {
    backgroundColor: Colors.lightOrange,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  verticalSeparator: {
    width: 1,
    backgroundColor: "#faf",
    height: "100%",
  },
  iconContainer: {
    position: "absolute",
    right: -10,
    top: -10,
  },
  ftbOptionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 16,
  },
  ftbTextContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginBottom: 16,
  },
  ftbBlankButton: {
    minWidth: 100,
    marginHorizontal: 4,
  },
  ftbOptionButton: {
    margin: 4,
    fontSize: 16,
  },
  optionsContainer: {
    flexDirection: "column",
    gap: 8,
  },
  optionContainer: {
    borderRadius: 4,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: 500,
	flexShrink:1,
  },
  option: {
    flexDirection: "row",
    gap: 10,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(108, 92, 231, 0)",
    alignItems: "center",
	flex: 1,
  },
  selectedOption: {
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: generateColors(Colors.primary, 0.2).muted,
  },
  selectedImage: {
    borderWidth: 1,
    backgroundColor: generateColors(Colors.primary, 0.2).muted,
    borderColor: Colors.primary,
  },
  correctOption: {
    borderWidth: 1,
    borderColor: Colors.success,
    backgroundColor: Colors.successBackground,
  },
  incorrectOption: {
    borderWidth: 1,
    borderColor: Colors.error,
    backgroundColor: Colors.errorBackground,
  },
  revealedOption: {
    borderWidth: 1,
    borderColor: Colors.revealed,
    backgroundColor: Colors.revealedBackground,
  },
  buttonLabel: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "600",
  },
  correctButton: {
    backgroundColor: Colors.success,
  },
  correctLabel: {
    color: Colors.successText,
  },
  incorrectButton: {
    backgroundColor: Colors.error,
  },
  incorrectLabel: {
    color: Colors.whiteText,
  },
  revealedButton: {
    backgroundColor: Colors.revealedButton,
  },
  revealedLabel: {
    color: Colors.whiteText,
  },

  disabledOption: {},
});

// You can also export individual style objects or functions
export const dynamicStyles = (theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme === "dark" ? "#000000" : "#FFFFFF",
    },
    text: {
      color: theme === "dark" ? "#FFFFFF" : "#000000",
    },
  });

// MNIST Drawing Component Styles
export const mnistStyles = StyleSheet.create({
  container: {
    flex: 1, 
    alignItems: 'center'
  },
  contentContainer: {
    maxWidth: 400,
    width: '100%',
    alignItems: 'center',
    padding: 16,
    gap: 16
  },
  drawingBoxContainer: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'black',
    overflow: 'hidden',
    position: 'relative',
    maxWidth: 320,
  },
  clearButton: {
    position: 'absolute', 
    top: 0, 
    right: 0, 
    bottom: 0, 
    zIndex: 10
  },
  resultContainer: { 
    width: '100%', 
    marginTop: 16, 
    gap: 16 
  },
  predictionText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center'
  }
});

// Probability Visualizer Styles
export const probabilityVisualizerStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    backgroundColor: Colors.background,
    borderRadius: 4,
  },
  digitContainer: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  barContainer: {
    height: 80,
    width: '60%',
    backgroundColor: Colors.revealedBackground,
    justifyContent: 'flex-end',
    borderRadius: 4,
    overflow: 'hidden',
  },
  probabilityBar: {
    width: '100%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  digit: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  predictedDigit: {
    color: Colors.success,
    fontSize: 22,
  },
  percentage: {
    fontSize: 12,
    color: Colors.text,
  },
});

// Drawing Box Styles
export const drawingBoxStyles = StyleSheet.create({
  canvas: {
    backgroundColor: 'white',
    touchAction: 'none', 
    width: '100%',
    height: '100%',
    display: 'block'
  },
  container: { 
    width: '100%', 
    height: '100%' 
  }
});
