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
import ProgressPath from "@/components/ProgressPath";
import { SegmentedButtons } from "react-native-paper";


export default function ModulesList() {
  const [views, setViews] = useState<ViewType[]>([]);
  const [module, setModule] = useState<Module>({} as Module);
  const { id } = useLocalSearchParams();
  const [selectedView, setSelectedView] = useState<"list" | "path">("list");
  useEffect(() => {
    getModule(Number(id)).then((data) => {
      setModule(data);
      setViews(data.views.filter((view) => view.published));
    });
  }, []);


  const orderedViews = views.sort((a, b) => a.order - b.order)
  return (
    <ScreenWrapper>
      <TopNavBar module={module} />
	  {/* TODO: Add Tabs to switch between FlatList and ProgressPath */}
      <View style={styles.innerSection}>
        <ThemedTitle style={styles.sectionTitle}>Views</ThemedTitle>
		<SegmentedButtons
			value={selectedView}
			onValueChange={(value) => setSelectedView(value as "list" | "path")}
			buttons={[
				{ value: "list", label: "List" },
				{ value: "path", label: "Path" },
			]}
		/>
		{selectedView === "list" && (
			<FlatList
				data={orderedViews}
				renderItem={({ item }) => <ViewCard view={item} />}
				keyExtractor={(item) => item.id.toString()}
				contentContainerStyle={styles.listContainer}
        />
		)}
		{selectedView === "path" && (
			<>
			<ProgressPath levels={orderedViews}/>
			</>
		)}
      </View>
    </ScreenWrapper>
  );
}
