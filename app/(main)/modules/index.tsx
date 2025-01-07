import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet } from "react-native";
import ModuleCard from "../../../components/ModuleCard";
import styles from "@/styles/styles";
import ScreenWrapper from "@/components/screens/ScreenWrapper";
import { getModules } from "@/services/coursesApi";
import { Redirect, useLocalSearchParams } from "expo-router";
import { Module } from "@/types";

export default function ModulesList() {

	return <Redirect href={"/home"}/>

//   const [modules, setModules] = useState<Module[]>([]);
//   const { id } = useLocalSearchParams();
//   useEffect(() => {
//     getModules(Number(id)).then((data) => {
//       setModules(data);
//     });
//   }, []);

//   return (
//     <ScreenWrapper>
//       <FlatList
//         data={modules}
//         renderItem={({ item }) => <ModuleCard module={item} />}
//         keyExtractor={(item) => item.id.toString()}
//         contentContainerStyle={styles.container}
//       />
//     </ScreenWrapper>
//   );
}
