import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerBackTitle: "Back",
        // Auth-specific styling
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTintColor: '#000',
      }}
    >
      <Stack.Screen 
        name="login" 
        options={{ 
          title: "Login",
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="google-oauth/index" 
        options={{ 
          title: "Google Sign In",
          presentation: 'modal' 
        }} 
      />
    </Stack>
  );
}