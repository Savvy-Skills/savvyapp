import { View, StyleSheet } from 'react-native';
import { Button, Title } from 'react-native-paper';
import { Link } from 'expo-router';

export default function Home() {
  return (
    <View style={styles.container}>
      <Title style={styles.title}>Welcome to Savvyskills</Title>
      <Link href="./modules" asChild>
        <Button mode="contained">View Modules</Button>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    marginBottom: 24,
  },
});