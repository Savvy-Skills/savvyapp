import React, { useEffect, useState } from "react";
import { FlatList, ScrollView, View } from "react-native";
import styles from "@/styles/styles";
import ScreenWrapper from "@/components/screens/ScreenWrapper";
import { ViewType, Module, ViewProgress } from "@/types";
import { getModule } from "@/services/coursesApi";
import { useLocalSearchParams } from "expo-router";
import TopNavBar from "@/components/navigation/TopNavBar";
import ThemedTitle from "@/components/themed/ThemedTitle";
import ViewCard from "@/components/cards/ViewCard";
import ProgressPath from "@/components/ProgressPath";
import { Divider, SegmentedButtons, Text } from "react-native-paper";
import { Image } from "expo-image";

const blurhash =
	"L38gX#ai24u+XIGuY3+v00YMu%Ta";

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
			<ScrollView>
				<View style={styles.innerSection}>
					<ThemedTitle style={styles.sectionTitle}>Module Overview</ThemedTitle>
				{module.image && module.image.url && (
					<>
						<View style={{ flexDirection: "row", gap: 16, flexWrap: "wrap" }}>
							<Image source={module.image?.url} style={{ width: 150, height: 150, borderRadius: 16 }} transition={1000} contentFit="cover" placeholder={{ blurhash }} />
							<View style={{ flex: 1, maxWidth: "50%", minWidth: 200 }}>
								{module.description && (
									<Text>{module.description}</Text>
								)}
							</View>
						</View>
						<Divider />
					</>
				)}
				<ThemedTitle style={styles.sectionTitle}>Views</ThemedTitle>
				{selectedView === "list" && (
					<FlatList
						data={orderedViews}
						renderItem={({ item }) => <ViewCard view={item} progress={module.views_progress.find((view) => view.view_id === item.id) || {} as ViewProgress} />}
						keyExtractor={(item) => item.id.toString()}
						contentContainerStyle={styles.listContainer}
					/>
				)}
			</View>
			</ScrollView>
		</ScreenWrapper>
	);
}
