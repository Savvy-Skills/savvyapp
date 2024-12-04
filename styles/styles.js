import { SLIDE_MAX_WIDTH } from "@/constants/Utils";
import { StyleSheet, Dimensions } from "react-native";

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
  listContainer: {
    padding: 8,
    flexGrow: 1,
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
    marginRight: 68,
  },
  sectionTitle: {
    fontSize: 28,
    fontFamily: "PoppinsBold",
    marginBottom: 16,
  },
  innerSection: {
    paddingHorizontal: 20,
    gap: 32,
    maxWidth: 1080,
    width: "100%",
    alignSelf: "center",
    flex: 1,
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
  // Add more styles as needed
  navigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  feedbackContainer: {
    padding: 8,
    borderRadius: 4,
    marginTop: 16,
  },
  correctFeedback: {
    backgroundColor: "#d4edda",
  },
  incorrectFeedback: {
    backgroundColor: "#f8d7da",
  },
  feedbackText: {
    textAlign: "center",
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
