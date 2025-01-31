import { SLIDE_MAX_WIDTH } from "@/constants/Utils";
import { generateColors } from "@/utils/utilfunctions";
import { StyleSheet, Dimensions } from "react-native";
import { Colors } from "@/constants/Colors";
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
    padding: 8,
    flexGrow: 1,
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
    paddingHorizontal: 20,
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
  },
  slideWidth: {
    maxWidth: SLIDE_MAX_WIDTH,
  },
  title: {
    fontSize: fontSizes.large,
    fontWeight: "bold",
    textAlign: "center",
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
    padding: 10,
    gap: 10,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 4,
    shadowColor: "grey",
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
    flexDirection: "row",
    minHeight: 200,
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
    padding: 16,
    borderWidth: 0,
    borderBottomWidth: 0,
    gap: 10,
    maxWidth: SLIDE_MAX_WIDTH,
    alignSelf: "center",
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: Colors.assessmentBackground,
    boxShadow: "0 -8px 10px 0 rgba(0, 0, 0, 0.10)",
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
    fontSize: 16,
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
  correctFeedback: {
    // backgroundColor: generateColors(Colors.success, 0.2).muted,
    borderColor: Colors.success,
  },
  incorrectFeedback: {
    // backgroundColor: generateColors(Colors.error, 0.2).muted,
    borderColor: Colors.error,
  },
  revealedFeedback: {
    // backgroundColor: generateColors(Colors.revealed, 0.2).muted,
    borderColor: Colors.revealed,
  },
  correctTitle: {
    color: Colors.success,
  },
  incorrectTitle: {
    color: Colors.error,
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
    backgroundColor: Colors.assessmentBackground,
    flex: 1,
    gap: 16,
    padding: 30,
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
  bottomNavigation: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    backgroundColor: "#4a148c",
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
  optionsContainer: {
    flexDirection: "column",
    gap: 8,
  },
  optionContainer: {
    flex: 1,
    borderRadius: 4,
    minHeight: "auto",
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: 500,
  },
  option: {
    flexDirection: "row",
    gap: 10,
    borderRadius: 4,
    flex: 1,
    paddingHorizontal: 5,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: "rgba(108, 92, 231, 0)",
    alignItems: "center",
  },
  selectedOption: {
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: generateColors(Colors.primary, 0.2).muted,
  },
  selectedImage: {
    borderWidth: 3,
    backgroundColor: generateColors(Colors.primary, 0.2).muted,
    borderColor: Colors.primary,
  },
  correctOption: {
    borderWidth: 2,
    borderColor: Colors.success,
    backgroundColor: generateColors(Colors.success, 0.2).muted,
  },
  incorrectOption: {
    borderWidth: 2,
    borderColor: Colors.error,
    backgroundColor: generateColors(Colors.error, 0.2).muted,
  },
  revealedOption: {
    borderWidth: 2,
    borderColor: Colors.revealed,
    backgroundColor: generateColors(Colors.revealed, 0.2).muted,
  },
  correctButton: {
    backgroundColor: "#d0ecdf",
  },
  correctLabel: {
    color: Colors.success,
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
