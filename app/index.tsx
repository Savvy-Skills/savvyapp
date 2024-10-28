import { View } from "react-native";
import { Button, Title, useTheme } from "react-native-paper";
import { Link } from "expo-router";
import styles from "@/styles/styles";
import "@/styles/styles.css";
import { useAuthStore } from "@/store/authStore";
import ScreenWrapper from "@/components/screens/ScreenWrapper";

export default function Home() {
  const { user, logout } = useAuthStore();
  return (
    <ScreenWrapper style={styles.centeredContainer}>
      <Title>Welcome to Savvyskills</Title>
      <Link href="./modules" asChild>
        <Button mode="contained">View Modules</Button>
      </Link>
      {/* Logout button */}
      {user && (
        <Button mode="contained" onPress={logout}>
          Logout
        </Button>
      )}
    </ScreenWrapper>
  );
}
