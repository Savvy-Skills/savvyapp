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
    backgroundColor: "white",
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
	gap:16,
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
    margin: 10,
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
  tag: {
    fontSize: 12,
    color: Colors.primary,
    fontFamily: "PoppinsBold",
  },
  // Add more styles as needed

  feedbackContainer: {
    padding: 16,
    borderWidth: 1,
    gap: 10,
    maxWidth: SLIDE_MAX_WIDTH,
    alignSelf: "center",
    width: "100%",
    flexDirection: "row",
	justifyContent:"space-between",
  },
  feedbackHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
	flex: 1
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 16,
    padding: 10,
  },
  correctFeedback: {
    backgroundColor: "#daedf5",
    borderColor: "#3bc2f5",
  },
  incorrectFeedback: {
    backgroundColor: "#ffe7cc",
    borderColor: "#ff861d",
  },
  revealedFeedback: {
    backgroundColor: "#f4f4f4",
    borderColor: "#e0e0e0",
  },
  correctTitle: {
    color: "#3bc2f5",
  },
  incorrectTitle: {
    color: "#ff861d",
  },
  revealedTitle: {
    color: "#666666",
  },
  navigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
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
  optionContainer: {
    flex: 1,
    borderRadius: 4,
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
  },
  selectedOption: {
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#6c5ce7",
    backgroundColor: "rgba(108, 92, 231, 0.1)",
  },
  correctOption: {
    borderWidth: 2,
    borderColor: "#23b5ec",
    backgroundColor: "rgba(35, 181, 236, 0.1)",
  },
  incorrectOption: {
    borderWidth: 2,
    borderColor: "#ff7b09",
    backgroundColor: "rgba(255, 123, 9, 0.1)",
  },
  revealedOption: {
    borderWidth: 2,
    borderColor: "#9E9E9E",
    backgroundColor: "rgba(158, 158, 158, 0.1)",
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
