import { Stack } from 'expo-router';

export default function MiscLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        // Misc pages styling
        presentation: 'modal',
        headerStyle: {
          backgroundColor: '#fff',
        },
      }}
    >
      <Stack.Screen 
        name="terms/index" 
        options={{ title: "Terms & Conditions" }} 
      />
      <Stack.Screen 
        name="debug/index" 
        options={{ 
          title: "Debug",
          headerShown: process.env.NODE_ENV === 'development' 
        }} 
      />
    </Stack>
  );
}