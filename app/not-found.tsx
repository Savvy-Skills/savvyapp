import React from "react";
import { Image } from "react-native";
import ErrorComponent from "@/components/errors/ErrorComponent";
import ScreenWrapper from "@/components/screens/ScreenWrapper";
import TopNavBar from "@/components/navigation/TopNavBar";
import { router } from "expo-router";

export default function NotFoundPage() {
  return (
    <ScreenWrapper>
      <TopNavBar />
      <ErrorComponent 
        title="Page Not Found"
        message="We couldn't find the page you're looking for. It might have been moved or deleted."
        actionLabel="Go to Home"
        onAction={() => router.push("/")}
        imageSource={require("@/assets/images/pngs/robot.png")} // Make sure to add this image to your assets
        secondaryActionLabel="Go Back"
        onSecondaryAction={() => router.back()}
      />
    </ScreenWrapper>
  );
} 