import { SLIDE_MAX_WIDTH } from "@/constants/Utils";
import { generateColors } from "@/utils/utilfunctions";
import { StyleSheet, Dimensions } from "react-native";
import { Colors } from "@/constants/Colors";
import { useThemeStore } from "@/store/themeStore";
const { width, height } = Dimensions.get("window");

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
    fontFamily: "PoppinsBold",
    marginBottom: 16,
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
  button: {
    padding: 10,
    borderRadius: 5,
    width: width * 0.8, // 80% of screen width
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
  },
  tagContainer: {
    backgroundColor: generateColors(Colors.primary, 0.2).muted,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: "flex-start",
    fontFamily: "PoppinsBold",
  },
  networkContainer: {
    flex: 1,
    flexDirection: "row",
	maxHeight: 400,
  },
  tag: {
    fontSize: 12,
    color: Colors.primary,
    fontFamily: "PoppinsBold",
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
    shadowColor: "grey",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 4,
    shadowOpacity: 0.2,
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
    marginTop: 16,
    borderRadius: 8,
    elevation: 2,
    gap: 16,
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
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
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
    gap: 8,
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
    marginTop: 16,
    padding: 8,
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
    width: "45%",
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
    height: 40,
    textAlign: "center",
    backgroundColor: "white",
    borderRadius: 4,
    color: "black",
    borderWidth: 1,
    borderColor: "grey",
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
  navButton: {
    margin: 0,
    borderRadius: 5,
  },
  checkButton: {
    borderRadius: 5,
    flex: 1,
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
