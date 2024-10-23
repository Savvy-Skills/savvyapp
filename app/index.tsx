import { View } from 'react-native';
import { Button, Title } from 'react-native-paper';
import { Link } from 'expo-router';
import styles from '@/styles/styles';

export default function Home() {
  return (
    <View style={styles.centeredContainer}>
      <Title style={styles.title}>Welcome to Savvyskills</Title>
      <Link href="./modules" asChild>
        <Button mode="contained">View Modules</Button>
      </Link>
    </View>
  );
}

