import { Stack } from 'expo-router';

export default function MainLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // Main content styling
        headerStyle: {
          backgroundColor: '#f4f4f4',
        },
      }}
    >
      <Stack.Screen 
        name="home/index" 
        options={{ title: "Home" }} 
      />
      <Stack.Screen 
        name="courses/index" 
        options={{ title: "Courses" }} 
      />
      <Stack.Screen 
        name="courses/[id]" 
        options={{ title: "Course Details" }} 
      />
      <Stack.Screen 
        name="modules/index" 
        options={{ title: "Modules" }} 
      />
      <Stack.Screen 
        name="modules/[id]" 
        options={{ title: "Module Details" }} 
      />
      <Stack.Screen 
        name="views/[id]" 
        options={{ title: "Views" }} 
      />
    </Stack>
  );
}