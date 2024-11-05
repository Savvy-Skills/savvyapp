import { Button, Title } from "react-native-paper";
import { Link } from "expo-router";
import styles from "@/styles/styles";
import "@/styles/styles.css";
import { useAuthStore } from "@/store/authStore";
import ScreenWrapper from "@/components/screens/ScreenWrapper";
import ThemedTitle from "@/components/themed/ThemedTitle";

export default function Home() {
  const { user, logout } = useAuthStore();
  return (
    <ScreenWrapper style={[styles.centeredContainer, {gap:10}]}>
      <ThemedTitle>Welcome to Savvyskills</ThemedTitle>
      <Link href="./modules" asChild>
        <Button mode="contained">View Modules</Button>
      </Link>
      <Link href="./debug" asChild>
        <Button mode="contained">Debug</Button>
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
