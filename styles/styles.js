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
  customContainer: {
    justifyContent: "center",
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
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
    justifyContent: "space-between",
    gap: 10,
    alignItems: "center",
    backgroundColor: "#4a148c",
    borderRadius: 10,
    margin: 10,
    paddingHorizontal: 10,
	paddingVertical: 10,
    alignSelf: "center",
  },
  navButton: {
    margin: 0,
    borderRadius: 5,
	height: 28,
  },
  checkButton: {
    borderRadius: 5,
  },
  verticalSeparator: {
    width: 1,
    backgroundColor: "#faf",
	height: "100%",
  },
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
