import React, { useEffect, useState } from "react";
import { FlatList, View } from "react-native";
import styles from "@/styles/styles";
import ScreenWrapper from "@/components/screens/ScreenWrapper";
import { ViewType, Module } from "@/types";
import { getModule } from "@/services/coursesApi";
import { useLocalSearchParams } from "expo-router";
import TopNavBar from "@/components/navigation/TopNavBar";
import ThemedTitle from "@/components/themed/ThemedTitle";
import ViewCard from "@/components/ViewCard";

export default function ModulesList() {
  const [views, setViews] = useState<ViewType[]>([]);
  const [module, setModule] = useState<Module>({} as Module);
  const { id } = useLocalSearchParams();

  useEffect(() => {
    getModule(Number(id)).then((data) => {
      setModule(data);
      setViews(data.views);
    });
  }, []);  

  return (
    <ScreenWrapper>
      <TopNavBar module={module} />
      <View style={styles.innerSection}>
        <ThemedTitle style={styles.sectionTitle}>Views</ThemedTitle>
        <FlatList
          data={views}
          renderItem={({ item }) => <ViewCard view={item} />}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
        />
      </View>
    </ScreenWrapper>
  );
}
