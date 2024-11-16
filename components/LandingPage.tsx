import React from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  Image,
  useWindowDimensions,
} from "react-native";
import { Button, Text, Paragraph, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import ThemedTitle from "./themed/ThemedTitle";
import { Colors } from "@/constants/Colors";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useAuthStore } from "@/store/authStore";

const DEVICES_WIDTH = {
  mobile: 600,
  tablet: 992,
};

const LandingPage = () => {
  const theme = useTheme();
  const { user, logout } = useAuthStore();
  const { width } = useWindowDimensions();

  const styles = StyleSheet.create({
    featureItem: {
      alignItems: "center",
    },
    featureIcon: {
      width: 64,
      height: 64,
      marginBottom: 8,
    },
    featureText: {
      fontSize: 16,
    },
    safeContainer: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    container: {
      maxWidth: 1080,
      alignSelf: "center",
      width: "100%",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
    },
    logo: {
      width: 80,
      height: 80,
      borderRadius: 20,
    },
    heroSection: {
      alignItems: "center",
      padding: 24,
      gap: 40,
      maxWidth: 1080,
      alignSelf: "center",
      marginVertical: 60,
    },
    heroImage: {
      width: "100%",
      height: 300,
      marginBottom: 24,
    },
    title: {
      fontSize: width <= DEVICES_WIDTH.tablet ? 36 : 48,
      fontFamily: "PoppinsBold",
      textAlign: "center",
      marginBottom: 16,
    },
    subtitle: {
      fontSize: width <= DEVICES_WIDTH.tablet ? 20 : 24,
      textAlign: "center",
      marginBottom: 24,
      color: theme.colors.secondary,
      fontWeight: "bold",
    },
    sectionContainer: {
      paddingHorizontal: 16,
      paddingVertical: 100,
      gap: 40,
      width: "100%",
      maxWidth: 1080,
      alignSelf: "center",
    },
    sectionTitle: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 16,
      textAlign: "center",
    },
    featureContainer: {
      flexDirection: "row",
      marginTop: 16,
      gap: 40,
      alignSelf: "center",
	  flexWrap: "wrap",
	  justifyContent: "center",
    },
    button: {
      borderRadius: 4,
    },
    iconPillCont: {
      flexDirection: "row",
      gap: 8,
      alignSelf: "center",
      borderWidth: 2,
      borderColor: Colors.light.lightOrange,
      borderRadius: 30,
      paddingVertical: 6,
      paddingHorizontal: 10,
    },
    buttonLabel: {
      fontWeight: "bold",
    },
    pillText: {
      fontWeight: "bold",
      fontSize: 16,
    },
    iconPill: {
      width: 26,
      height: 26,
    },
    sectionText: {
      fontSize: width <= DEVICES_WIDTH.tablet ? 24 : 36,
      textAlign: "center",
      fontWeight: "bold",
    },
    gradient: {
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      height: "100%",
    },
  });

  const handleLogin = () => {
    if (!user) {
      router.replace("/auth/login");
    } else {
      logout();
    }
  };

  const handleStart = () => {
    router.replace("/modules");
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView>
        <View style={styles.container}>
          <View style={styles.header}>
            <Image
              source={require("@/assets/images/savvylogo.svg")}
              style={styles.logo}
            />
            <Button
              style={styles.button}
              mode="contained"
              onPress={handleLogin}
              buttonColor={!user ? Colors.light.orange : theme.colors.secondary}
              labelStyle={styles.buttonLabel}
            >
              {!user ? "Log in" : "Log out"}
            </Button>
          </View>

          <View style={styles.heroSection}>
            <Image
              source={{ uri: "https://via.placeholder.com/1080x300" }}
              style={styles.heroImage}
            />
            <ThemedTitle style={styles.title}>
              Ignite Young Minds with AI
            </ThemedTitle>
            <Text style={styles.subtitle}>
              Explore the world of Artificial Intelligence through fun
              problem-solving activities designed for K-12 students.
            </Text>
            <Button
              mode="contained"
              onPress={handleStart}
              style={styles.button}
              labelStyle={[
                styles.buttonLabel,
                { fontSize: 24, paddingHorizontal: 0, paddingVertical: 2 },
              ]}
              buttonColor={Colors.light.primary}
            >
              Get started
            </Button>
          </View>

          <View style={styles.sectionContainer}>
            <LinearGradient
              // Background Linear Gradient
              colors={["#fff7e8", "transparent"]}
              style={styles.gradient}
            />
            <View style={styles.iconPillCont}>
              <Image
                source={require("@/assets/images/pngs/diamond.png")}
                style={styles.iconPill}
              ></Image>
              <Text style={styles.pillText}> Value Proposition</Text>
            </View>
            <Text style={styles.sectionText}>
              Savvy's AI course combines engaging lessons with hands-on
              projects, helping students develop critical thinking and
              problem-solving skills essential for future careers.
            </Text>
            <View style={styles.featureContainer}>
              <View style={styles.featureItem}>
                <Image
                  source={require("@/assets/images/pngs/interactive.png")}
                  style={styles.featureIcon}
                />
                <Text style={styles.featureText}>Interactive Learning</Text>
              </View>
              <View style={styles.featureItem}>
                <Image
                  source={require("@/assets/images/pngs/rocket.png")}
                  style={styles.featureIcon}
                />
                <Text style={styles.featureText}>Career Exposure</Text>
              </View>
            </View>
          </View>

          <View style={styles.sectionContainer}>
            <LinearGradient
              // Background Linear Gradient
              colors={["#EAF7FF", "transparent"]}
              style={styles.gradient}
            />
            <View
              style={[styles.iconPillCont, { borderColor: Colors.light.blue }]}
            >
              <Image
                source={require("@/assets/images/pngs/bag.png")}
                style={styles.iconPill}
              ></Image>
              <Text style={styles.pillText}> Careers</Text>
            </View>
            <Text style={styles.sectionText}>AI is shaping the future!</Text>
            <Text style={[styles.subtitle, { marginBottom: 24 }]}>
              Explore the various careers you can pursue with AI skills.
            </Text>
            <View style={styles.featureContainer}>
              <View style={styles.featureItem}>
                <Image
                  source={require("@/assets/images/pngs/ai.png")}
                  style={styles.featureIcon}
                />
                <Text style={styles.featureText}>AI Engineer</Text>
              </View>
              <View style={styles.featureItem}>
                <Image
                  source={require("@/assets/images/pngs/analysis.png")}
                  style={styles.featureIcon}
                />
                <Text style={styles.featureText}>Data Scientist</Text>
              </View>
              <View style={styles.featureItem}>
                <Image
                  source={require("@/assets/images/pngs/robot.png")}
                  style={styles.featureIcon}
                />
                <Text style={styles.featureText}>Robotics Engineer</Text>
              </View>
            </View>
          </View>

          <View style={styles.sectionContainer}>
            <LinearGradient
              // Background Linear Gradient
              colors={["#EDE9FE", "transparent"]}
              style={styles.gradient}
            />
            <View
              style={[styles.iconPillCont, { borderColor: Colors.light.primaryLighter }]}
            >
              <Image
                source={require("@/assets/images/pngs/solution.png")}
                style={styles.iconPill}
              ></Image>
              <Text style={styles.pillText}>
                Learning through problem-solving
              </Text>
            </View>
            <Text style={styles.sectionTitle}>
              Learn AI by solving real-world problems and completing exciting
              projects.
            </Text>
            <View style={styles.featureContainer}>
              <View style={styles.featureItem}>
                <Image
                  source={require("@/assets/images/pngs/problem-solving.png")}
                  style={styles.featureIcon}
                />
                <Text style={styles.featureText}>Interactive Challenges</Text>
              </View>
              <View style={styles.featureItem}>
                <Image
                  source={require("@/assets/images/pngs/hands-on-activities.png")}
                  style={styles.featureIcon}
                />
                <Text style={styles.featureText}>Hands-on Activities</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LandingPage;
